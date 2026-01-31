import Redis from 'ioredis';

class RedisService {
    private _client: Redis;
    private _subscriber: Redis;
    private readonly LOCK_TTL = 5000;

    constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        };

        this._client = new Redis(redisConfig);
        this._subscriber = new Redis(redisConfig);

        this._client.on('connect', () => {
            console.log('Redis connected');
        });

        this._client.on('error', (err) => {
            console.error('Redis error:', err);
        });

        this._subscriber.on('connect', () => {
            console.log('Redis subscriber connected');
        });

        this._subscriber.on('error', (err) => {
            console.error('Redis subscriber error:', err);
        });
    }

    async acquireLock(key: string, ttl: number = this.LOCK_TTL): Promise<boolean> {
        const lockKey = `lock:${key}`;
        const result = await this._client.set(lockKey, '1', 'PX', ttl, 'NX');
        return result === 'OK';
    }

    async releaseLock(key: string): Promise<void> {
        const lockKey = `lock:${key}`;
        await this._client.del(lockKey);
    }

    async getSecondsSinceLastBid(auctionId: string, userId: string): Promise<number | null> {
        const key = `bid:${auctionId}:${userId}:lastBid`;
        const lastBidTime = await this._client.get(key);
        if (!lastBidTime) return null;

        const secondsSince = Math.floor((Date.now() - parseInt(lastBidTime)) / 1000);
        return secondsSince;
    }

    async recordBid(auctionId: string, userId: string): Promise<void> {
        const key = `bid:${auctionId}:${userId}:lastBid`;
        await this._client.set(key, Date.now().toString(), 'EX', 120);
    }

    async getSecondsUntilCanBid(auctionId: string, userId: string): Promise<number> {
        const secondsSince = await this.getSecondsSinceLastBid(auctionId, userId);
        if (secondsSince === null) return 0;

        const RATE_LIMIT_SECONDS = 60;
        const remaining = RATE_LIMIT_SECONDS - secondsSince;
        return remaining > 0 ? remaining : 0;
    }

    async publish(channel: string, message: string): Promise<void> {
        await this._client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        await this._subscriber.subscribe(channel);
        this._subscriber.on('message', (chan, msg) => {
            if (chan === channel) {
                callback(msg);
            }
        });
    }

    async unsubscribe(channel: string): Promise<void> {
        await this._subscriber.unsubscribe(channel);
    }

    async disconnect(): Promise<void> {
        await this._client.quit();
        await this._subscriber.quit();
    }
}


export const redisService = new RedisService();
