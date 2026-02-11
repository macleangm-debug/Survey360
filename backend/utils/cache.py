"""
Survey360 - Redis Cache Layer
High-performance caching for survey data, responses, and analytics
With authentication and Sentinel support for HA
"""

import os
import json
import hashlib
from typing import Optional, Any, Callable
from datetime import timedelta
from functools import wraps
import logging

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

# Try to import redis, fallback to in-memory cache
try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available, using in-memory fallback cache")

# In-memory fallback cache
_memory_cache = {}
_cache_expiry = {}


class CacheConfig:
    """Cache configuration settings"""
    REDIS_URL = os.environ.get("REDIS_URL", "redis://:survey360_redis_secret_2026@127.0.0.1:6379/0")
    REDIS_SENTINEL_URL = os.environ.get("REDIS_SENTINEL_URL", "redis://:survey360_sentinel_secret_2026@127.0.0.1:26379")
    DEFAULT_TTL = 300  # 5 minutes
    SURVEY_TTL = 600  # 10 minutes for survey data
    ANALYTICS_TTL = 60  # 1 minute for analytics (changes frequently)
    TEMPLATE_TTL = 3600  # 1 hour for templates (rarely change)
    PUBLIC_SURVEY_TTL = 120  # 2 minutes for public survey cache
    MAX_MEMORY_CACHE_SIZE = 10000  # Max items in memory fallback


class RedisCache:
    """Async Redis cache client with fallback to in-memory"""
    
    _instance: Optional['RedisCache'] = None
    _redis: Optional[Any] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def connect(self):
        """Initialize Redis connection with authentication"""
        if REDIS_AVAILABLE and self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    CacheConfig.REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                await self._redis.ping()
                logger.info("Redis cache connected successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed, using memory cache: {e}")
                self._redis = None
    
    async def close(self):
        """Close Redis connection"""
        if self._redis:
            await self._redis.close()
            self._redis = None
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from prefix and arguments"""
        key_data = f"{prefix}:{':'.join(str(a) for a in args)}"
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            key_data += f":{hashlib.md5(str(sorted_kwargs).encode()).hexdigest()[:8]}"
        return key_data
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if self._redis:
                value = await self._redis.get(key)
                if value:
                    return json.loads(value)
            else:
                # Memory fallback
                import time
                if key in _memory_cache:
                    if key in _cache_expiry and _cache_expiry[key] < time.time():
                        del _memory_cache[key]
                        del _cache_expiry[key]
                        return None
                    return _memory_cache.get(key)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None
    
    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache with TTL"""
        ttl = ttl or CacheConfig.DEFAULT_TTL
        try:
            serialized = json.dumps(value, default=str)
            if self._redis:
                await self._redis.setex(key, ttl, serialized)
            else:
                # Memory fallback with size limit
                import time
                if len(_memory_cache) >= CacheConfig.MAX_MEMORY_CACHE_SIZE:
                    # Remove oldest 10% of entries
                    oldest_keys = sorted(_cache_expiry.keys(), key=lambda k: _cache_expiry.get(k, 0))[:1000]
                    for k in oldest_keys:
                        _memory_cache.pop(k, None)
                        _cache_expiry.pop(k, None)
                
                _memory_cache[key] = json.loads(serialized)
                _cache_expiry[key] = time.time() + ttl
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            if self._redis:
                await self._redis.delete(key)
            else:
                _memory_cache.pop(key, None)
                _cache_expiry.pop(key, None)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        count = 0
        try:
            if self._redis:
                cursor = 0
                while True:
                    cursor, keys = await self._redis.scan(cursor, match=pattern, count=100)
                    if keys:
                        await self._redis.delete(*keys)
                        count += len(keys)
                    if cursor == 0:
                        break
            else:
                # Memory fallback
                import fnmatch
                keys_to_delete = [k for k in _memory_cache.keys() if fnmatch.fnmatch(k, pattern)]
                for k in keys_to_delete:
                    _memory_cache.pop(k, None)
                    _cache_expiry.pop(k, None)
                    count += 1
        except Exception as e:
            logger.error(f"Cache delete pattern error: {e}")
        return count
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment counter in cache"""
        try:
            if self._redis:
                return await self._redis.incrby(key, amount)
            else:
                current = _memory_cache.get(key, 0)
                _memory_cache[key] = current + amount
                return _memory_cache[key]
        except Exception as e:
            logger.error(f"Cache increment error: {e}")
            return 0


# Global cache instance
cache = RedisCache()


def cached(prefix: str, ttl: int = None, key_builder: Callable = None):
    """
    Decorator for caching function results
    
    Usage:
        @cached("survey", ttl=600)
        async def get_survey(survey_id: str):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = cache._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            if result is not None:
                await cache.set(cache_key, result, ttl or CacheConfig.DEFAULT_TTL)
            
            return result
        return wrapper
    return decorator


# Cache key builders for common patterns
def survey_key(survey_id: str, **kwargs) -> str:
    return f"survey360:survey:{survey_id}"

def survey_responses_key(survey_id: str, page: int = 1, **kwargs) -> str:
    return f"survey360:responses:{survey_id}:page:{page}"

def survey_analytics_key(survey_id: str, **kwargs) -> str:
    return f"survey360:analytics:{survey_id}"

def public_survey_key(survey_id: str, **kwargs) -> str:
    return f"survey360:public:{survey_id}"

def templates_key(**kwargs) -> str:
    return "survey360:templates:all"

def user_surveys_key(user_id: str, org_id: str, **kwargs) -> str:
    return f"survey360:user_surveys:{org_id}:{user_id}"


# Cache invalidation helpers
async def invalidate_survey_cache(survey_id: str):
    """Invalidate all cache entries for a survey"""
    await cache.delete_pattern(f"survey360:*:{survey_id}*")
    
async def invalidate_user_cache(user_id: str, org_id: str):
    """Invalidate cache for a user"""
    await cache.delete_pattern(f"survey360:user_surveys:{org_id}:{user_id}")

async def invalidate_org_cache(org_id: str):
    """Invalidate all cache for an organization"""
    await cache.delete_pattern(f"survey360:*:{org_id}:*")
