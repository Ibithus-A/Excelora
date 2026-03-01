type Bucket = {
  windowStart: number;
  count: number;
};

export type LimiterResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type CreateLimiterOptions = {
  maxRequests: number;
  windowMs: number;
};

export function createRateLimiter(options: CreateLimiterOptions) {
  const buckets = new Map<string, Bucket>();
  const { maxRequests, windowMs } = options;

  return (key: string): LimiterResult => {
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || now - current.windowStart >= windowMs) {
      buckets.set(key, { windowStart: now, count: 1 });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (current.count >= maxRequests) {
      const retryAfterMs = Math.max(0, current.windowStart + windowMs - now);
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      };
    }

    current.count += 1;
    buckets.set(key, current);
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
