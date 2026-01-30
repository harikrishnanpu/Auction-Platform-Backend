import { Server, Socket } from 'socket.io';

/**
 * Setup payment-related socket events
 */
export function setupPaymentSocket(io: Server, socket: Socket) {
    const user = (socket as any).user;

    if (!user) {
        console.error('❌ No user found in socket');
        return;
    }

    // Join user's personal room for payment notifications
    socket.join(`user:${user.userId}`);
    console.log(`✅ User ${user.userId} joined personal room for payment notifications`);
}

/**
 * Emit payment success to auction room and seller
 */
export function emitPaymentSuccess(io: Server, auctionId: string, userId: string, amount: number, sellerId: string) {
    // Notify auction room
    io.to(`auction:${auctionId}`).emit('payment:success', {
        auctionId,
        userId,
        amount,
        timestamp: new Date()
    });

    // Notify seller
    io.to(`user:${sellerId}`).emit('payment:completed', {
        auctionId,
        buyerId: userId,
        amount,
        timestamp: new Date()
    });

    console.log(`✅ Payment success event emitted for auction ${auctionId}`);
}

/**
 * Emit offer created to user
 */
export function emitOfferCreated(io: Server, userId: string, offerId: string, auctionId: string, amount: number, rank: number, expiresAt: Date) {
    io.to(`user:${userId}`).emit('offer:created', {
        offerId,
        auctionId,
        amount,
        rank,
        expiresAt,
        timestamp: new Date()
    });

    console.log(`✅ Offer created event emitted to user ${userId}`);
}

/**
 * Emit auction completion status change
 */
export function emitAuctionCompleted(io: Server, auctionId: string, completionStatus: string) {
    io.to(`auction:${auctionId}`).emit('auction:completed', {
        auctionId,
        status: completionStatus,
        timestamp: new Date()
    });

    console.log(`✅ Auction completed event emitted: ${auctionId} - ${completionStatus}`);
}
