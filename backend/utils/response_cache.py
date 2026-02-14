"""
Survey360 - Response Caching Middleware
Caches public survey responses and API responses for high traffic
"""

import hashlib
import json
from typing import Callable, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from utils.cache import cache, CacheConfig

logger = logging.getLogger(__name__)


class ResponseCacheMiddleware(BaseHTTPMiddleware):
    """
    Middleware to cache API responses for GET requests.
    Caches based on URL path and query parameters.
    """
    
    # Routes to cache and their TTLs
    CACHEABLE_ROUTES = {
        "/api/survey360/templates": CacheConfig.TEMPLATE_TTL,
        "/api/survey360/surveys": CacheConfig.SURVEY_TTL,
    }
    
    # Routes with dynamic caching (pattern-based)
    CACHEABLE_PATTERNS = [
        ("/api/s/", CacheConfig.PUBLIC_SURVEY_TTL),  # Public surveys
        ("/api/survey360/surveys/", CacheConfig.SURVEY_TTL),  # Survey details
    ]
    
    # Routes to never cache
    SKIP_CACHE_ROUTES = [
        "/api/auth",
        "/api/survey360/responses",  # Don't cache response submissions
        "/api/health",
    ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only cache GET requests
        if request.method != "GET":
            return await call_next(request)
        
        path = request.url.path
        
        # Skip certain routes
        for skip_route in self.SKIP_CACHE_ROUTES:
            if path.startswith(skip_route):
                return await call_next(request)
        
        # Determine TTL for this route
        ttl = self._get_route_ttl(path)
        if ttl is None:
            return await call_next(request)
        
        # Generate cache key
        cache_key = self._generate_cache_key(request)
        
        # Try to get from cache
        cached_response = await cache.get(cache_key)
        if cached_response:
            logger.debug(f"Cache HIT: {path}")
            return JSONResponse(
                content=cached_response["body"],
                status_code=cached_response["status_code"],
                headers={"X-Cache": "HIT"}
            )
        
        # Cache MISS - get response from handler
        logger.debug(f"Cache MISS: {path}")
        response = await call_next(request)
        
        # Only cache successful responses
        if response.status_code == 200:
            # Read response body
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            try:
                # Parse and cache the response
                body_json = json.loads(body.decode())
                await cache.set(cache_key, {
                    "body": body_json,
                    "status_code": response.status_code
                }, ttl)
                
                # Return new response with body
                return JSONResponse(
                    content=body_json,
                    status_code=response.status_code,
                    headers={"X-Cache": "MISS"}
                )
            except json.JSONDecodeError:
                # Non-JSON response, return as-is
                return Response(
                    content=body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type
                )
        
        return response
    
    def _get_route_ttl(self, path: str) -> Optional[int]:
        """Get cache TTL for a route"""
        # Check exact matches first
        if path in self.CACHEABLE_ROUTES:
            return self.CACHEABLE_ROUTES[path]
        
        # Check patterns
        for pattern, ttl in self.CACHEABLE_PATTERNS:
            if path.startswith(pattern):
                return ttl
        
        return None
    
    def _generate_cache_key(self, request: Request) -> str:
        """Generate a unique cache key for the request"""
        path = request.url.path
        query = str(sorted(request.query_params.items()))
        
        # Include user context if available (for personalized responses)
        user_id = request.headers.get("X-User-ID", "anonymous")
        
        key_data = f"{path}:{query}:{user_id}"
        key_hash = hashlib.md5(key_data.encode()).hexdigest()[:12]
        
        return f"response_cache:{key_hash}"


class PublicSurveyCacheMiddleware(BaseHTTPMiddleware):
    """
    Specialized caching for public survey access.
    Optimized for high-traffic survey collection.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        
        # Only handle public survey routes
        if not path.startswith("/api/s/"):
            return await call_next(request)
        
        # Extract survey ID from path
        parts = path.split("/")
        if len(parts) < 4:
            return await call_next(request)
        
        survey_id = parts[3]
        
        if request.method == "GET":
            # Try to get cached survey
            cache_key = f"public_survey:{survey_id}"
            cached = await cache.get(cache_key)
            
            if cached:
                return JSONResponse(
                    content=cached,
                    headers={"X-Cache": "HIT", "X-Cache-TTL": str(CacheConfig.PUBLIC_SURVEY_TTL)}
                )
            
            # Get fresh response
            response = await call_next(request)
            
            if response.status_code == 200:
                body = b""
                async for chunk in response.body_iterator:
                    body += chunk
                
                try:
                    body_json = json.loads(body.decode())
                    await cache.set(cache_key, body_json, CacheConfig.PUBLIC_SURVEY_TTL)
                    
                    return JSONResponse(
                        content=body_json,
                        headers={"X-Cache": "MISS"}
                    )
                except json.JSONDecodeError:
                    return Response(content=body, status_code=response.status_code)
            
            return response
        
        elif request.method == "POST":
            # For submissions, invalidate cache after successful submission
            response = await call_next(request)
            
            if response.status_code in [200, 201]:
                # Invalidate analytics cache since we have new data
                await cache.delete(f"survey360:analytics:{survey_id}")
            
            return response
        
        return await call_next(request)


# Rate limiting with Redis (enhanced)
class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Redis-based rate limiting for API protection.
    Uses sliding window algorithm.
    """
    
    # Rate limits per route pattern (requests per minute)
    RATE_LIMITS = {
        "/api/survey360/responses": 60,  # Survey submissions
        "/api/survey360/surveys": 100,
        "/api/s/": 200,  # Public survey access (higher limit)
        "/api/": 100,  # Default
    }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client identifier
        client_ip = request.client.host if request.client else "unknown"
        user_id = request.headers.get("X-User-ID", client_ip)
        
        path = request.url.path
        rate_limit = self._get_rate_limit(path)
        
        # Check rate limit
        rate_key = f"rate_limit:{user_id}:{path.split('/')[2] if len(path.split('/')) > 2 else 'api'}"
        
        current_count = await cache.increment(rate_key)
        
        # Set expiry on first request
        if current_count == 1:
            if cache._redis:
                await cache._redis.expire(rate_key, 60)
        
        if current_count > rate_limit:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "retry_after": 60,
                    "limit": rate_limit
                },
                headers={
                    "X-RateLimit-Limit": str(rate_limit),
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": "60"
                }
            )
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(rate_limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, rate_limit - current_count))
        
        return response
    
    def _get_rate_limit(self, path: str) -> int:
        """Get rate limit for a path"""
        for pattern, limit in self.RATE_LIMITS.items():
            if path.startswith(pattern):
                return limit
        return 100  # Default
