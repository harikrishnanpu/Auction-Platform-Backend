"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionSocketHandler = void 0;
const jwt_service_1 = require("../../infrastructure/services/jwt/jwt.service");
const auction_constants_1 = require("../../constants/auction.constants");
class AuctionSocketHandler {
    constructor(io, auctionRepository, participantRepository, activityRepository, userRepository, placeBidUseCase, sendChatMessageUseCase, getRoomStateUseCase, revokeUserUseCase, unrevokeUserUseCase, pauseAuctionUseCase, resumeAuctionUseCase, endAuctionUseCase) {
        this.io = io;
        this.auctionRepository = auctionRepository;
        this.participantRepository = participantRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.placeBidUseCase = placeBidUseCase;
        this.sendChatMessageUseCase = sendChatMessageUseCase;
        this.getRoomStateUseCase = getRoomStateUseCase;
        this.revokeUserUseCase = revokeUserUseCase;
        this.unrevokeUserUseCase = unrevokeUserUseCase;
        this.pauseAuctionUseCase = pauseAuctionUseCase;
        this.resumeAuctionUseCase = resumeAuctionUseCase;
        this.endAuctionUseCase = endAuctionUseCase;
        this.authMiddleware = (socket, next) => {
            console.log(`[Socket] New connection attempt: ${socket.id}`);
            const token = socket.handshake.auth?.token || this.parseCookieToken(socket.handshake.headers.cookie);
            console.log(`[Socket] Token parsed: ${token ? "Yes (Length: " + token.length + ")" : "No"}`);
            const payload = jwt_service_1.tokenService.verifyAccessToken(token);
            if (!payload) {
                console.log(`[Socket] Token verification failed for socket ${socket.id}`);
                return next(new Error("Unauthorized"));
            }
            console.log(`[Socket] Authorized user: ${payload.userId}`);
            socket.user = payload;
            socket.data.userId = payload.userId;
            next();
        };
    }
    handle() {
        this.io.use(this.authMiddleware);
        this.io.on("connection", (socket) => this.onConnection(socket));
    }
    parseCookieToken(cookieHeader) {
        if (!cookieHeader)
            return "";
        const pairs = cookieHeader.split(";").map((part) => part.trim());
        const match = pairs.find((p) => p.startsWith("accessToken="));
        if (!match)
            return "";
        return decodeURIComponent(match.split("=")[1] || "");
    }
    async onConnection(socket) {
        const user = socket.user;
        console.log(`Socket connected: ${socket.id}, User: ${user?.userId || 'unknown'}`);
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_JOIN, (data) => this.handleRoomJoin(socket, data));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.BID_PLACE, (data, callback) => this.handlePlaceBid(socket, data, callback));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.CHAT_SEND, (data, callback) => this.handleChatSend(socket, data, callback));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.SELLER_JOIN, (data) => this.handleSellerJoin(socket, data));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.ADMIN_JOIN, (data) => this.handleAdminJoin(socket, data));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.SELLER_REVOKE_USER, (data) => this.handleRevokeUser(socket, data));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.SELLER_UNREVOKE_USER, (data) => this.handleUnrevokeUser(socket, data));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.SELLER_PAUSE_AUCTION, (data, callback) => this.handlePauseAuction(socket, data, callback));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.SELLER_RESUME_AUCTION, (data, callback) => this.handleResumeAuction(socket, data, callback));
        socket.on(auction_constants_1.AUCTION_SOCKET_EVENTS.SELLER_END_AUCTION, (data, callback) => this.handleEndAuction(socket, data, callback));
        socket.on("disconnect", () => this.handleDisconnect(socket));
    }
    async handleRoomJoin(socket, { auctionId }) {
        try {
            const user = socket.user;
            console.log(`User ${user.userId} joining room: ${auctionId}`);
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: auction_constants_1.AUCTION_ERROR_CODES.AUCTION_NOT_FOUND, message: auction_constants_1.AUCTION_MESSAGES.NOT_FOUND });
                return;
            }
            const domainUser = await this.userRepository.findById(user.userId);
            if (!domainUser || domainUser.is_blocked || !domainUser.is_verified) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: auction_constants_1.AUCTION_ERROR_CODES.NOT_ALLOWED, message: auction_constants_1.AUCTION_MESSAGES.USER_NOT_ELIGIBLE });
                return;
            }
            if (auction.sellerId === user.userId) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: auction_constants_1.AUCTION_ERROR_CODES.SELLER_NOT_ALLOWED, message: auction_constants_1.AUCTION_MESSAGES.SELLER_CANNOT_JOIN });
                return;
            }
            const existingParticipant = await this.participantRepository.findByAuctionAndUser(auctionId, user.userId);
            if (existingParticipant?.revokedAt) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: auction_constants_1.AUCTION_ERROR_CODES.USER_REVOKED, message: auction_constants_1.AUCTION_MESSAGES.USER_REVOKED });
                return;
            }
            await this.participantRepository.upsertParticipant(auctionId, user.userId);
            await this.participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);
            socket.join(auctionId);
            const result = await this.getRoomStateUseCase.execute(auctionId, 20, user.userId);
            if (result.isFailure) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: result.error });
                return;
            }
            const state = result.getValue();
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.PARTICIPANT_ONLINE, { userId: user.userId, socketId: socket.id });
        }
        catch (error) {
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
        }
    }
    async handlePlaceBid(socket, { auctionId, amount }, callback) {
        const user = socket.user;
        try {
            const result = await this.placeBidUseCase.execute(auctionId, user.userId, Number(amount));
            if (result.isFailure) {
                const errorResponse = { success: false, code: auction_constants_1.AUCTION_ERROR_CODES.NOT_ALLOWED, message: result.error };
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.BID_ERROR, errorResponse);
                if (callback)
                    callback(errorResponse);
                return;
            }
            const data = result.getValue();
            await this.participantRepository.updateLastSeen(auctionId, user.userId);
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.BID_CREATED, data.bid);
            if (data.extended) {
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.AUCTION_EXTENDED, { newEndTime: data.newEndTime, extensionCount: data.extensionCount });
            }
            const recentActivities = await this.activityRepository.getRecentActivities(auctionId, 1);
            if (recentActivities.length > 0) {
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, recentActivities[0]);
            }
            if (callback)
                callback({ success: true, bid: data.bid, extended: data.extended });
        }
        catch (error) {
            const errorResponse = { success: false, code: auction_constants_1.AUCTION_ERROR_CODES.NOT_ALLOWED, message: error.message };
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.BID_ERROR, errorResponse);
            if (callback)
                callback(errorResponse);
        }
    }
    async handleChatSend(socket, { auctionId, message, isSeller }, callback) {
        const user = socket.user;
        try {
            const result = await this.sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
            if (result.isFailure) {
                const errorResponse = { success: false, code: auction_constants_1.AUCTION_ERROR_CODES.NOT_ALLOWED, message: result.error };
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.CHAT_ERROR, errorResponse);
                if (callback)
                    callback(errorResponse);
                return;
            }
            const chatMessage = result.getValue();
            await this.participantRepository.updateLastSeen(auctionId, user.userId);
            if (isSeller) {
                const activity = await this.activityRepository.logActivity(auctionId, auction_constants_1.AUCTION_MESSAGES.SELLER_MESSAGE, `Seller: "${message}"`, user.userId).catch(() => null);
                if (activity)
                    this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            }
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.CHAT_CREATED, chatMessage);
            if (callback)
                callback({ success: true, message: chatMessage });
        }
        catch (error) {
            const errorResponse = { success: false, code: auction_constants_1.AUCTION_ERROR_CODES.NOT_ALLOWED, message: error.message };
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.CHAT_ERROR, errorResponse);
            if (callback)
                callback(errorResponse);
        }
    }
    async handleSellerJoin(socket, { auctionId }) {
        try {
            const user = socket.user;
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: auction_constants_1.AUCTION_MESSAGES.NOT_ALLOWED });
                return;
            }
            socket.join(auctionId);
            const result = await this.getRoomStateUseCase.execute(auctionId, 20);
            if (result.isFailure)
                return;
            const state = result.getValue();
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
        }
        catch (error) {
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
        }
    }
    async handleAdminJoin(socket, { auctionId }) {
        try {
            const user = socket.user;
            const roles = (user?.roles || []);
            if (!roles.includes("ADMIN")) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: auction_constants_1.AUCTION_MESSAGES.NOT_ALLOWED });
                return;
            }
            socket.join(auctionId);
            const result = await this.getRoomStateUseCase.execute(auctionId, 20);
            if (result.isFailure)
                return;
            const state = result.getValue();
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
        }
        catch (error) {
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
        }
    }
    async handleRevokeUser(socket, { auctionId, userId }) {
        const user = socket.user;
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId)
                return;
            const result = await this.revokeUserUseCase.execute(auctionId, user.userId, userId);
            if (result.isFailure) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: result.error });
                return;
            }
            const data = result.getValue();
            const sockets = await this.io.in(auctionId).fetchSockets();
            for (const s of sockets) {
                if (s.user?.userId === userId || s.data.userId === userId) {
                    await this.participantRepository.setOnlineStatus(auctionId, userId, false).catch(() => null);
                    s.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.USER_REVOKED, { code: auction_constants_1.AUCTION_ERROR_CODES.USER_REVOKED, message: auction_constants_1.AUCTION_MESSAGES.REVOKED_BY_SELLER, auctionId });
                    s.leave(auctionId);
                    setTimeout(() => s.disconnect(true), 500);
                }
            }
            const activity = await this.activityRepository.logActivity(auctionId, auction_constants_1.AUCTION_MESSAGES.USER_REVOKED_ACTIVITY, auction_constants_1.AUCTION_MESSAGES.USER_REVOKED_DESC, user.userId, { revokedUserId: userId }).catch(() => null);
            if (activity)
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.PARTICIPANTS_UPDATED, { participants });
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.REVOKE_SUCCESS, { userId, invalidatedBids: data.invalidatedBids, newPrice: data.newPrice });
        }
        catch (error) {
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
        }
    }
    async handleUnrevokeUser(socket, { auctionId, userId }) {
        const user = socket.user;
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId)
                return;
            const result = await this.unrevokeUserUseCase.execute(auctionId, user.userId, userId);
            if (result.isFailure) {
                socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: result.error });
                return;
            }
            const activity = await this.activityRepository.logActivity(auctionId, "USER_RESTORED", "User access restored by seller", user.userId, { restoredUserId: userId }).catch(() => null);
            if (activity)
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.PARTICIPANTS_UPDATED, { participants });
        }
        catch (error) {
            socket.emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
        }
    }
    async handlePauseAuction(socket, { auctionId }, callback) {
        const user = socket.user;
        try {
            const result = await this.pauseAuctionUseCase.execute(user.userId, auctionId);
            if (result.isFailure) {
                if (callback)
                    callback({ success: false, message: result.error });
                return;
            }
            const activity = await this.activityRepository.logActivity(auctionId, auction_constants_1.AUCTION_MESSAGES.AUCTION_PAUSED_ACTIVITY, auction_constants_1.AUCTION_MESSAGES.PAUSED_BY_SELLER, user.userId).catch(() => null);
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.AUCTION_PAUSED, { auctionId });
            if (activity)
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            if (callback)
                callback({ success: true });
        }
        catch (error) {
            if (callback)
                callback({ success: false, message: error.message });
        }
    }
    async handleResumeAuction(socket, { auctionId }, callback) {
        const user = socket.user;
        try {
            const result = await this.resumeAuctionUseCase.execute(user.userId, auctionId);
            if (result.isFailure) {
                if (callback)
                    callback({ success: false, message: result.error });
                return;
            }
            const updated = await this.auctionRepository.findById(auctionId);
            if (updated?.status === "ENDED") {
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.AUCTION_ENDED, { auctionId });
                if (callback)
                    callback({ success: true, ended: true });
                return;
            }
            const activity = await this.activityRepository.logActivity(auctionId, auction_constants_1.AUCTION_MESSAGES.AUCTION_RESUMED_ACTIVITY, auction_constants_1.AUCTION_MESSAGES.RESUMED_BY_SELLER, user.userId).catch(() => null);
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.AUCTION_RESUMED, { auctionId });
            if (activity)
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            if (callback)
                callback({ success: true });
        }
        catch (error) {
            if (callback)
                callback({ success: false, message: error.message });
        }
    }
    async handleEndAuction(socket, { auctionId }, callback) {
        const user = socket.user;
        try {
            const result = await this.endAuctionUseCase.execute(auctionId, 'SELLER');
            if (result.isFailure) {
                if (callback)
                    callback({ success: false, message: result.error });
                return;
            }
            const activity = await this.activityRepository.logActivity(auctionId, auction_constants_1.AUCTION_MESSAGES.AUCTION_ENDED_ACTIVITY, auction_constants_1.AUCTION_MESSAGES.ENDED_BY_SELLER, user.userId).catch(() => null);
            this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.AUCTION_ENDED, { auctionId });
            if (activity)
                this.io.to(auctionId).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            if (callback)
                callback({ success: true });
        }
        catch (error) {
            if (callback)
                callback({ success: false, message: error.message });
        }
    }
    async handleDisconnect(socket) {
        const user = socket.user;
        if (!user)
            return;
        try {
            const rooms = Array.from(socket.rooms);
            for (const room of rooms) {
                if (room === socket.id)
                    continue;
                await this.participantRepository.setOnlineStatus(room, user.userId, false);
                this.io.to(room).emit(auction_constants_1.AUCTION_SOCKET_EVENTS.PARTICIPANT_OFFLINE, { userId: user.userId, socketId: socket.id });
            }
        }
        catch (error) {
            console.error("Disconnect error", error);
        }
    }
}
exports.AuctionSocketHandler = AuctionSocketHandler;
