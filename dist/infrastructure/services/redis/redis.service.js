"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisService {
    constructor() {
        this.LOCK_TTL = 5000; // 5 seconds lock timeout
        this.client = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.client.on('connect', () => {
            console.log('✅ Redis connected');
        });
        this.client.on('error', (err) => {
            console.error('❌ Redis error:', err);
        });
    }
    /**
     * Acquire a distributed lock
     * @param key Lock key
     * @param ttl Lock time-to-live in milliseconds
     * @returns Lock acquired successfully
     */
    async acquireLock(key, ttl = this.LOCK_TTL) {
        const lockKey = `lock:${key}`;
        const result = await this.client.set(lockKey, '1', 'PX', ttl, 'NX');
        return result === 'OK';
    }
    /**
     * Release a distributed lock
     * @param key Lock key
     */
    async releaseLock(key) {
        const lockKey = `lock:${key}`;
        await this.client.del(lockKey);
    }
    /**
     * Check last bid time for rate limiting
     * @param auctionId Auction ID
     * @param userId User ID
     * @returns Seconds since last bid, or null if no previous bid
     */
    async getSecondsSinceLastBid(auctionId, userId) {
        const key = `bid:${auctionId}:${userId}:lastBid`;
        const lastBidTime = await this.client.get(key);
        if (!lastBidTime)
            return null;
        const secondsSince = Math.floor((Date.now() - parseInt(lastBidTime)) / 1000);
        return secondsSince;
    }
    /**
     * Record a bid timestamp for rate limiting
     * @param auctionId Auction ID
     * @param userId User ID
     */
    async recordBid(auctionId, userId, cooldownSeconds = 60) {
        const key = `bid:${auctionId}:${userId}:lastBid`;
        const ttl = Math.max(cooldownSeconds * 2, 120);
        await this.client.set(key, Date.now().toString(), 'EX', ttl);
    }
    /**
     * Get remaining time until user can bid again
     * @param auctionId Auction ID
     * @param userId User ID
     * @returns Seconds remaining, or 0 if can bid now
     */
    async getSecondsUntilCanBid(auctionId, userId, cooldownSeconds = 60) {
        const secondsSince = await this.getSecondsSinceLastBid(auctionId, userId);
        if (secondsSince === null)
            return 0;
        const remaining = cooldownSeconds - secondsSince;
        return remaining > 0 ? remaining : 0;
    }
    /**
     * Close Redis connection
     */
    async disconnect() {
        await this.client.quit();
    }
}
exports.redisService = new RedisService();
