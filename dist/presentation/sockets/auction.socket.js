"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAuctionSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_service_1 = require("../../infrastructure/services/jwt/jwt.service");
const repository_di_1 = require("../../Di/repository.di");
const place_bid_usecase_1 = require("../../application/useCases/auction/place-bid.usecase");
const send_chat_message_usecase_1 = require("../../application/useCases/auction/send-chat-message.usecase");
const get_auction_room_state_usecase_1 = require("../../application/useCases/auction/get-auction-room-state.usecase");
const revoke_user_usecase_1 = require("../../application/useCases/auction/revoke-user.usecase");
const pause_auction_usecase_1 = require("../../application/useCases/seller/pause-auction.usecase");
const resume_auction_usecase_1 = require("../../application/useCases/seller/resume-auction.usecase");
const end_auction_usecase_1 = require("../../application/useCases/seller/end-auction.usecase");
const auction_errors_1 = require("../../domain/auction/auction.errors");
const auction_messages_1 = require("../../application/constants/auction.messages");
const user_entity_1 = require("../../domain/user/user.entity");
const redis_service_1 = require("../../infrastructure/services/redis/redis.service");
const parseCookieToken = (cookieHeader) => {
    if (!cookieHeader)
        return "";
    const pairs = cookieHeader.split(";").map((part) => part.trim());
    const match = pairs.find((p) => p.startsWith("accessToken="));
    if (!match)
        return "";
    return decodeURIComponent(match.split("=")[1] || "");
};
const initAuctionSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });
    // Subscribe to global auction events
    redis_service_1.redisService.subscribe("global:auction:events", (message) => {
        try {
            const { room, event, data } = JSON.parse(message);
            if (room && event) {
                io.to(room).emit(event, data);
            }
        }
        catch (error) {
            console.error("Error processing Redis message:", error);
        }
    });
    const publishEvent = async (room, event, data) => {
        const message = JSON.stringify({ room, event, data });
        await redis_service_1.redisService.publish("global:auction:events", message);
    };
    const placeBidUseCase = new place_bid_usecase_1.PlaceBidUseCase(repository_di_1.auctionRepository, repository_di_1.bidRepository, repository_di_1.participantRepository, repository_di_1.activityRepository, repository_di_1.transactionManager);
    const sendChatMessageUseCase = new send_chat_message_usecase_1.SendChatMessageUseCase(repository_di_1.chatMessageRepository, repository_di_1.participantRepository);
    const getRoomStateUseCase = new get_auction_room_state_usecase_1.GetAuctionRoomStateUseCase(repository_di_1.auctionRepository, repository_di_1.bidRepository, repository_di_1.chatMessageRepository, repository_di_1.activityRepository);
    const revokeUserUseCase = new revoke_user_usecase_1.RevokeUserUseCase(repository_di_1.auctionRepository, repository_di_1.participantRepository, repository_di_1.bidRepository, repository_di_1.activityRepository, repository_di_1.transactionManager);
    const pauseAuctionUseCase = new pause_auction_usecase_1.PauseAuctionUseCase(repository_di_1.auctionRepository);
    const resumeAuctionUseCase = new resume_auction_usecase_1.ResumeAuctionUseCase(repository_di_1.auctionRepository);
    const endAuctionUseCase = new end_auction_usecase_1.EndAuctionUseCase(repository_di_1.auctionRepository);
    io.use((socket, next) => {
        const token = parseCookieToken(socket.handshake.headers.cookie);
        const payload = jwt_service_1.tokenService.verifyAccessToken(token);
        if (!payload) {
            return next(new Error(auction_messages_1.AuctionMessages.UNAUTHORIZED));
        }
        socket.user = payload;
        socket.data.userId = payload.userId;
        next();
    });
    io.on("connection", (socket) => {
        const user = socket.user;
        console.log(`Socket connected: ${socket.id}, User: ${user?.userId}`);
        socket.on("room:join", async ({ auctionId }) => {
            try {
                console.log(`User ${user.userId} joining room: auction:${auctionId}`);
                const auction = await repository_di_1.auctionRepository.findById(auctionId);
                if (!auction) {
                    console.log(`Auction not found: ${auctionId}`);
                    socket.emit("room:error", { code: auction_errors_1.AuctionErrorCode.AUCTION_NOT_FOUND, message: auction_messages_1.AuctionMessages.AUCTION_NOT_FOUND });
                    return;
                }
                if (auction.sellerId === user.userId) {
                    console.log(`Seller ${user.userId} trying to join their own auction ${auctionId} as user`);
                    socket.emit("room:error", { code: auction_errors_1.AuctionErrorCode.SELLER_NOT_ALLOWED, message: auction_messages_1.AuctionMessages.SELLER_NOT_ALLOWED });
                    return;
                }
                const participant = await repository_di_1.participantRepository.findByAuctionAndUser(auctionId, user.userId);
                if (!participant) {
                    console.log(`User ${user.userId} is not a participant of auction ${auctionId}`);
                    socket.emit("room:error", { code: auction_errors_1.AuctionErrorCode.NOT_PARTICIPANT, message: auction_messages_1.AuctionMessages.NOT_PARTICIPANT });
                    return;
                }
                if (participant.revokedAt) {
                    console.log(`User ${user.userId} was revoked from auction ${auctionId}`);
                    socket.emit("room:error", { code: auction_errors_1.AuctionErrorCode.USER_REVOKED, message: auction_messages_1.AuctionMessages.REVOKED_FROM_AUCTION });
                    return;
                }
                await repository_di_1.participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);
                socket.join(`auction:${auctionId}`);
                console.log(`User ${user.userId} joined room: auction:${auctionId}`);
                const state = await getRoomStateUseCase.execute(auctionId, 20, user.userId);
                const participants = await repository_di_1.participantRepository.listParticipantsWithStatus(auctionId);
                socket.emit("room:state", { ...state, participants });
                console.log(`Sent room state to ${user.userId}`);
                await publishEvent(`auction:${auctionId}`, "participant:online", {
                    userId: user.userId,
                    socketId: socket.id
                });
            }
            catch (error) {
                console.error(`Error in room:join:`, error);
                socket.emit("room:error", { message: error.message });
            }
        });
        socket.on("bid:place", async ({ auctionId, amount }, callback) => {
            try {
                console.log(`User ${user.userId} placing bid: ${amount} on auction ${auctionId}`);
                const result = await placeBidUseCase.execute(auctionId, user.userId, Number(amount));
                console.log(` Bid placed successfully: ${result.bid.id}, extended: ${result.extended}`);
                await repository_di_1.participantRepository.updateLastSeen(auctionId, user.userId);
                await publishEvent(`auction:${auctionId}`, "bid:created", result.bid);
                console.log(`Broadcasted bid to room: auction:${auctionId}`);
                if (result.extended) {
                    await publishEvent(`auction:${auctionId}`, "auction:extended", {
                        newEndTime: result.newEndTime,
                        extensionCount: result.extensionCount
                    });
                    console.log(`Broadcasted auction extension: new end time ${result.newEndTime}`);
                }
                const recentActivities = await repository_di_1.activityRepository.getRecentActivities(auctionId, 1);
                if (recentActivities.length > 0) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", recentActivities[0]);
                }
                if (callback && typeof callback === 'function') {
                    callback({ success: true, bid: result.bid, extended: result.extended });
                }
            }
            catch (error) {
                const err = error;
                console.error(`Bid error:`, err.message);
                const errorResponse = {
                    success: false,
                    code: err instanceof auction_errors_1.AuctionError ? err.code : auction_errors_1.AuctionErrorCode.NOT_ALLOWED,
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
                await repository_di_1.participantRepository.updateLastSeen(auctionId, user.userId);
                if (isSeller) {
                    const truncatedMsg = message.length > 50 ? `${message.substring(0, 50)}...` : message;
                    const activity = await repository_di_1.activityRepository.logActivity(auctionId, "SELLER_MESSAGE", `Seller: "${truncatedMsg}"`, user.userId).catch(err => {
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
            }
            catch (error) {
                const err = error;
                console.error(`Chat error:`, err.message);
                const errorResponse = {
                    success: false,
                    code: err instanceof auction_errors_1.AuctionError ? err.code : auction_errors_1.AuctionErrorCode.NOT_ALLOWED,
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
                const isAdmin = user.roles.includes(user_entity_1.UserRole.ADMIN);
                console.log(`${isAdmin ? 'Admin' : 'Seller'} ${user.userId} joining room: auction:${auctionId}`);
                const auction = await repository_di_1.auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    console.log(`User ${user.userId} not authorized for auction ${auctionId}`);
                    socket.emit("room:error", { message: auction_messages_1.AuctionMessages.NOT_ALLOWED });
                    return;
                }
                socket.join(`auction:${auctionId}`);
                console.log(`${isAdmin ? 'Admin' : 'Seller'} ${user.userId} joined room: auction:${auctionId}`);
                const state = await getRoomStateUseCase.execute(auctionId, 20);
                const participants = await repository_di_1.participantRepository.listParticipantsWithStatus(auctionId);
                socket.emit("room:state", { ...state, participants });
                console.log(`Sent room state to ${isAdmin ? 'admin' : 'seller'} ${user.userId}`);
            }
            catch (error) {
                console.error(`Error in seller:join:`, error);
                socket.emit("room:error", { message: error.message });
            }
        });
        socket.on("seller:revoke-user", async ({ auctionId, userId }) => {
            try {
                const user = socket.user;
                const isAdmin = user.roles.includes(user_entity_1.UserRole.ADMIN);
                console.log(`${isAdmin ? 'Admin' : 'Seller'} ${user.userId} revoking user ${userId} from auction ${auctionId}`);
                const auction = await repository_di_1.auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    console.log(`Unauthorized revoke attempt`);
                    socket.emit("room:error", { code: auction_errors_1.AuctionErrorCode.NOT_ALLOWED, message: auction_messages_1.AuctionMessages.NOT_ALLOWED });
                    return;
                }
                const result = await revokeUserUseCase.execute(auctionId, user.userId, userId);
                console.log(`User revoked successfully:`, result);
                const room = `auction:${auctionId}`;
                const sockets = await io.in(room).fetchSockets();
                let disconnectedCount = 0;
                for (const s of sockets) {
                    if (s.user?.userId === userId || s.data.userId === userId) {
                        console.log(`Disconnecting revoked user socket: ${s.id}`);
                        await repository_di_1.participantRepository.setOnlineStatus(auctionId, userId, false).catch(err => console.error('Failed to set offline status:', err));
                        s.emit("user:revoked", {
                            code: auction_errors_1.AuctionErrorCode.USER_REVOKED,
                            message: auction_messages_1.AuctionMessages.REVOKED_FROM_AUCTION,
                            auctionId
                        });
                        s.leave(room);
                        setTimeout(() => s.disconnect(true), 500);
                        disconnectedCount++;
                    }
                }
                console.log(`👋 Disconnected ${disconnectedCount} socket(s) for user ${userId}`);
                const activity = await repository_di_1.activityRepository.logActivity(auctionId, "USER_REVOKED", isAdmin ? "User revoked from auction by Admin" : "User revoked from auction", user.userId, { revokedUserId: userId, invalidatedBids: result.invalidatedBids }).catch(err => {
                    console.error('Failed to log revoke activity:', err);
                    return null;
                });
                if (activity) {
                    await publishEvent(room, "activity:created", activity);
                }
                const participants = await repository_di_1.participantRepository.listParticipantsWithStatus(auctionId);
                await publishEvent(room, "participants:updated", { participants });
                socket.emit("revoke:success", {
                    userId,
                    message: "User has been revoked and removed from the auction",
                    invalidatedBids: result.invalidatedBids,
                    priceChanged: result.priceChanged,
                    newPrice: result.newPrice
                });
                console.log(`📤 Broadcasted revoke and participants update to room`);
            }
            catch (error) {
                const err = error;
                console.error(`❌ Revoke error:`, err);
                if (err instanceof auction_errors_1.AuctionError) {
                    socket.emit("room:error", { code: err.code, message: err.message });
                    return;
                }
                socket.emit("room:error", { code: auction_errors_1.AuctionErrorCode.NOT_ALLOWED, message: err.message });
            }
        });
        socket.on("seller:pause-auction", async ({ auctionId }) => {
            try {
                const user = socket.user;
                const isAdmin = user.roles.includes(user_entity_1.UserRole.ADMIN);
                console.log(`⏸️ ${isAdmin ? 'Admin' : 'Seller'} ${user.userId} pausing auction ${auctionId}`);
                const auction = await repository_di_1.auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    socket.emit("room:error", { message: auction_messages_1.AuctionMessages.NOT_ALLOWED });
                    return;
                }
                await pauseAuctionUseCase.execute(auctionId, user.userId);
                const activity = await repository_di_1.activityRepository.logActivity(auctionId, "AUCTION_PAUSED", isAdmin ? "Auction paused by Admin" : "Auction paused by seller", user.userId).catch(err => {
                    console.error('Failed to log pause activity:', err);
                    return null;
                });
                await publishEvent(`auction:${auctionId}`, "auction:paused", { auctionId });
                if (activity) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", activity);
                }
                console.log(`📤 Broadcasted auction paused`);
            }
            catch (error) {
                console.error(`❌ Pause error:`, error);
                socket.emit("room:error", { message: error.message });
            }
        });
        socket.on("seller:resume-auction", async ({ auctionId }) => {
            try {
                const user = socket.user;
                const isAdmin = user.roles.includes(user_entity_1.UserRole.ADMIN);
                console.log(`▶️ ${isAdmin ? 'Admin' : 'Seller'} ${user.userId} resuming auction ${auctionId}`);
                const auction = await repository_di_1.auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    socket.emit("room:error", { message: auction_messages_1.AuctionMessages.NOT_ALLOWED });
                    return;
                }
                await resumeAuctionUseCase.execute(auctionId, user.userId);
                const activity = await repository_di_1.activityRepository.logActivity(auctionId, "AUCTION_RESUMED", isAdmin ? "Auction resumed by Admin" : "Auction resumed by seller", user.userId).catch(err => {
                    console.error('Failed to log resume activity:', err);
                    return null;
                });
                await publishEvent(`auction:${auctionId}`, "auction:resumed", { auctionId });
                if (activity) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", activity);
                }
                console.log(`📤 Broadcasted auction resumed`);
            }
            catch (error) {
                console.error(`❌ Resume error:`, error);
                socket.emit("room:error", { message: error.message });
            }
        });
        socket.on("seller:end-auction", async ({ auctionId }) => {
            try {
                const user = socket.user;
                const isAdmin = user.roles.includes(user_entity_1.UserRole.ADMIN);
                console.log(`🏁 ${isAdmin ? 'Admin' : 'Seller'} ${user.userId} ending auction ${auctionId}`);
                const auction = await repository_di_1.auctionRepository.findById(auctionId);
                if (!auction || (!isAdmin && auction.sellerId !== user.userId)) {
                    socket.emit("room:error", { message: auction_messages_1.AuctionMessages.NOT_ALLOWED });
                    return;
                }
                await endAuctionUseCase.execute(auctionId, user.userId);
                const activity = await repository_di_1.activityRepository.logActivity(auctionId, "AUCTION_ENDED", isAdmin ? "Auction ended by Admin" : "Auction ended by seller", user.userId).catch(err => {
                    console.error('Failed to log end activity:', err);
                    return null;
                });
                await publishEvent(`auction:${auctionId}`, "auction:ended", { auctionId });
                if (activity) {
                    await publishEvent(`auction:${auctionId}`, "activity:created", activity);
                }
                console.log(`📤 Broadcasted auction ended`);
            }
            catch (error) {
                console.error(`❌ End error:`, error);
                socket.emit("room:error", { message: error.message });
            }
        });
        socket.on("disconnect", async () => {
            try {
                console.log(`🔌 Socket disconnected: ${socket.id}, User: ${user.userId}`);
                const rooms = Array.from(socket.rooms);
                for (const room of rooms) {
                    if (room.startsWith("auction:")) {
                        const auctionId = room.replace("auction:", "");
                        await repository_di_1.participantRepository.setOnlineStatus(auctionId, user.userId, false);
                        await publishEvent(room, "participant:offline", {
                            userId: user.userId,
                            socketId: socket.id
                        });
                        console.log(`User ${user.userId} marked offline in ${auctionId}`);
                    }
                }
            }
            catch (error) {
                console.error(`Error in disconnect handler:`, error);
            }
        });
    });
    return io;
};
exports.initAuctionSocket = initAuctionSocket;
