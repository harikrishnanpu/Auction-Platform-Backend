import { Server, Socket } from "socket.io";
import { tokenService } from "../../infrastructure/services/jwt/jwt.service";
import { PlaceBidUseCase } from "../../application/useCases/auction/place-bid.usecase";
import { SendChatMessageUseCase } from "../../application/useCases/auction/send-chat-message.usecase";
import { GetAuctionRoomStateUseCase } from "../../application/useCases/auction/get-auction-room-state.usecase";
import { RevokeUserUseCase } from "../../application/useCases/auction/revoke-user.usecase";
import { UnrevokeUserUseCase } from "../../application/useCases/auction/unrevoke-user.usecase";
import { PauseAuctionUseCase } from "../../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase } from "../../application/useCases/auction/end-auction.usecase";
import { AuctionError } from "../../domain/auction/auction.errors";
import { setupPaymentSocket } from "./payment.socket";
import { IAuctionRepository } from "../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../domain/auction/repositories/activity.repository";
import { IUserRepository } from "../../domain/user/user.repository";
import { AUCTION_ERROR_CODES, AUCTION_MESSAGES, AUCTION_SOCKET_EVENTS } from "../../constants/auction.constants";

export class AuctionSocketHandler {
    constructor(
        private io: Server,
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository,
        private userRepository: IUserRepository,
        private placeBidUseCase: PlaceBidUseCase,
        private sendChatMessageUseCase: SendChatMessageUseCase,
        private getRoomStateUseCase: GetAuctionRoomStateUseCase,
        private revokeUserUseCase: RevokeUserUseCase,
        private unrevokeUserUseCase: UnrevokeUserUseCase,
        private pauseAuctionUseCase: PauseAuctionUseCase,
        private resumeAuctionUseCase: ResumeAuctionUseCase,
        private endAuctionUseCase: EndAuctionUseCase
    ) { }

    public handle() {
        this.io.use(this.authMiddleware);
        this.io.on("connection", (socket) => this.onConnection(socket));
    }

    private authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
        console.log(`[Socket] New connection attempt: ${socket.id}`);

        const token = socket.handshake.auth?.token || this.parseCookieToken(socket.handshake.headers.cookie);

        console.log(`[Socket] Token parsed: ${token ? "Yes (Length: " + token.length + ")" : "No"}`);

        const payload = tokenService.verifyAccessToken(token);
        if (!payload) {
            console.log(`[Socket] Token verification failed for socket ${socket.id}`);
            return next(new Error("Unauthorized"));
        }

