/**
 * Redis caching module for Milestone 18.
 *
 * Implements caching for high-read, low-write endpoints:
 * - Tutor Search results
 * - Tutor Profile
 * - Subjects/Catalog
 * - Filters (curricula, grades, etc.)
 *
 * Never cached: Bookings, Payments, Authentication, Verification
 */

import { createClient, type RedisClientType } from "redis";

export interface CacheConfig {
  /** Redis connection URL */
  url: string;
  /** Default TTL in seconds */
  defaultTTLSeconds: number;
  /** Maximum TTL in seconds */
  maxTTLSeconds: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  errors: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  defaultTTLSeconds: 300, // 5 minutes
  maxTTLSeconds: 3600, // 1 hour
};

export class RedisCache {
  private client: RedisClientType | null = null;
  private connected = false;
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
    errors: 0,
  };

  // Caching policies per key prefix
  private static readonly CACHEABLE_PREFIXES = [
    "search:",
    "tutor-profile:",
    "subjects:",
    "catalog:",
    "filters:",
    "health:",
  ];

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      this.client = createClient({ url: this.config.url });
      this.client.on("error", (_err: Error) => {
        // Silently handle Redis errors - app continues
        this.stats.errors++;
        this.connected = false;
      });

      await this.client.connect();
      this.connected = true;
    } catch {
      // Redis unavailable - gracefully degrade, no caching
      this.connected = false;
      this.client = null;
      this.stats.errors++;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // Ignore disconnect errors
      }
      this.client = null;
      this.connected = false;
    }
  }

  private isHealthy(): boolean {
    return this.connected && this.client !== null && this.client.isOpen;
  }

  /**
   * Check if a key prefix is cacheable per policy.
   * Bookings, payments, auth, verification are explicitly excluded.
   */
  private static isCacheable(key: string): boolean {
    return RedisCache.CACHEABLE_PREFIXES.some((prefix) =>
      key.startsWith(prefix),
    );
  }

  /**
   * Get a cached value. Returns null on miss or Redis unavailability.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.isHealthy()) {
      this.stats.misses++;
      return null;
    }

    try {
      const raw = await this.client!.get(key);
      if (raw === null || raw === undefined) {
        this.stats.misses++;
        return null;
      }
      this.stats.hits++;
      return JSON.parse(raw) as T;
    } catch {
      this.stats.misses++;
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set a cached value with TTL.
   * Only caches keys with approved prefixes.
   */
  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!RedisCache.isCacheable(key)) {
      return; // Silently skip caching non-cacheable entities
    }

    if (!this.isHealthy()) {
      return;
    }

    const ttl = Math.min(
      ttlSeconds ?? this.config.defaultTTLSeconds,
      this.config.maxTTLSeconds,
    );

    try {
      await this.client!.set(key, JSON.stringify(value), { EX: ttl });
      this.stats.sets++;
    } catch {
      this.stats.errors++;
    }
  }

  /**
   * Invalidate a specific cache key.
   */
  async invalidate(key: string): Promise<void> {
    if (!this.isHealthy()) return;

    try {
      await this.client!.del(key);
      this.stats.invalidations++;
    } catch {
      this.stats.errors++;
    }
  }

  /**
   * Invalidate all keys matching a pattern.
   * Used for bulk invalidation (e.g., when a tutor updates their profile).
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isHealthy()) return;

    try {
      let cursor = "0";
      do {
        const result = await this.client!.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = result.cursor;
        if (result.keys.length > 0) {
          await this.client!.del(result.keys);
          this.stats.invalidations += result.keys.length;
        }
      } while (cursor !== "0");
    } catch {
      this.stats.errors++;
    }
  }

  /**
   * Cache-through pattern: try cache first, execute fetcher on miss.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /** Get cache statistics for monitoring */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /** Reset statistics */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, invalidations: 0, errors: 0 };
  }

  /** Get cache key builders for consistent naming */
  static keys = {
    search: (queryHash: string, page: string): string =>
      `search:tutors:${queryHash}:${page}`,
    tutorProfile: (tutorId: string): string =>
      `tutor-profile:${tutorId}`,
    subjects: (): string => "subjects:all",
    subjectsByCategory: (category: string): string =>
      `subjects:category:${category}`,
    filters: (): string => "filters:all",
    health: (): string => "health:api",
  } as const;
}

/** Singleton instance */
let cacheInstance: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache();
  }
  return cacheInstance;
}

export async function initializeCache(): Promise<void> {
  const cache = getRedisCache();
  await cache.connect();
}

export async function shutdownCache(): Promise<void> {
  if (cacheInstance) {
    await cacheInstance.disconnect();
    cacheInstance = null;
  }
}