import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { tokenService } from "../../infrastructure/services/jwt/jwt.service";
import { auctionRepository, bidRepository, chatMessageRepository, participantRepository, transactionManager, activityRepository } from "../../Di/repository.di";
import { PlaceBidUseCase } from "../../application/useCases/auction/place-bid.usecase";
import { SendChatMessageUseCase } from "../../application/useCases/auction/send-chat-message.usecase";
import { GetAuctionRoomStateUseCase } from "../../application/useCases/auction/get-auction-room-state.usecase";
import { RevokeUserUseCase } from "../../application/useCases/auction/revoke-user.usecase";
import { PauseAuctionUseCase } from "../../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase } from "../../application/useCases/seller/end-auction.usecase";
import { AuctionError, AuctionErrorCode } from "../../domain/auction/auction.errors";
import { AuctionMessages } from "../../application/constants/auction.messages";
import { UserRole } from "../../domain/user/user.entity";
import { redisService } from "../../infrastructure/services/redis/redis.service";

const parseCookieToken = (cookieHeader?: string) => {
    if (!cookieHeader) return "";
    const pairs = cookieHeader.split(";").map((part) => part.trim());
    const match = pairs.find((p) => p.startsWith("accessToken="));
    if (!match) return "";
    return decodeURIComponent(match.split("=")[1] || "");
};