        console.log(`[Socket] Authorized user: ${payload.userId}`);
        (socket as any).user = payload;
        socket.data.userId = payload.userId;
        next();
    };

    private parseCookieToken(cookieHeader?: string) {
        if (!cookieHeader) return "";
        const pairs = cookieHeader.split(";").map((part) => part.trim());
        const match = pairs.find((p) => p.startsWith("accessToken="));
        if (!match) return "";
        return decodeURIComponent(match.split("=")[1] || "");
    }

    private async onConnection(socket: Socket) {
        const user = (socket as any).user;
        console.log(`Socket connected: ${socket.id}, User: ${user?.userId || 'unknown'}`);

        // if (user) {
        //     setupPaymentSocket(this.io, socket);
        // }

        socket.on(AUCTION_SOCKET_EVENTS.ROOM_JOIN, (data) => this.handleRoomJoin(socket, data));
        socket.on(AUCTION_SOCKET_EVENTS.BID_PLACE, (data, callback) => this.handlePlaceBid(socket, data, callback));
        socket.on(AUCTION_SOCKET_EVENTS.CHAT_SEND, (data, callback) => this.handleChatSend(socket, data, callback));
        socket.on(AUCTION_SOCKET_EVENTS.SELLER_JOIN, (data) => this.handleSellerJoin(socket, data));
        socket.on(AUCTION_SOCKET_EVENTS.ADMIN_JOIN, (data) => this.handleAdminJoin(socket, data));
        socket.on(AUCTION_SOCKET_EVENTS.SELLER_REVOKE_USER, (data) => this.handleRevokeUser(socket, data));
        socket.on(AUCTION_SOCKET_EVENTS.SELLER_UNREVOKE_USER, (data) => this.handleUnrevokeUser(socket, data));
        socket.on(AUCTION_SOCKET_EVENTS.SELLER_PAUSE_AUCTION, (data, callback) => this.handlePauseAuction(socket, data, callback));
        socket.on(AUCTION_SOCKET_EVENTS.SELLER_RESUME_AUCTION, (data, callback) => this.handleResumeAuction(socket, data, callback));
        socket.on(AUCTION_SOCKET_EVENTS.SELLER_END_AUCTION, (data, callback) => this.handleEndAuction(socket, data, callback));
        socket.on("disconnect", () => this.handleDisconnect(socket));
    }

    private async handleRoomJoin(socket: Socket, { auctionId }: { auctionId: string }) {
        try {
            const user = (socket as any).user;
            console.log(`User ${user.userId} joining room: ${auctionId}`);

            console.log(`[RoomJoin] Fetching auction ${auctionId}...`);
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                console.log(`[RoomJoin] Auction not found`);
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND, message: AUCTION_MESSAGES.NOT_FOUND });
                return;
            }

            console.log(`[RoomJoin] Fetching user ${user.userId}...`);
            const domainUser = await this.userRepository.findById(user.userId);
            if (!domainUser || domainUser.is_blocked || !domainUser.is_verified) {
                console.log(`[RoomJoin] User not eligible (Blocked: ${domainUser?.is_blocked}, Verified: ${domainUser?.is_verified})`);
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.NOT_ALLOWED, message: AUCTION_MESSAGES.USER_NOT_ELIGIBLE });
                return;
            }

            if (auction.sellerId === user.userId) {
                console.log(`[RoomJoin] User is seller, blocking entry as participant`);
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.SELLER_NOT_ALLOWED, message: AUCTION_MESSAGES.SELLER_CANNOT_JOIN });
                return;
            }

            console.log(`[RoomJoin] Checking revocation status...`);
            const existingParticipant = await this.participantRepository.findByAuctionAndUser(auctionId, user.userId);
            if (existingParticipant?.revokedAt) {
                console.log(`[RoomJoin] User is revoked`);
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.USER_REVOKED, message: AUCTION_MESSAGES.USER_REVOKED });
                return;
            }

            console.log(`[RoomJoin] Upserting participant...`);
            await this.participantRepository.upsertParticipant(auctionId, user.userId);

            console.log(`[RoomJoin] Setting online status...`);
            await this.participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);

            socket.join(auctionId);
            console.log(`[RoomJoin] Socket ${socket.id} joined room ${auctionId}`);

            console.log(`[RoomJoin] Fetching room state...`);
            const state = await this.getRoomStateUseCase.execute(auctionId, 20, user.userId);
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);

            console.log(`[RoomJoin] Emitting room:state...`);
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.PARTICIPANT_ONLINE, { userId: user.userId, socketId: socket.id });
            console.log(`[RoomJoin] Join completed successfully.`);
        } catch (error) {
            console.error(`[RoomJoin] Error joining room:`, error);
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handlePlaceBid(socket: Socket, { auctionId, amount }: any, callback: any) {
        const user = (socket as any).user;
        console.log(`[PlaceBid] Request from ${user.userId} for ${auctionId}, amount: ${amount}`);
        try {
            const result = await this.placeBidUseCase.execute(auctionId, user.userId, Number(amount));
            console.log(`[PlaceBid] Success. Bid ID: ${result.bid.id}`);

            await this.participantRepository.updateLastSeen(auctionId, user.userId);

            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.BID_CREATED, result.bid);
            if (result.extended) {
                this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.AUCTION_EXTENDED, { newEndTime: result.newEndTime, extensionCount: result.extensionCount });
            }

            const recentActivities = await this.activityRepository.getRecentActivities(auctionId, 1);
            if (recentActivities.length > 0) {
                this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, recentActivities[0]);
            }

            if (callback) callback({ success: true, bid: result.bid, extended: result.extended });
        } catch (error) {
            console.error(`[PlaceBid] Error:`, error);
            const err = error as Error;
            const errorResponse = { success: false, code: err instanceof AuctionError ? err.code : AUCTION_ERROR_CODES.NOT_ALLOWED, message: err.message };
            socket.emit(AUCTION_SOCKET_EVENTS.BID_ERROR, errorResponse);
            if (callback) callback(errorResponse);
        }
    }

    private async handleChatSend(socket: Socket, { auctionId, message, isSeller }: any, callback: any) {
        const user = (socket as any).user;
        console.log(`[ChatSend] Request from ${user.userId} for ${auctionId}: "${message}"`);
        try {
            const chatMessage = await this.sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
            console.log(`[ChatSend] Success. Msg ID: ${chatMessage.id}`);

            await this.participantRepository.updateLastSeen(auctionId, user.userId);

            if (isSeller) {
                const activity = await this.activityRepository.logActivity(auctionId, AUCTION_MESSAGES.SELLER_MESSAGE, `Seller: "${message}"`, user.userId).catch(() => null);
                if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            }

            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.CHAT_CREATED, chatMessage);
            if (callback) callback({ success: true, message: chatMessage });
        } catch (error) {
            console.error(`[ChatSend] Error:`, error);
            const err = error as Error;
            const errorResponse = { success: false, code: err instanceof AuctionError ? err.code : AUCTION_ERROR_CODES.NOT_ALLOWED, message: err.message };
            socket.emit(AUCTION_SOCKET_EVENTS.CHAT_ERROR, errorResponse);
            if (callback) callback(errorResponse);
        }
    }

    private async handleSellerJoin(socket: Socket, { auctionId }: { auctionId: string }) {
        try {
            const user = (socket as any).user;
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: AUCTION_MESSAGES.NOT_ALLOWED });
                return;
            }
            socket.join(auctionId);
            const state = await this.getRoomStateUseCase.execute(auctionId, 20);
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
        } catch (error) {
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handleAdminJoin(socket: Socket, { auctionId }: { auctionId: string }) {
        try {
            const user = (socket as any).user;
            const roles = (user?.roles || []) as string[];
            if (!roles.includes("ADMIN")) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: AUCTION_MESSAGES.NOT_ALLOWED });
                return;
            }
            socket.join(auctionId);
            const state = await this.getRoomStateUseCase.execute(auctionId, 20);
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
        } catch (error) {
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handleRevokeUser(socket: Socket, { auctionId, userId }: any) {
        const user = (socket as any).user;
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId) return;

            const result = await this.revokeUserUseCase.execute(auctionId, user.userId, userId);
            const sockets = await this.io.in(auctionId).fetchSockets();

            for (const s of sockets) {
                if ((s as any).user?.userId === userId || s.data.userId === userId) {
                    await this.participantRepository.setOnlineStatus(auctionId, userId, false).catch(() => null);
                    s.emit(AUCTION_SOCKET_EVENTS.USER_REVOKED, { code: AUCTION_ERROR_CODES.USER_REVOKED, message: AUCTION_MESSAGES.REVOKED_BY_SELLER, auctionId });
                    s.leave(auctionId);
                    setTimeout(() => s.disconnect(true), 500);
                }
            }

            const activity = await this.activityRepository.logActivity(auctionId, AUCTION_MESSAGES.USER_REVOKED_ACTIVITY, AUCTION_MESSAGES.USER_REVOKED_DESC, user.userId, { revokedUserId: userId }).catch(() => null);
            if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);

            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.PARTICIPANTS_UPDATED, { participants });
            socket.emit(AUCTION_SOCKET_EVENTS.REVOKE_SUCCESS, { userId, invalidatedBids: result.invalidatedBids, newPrice: result.newPrice });
        } catch (error) {
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handleUnrevokeUser(socket: Socket, { auctionId, userId }: any) {
        const user = (socket as any).user;
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId) return;

            await this.unrevokeUserUseCase.execute(auctionId, user.userId, userId);

            const activity = await this.activityRepository.logActivity(auctionId, "USER_RESTORED" as any, "User access restored by seller", user.userId, { restoredUserId: userId }).catch(() => null);
            if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);

            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.PARTICIPANTS_UPDATED, { participants });
        } catch (error) {
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handlePauseAuction(socket: Socket, { auctionId }: any, callback: any) {
        const user = (socket as any).user;
        try {
            await this.pauseAuctionUseCase.execute(auctionId, user.userId);
            const activity = await this.activityRepository.logActivity(auctionId, AUCTION_MESSAGES.AUCTION_PAUSED_ACTIVITY, AUCTION_MESSAGES.PAUSED_BY_SELLER, user.userId).catch(() => null);
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.AUCTION_PAUSED, { auctionId });
            if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            if (callback) callback({ success: true });
        } catch (error) {
            if (callback) callback({ success: false, message: (error as Error).message });
        }
    }

    private async handleResumeAuction(socket: Socket, { auctionId }: any, callback: any) {
        const user = (socket as any).user;
        try {
            await this.resumeAuctionUseCase.execute(auctionId, user.userId);
            const updated = await this.auctionRepository.findById(auctionId);
            if (updated?.status === "ENDED") {
                this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.AUCTION_ENDED, { auctionId });
                if (callback) callback({ success: true, ended: true });
                return;
            }
            const activity = await this.activityRepository.logActivity(auctionId, AUCTION_MESSAGES.AUCTION_RESUMED_ACTIVITY, AUCTION_MESSAGES.RESUMED_BY_SELLER, user.userId).catch(() => null);
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.AUCTION_RESUMED, { auctionId });
            if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            if (callback) callback({ success: true });
        } catch (error) {
            if (callback) callback({ success: false, message: (error as Error).message });
        }
    }

    private async handleEndAuction(socket: Socket, { auctionId }: any, callback: any) {
        const user = (socket as any).user;
        try {
            await this.endAuctionUseCase.execute(auctionId, 'SELLER');
            const activity = await this.activityRepository.logActivity(auctionId, AUCTION_MESSAGES.AUCTION_ENDED_ACTIVITY, AUCTION_MESSAGES.ENDED_BY_SELLER, user.userId).catch(() => null);
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.AUCTION_ENDED, { auctionId });
            if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            if (callback) callback({ success: true });
        } catch (error) {
            if (callback) callback({ success: false, message: (error as Error).message });
        }
    }

    private async handleDisconnect(socket: Socket) {
        const user = (socket as any).user;
        if (!user) return;
        try {
            const rooms = Array.from(socket.rooms);
            for (const room of rooms) {
                if (room === socket.id) continue;
                await this.participantRepository.setOnlineStatus(room, user.userId, false);
                this.io.to(room).emit(AUCTION_SOCKET_EVENTS.PARTICIPANT_OFFLINE, { userId: user.userId, socketId: socket.id });
            }
        } catch (error) {
            console.error("Disconnect error", error);
        }
    }
}
