/**
 * Flexible caching utility for Next.js API routes
 * Supports in-memory cache (development) and Redis (production)
 * Caches indefinitely until manually invalidated
 */

 import Redis from 'ioredis';

// In-memory cache store
const memoryCache = new Map();

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // Maximum cache size for memory cache
  maxMemoryCacheSize: 1000,
  // Enable/disable caching globally
  enabled: process.env.ENABLE_CACHE === 'true',
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL, // Can include password: redis://:password@host:port
    host: process.env.REDIS_HOST, // Alternative to URL
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD, // Redis password
    username: process.env.REDIS_USERNAME, // Redis 6+ ACL username (optional)
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0, // Redis database number
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3, // Max retry attempts per command
    lazyConnect: false, // Connect immediately to trigger events
    connectTimeout: 10000, // 10 second connection timeout
    commandTimeout: 5000, // 5 second command timeout
    retryDelayOnClusterDown: 300, // Delay between retries when cluster is down
    enableOfflineQueue: false, // Don't queue commands when disconnected
    retryStrategy: (times) => {
      // Custom retry strategy with exponential backoff
      const delay = Math.min(times * 500, 2000); // Exponential backoff, max 2 seconds
      console.log(`Redis retry attempt ${times}, waiting ${delay}ms`);
      return times > 4 ? null : delay; // Stop retrying after 4 attempts
    }
  }
};

// Redis client instance
let redisClient = null;
let redisAvailable = false;

/**
 * Initialize Redis connection
 */
async function initRedis() {
  if ((!CACHE_CONFIG.redis.url && !CACHE_CONFIG.redis.host) || redisClient) {
    return;
  }

  try {
    let redisConfig;
    
    // Use URL if provided, otherwise use individual parameters
    if (CACHE_CONFIG.redis.url) {
      redisConfig = {
        ...CACHE_CONFIG.redis,
        // URL takes precedence, but individual params can override
        ...(CACHE_CONFIG.redis.password && { password: CACHE_CONFIG.redis.password }),
        ...(CACHE_CONFIG.redis.username && { username: CACHE_CONFIG.redis.username }),
      };
    } else {
      redisConfig = {
        host: CACHE_CONFIG.redis.host,
        port: CACHE_CONFIG.redis.port,
        password: CACHE_CONFIG.redis.password,
        username: CACHE_CONFIG.redis.username,
        db: CACHE_CONFIG.redis.db,
        retryDelayOnFailover: CACHE_CONFIG.redis.retryDelayOnFailover,
        maxRetriesPerRequest: CACHE_CONFIG.redis.maxRetriesPerRequest,
        lazyConnect: CACHE_CONFIG.redis.lazyConnect,
        connectTimeout: CACHE_CONFIG.redis.connectTimeout,
        commandTimeout: CACHE_CONFIG.redis.commandTimeout,
        retryDelayOnClusterDown: CACHE_CONFIG.redis.retryDelayOnClusterDown,
        enableOfflineQueue: CACHE_CONFIG.redis.enableOfflineQueue,
        retryStrategy: CACHE_CONFIG.redis.retryStrategy,
      };
    }
    
    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
      redisAvailable = true;
    });

    redisClient.on('ready', () => {
      console.log('Redis ready for commands');
      redisAvailable = true;
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error.message);
      redisAvailable = false;
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
      redisAvailable = false;
    });

    redisClient.on('reconnecting', (delay) => {
      console.log(`Redis reconnecting in ${delay}ms...`);
      redisAvailable = false;
    });

    redisClient.on('end', () => {
      console.log('Redis connection ended');
      redisAvailable = false;
    });

  } catch (error) {
    console.error('Failed to initialize Redis:', error.message);
    redisAvailable = false;
    redisClient = null;
  }
}

// Initialize Redis on module load
initRedis()

/**
 * Generate cache key from parameters
 * @param {string} prefix - Cache key prefix
 * @param {Object} params - Parameters to include in key
 * @returns {string} Generated cache key
 */
export function generateCacheKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * Clean up cache when it gets too large (LRU-style)
 */
function cleanupMemoryCache() {
  if (memoryCache.size >= CACHE_CONFIG.maxMemoryCacheSize) {
    // Remove oldest entries (first 10% of cache)
    const entriesToRemove = Math.floor(CACHE_CONFIG.maxMemoryCacheSize * 0.1);
    const keys = Array.from(memoryCache.keys()).slice(0, entriesToRemove);
    keys.forEach(key => memoryCache.delete(key));
  }
}

