import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { tokenService } from "../../infrastructure/services/jwt/jwt.service";
import { auctionRepository, bidRepository, chatMessageRepository, participantRepository, transactionManager } from "../../Di/repository.di";
import { PlaceBidUseCase } from "../../application/useCases/auction/place-bid.usecase";
import { SendChatMessageUseCase } from "../../application/useCases/auction/send-chat-message.usecase";
import { GetAuctionRoomStateUseCase } from "../../application/useCases/auction/get-auction-room-state.usecase";
import { RevokeUserUseCase } from "../../application/useCases/auction/revoke-user.usecase";
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
        socket.on("room:join", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                const auction = await auctionRepository.findById(auctionId);
                if (!auction) {
                    socket.emit("room:error", { message: "Auction not found" });
                    return;
                }
                const participant = await participantRepository.findByAuctionAndUser(auctionId, user.userId);
                if (!participant || participant.revokedAt) {
                    socket.emit("room:error", { message: "Not allowed" });
                    return;
                }

                socket.join(`auction:${auctionId}`);
                const state = await getRoomStateUseCase.execute(auctionId, 20);
                socket.emit("room:state", state);
            } catch (error) {
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("bid:place", async ({ auctionId, amount }) => {
            try {
                const user = (socket as any).user;
                const bid = await placeBidUseCase.execute(auctionId, user.userId, Number(amount));
                io.to(`auction:${auctionId}`).emit("bid:created", bid);
            } catch (error) {
                const err = error as Error;
                if (err instanceof AuctionError) {
                    socket.emit("bid:error", { code: err.code, message: err.message });
                    return;
                }
                socket.emit("bid:error", { code: "NOT_ALLOWED", message: err.message });
            }
        });

        socket.on("chat:send", async ({ auctionId, message }) => {
            try {
                const user = (socket as any).user;
                const chatMessage = await sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
                io.to(`auction:${auctionId}`).emit("chat:created", chatMessage);
            } catch (error) {
                const err = error as Error;
                if (err instanceof AuctionError) {
                    socket.emit("chat:error", { code: err.code, message: err.message });
                    return;
                }
                socket.emit("chat:error", { code: "NOT_ALLOWED", message: err.message });
            }
        });

        socket.on("seller:join", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                const auction = await auctionRepository.findById(auctionId);
                if (!auction || auction.sellerId !== user.userId) {
                    socket.emit("room:error", { message: "Not allowed" });
                    return;
                }
                socket.join(`auction:${auctionId}`);
                const state = await getRoomStateUseCase.execute(auctionId, 20);
                socket.emit("room:state", state);
            } catch (error) {
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
    });

    return io;
};
