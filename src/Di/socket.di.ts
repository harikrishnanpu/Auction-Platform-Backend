import { Server } from "socket.io";
import { AuctionSocketHandler } from "../presentation/sockets/auction-socket.handler";
import { auctionRepository, participantRepository, activityRepository, bidRepository, transactionManager, paymentRepository, chatMessageRepository, userRepository } from "./repository.di";
import { PlaceBidUseCase } from "../application/useCases/auction/place-bid.usecase";
import { SendChatMessageUseCase } from "../application/useCases/auction/send-chat-message.usecase";
import { GetAuctionRoomStateUseCase } from "../application/useCases/auction/get-auction-room-state.usecase";
import { RevokeUserUseCase } from "../application/useCases/auction/revoke-user.usecase";
import { PauseAuctionUseCase } from "../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase } from "../application/useCases/auction/end-auction.usecase";

export const initSocketHandlers = (io: Server) => {
    // Instantiate Use Cases (or get from DI if available)
    const placeBidUseCase = new PlaceBidUseCase(auctionRepository, bidRepository, participantRepository, activityRepository, transactionManager);
    const sendChatMessageUseCase = new SendChatMessageUseCase(chatMessageRepository, participantRepository, auctionRepository);
    const getRoomStateUseCase = new GetAuctionRoomStateUseCase(auctionRepository, bidRepository, chatMessageRepository, activityRepository);
    const revokeUserUseCase = new RevokeUserUseCase(auctionRepository, participantRepository, bidRepository, activityRepository, transactionManager);
    const pauseAuctionUseCase = new PauseAuctionUseCase(auctionRepository);
    const endAuctionUseCase = new EndAuctionUseCase(auctionRepository, bidRepository, activityRepository, paymentRepository);
    const resumeAuctionUseCase = new ResumeAuctionUseCase(auctionRepository, endAuctionUseCase);

    const auctionSocketHandler = new AuctionSocketHandler(
        io,
        auctionRepository,
        participantRepository,
        activityRepository,
        userRepository,
        placeBidUseCase,
        sendChatMessageUseCase,
        getRoomStateUseCase,
        revokeUserUseCase,
        pauseAuctionUseCase,
        resumeAuctionUseCase,
        endAuctionUseCase
    );

    auctionSocketHandler.handle();
};
