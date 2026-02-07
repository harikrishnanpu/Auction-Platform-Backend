import Redis from 'ioredis';

class RedisService {
    private client: Redis;
    private readonly LOCK_TTL = 5000;

    constructor() {
        this.client = new Redis({
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


    async acquireLock(key: string, ttl: number = this.LOCK_TTL): Promise<boolean> {
        const lockKey = `lock:${key}`;
        const result = await this.client.set(lockKey, '1', 'PX', ttl, 'NX');
        return result === 'OK';
    }


    async releaseLock(key: string): Promise<void> {
        const lockKey = `lock:${key}`;
        await this.client.del(lockKey);
    }

    async getSecondsSinceLastBid(auctionId: string, userId: string): Promise<number | null> {
        const key = `bid:${auctionId}:${userId}:lastBid`;
        const lastBidTime = await this.client.get(key);
        if (!lastBidTime) return null;

        const secondsSince = Math.floor((Date.now() - parseInt(lastBidTime)) / 1000);
        return secondsSince;
    }

    async recordBid(auctionId: string, userId: string, cooldownSeconds: number = 60): Promise<void> {
        const key = `bid:${auctionId}:${userId}:lastBid`;
        const ttl = Math.max(cooldownSeconds * 2, 120);
        await this.client.set(key, Date.now().toString(), 'EX', ttl);
    }

    async getSecondsUntilCanBid(auctionId: string, userId: string, cooldownSeconds: number = 60): Promise<number> {
        const secondsSince = await this.getSecondsSinceLastBid(auctionId, userId);
        if (secondsSince === null) return 0;

        const remaining = cooldownSeconds - secondsSince;
        return remaining > 0 ? remaining : 0;
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export const redisService = new RedisService();