/**
 * Memory cache implementation
 */
const memoryCacheAdapter = {
  async get(key) {
    return memoryCache.get(key) || null;
  },

  async set(key, value) {
    // Clean up if cache is getting too large
    cleanupMemoryCache();
    
    memoryCache.set(key, value);
    return true;
  },

  async del(key) {
    memoryCache.delete(key);
    return true;
  },

  async clear() {
    memoryCache.clear();
    return true;
  },

  async size() {
    return memoryCache.size;
  },

  async keys() {
    return Array.from(memoryCache.keys());
  }
};

/**
 * Redis cache implementation
 */
const redisCacheAdapter = {
  async get(key) {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error.message);
      throw error;
    }
  },

  async set(key, value) {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      
      await redisClient.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error.message);
      throw error;
    }
  },

  async del(key) {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error.message);
      throw error;
    }
  },

  async clear() {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      
      await redisClient.flushdb();
      return true;
    } catch (error) {
      console.error('Redis clear error:', error.message);
      throw error;
    }
  },

  async size() {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      
      return await redisClient.dbsize();
    } catch (error) {
      console.error('Redis size error:', error.message);
      throw error;
    }
  },

  async keys() {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      
      return await redisClient.keys('*');
    } catch (error) {
      console.error('Redis keys error:', error.message);
      throw error;
    }
  },

  async scanKeys(pattern = '*', count = 100) {
    try {
      if (!redisAvailable || !redisClient) {
        throw new Error('Redis not available');
      }
      
      const keys = [];
      const stream = redisClient.scanStream({
        match: pattern,
        count
      });
      
      return new Promise((resolve, reject) => {
        stream.on('data', (resultKeys) => {
          keys.push(...resultKeys);
        });
        
        stream.on('end', () => {
          resolve(keys);
        });
        
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Redis scanKeys error:', error.message);
      throw error;
    }
  }
};

/**
 * Get the appropriate cache adapter with fallback
 */
function getCacheAdapter() {
  // Use Redis if available and configured, otherwise fall back to memory cache
  if (redisAvailable && redisClient) {
    return {
      adapter: redisCacheAdapter,
      type: 'redis'
    };
  }
  
  return {
    adapter: memoryCacheAdapter,
    type: 'memory'
  };
}

/**
 * Main cache interface with automatic fallback
 */
export const cache = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!CACHE_CONFIG.enabled) return null;
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      return await adapter.get(key);
    } catch (error) {
      console.error(`${type} cache get error:`, error.message);
      
      // If Redis fails, try memory cache as fallback
      if (type === 'redis') {
        try {
          return await memoryCacheAdapter.get(key);
        } catch (fallbackError) {
          console.error('Memory cache fallback failed:', fallbackError.message);
        }
      }
      
      return null;
    }
  },

  /**
   * Set value in cache (indefinitely)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @returns {Promise<boolean>}
   */
  async set(key, value) {
    if (!CACHE_CONFIG.enabled) return false;
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      const result = await adapter.set(key, value);
      
      // If using Redis, also set in memory cache as backup
      if (type === 'redis') {
        try {
          await memoryCacheAdapter.set(key, value);
        } catch (memoryError) {
          console.error('Failed to backup to memory cache:', memoryError.message);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`${type} cache set error:`, error.message);
      
      // If Redis fails, try memory cache as fallback
      if (type === 'redis') {
        try {
          return await memoryCacheAdapter.set(key, value);
        } catch (fallbackError) {
          console.error('Memory cache fallback failed:', fallbackError.message);
        }
      }
      
      return false;
    }
  },

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    if (!CACHE_CONFIG.enabled) return false;
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      const result = await adapter.del(key);
      
      // If using Redis, also delete from memory cache
      if (type === 'redis') {
        try {
          await memoryCacheAdapter.del(key);
        } catch (memoryError) {
          console.error('Failed to delete from memory cache:', memoryError.message);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`${type} cache delete error:`, error.message);
      
      // If Redis fails, try memory cache as fallback
      if (type === 'redis') {
        try {
          return await memoryCacheAdapter.del(key);
        } catch (fallbackError) {
          console.error('Memory cache fallback failed:', fallbackError.message);
        }
      }
      
      return false;
    }
  },

  /**
   * Clear all cache entries
   * @returns {Promise<boolean>}
   */
  async clear() {
    if (!CACHE_CONFIG.enabled) return false;
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      const result = await adapter.clear();
      
      // Always clear memory cache too
      try {
        await memoryCacheAdapter.clear();
      } catch (memoryError) {
        console.error('Failed to clear memory cache:', memoryError.message);
      }
      
      return result;
    } catch (error) {
      console.error(`${type} cache clear error:`, error.message);
      
      // If Redis fails, try memory cache as fallback
      if (type === 'redis') {
        try {
          return await memoryCacheAdapter.clear();
        } catch (fallbackError) {
          console.error('Memory cache fallback failed:', fallbackError.message);
        }
      }
      
      return false;
    }
  },

  /**
   * Get cache size
   * @returns {Promise<number>}
   */
  async size() {
    if (!CACHE_CONFIG.enabled) return 0;
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      return await adapter.size();
    } catch (error) {
      console.error(`${type} cache size error:`, error.message);
      
      // If Redis fails, try memory cache as fallback
      if (type === 'redis') {
        try {
          return await memoryCacheAdapter.size();
        } catch (fallbackError) {
          console.error('Memory cache fallback failed:', fallbackError.message);
        }
      }
      
      return 0;
    }
  },

  /**
   * Get all cache keys
   * @returns {Promise<Array<string>>}
   */
  async keys() {
    if (!CACHE_CONFIG.enabled) return [];
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      return await adapter.keys();
    } catch (error) {
      console.error(`${type} cache keys error:`, error.message);
      
      // If Redis fails, try memory cache as fallback
      if (type === 'redis') {
        try {
          return await memoryCacheAdapter.keys();
        } catch (fallbackError) {
          console.error('Memory cache fallback failed:', fallbackError.message);
        }
      }
      
      return [];
    }
  },

  /**
   * Scan keys with pattern (Redis-specific, falls back to keys() for memory)
   * @param {string} pattern - Pattern to match
   * @param {number} count - Scan count
   * @returns {Promise<Array<string>>}
   */
  async scanKeys(pattern = '*', count = 100) {
    if (!CACHE_CONFIG.enabled) return [];
    
    const { adapter, type } = getCacheAdapter();
    
    try {
      if (type === 'redis' && adapter.scanKeys) {
        return await adapter.scanKeys(pattern, count);
      } else {
        // For memory cache, use keys() and filter
        const allKeys = await adapter.keys();
        if (pattern === '*') return allKeys;
        
        // Simple pattern matching for memory cache
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return allKeys.filter(key => regex.test(key));
      }
    } catch (error) {
      console.error(`${type} cache scanKeys error:`, error.message);
      return [];
    }
  },

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to execute if cache miss
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetchFn) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - execute function
    const result = await fetchFn();
    
    // Cache the result indefinitely
    await this.set(key, result);
    
    return result;
  },

  /**
   * Get cache type and status
   * @returns {Object}
   */
  getStatus() {
    const { type } = getCacheAdapter();
    return {
      type,
      redisAvailable,
      redisConfigured: !!CACHE_CONFIG.redis.url,
      enabled: CACHE_CONFIG.enabled
    };
  }
};

