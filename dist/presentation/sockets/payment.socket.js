"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPaymentSocket = setupPaymentSocket;
exports.emitPaymentSuccess = emitPaymentSuccess;
exports.emitOfferCreated = emitOfferCreated;
exports.emitAuctionCompleted = emitAuctionCompleted;
/**
 * Setup payment-related socket events
 */
function setupPaymentSocket(io, socket) {
    const user = socket.user;
    if (!user) {
        console.error('No user found in socket');
        return;
    }
    // Join user's personal room for payment notifications
    socket.join(`user:${user.userId}`);
    console.log(`User ${user.userId} joined personal room for payment notifications`);
}
/**
 * Emit payment success to auction room and seller
 */
function emitPaymentSuccess(io, auctionId, userId, amount, sellerId) {
    // Notify auction room
    io.to(auctionId).emit('payment:success', {
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
    console.log(`Payment success event emitted for auction ${auctionId}`);
}
/**
 * Emit offer created to user
 */
function emitOfferCreated(io, userId, offerId, auctionId, amount, rank, expiresAt) {
    io.to(`user:${userId}`).emit('offer:created', {
        offerId,
        auctionId,
        amount,
        rank,
        expiresAt,
        timestamp: new Date()
    });
    console.log(`Offer created event emitted to user ${userId}`);
}
/**
 * Emit auction completion status change
 */
function emitAuctionCompleted(io, auctionId, completionStatus) {
    io.to(auctionId).emit('auction:completed', {
        auctionId,
        status: completionStatus,
        timestamp: new Date()
    });
    console.log(`Auction completed event emitted: ${auctionId} - ${completionStatus}`);
}
