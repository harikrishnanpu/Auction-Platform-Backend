import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { tokenService } from "../../infrastructure/services/jwt/jwt.service";
import { auctionRepository, bidRepository, chatMessageRepository, participantRepository, transactionManager } from "../../Di/repository.di";
import { PlaceBidUseCase } from "../../application/useCases/auction/place-bid.usecase";
import { SendChatMessageUseCase } from "../../application/useCases/auction/send-chat-message.usecase";
import { GetAuctionRoomStateUseCase } from "../../application/useCases/auction/get-auction-room-state.usecase";
import { RevokeUserUseCase } from "../../application/useCases/auction/revoke-user.usecase";
import { PauseAuctionUseCase } from "../../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase } from "../../application/useCases/seller/end-auction.usecase";
import { AuctionError } from "../../domain/auction/auction.errors";

export const initAuctionSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true
        }
    });

    const placeBidUseCase = new PlaceBidUseCase(auctionRepository, bidRepository, participantRepository, transactionManager);
    const sendChatMessageUseCase = new SendChatMessageUseCase(chatMessageRepository, participantRepository);
    const getRoomStateUseCase = new GetAuctionRoomStateUseCase(auctionRepository, bidRepository, chatMessageRepository);
    const revokeUserUseCase = new RevokeUserUseCase(auctionRepository, participantRepository);
    const pauseAuctionUseCase = new PauseAuctionUseCase(auctionRepository);
    const resumeAuctionUseCase = new ResumeAuctionUseCase(auctionRepository);
    const endAuctionUseCase = new EndAuctionUseCase(auctionRepository);

    const parseCookieToken = (cookieHeader?: string) => {
        if (!cookieHeader) return "";
        const pairs = cookieHeader.split(";").map((part) => part.trim());
        const match = pairs.find((p) => p.startsWith("accessToken="));
        if (!match) return "";
        return decodeURIComponent(match.split("=")[1] || "");
    };

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token
            || (socket.handshake.headers.authorization || "").replace("Bearer ", "")
            || parseCookieToken(socket.handshake.headers.cookie);
        const payload = tokenService.verifyAccessToken(token);
        if (!payload) {
            return next(new Error("Unauthorized"));
        }
        (socket as any).user = payload;
        socket.data.userId = payload.userId;
        next();
    });

    io.on("connection", (socket) => {
        const user = (socket as any).user;
        console.log(`✅ Socket connected: ${socket.id}, User: ${user?.userId || 'unknown'}`);

        socket.on("room:join", async ({ auctionId }) => {
            try {
                console.log(`🔵 User ${user.userId} joining room: auction:${auctionId}`);
                const auction = await auctionRepository.findById(auctionId);
                if (!auction) {
                    console.log(`❌ Auction not found: ${auctionId}`);
                    socket.emit("room:error", { message: "Auction not found" });
                    return;
                }
                const participant = await participantRepository.findByAuctionAndUser(auctionId, user.userId);
                if (!participant) {
                    console.log(`❌ User ${user.userId} is not a participant of auction ${auctionId}`);
                    socket.emit("room:error", { message: "Not a participant. Please enter the auction first." });
                    return;
                }
                if (participant.revokedAt) {
                    console.log(`❌ User ${user.userId} was revoked from auction ${auctionId}`);
                    socket.emit("room:error", { message: "You have been revoked from this auction" });
                    return;
                }

                // Mark user as online
                await participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);
                socket.join(`auction:${auctionId}`);
                console.log(`✅ User ${user.userId} joined room: auction:${auctionId}`);
                
                // Get room state and participants
                const state = await getRoomStateUseCase.execute(auctionId, 20);
                const participants = await participantRepository.listParticipantsWithStatus(auctionId);
                
                socket.emit("room:state", { ...state, participants });
                console.log(`📤 Sent room state to ${user.userId}`);
                
                // Notify room about new online user
                io.to(`auction:${auctionId}`).emit("participant:online", {
                    userId: user.userId,
                    socketId: socket.id
                });
            } catch (error) {
                console.error(`❌ Error in room:join:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("bid:place", async ({ auctionId, amount }) => {
            try {
                console.log(`💰 User ${user.userId} placing bid: ${amount} on auction ${auctionId}`);
                const bid = await placeBidUseCase.execute(auctionId, user.userId, Number(amount));
                console.log(`✅ Bid placed successfully: ${bid.id}`);
                
                // Update last seen
                await participantRepository.updateLastSeen(auctionId, user.userId);
                
                io.to(`auction:${auctionId}`).emit("bid:created", bid);
                console.log(`📤 Broadcasted bid to room: auction:${auctionId}`);
            } catch (error) {
                const err = error as Error;
                console.error(`❌ Bid error:`, err.message);
                if (err instanceof AuctionError) {
                    socket.emit("bid:error", { code: err.code, message: err.message });
                    return;
                }
                socket.emit("bid:error", { code: "NOT_ALLOWED", message: err.message });
            }
        });

        socket.on("chat:send", async ({ auctionId, message }) => {
            try {
                console.log(`💬 User ${user.userId} sending message to auction ${auctionId}: ${message}`);
                const chatMessage = await sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
                console.log(`✅ Chat message created: ${chatMessage.id}`);
                
                // Update last seen
                await participantRepository.updateLastSeen(auctionId, user.userId);
                
                io.to(`auction:${auctionId}`).emit("chat:created", chatMessage);
                console.log(`📤 Broadcasted chat to room: auction:${auctionId}`);
            } catch (error) {
                const err = error as Error;
                console.error(`❌ Chat error:`, err.message);
                if (err instanceof AuctionError) {
                    socket.emit("chat:error", { code: err.code, message: err.message });
                    return;
                }
                socket.emit("chat:error", { code: "NOT_ALLOWED", message: err.message });
            }
        });

        socket.on("seller:join", async ({ auctionId }) => {
            try {
                console.log(`🔵 Seller ${user.userId} joining room: auction:${auctionId}`);
                const auction = await auctionRepository.findById(auctionId);
                if (!auction || auction.sellerId !== user.userId) {
                    console.log(`❌ Seller ${user.userId} not authorized for auction ${auctionId}`);
                    socket.emit("room:error", { message: "Not allowed" });
                    return;
                }
                socket.join(`auction:${auctionId}`);
                console.log(`✅ Seller ${user.userId} joined room: auction:${auctionId}`);
                
                // Get room state and participants
                const state = await getRoomStateUseCase.execute(auctionId, 20);
                const participants = await participantRepository.listParticipantsWithStatus(auctionId);
                
                socket.emit("room:state", { ...state, participants });
                console.log(`📤 Sent room state to seller ${user.userId}`);
            } catch (error) {
                console.error(`❌ Error in seller:join:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("seller:revoke-user", async ({ auctionId, userId }) => {
            try {
                const user = (socket as any).user;
                const revoked = await revokeUserUseCase.execute(auctionId, user.userId, userId);

                const room = `auction:${auctionId}`;
                const sockets = await io.in(room).fetchSockets();
                sockets.forEach((s) => {
                    if (s.data.userId === userId) {
                        s.leave(room);
                        s.emit("user:revoked", { auctionId });
                    }
                });
                io.to(room).emit("user:revoked", { auctionId, userId, revokedAt: revoked.revokedAt });
            } catch (error) {
                const err = error as Error;
                if (err instanceof AuctionError) {
                    socket.emit("room:error", { code: err.code, message: err.message });
                    return;
                }
                socket.emit("room:error", { code: "NOT_ALLOWED", message: err.message });
            }
        });

        socket.on("seller:pause-auction", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                await pauseAuctionUseCase.execute(auctionId, user.userId);
                io.to(`auction:${auctionId}`).emit("auction:paused", { auctionId });
            } catch (error) {
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("seller:resume-auction", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                await resumeAuctionUseCase.execute(auctionId, user.userId);
                io.to(`auction:${auctionId}`).emit("auction:resumed", { auctionId });
            } catch (error) {
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("seller:end-auction", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                await endAuctionUseCase.execute(auctionId, user.userId);
                io.to(`auction:${auctionId}`).emit("auction:ended", { auctionId });
            } catch (error) {
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        // Handle disconnect - mark user as offline in all auctions
        socket.on("disconnect", async () => {
            try {
                console.log(`🔌 Socket disconnected: ${socket.id}, User: ${user.userId}`);
                
                // Find all auction rooms this socket is in and mark user offline
                const rooms = Array.from(socket.rooms);
                for (const room of rooms) {
                    if (room.startsWith("auction:")) {
                        const auctionId = room.replace("auction:", "");
                        await participantRepository.setOnlineStatus(auctionId, user.userId, false);
                        
                        // Notify room about user going offline
                        io.to(room).emit("participant:offline", {
                            userId: user.userId,
                            socketId: socket.id
                        });
                        console.log(`👋 User ${user.userId} marked offline in ${auctionId}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Error in disconnect handler:`, error);
            }
        });
    });

    return io;
};