/**
 * Higher-order function to add caching to API route handlers
 * @param {Function} handler - API route handler
 * @param {Object} options - Caching options
 * @returns {Function} Cached API route handler
 */
export function withCache(handler, options = {}) {
  const {
    keyGenerator = (request) => {
      const url = new URL(request.url);
      return generateCacheKey('api', {
        pathname: url.pathname,
        search: url.search
      });
    },
    skipCache = () => false,
  } = options;

  return async function cachedHandler(request, context) {
    // Skip cache if specified
    if (skipCache(request)) {
      return handler(request, context);
    }

    // Generate cache key
    const cacheKey = keyGenerator(request);

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      const { type } = getCacheAdapter();
      
      // Return cached response with cache headers
      return new Response(JSON.stringify(cached.data), {
        status: cached.status,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-Cache-Type': type,
          'Cache-Control': 'public, max-age=31536000', // 1 year since we manually invalidate
          ...cached.headers
        }
      });
    }

    // Cache miss - execute handler
    const response = await handler(request, context);
    
    // Only cache successful responses
    if (response.ok) {
      try {
        const data = await response.json();
        const cacheEntry = {
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        // Cache the response indefinitely
        await cache.set(cacheKey, cacheEntry);
        
        const { type } = getCacheAdapter();
        
        // Return response with cache headers
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'MISS',
            'X-Cache-Type': type,
            'Cache-Control': 'public, max-age=31536000', // 1 year since we manually invalidate
            ...cacheEntry.headers
          }
        });
      } catch (error) {
        console.error('Error caching response:', error);
        return response;
      }
    }

    return response;
  };
} 