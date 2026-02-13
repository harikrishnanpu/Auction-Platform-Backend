import { Server, Socket } from "socket.io";
import { tokenService } from "../../infrastructure/services/jwt/jwt.service";
import {
    IPlaceBidUseCase,
    ISendChatMessageUseCase,
    IGetAuctionRoomStateUseCase,
    IRevokeUserUseCase,
    IUnrevokeUserUseCase,
    IEndAuctionUseCase
} from "../../application/interfaces/use-cases/auction.usecase.interface";
import {
    IPauseAuctionUseCase,
    IResumeAuctionUseCase
} from "../../application/interfaces/use-cases/seller.usecase.interface";
import { IAuctionRepository } from "../../domain/entities/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../domain/entities/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../domain/entities/auction/repositories/activity.repository";
import { IUserRepository } from "@domain/repositories/user.repository";
import { AUCTION_ERROR_CODES, AUCTION_MESSAGES, AUCTION_SOCKET_EVENTS } from "../../constants/auction.constants";

export class AuctionSocketHandler {
    constructor(
        private io: Server,
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository,
        private userRepository: IUserRepository,
        private placeBidUseCase: IPlaceBidUseCase,
        private sendChatMessageUseCase: ISendChatMessageUseCase,
        private getRoomStateUseCase: IGetAuctionRoomStateUseCase,
        private revokeUserUseCase: IRevokeUserUseCase,
        private unrevokeUserUseCase: IUnrevokeUserUseCase,
        private pauseAuctionUseCase: IPauseAuctionUseCase,
        private resumeAuctionUseCase: IResumeAuctionUseCase,
        private endAuctionUseCase: IEndAuctionUseCase
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

            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND, message: AUCTION_MESSAGES.NOT_FOUND });
                return;
            }

            const domainUser = await this.userRepository.findById(user.userId);
            if (!domainUser || domainUser.is_blocked || !domainUser.is_verified) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.NOT_ALLOWED, message: AUCTION_MESSAGES.USER_NOT_ELIGIBLE });
                return;
            }

            if (auction.sellerId === user.userId) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.SELLER_NOT_ALLOWED, message: AUCTION_MESSAGES.SELLER_CANNOT_JOIN });
                return;
            }

            const existingParticipant = await this.participantRepository.findByAuctionAndUser(auctionId, user.userId);
            if (existingParticipant?.revokedAt) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { code: AUCTION_ERROR_CODES.USER_REVOKED, message: AUCTION_MESSAGES.USER_REVOKED });
                return;
            }

            await this.participantRepository.upsertParticipant(auctionId, user.userId);
            await this.participantRepository.setOnlineStatus(auctionId, user.userId, true, socket.id);

            socket.join(auctionId);

            const result = await this.getRoomStateUseCase.execute(auctionId, 20, user.userId);
            if (result.isFailure) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: result.error });
                return;
            }

            const state = result.getValue();
            const participants = await this.participantRepository.listParticipantsWithStatus(auctionId);

            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_STATE, { ...state, participants });
            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.PARTICIPANT_ONLINE, { userId: user.userId, socketId: socket.id });
        } catch (error) {
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handlePlaceBid(socket: Socket, { auctionId, amount }: any, callback: any) {
        const user = (socket as any).user;
        try {
            const result = await this.placeBidUseCase.execute(auctionId, user.userId, Number(amount));
            if (result.isFailure) {
                const errorResponse = { success: false, code: AUCTION_ERROR_CODES.NOT_ALLOWED, message: result.error };
                socket.emit(AUCTION_SOCKET_EVENTS.BID_ERROR, errorResponse);
                if (callback) callback(errorResponse);
                return;
            }

            const data = result.getValue();
            await this.participantRepository.updateLastSeen(auctionId, user.userId);

            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.BID_CREATED, data.bid);
            if (data.extended) {
                this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.AUCTION_EXTENDED, { newEndTime: data.newEndTime, extensionCount: data.extensionCount });
            }

            const recentActivities = await this.activityRepository.getRecentActivities(auctionId, 1);
            if (recentActivities.length > 0) {
                this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, recentActivities[0]);
            }

            if (callback) callback({ success: true, bid: data.bid, extended: data.extended });
        } catch (error) {
            const errorResponse = { success: false, code: AUCTION_ERROR_CODES.NOT_ALLOWED, message: (error as Error).message };
            socket.emit(AUCTION_SOCKET_EVENTS.BID_ERROR, errorResponse);
            if (callback) callback(errorResponse);
        }
    }

    private async handleChatSend(socket: Socket, { auctionId, message, isSeller }: any, callback: any) {
        const user = (socket as any).user;
        try {
            const result = await this.sendChatMessageUseCase.execute(auctionId, user.userId, String(message || ""));
            if (result.isFailure) {
                const errorResponse = { success: false, code: AUCTION_ERROR_CODES.NOT_ALLOWED, message: result.error };
                socket.emit(AUCTION_SOCKET_EVENTS.CHAT_ERROR, errorResponse);
                if (callback) callback(errorResponse);
                return;
            }

            const chatMessage = result.getValue();
            await this.participantRepository.updateLastSeen(auctionId, user.userId);

            if (isSeller) {
                const activity = await this.activityRepository.logActivity(auctionId, AUCTION_MESSAGES.SELLER_MESSAGE, `Seller: "${message}"`, user.userId).catch(() => null);
                if (activity) this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.ACTIVITY_CREATED, activity);
            }

            this.io.to(auctionId).emit(AUCTION_SOCKET_EVENTS.CHAT_CREATED, chatMessage);
            if (callback) callback({ success: true, message: chatMessage });
        } catch (error) {
            const errorResponse = { success: false, code: AUCTION_ERROR_CODES.NOT_ALLOWED, message: (error as Error).message };
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
            const result = await this.getRoomStateUseCase.execute(auctionId, 20);
            if (result.isFailure) return;

            const state = result.getValue();
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
            const result = await this.getRoomStateUseCase.execute(auctionId, 20);
            if (result.isFailure) return;

            const state = result.getValue();
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
            if (result.isFailure) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: result.error });
                return;
            }

            const data = result.getValue();
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
            socket.emit(AUCTION_SOCKET_EVENTS.REVOKE_SUCCESS, { userId, invalidatedBids: data.invalidatedBids, newPrice: data.newPrice });
        } catch (error) {
            socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: (error as Error).message });
        }
    }

    private async handleUnrevokeUser(socket: Socket, { auctionId, userId }: any) {
        const user = (socket as any).user;
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== user.userId) return;

            const result = await this.unrevokeUserUseCase.execute(auctionId, user.userId, userId);
            if (result.isFailure) {
                socket.emit(AUCTION_SOCKET_EVENTS.ROOM_ERROR, { message: result.error });
                return;
            }

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
            const result = await this.pauseAuctionUseCase.execute(user.userId, auctionId);
            if (result.isFailure) {
                if (callback) callback({ success: false, message: result.error });
                return;
            }

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
            const result = await this.resumeAuctionUseCase.execute(user.userId, auctionId);
            if (result.isFailure) {
                if (callback) callback({ success: false, message: result.error });
                return;
            }

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
            const result = await this.endAuctionUseCase.execute(auctionId, 'SELLER');
            if (result.isFailure) {
                if (callback) callback({ success: false, message: result.error });
                return;
            }

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
