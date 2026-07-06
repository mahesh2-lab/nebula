import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAaQZAAIgcDIyZTIzZDU5NzIyMmI0ODljODY0MTFmMjFmZmJhNDgxOA@pumped-drum-107545.upstash.io:6379';

let redis: Redis;

if (process.env.NODE_ENV === 'production') {
  redis = new Redis(REDIS_URL);
} else {
  // Prevent duplicate connections during fast refresh in development
  if (!(global as any).redis) {
    (global as any).redis = new Redis(REDIS_URL);
  }
  redis = (global as any).redis;
}

export { redis };