export const initAuctionSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });

    // Subscribe to global auction events
    redisService.subscribe("global:auction:events", (message) => {
        try {
            const { room, event, data } = JSON.parse(message);
            if (room && event) {
                io.to(room).emit(event, data);
            }
        } catch (error) {
            console.error("Error processing Redis message:", error);
        }
    });

    const publishEvent = async (room: string, event: string, data: any) => {
        const message = JSON.stringify({ room, event, data });
        await redisService.publish("global:auction:events", message);
    };

    const placeBidUseCase = new PlaceBidUseCase(auctionRepository, bidRepository, participantRepository, activityRepository, transactionManager);
    const sendChatMessageUseCase = new SendChatMessageUseCase(chatMessageRepository, participantRepository);
    const getRoomStateUseCase = new GetAuctionRoomStateUseCase(auctionRepository, bidRepository, chatMessageRepository, activityRepository);
    const revokeUserUseCase = new RevokeUserUseCase(auctionRepository, participantRepository, bidRepository, activityRepository, transactionManager);
    const pauseAuctionUseCase = new PauseAuctionUseCase(auctionRepository);
    const resumeAuctionUseCase = new ResumeAuctionUseCase(auctionRepository);
    const endAuctionUseCase = new EndAuctionUseCase(auctionRepository);

    io.use((socket, next) => {
        const token = parseCookieToken(socket.handshake.headers.cookie);
        const payload = tokenService.verifyAccessToken(token);
        if (!payload) {
            return next(new Error(AuctionMessages.UNAUTHORIZED));
        }
        (socket as any).user = payload;
        socket.data.userId = payload.userId;
        next();
    });

    io.on("connection", (socket) => {
        const user = (socket as any).user;
        console.log(`Socket connected: ${socket.id}, User: ${user?.userId}`);

        socket.on("room:join", async ({ auctionId }) => {
            try {
                console.log(`User ${user.userId} joining room: auction:${auctionId}`);
                const auction = await auctionRepository.findById(auctionId);
                if (!auction) {
                    console.log(`Auction not found: ${auctionId}`);
                    socket.emit("room:error", { code: AuctionErrorCode.AUCTION_NOT_FOUND, message: AuctionMessages.AUCTION_NOT_FOUND });
                    return;
                }

                if (auction.sellerId === user.userId) {
                    console.log(`Seller ${user.userId} trying to join their own auction ${auctionId} as user`);
                    socket.emit("room:error", { code: AuctionErrorCode.SELLER_NOT_ALLOWED, message: AuctionMessages.SELLER_NOT_ALLOWED });
                    return;
                }

                const participant = await participantRepository.findByAuctionAndUser(auctionId, user.userId);
                if (!participant) {
                    console.log(`User ${user.userId} is not a participant of auction ${auctionId}`);
                    socket.emit("room:error", { code: AuctionErrorCode.NOT_PARTICIPANT, message: AuctionMessages.NOT_PARTICIPANT });
                    return;
                }
                if (participant.revokedAt) {
                    console.log(`User ${user.userId} was revoked from auction ${auctionId}`);
                    socket.emit("room:error", { code: AuctionErrorCode.USER_REVOKED, message: AuctionMessages.REVOKED_FROM_AUCTION });
                    return;
                }

                await participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);
                socket.join(`auction:${auctionId}`);
                console.log(`User ${user.userId} joined room: auction:${auctionId}`);

                const state = await getRoomStateUseCase.execute(auctionId, 20, user.userId);
                const participants = await participantRepository.listParticipantsWithStatus(auctionId);

                socket.emit("room:state", { ...state, participants });
                console.log(`Sent room state to ${user.userId}`);

                await publishEvent(`auction:${auctionId}`, "participant:online", {
                    userId: user.userId,
                    socketId: socket.id
                });
            } catch (error) {
                console.error(`Error in room:join:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("bid:place", async ({ auctionId, amount }, callback) => {
            try {
                console.log(`User ${user.userId} placing bid: ${amount} on auction ${auctionId}`);
                const result = await placeBidUseCase.execute(auctionId, user.userId, Number(amount));
                console.log(` Bid placed successfully: ${result.bid.id}, extended: ${result.extended}`);

                await participantRepository.updateLastSeen(auctionId, user.userId);

                await publishEvent(`auction:${auctionId}`, "bid:created", result.bid);
                console.log(`Broadcasted bid to room: auction:${auctionId}`);

                if (result.extended) {
                    await publishEvent(`auction:${auctionId}`, "auction:extended", {
                        newEndTime: result.newEndTime,
                        extensionCount: result.extensionCount
                    });
                    console.log(`Broadcasted auction extension: new end time ${result.newEndTime}`);
                }

                const recentActivities = await activityRepository.getRecentActivities(auctionId, 1);
                if (recentActivities.length > 0) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", recentActivities[0]);
                }

                if (callback && typeof callback === 'function') {
                    callback({ success: true, bid: result.bid, extended: result.extended });
                }
            } catch (error) {
                const err = error as Error;
                console.error(`Bid error:`, err.message);

                const errorResponse = {
                    success: false,
                    code: err instanceof AuctionError ? err.code : AuctionErrorCode.NOT_ALLOWED,
                    message: err.message
                };

                socket.emit("bid:error", errorResponse);

                if (callback && typeof callback === 'function') {
                    callback(errorResponse);
                }
            }
        });

        socket.on("chat:send", async ({ auctionId, message, isSeller }, callback) => {
            try {
                console.log(`User ${user.userId} sending message to auction ${auctionId}: ${message}`);
                const chatMessage = await sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
                console.log(`Chat message created: ${chatMessage.id}`);

                await participantRepository.updateLastSeen(auctionId, user.userId);

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
                        await publishEvent(`auction:${auctionId}`, "activity:created", activity);
                    }
                }

                await publishEvent(`auction:${auctionId}`, "chat:created", chatMessage);
                console.log(`Broadcasted chat to room: auction:${auctionId}`);

                if (callback && typeof callback === 'function') {
                    callback({ success: true, message: chatMessage });
                }
            } catch (error) {
                const err = error as Error;
                console.error(`Chat error:`, err.message);

                const errorResponse = {
                    success: false,
                    code: err instanceof AuctionError ? err.code : AuctionErrorCode.NOT_ALLOWED,
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
                const isAdmin = user.roles.includes(UserRole.ADMIN);
                console.log(`${isAdmin ? 'Admin' : 'Seller'} ${user.userId} joining room: auction:${auctionId}`);
                const auction = await auctionRepository.findById(auctionId);

                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    console.log(`User ${user.userId} not authorized for auction ${auctionId}`);
                    socket.emit("room:error", { message: AuctionMessages.NOT_ALLOWED });
                    return;
                }
                socket.join(`auction:${auctionId}`);
                console.log(`${isAdmin ? 'Admin' : 'Seller'} ${user.userId} joined room: auction:${auctionId}`);

                const state = await getRoomStateUseCase.execute(auctionId, 20);
                const participants = await participantRepository.listParticipantsWithStatus(auctionId);

                socket.emit("room:state", { ...state, participants });
                console.log(`Sent room state to ${isAdmin ? 'admin' : 'seller'} ${user.userId}`);
            } catch (error) {
                console.error(`Error in seller:join:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("seller:revoke-user", async ({ auctionId, userId }) => {
            try {
                const user = (socket as any).user;
                const isAdmin = user.roles.includes(UserRole.ADMIN);
                console.log(`${isAdmin ? 'Admin' : 'Seller'} ${user.userId} revoking user ${userId} from auction ${auctionId}`);

                const auction = await auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    console.log(`Unauthorized revoke attempt`);
                    socket.emit("room:error", { code: AuctionErrorCode.NOT_ALLOWED, message: AuctionMessages.NOT_ALLOWED });
                    return;
                }

                const result = await revokeUserUseCase.execute(auctionId, user.userId, userId);
                console.log(`User revoked successfully:`, result);

                const room = `auction:${auctionId}`;
                const sockets = await io.in(room).fetchSockets();
                let disconnectedCount = 0;

                for (const s of sockets) {
                    if ((s as any).user?.userId === userId || s.data.userId === userId) {
                        console.log(`Disconnecting revoked user socket: ${s.id}`);

                        await participantRepository.setOnlineStatus(auctionId, userId, false).catch(err =>
                            console.error('Failed to set offline status:', err)
                        );

                        s.emit("user:revoked", {
                            code: AuctionErrorCode.USER_REVOKED,
                            message: AuctionMessages.REVOKED_FROM_AUCTION,
                            auctionId
                        });

                        s.leave(room);
                        setTimeout(() => s.disconnect(true), 500);
                        disconnectedCount++;
                    }
                }

                console.log(`👋 Disconnected ${disconnectedCount} socket(s) for user ${userId}`);

                const activity = await activityRepository.logActivity(
                    auctionId,
                    "USER_REVOKED",
                    isAdmin ? "User revoked from auction by Admin" : "User revoked from auction",
                    user.userId,
                    { revokedUserId: userId, invalidatedBids: result.invalidatedBids }
                ).catch(err => {
                    console.error('Failed to log revoke activity:', err);
                    return null;
                });

                if (activity) {
                    await publishEvent(room, "activity:created", activity);
                }

                const participants = await participantRepository.listParticipantsWithStatus(auctionId);
                await publishEvent(room, "participants:updated", { participants });

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
                socket.emit("room:error", { code: AuctionErrorCode.NOT_ALLOWED, message: err.message });
            }
        });

        socket.on("seller:pause-auction", async ({ auctionId }) => {
            try {
                const user = (socket as any).user;
                const isAdmin = user.roles.includes(UserRole.ADMIN);
                console.log(`⏸️ ${isAdmin ? 'Admin' : 'Seller'} ${user.userId} pausing auction ${auctionId}`);

                const auction = await auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    socket.emit("room:error", { message: AuctionMessages.NOT_ALLOWED });
                    return;
                }

                await pauseAuctionUseCase.execute(auctionId, user.userId);

                const activity = await activityRepository.logActivity(
                    auctionId,
                    "AUCTION_PAUSED",
                    isAdmin ? "Auction paused by Admin" : "Auction paused by seller",
                    user.userId
                ).catch(err => {
                    console.error('Failed to log pause activity:', err);
                    return null;
                });

                await publishEvent(`auction:${auctionId}`, "auction:paused", { auctionId });
                if (activity) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", activity);
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
                const isAdmin = user.roles.includes(UserRole.ADMIN);
                console.log(`▶️ ${isAdmin ? 'Admin' : 'Seller'} ${user.userId} resuming auction ${auctionId}`);

                const auction = await auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    socket.emit("room:error", { message: AuctionMessages.NOT_ALLOWED });
                    return;
                }

                await resumeAuctionUseCase.execute(auctionId, user.userId);

                const activity = await activityRepository.logActivity(
                    auctionId,
                    "AUCTION_RESUMED",
                    isAdmin ? "Auction resumed by Admin" : "Auction resumed by seller",
                    user.userId
                ).catch(err => {
                    console.error('Failed to log resume activity:', err);
                    return null;
                });

                await publishEvent(`auction:${auctionId}`, "auction:resumed", { auctionId });
                if (activity) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", activity);
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
                const isAdmin = user.roles.includes(UserRole.ADMIN);
                console.log(`🏁 ${isAdmin ? 'Admin' : 'Seller'} ${user.userId} ending auction ${auctionId}`);

                const auction = await auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    socket.emit("room:error", { message: AuctionMessages.NOT_ALLOWED });
                    return;
                }

                await endAuctionUseCase.execute(auctionId, user.userId);

                const activity = await activityRepository.logActivity(
                    auctionId,
                    "AUCTION_ENDED",
                    isAdmin ? "Auction ended by Admin" : "Auction ended by seller",
                    user.userId
                ).catch(err => {
                    console.error('Failed to log end activity:', err);
                    return null;
                });

                await publishEvent(`auction:${auctionId}`, "auction:ended", { auctionId });
                if (activity) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", activity);
                }
                console.log(`📤 Broadcasted auction ended`);
            } catch (error) {
                console.error(`❌ End error:`, error);
                socket.emit("room:error", { message: (error as Error).message });
            }
        });

        socket.on("disconnect", async () => {
            try {
                console.log(`🔌 Socket disconnected: ${socket.id}, User: ${user.userId}`);

                const rooms = Array.from(socket.rooms);
                for (const room of rooms) {
                    if (room.startsWith("auction:")) {
                        const auctionId = room.replace("auction:", "");
                        await participantRepository.setOnlineStatus(auctionId, user.userId, false);

                        await publishEvent(room, "participant:offline", {
                            userId: user.userId,
                            socketId: socket.id
                        });
                        console.log(`User ${user.userId} marked offline in ${auctionId}`);
                    }
                }
            } catch (error) {
                console.error(`Error in disconnect handler:`, error);
            }
        });
    });

    return io;
};

