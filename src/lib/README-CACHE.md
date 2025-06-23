# API Route Caching Implementation

This caching system provides efficient caching for Next.js API routes with support for both in-memory and Redis backends.

## Features

- **Flexible Backend**: Supports in-memory cache (development) and Redis (production)
- **Automatic Cache Keys**: Generates cache keys from request parameters
- **TTL Support**: Configurable time-to-live for cache entries
- **Cache Invalidation**: Utilities to invalidate cache when data changes
- **HTTP Cache Headers**: Adds appropriate cache headers to responses
- **Error Handling**: Graceful fallback when cache operations fail

## Usage

### Basic Caching

```javascript
import { withCache } from 'src/lib/cache';

async function apiHandler(request) {
  // Your API logic here
  return new Response(JSON.stringify(data));
}

export const GET = withCache(apiHandler);
```

### Custom Cache Configuration

```javascript
export const GET = withCache(apiHandler, {
  // Custom cache key generator
  keyGenerator: (request) => {
    const { searchParams } = new URL(request.url);
    return generateCacheKey('my-api', {
      param1: searchParams.get('param1'),
      param2: searchParams.get('param2')
    });
  },
  
  // Cache for 30 minutes
  ttl: 1800,
  
  // Skip cache for certain conditions
  skipCache: (request) => {
    const { searchParams } = new URL(request.url);
    return !searchParams.get('required_param');
  }
});
```

### Cache Invalidation

```javascript
import { invalidateAllSeasonIndividualMetrics } from 'src/lib/cache-invalidation';

// After uploading new data
await invalidateAllSeasonIndividualMetrics(seasonName);
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Enable caching in development (disabled by default)
ENABLE_CACHE=true

# Redis URL for production (optional)
REDIS_URL=redis://localhost:6379

# Default TTL in seconds (optional)
CACHE_DEFAULT_TTL=3600

# Maximum memory cache size (optional)
CACHE_MAX_MEMORY_SIZE=1000
```

### Cache Backends

#### Memory Cache (Default)
- Used automatically in development
- Stores cache in application memory
- Limited by `CACHE_MAX_MEMORY_SIZE`
- Automatically cleans up expired entries

#### Redis Cache (Production)
To enable Redis caching:

1. Install Redis client:
```bash
npm install ioredis
```

2. Uncomment Redis code in `src/lib/cache.js`
3. Set `REDIS_URL` environment variable

## API Routes with Caching

### Individual Metrics Route

The individual metrics route (`/api/metrics/individual`) is cached with:
- **Cache Key**: Based on `seasonName`, `startDate`, and `endDate`
- **TTL**: 30 minutes (1800 seconds)
- **Invalidation**: When new season data is uploaded

Example requests:
- `GET /api/metrics/individual?season_name=S5&start_date=2024-06-10&end_date=2024-06-15`
- Cache key: `metrics-individual:endDate:2024-06-15|seasonName:S5|startDate:2024-06-10`

### Upload Route Cache Invalidation

When new season data is uploaded via `/api/season/upload`, all related cached metrics are automatically invalidated to ensure users receive fresh data.

## Cache Headers

Cached responses include these headers:
- `X-Cache: HIT` (cache hit) or `X-Cache: MISS` (cache miss)
- `Cache-Control: public, max-age=<ttl>`

## Monitoring and Debugging

### Cache Statistics
```javascript
import { getCacheStats } from 'src/lib/cache-invalidation';

const stats = await getCacheStats();
console.log(stats);
```

### Manual Cache Operations
```javascript
import { cache } from 'src/lib/cache';

// Get cached value
const value = await cache.get('my-key');

// Set cached value
await cache.set('my-key', data, 3600);

// Delete cached value
await cache.del('my-key');

// Clear all cache
await cache.clear();
```

## Best Practices

1. **Cache Duration**: Choose appropriate TTL based on data freshness requirements
   - Frequently changing data: 5-15 minutes
   - Moderately changing data: 30-60 minutes
   - Rarely changing data: 2-24 hours

2. **Cache Keys**: Use descriptive, consistent cache key patterns
   - Include all relevant parameters
   - Use consistent naming conventions

3. **Invalidation**: Always invalidate cache when underlying data changes
   - Implement invalidation in data modification endpoints
   - Use pattern-based invalidation for related data

4. **Error Handling**: Cache operations should never break your API
   - Graceful fallback when cache is unavailable
   - Log cache errors for monitoring

5. **Memory Usage**: Monitor memory cache size in production
   - Set appropriate `CACHE_MAX_MEMORY_SIZE`
   - Consider Redis for high-traffic applications

## Production Considerations

### Redis Setup
For production, use Redis for:
- **Distributed Caching**: Multiple server instances
- **Persistence**: Cache survives server restarts
- **Advanced Features**: Pattern matching, pub/sub for invalidation

### Monitoring
Monitor these metrics:
- Cache hit/miss ratios
- Cache memory usage
- Cache operation latency
- Cache invalidation frequency

### Scaling
- Use Redis Cluster for high availability
- Implement cache warming for critical data
- Consider CDN caching for static responses 