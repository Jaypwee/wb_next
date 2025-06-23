/**
 * Cache invalidation utilities
 * Provides functions to invalidate cache entries based on patterns
 * Works with both Redis and memory cache backends
 */

import { cache, generateCacheKey } from './cache';

/**
 * Get all cache keys matching a pattern
 * Uses Redis SCAN for Redis cache, or simple filtering for memory cache
 * @param {string} pattern - Pattern to match (Redis glob pattern or simple string contains)
 * @returns {Promise<Array<string>>} Matching cache keys
 */
export async function getCacheKeysByPattern(pattern) {
  try {
    const cacheStatus = cache.getStatus();
    
    if (cacheStatus.type === 'redis') {
      // Use Redis SCAN for efficient pattern matching
      return await cache.scanKeys(pattern);
    } else {
      // For memory cache, use simple string matching
      const allKeys = await cache.keys();
      return allKeys.filter(key => key.includes(pattern));
    }
  } catch (error) {
    console.error('Error getting cache keys by pattern:', error);
    return [];
  }
}

/**
 * Invalidate cache entries by pattern matching
 * @param {string} pattern - Pattern to match cache keys
 * @returns {Promise<number>} Number of invalidated entries
 */
export async function invalidateByPattern(pattern) {
  try {
    const cacheStatus = cache.getStatus();
    let matchingKeys = [];
    
    if (cacheStatus.type === 'redis') {
      // For Redis, use glob pattern (e.g., "metrics-individual:seasonName:S5*")
      const redisPattern = pattern.includes('*') ? pattern : `*${pattern}*`;
      matchingKeys = await cache.scanKeys(redisPattern);
    } else {
      // For memory cache, use simple string contains
      matchingKeys = await getCacheKeysByPattern(pattern);
    }
    
    // Delete all matching keys
    for (const key of matchingKeys) {
      await cache.del(key);
    }
    
    if (matchingKeys.length > 0) {
      console.log(`Invalidated ${matchingKeys.length} cache entries matching pattern: ${pattern}`);
    }
    return matchingKeys.length;
  } catch (error) {
    console.error('Error invalidating cache by pattern:', error);
    return 0;
  }
}

/**
 * Invalidate all individual metrics for a season
 * This is called when new season data is uploaded
 * @param {string} seasonName - Season name
 * @returns {Promise<void>}
 */
export async function invalidateAllSeasonIndividualMetrics(seasonName) {
  try {
    const cacheStatus = cache.getStatus();
    let pattern;
    
    if (cacheStatus.type === 'redis') {
      // Redis glob pattern - matches any key containing this season
      pattern = `*metrics-individual*seasonName:${seasonName}*`;
    } else {
      // Memory cache simple string matching
      pattern = `metrics-individual:seasonName:${seasonName}`;
    }
    
    const count = await invalidateByPattern(pattern);
    if (count > 0) {
      console.log(`Invalidated ${count} individual metrics cache entries for season: ${seasonName}`);
    }
  } catch (error) {
    console.error('Error invalidating season individual metrics cache:', error);
  }
}

/**
 * Invalidate specific metrics cache entry
 * @param {string} seasonName - Season name
 * @param {string} startDate - Start date
 * @param {string} endDate - End date (optional)
 * @returns {Promise<void>}
 */
export async function invalidateSpecificMetrics(seasonName, startDate, endDate = null) {
  try {
    const cacheKey = generateCacheKey('metrics-individual', {
      seasonName,
      startDate,
      endDate: endDate || 'single'
    });
    
    const result = await cache.del(cacheKey);
    if (result) {
      console.log(`Invalidated cache for key: ${cacheKey}`);
    }
  } catch (error) {
    console.error('Error invalidating specific metrics cache:', error);
  }
}

/**
 * Get cache statistics (for debugging and monitoring)
 * @returns {Promise<Object>} Cache statistics
 */
export async function getCacheStats() {
  try {
    const cacheStatus = cache.getStatus();
    const totalSize = await cache.size();
    const allKeys = await cache.keys();
    
    // Group keys by prefix to show cache distribution
    const keysByPrefix = {};
    allKeys.forEach(key => {
      const prefix = key.split(':')[0];
      keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
    });

    return {
      type: cacheStatus.type,
      redisAvailable: cacheStatus.redisAvailable,
      enabled: cacheStatus.enabled,
      totalEntries: totalSize,
      keyDistribution: keysByPrefix,
      sampleKeys: allKeys.slice(0, 10), // Show first 10 keys as examples
      message: `Cache (${cacheStatus.type}) contains ${totalSize} entries`
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      type: 'unknown',
      error: error.message,
      message: 'Error retrieving cache statistics'
    };
  }
}

/**
 * List all cached metrics for a specific season
 * @param {string} seasonName - Season name
 * @returns {Promise<Array<Object>>} List of cached metrics entries
 */
export async function listSeasonCachedMetrics(seasonName) {
  try {
    const cacheStatus = cache.getStatus();
    let pattern;
    
    if (cacheStatus.type === 'redis') {
      pattern = `*metrics-individual*seasonName:${seasonName}*`;
    } else {
      pattern = `metrics-individual:seasonName:${seasonName}`;
    }
    
    const matchingKeys = await getCacheKeysByPattern(pattern);
    
    const cachedEntries = [];
    for (const key of matchingKeys) {
      try {
        // Parse the cache key to extract parameters
        const keyParts = key.split('|');
        const params = {};
        keyParts.forEach(part => {
          const [paramKey, paramValue] = part.split(':');
          if (paramKey && paramValue) {
            params[paramKey] = paramValue;
          }
        });
        
        cachedEntries.push({
          cacheKey: key,
          seasonName: params.seasonName,
          startDate: params.startDate,
          endDate: params.endDate === 'single' ? null : params.endDate
        });
      } catch (parseError) {
        console.error('Error parsing cache key:', key, parseError);
      }
    }
    
    return cachedEntries;
  } catch (error) {
    console.error('Error listing season cached metrics:', error);
    return [];
  }
}

/**
 * Clean up cache entries (manual cleanup)
 * @param {Object} options - Cleanup options
 * @returns {Promise<number>} Number of entries cleaned up
 */
export async function cleanupCache(options = {}) {
  const { 
    dryRun = false,
    pattern = null,
    maxEntries = null 
  } = options;
  
  try {
    let keysToRemove = [];
    
    if (pattern) {
      // Remove entries matching pattern
      keysToRemove = await getCacheKeysByPattern(pattern);
    } else if (maxEntries) {
      // Remove oldest entries to stay under maxEntries
      const allKeys = await cache.keys();
      if (allKeys.length > maxEntries) {
        keysToRemove = allKeys.slice(0, allKeys.length - maxEntries);
      }
    }
    
    if (dryRun) {
      console.log(`Would remove ${keysToRemove.length} cache entries:`, keysToRemove.slice(0, 5));
      return keysToRemove.length;
    }
    
    // Actually remove the entries
    let removedCount = 0;
    for (const key of keysToRemove) {
      const result = await cache.del(key);
      if (result) removedCount++;
    }
    
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} cache entries`);
    }
    return removedCount;
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    return 0;
  }
}

/**
 * Get cache health status
 * @returns {Promise<Object>} Cache health information
 */
export async function getCacheHealth() {
  try {
    const status = cache.getStatus();
    const size = await cache.size();
    
    return {
      healthy: status.enabled && (status.type === 'memory' || status.redisAvailable),
      type: status.type,
      enabled: status.enabled,
      redisAvailable: status.redisAvailable,
      redisConfigured: status.redisConfigured,
      totalEntries: size,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
} 