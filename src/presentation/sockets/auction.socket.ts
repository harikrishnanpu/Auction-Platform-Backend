import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { tokenService } from "../../infrastructure/services/jwt/jwt.service";
import { auctionRepository, bidRepository, chatMessageRepository, participantRepository, transactionManager, activityRepository, paymentRepository } from "../../Di/repository.di";
import { PlaceBidUseCase } from "../../application/useCases/auction/place-bid.usecase";
import { SendChatMessageUseCase } from "../../application/useCases/auction/send-chat-message.usecase";
import { GetAuctionRoomStateUseCase } from "../../application/useCases/auction/get-auction-room-state.usecase";
import { RevokeUserUseCase } from "../../application/useCases/auction/revoke-user.usecase";
import { PauseAuctionUseCase } from "../../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase as AuctionEndAuctionUseCase } from "../../application/useCases/auction/end-auction.usecase";
import { AuctionError } from "../../domain/auction/auction.errors";

export const initAuctionSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true
        }
    });

    const placeBidUseCase = new PlaceBidUseCase(auctionRepository, bidRepository, participantRepository, activityRepository, transactionManager);
    const sendChatMessageUseCase = new SendChatMessageUseCase(
        chatMessageRepository,
        participantRepository,
        auctionRepository
    );
    const getRoomStateUseCase = new GetAuctionRoomStateUseCase(auctionRepository, bidRepository, chatMessageRepository, activityRepository);
    const revokeUserUseCase = new RevokeUserUseCase(auctionRepository, participantRepository, bidRepository, activityRepository, transactionManager);
    const pauseAuctionUseCase = new PauseAuctionUseCase(auctionRepository);
    const auctionEndAuctionUseCase = new AuctionEndAuctionUseCase(auctionRepository, bidRepository, activityRepository, paymentRepository);
    const resumeAuctionUseCase = new ResumeAuctionUseCase(auctionRepository, auctionEndAuctionUseCase);

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
                    socket.emit("room:error", { code: "AUCTION_NOT_FOUND", message: "Auction not found" });
                    return;
                }
                
                // Prevent seller from joining their own auction as a user
                if (auction.sellerId === user.userId) {
                    console.log(`❌ Seller ${user.userId} trying to join their own auction ${auctionId} as user`);
                    socket.emit("room:error", { code: "SELLER_NOT_ALLOWED", message: "Sellers cannot join their own auction. Please use the seller dashboard." });
                    return;
                }
                
                const participant = await participantRepository.findByAuctionAndUser(auctionId, user.userId);
                if (!participant) {
                    console.log(`❌ User ${user.userId} is not a participant of auction ${auctionId}`);
                    socket.emit("room:error", { code: "NOT_PARTICIPANT", message: "Not a participant. Please enter the auction first." });
                    return;
                }
                if (participant.revokedAt) {
                    console.log(`❌ User ${user.userId} was revoked from auction ${auctionId}`);
                    socket.emit("room:error", { code: "USER_REVOKED", message: "You have been revoked from this auction and cannot access it" });
                    return;
                }

                // Mark user as online
                await participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);
                socket.join(`auction:${auctionId}`);
                console.log(`✅ User ${user.userId} joined room: auction:${auctionId}`);
                
                // Get room state with user's last bid time for rate limit persistence
                const state = await getRoomStateUseCase.execute(auctionId, 20, user.userId);
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

        socket.on("bid:place", async ({ auctionId, amount }, callback) => {
            try {
                console.log(`💰 User ${user.userId} placing bid: ${amount} on auction ${auctionId}`);
                const result = await placeBidUseCase.execute(auctionId, user.userId, Number(amount));
                console.log(`✅ Bid placed successfully: ${result.bid.id}, extended: ${result.extended}`);
                
                // Update last seen
                await participantRepository.updateLastSeen(auctionId, user.userId);
                
                // Emit bid created event to all users
                io.to(`auction:${auctionId}`).emit("bid:created", result.bid);
                console.log(`📤 Broadcasted bid to room: auction:${auctionId}`);
                
                // If auction was extended, broadcast extension event
                if (result.extended) {
                    io.to(`auction:${auctionId}`).emit("auction:extended", {
                        newEndTime: result.newEndTime,
                        extensionCount: result.extensionCount
                    });
                    console.log(`📤 Broadcasted auction extension: new end time ${result.newEndTime}`);
                }
                
                // Broadcast the new activity (bid activity)
                const recentActivities = await activityRepository.getRecentActivities(auctionId, 1);
                if (recentActivities.length > 0) {
                    io.to(`auction:${auctionId}`).emit("activity:created", recentActivities[0]);
                }
                
                // Send success acknowledgment to the bidder
                if (callback && typeof callback === 'function') {
                    callback({ success: true, bid: result.bid, extended: result.extended });
                }
            } catch (error) {
                const err = error as Error;
                console.error(`❌ Bid error:`, err.message);
                
                const errorResponse = {
                    success: false,
                    code: err instanceof AuctionError ? err.code : "NOT_ALLOWED",
                    message: err.message
                };
                
                // Send error to the specific socket
                socket.emit("bid:error", errorResponse);
                
                // Send error via callback as well
                if (callback && typeof callback === 'function') {
                    callback(errorResponse);
                }
            }
        });

        socket.on("chat:send", async ({ auctionId, message, isSeller }, callback) => {
            try {
                console.log(`💬 User ${user.userId} sending message to auction ${auctionId}: ${message}`);
                const chatMessage = await sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
                console.log(`✅ Chat message created: ${chatMessage.id}`);
                
                // Update last seen
                await participantRepository.updateLastSeen(auctionId, user.userId);
                
                // Log activity for seller messages only
                if (isSeller) {
                    const truncatedMsg = message.length > 50 ? `${message.substring(0, 50)}...` : message;
                    const activity = await activityRepository.logActivity(
                        auctionId,
                        "SELLER_MESSAGE",
                        `Seller: "${truncatedMsg}"`,
                        user.userId
                    ).catch(err => {
                        console.error('Failed to log seller message activity:', err);
                        return null;
                    });
                    if (activity) {
                        io.to(`auction:${auctionId}`).emit("activity:created", activity);
                    }
                }
                
                // Broadcast to all users
                io.to(`auction:${auctionId}`).emit("chat:created", chatMessage);
                console.log(`📤 Broadcasted chat to room: auction:${auctionId}`);
                
                // Send success acknowledgment
                if (callback && typeof callback === 'function') {
                    callback({ success: true, message: chatMessage });
                }
            } catch (error) {
                const err = error as Error;
                console.error(`❌ Chat error:`, err.message);
                
                const errorResponse = {
                    success: false,
                    code: err instanceof AuctionError ? err.code : "NOT_ALLOWED",
                    message: err.message
                };
                
                socket.emit("chat:error", errorResponse);
                
                if (callback && typeof callback === 'function') {
                    callback(errorResponse);
                }
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
                
                // Get room state and participants (no need for seller's last bid time)
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
                console.log(`🚫 Seller ${user.userId} revoking user ${userId} from auction ${auctionId}`);
                
                // Check authorization
                const auction = await auctionRepository.findById(auctionId);
                if (!auction || auction.sellerId !== user.userId) {
                    console.log(`❌ Unauthorized revoke attempt`);
                    socket.emit("room:error", { code: "NOT_ALLOWED", message: "Not authorized" });
                    return;
                }
                
                const result = await revokeUserUseCase.execute(auctionId, user.userId, userId);
                console.log(`✅ User revoked successfully:`, result);

                const room = `auction:${auctionId}`;
                
                // Find and disconnect ALL sockets for the revoked user
                const sockets = await io.in(room).fetchSockets();
                let disconnectedCount = 0;
                
                for (const s of sockets) {
                    if ((s as any).user?.userId === userId || s.data.userId === userId) {
                        console.log(`🚫 Disconnecting revoked user socket: ${s.id}`);
                        
                        // Mark as offline
                        await participantRepository.setOnlineStatus(auctionId, userId, false).catch(err => 
                            console.error('Failed to set offline status:', err)
                        );
                        
                        // Send revoke message to the user
                        s.emit("user:revoked", { 
                            code: "USER_REVOKED",
                            message: "You have been revoked from this auction by the seller",
                            auctionId
                        });
                        
                        // Remove from room and disconnect
                        s.leave(room);
                        setTimeout(() => s.disconnect(true), 500);
                        disconnectedCount++;
                    }
                }
                
                console.log(`👋 Disconnected ${disconnectedCount} socket(s) for user ${userId}`);
                
                // Log activity
                const activity = await activityRepository.logActivity(
                    auctionId,
                    "USER_REVOKED",
                    `User revoked from auction`,
                    user.userId,
                    { revokedUserId: userId, invalidatedBids: result.invalidatedBids }
                ).catch(err => {
                    console.error('Failed to log revoke activity:', err);
                    return null;
                });
                
                if (activity) {
                    io.to(room).emit("activity:created", activity);
                }
                
                // Get updated participants list
                const participants = await participantRepository.listParticipantsWithStatus(auctionId);
                
                // Broadcast updated participants to remaining users
                io.to(room).emit("participants:updated", { participants });
                
                // Send success confirmation to seller
                socket.emit("revoke:success", { 
                    userId, 
                    message: "User has been revoked and removed from the auction",
                    invalidatedBids: result.invalidatedBids,
                    priceChanged: result.priceChanged,
                    newPrice: result.newPrice
                });
                
                console.log(`📤 Broadcasted revoke and participants update to room`);
            } catch (error) {
                const err = error as Error;
                console.error(`❌ Revoke error:`, err);
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
                console.log(`⏸️ Seller ${user.userId} pausing auction ${auctionId}`);
                await pauseAuctionUseCase.execute(auctionId, user.userId);
                
                // Log activity and broadcast
                const activity = await activityRepository.logActivity(
                    auctionId,
                    "AUCTION_PAUSED",
                    "Auction paused by seller",
                    user.userId
                ).catch(err => {
                    console.error('Failed to log pause activity:', err);
                    return null;
                });
                
                io.to(`auction:${auctionId}`).emit("auction:paused", { auctionId });
                if (activity) {
                    io.to(`auction:${auctionId}`).emit("activity:created", activity);
                }
                console.log(`📤 Broadcasted auction paused`);
            } catch (error) {
                console.error(`❌ Pause error:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("seller:resume-auction", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                console.log(`▶️ Seller ${user.userId} resuming auction ${auctionId}`);
                await resumeAuctionUseCase.execute(auctionId, user.userId);
                
                // Log activity and broadcast
                const activity = await activityRepository.logActivity(
                    auctionId,
                    "AUCTION_RESUMED",
                    "Auction resumed by seller",
                    user.userId
                ).catch(err => {
                    console.error('Failed to log resume activity:', err);
                    return null;
                });
                
                io.to(`auction:${auctionId}`).emit("auction:resumed", { auctionId });
                if (activity) {
                    io.to(`auction:${auctionId}`).emit("activity:created", activity);
                }
                console.log(`📤 Broadcasted auction resumed`);
            } catch (error) {
                console.error(`❌ Resume error:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("seller:end-auction", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                console.log(`🏁 Seller ${user.userId} ending auction ${auctionId}`);
                const auction = await auctionRepository.findById(auctionId);
                if (!auction || auction.sellerId !== user.userId) {
                    socket.emit("room:error", { message: "Unauthorized: Only the seller can end this auction" });
                    return;
                }

                await auctionEndAuctionUseCase.execute(auctionId, 'SELLER');
                
                // Log activity and broadcast
                const activity = await activityRepository.logActivity(
                    auctionId,
                    "AUCTION_ENDED",
                    "Auction ended by seller",
                    user.userId
                ).catch(err => {
                    console.error('Failed to log end activity:', err);
                    return null;
                });
                
                io.to(`auction:${auctionId}`).emit("auction:ended", { auctionId });
                if (activity) {
                    io.to(`auction:${auctionId}`).emit("activity:created", activity);
                }
                console.log(`📤 Broadcasted auction ended`);
            } catch (error) {
                console.error(`❌ End error:`, error);
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
