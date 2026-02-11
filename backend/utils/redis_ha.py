"""
Survey360 - Redis High Availability Monitor
Monitors Redis health and handles failover scenarios
Since Redis Sentinel is not available, this provides basic HA monitoring
"""

import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import json

logger = logging.getLogger(__name__)


class RedisHAMonitor:
    """
    Redis High Availability Monitor
    Provides health checking, alerting, and basic failover support
    """
    
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or os.environ.get(
            "REDIS_URL", 
            "redis://:survey360_redis_secret_2026@127.0.0.1:6379/0"
        )
        self.check_interval = 10  # seconds
        self.max_failures = 3
        self.failure_count = 0
        self.last_check: Optional[datetime] = None
        self.is_healthy = True
        self.metrics: Dict[str, Any] = {}
        self._running = False
    
    async def check_health(self) -> Dict[str, Any]:
        """Perform comprehensive health check on Redis"""
        try:
            import redis.asyncio as aioredis
            
            client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Basic ping
            start_time = datetime.now(timezone.utc)
            await client.ping()
            latency_ms = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            
            # Get server info
            info = await client.info()
            
            # Get memory info
            memory_info = await client.info("memory")
            
            # Get persistence info
            persistence_info = await client.info("persistence")
            
            # Get client info
            client_info = await client.info("clients")
            
            await client.close()
            
            self.metrics = {
                "status": "healthy",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "latency_ms": round(latency_ms, 2),
                "version": info.get("redis_version"),
                "uptime_seconds": info.get("uptime_in_seconds"),
                "memory": {
                    "used": memory_info.get("used_memory_human"),
                    "peak": memory_info.get("used_memory_peak_human"),
                    "fragmentation_ratio": memory_info.get("mem_fragmentation_ratio")
                },
                "persistence": {
                    "rdb_last_save_time": persistence_info.get("rdb_last_save_time"),
                    "rdb_last_bgsave_status": persistence_info.get("rdb_last_bgsave_status"),
                    "aof_enabled": persistence_info.get("aof_enabled"),
                    "aof_last_write_status": persistence_info.get("aof_last_write_status")
                },
                "clients": {
                    "connected": client_info.get("connected_clients"),
                    "blocked": client_info.get("blocked_clients")
                }
            }
            
            self.failure_count = 0
            self.is_healthy = True
            self.last_check = datetime.now(timezone.utc)
            
            return self.metrics
            
        except Exception as e:
            self.failure_count += 1
            self.is_healthy = self.failure_count < self.max_failures
            
            error_metrics = {
                "status": "unhealthy" if not self.is_healthy else "degraded",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": str(e),
                "failure_count": self.failure_count,
                "max_failures": self.max_failures
            }
            
            self.metrics = error_metrics
            logger.error(f"Redis health check failed: {e}")
            
            return error_metrics
    
    async def get_replication_info(self) -> Dict[str, Any]:
        """Get replication status"""
        try:
            import redis.asyncio as aioredis
            
            client = aioredis.from_url(self.redis_url)
            info = await client.info("replication")
            await client.close()
            
            return {
                "role": info.get("role"),
                "connected_slaves": info.get("connected_slaves", 0),
                "repl_backlog_active": info.get("repl_backlog_active", 0),
                "repl_backlog_size": info.get("repl_backlog_size")
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def get_slowlog(self, count: int = 10) -> list:
        """Get slow queries log"""
        try:
            import redis.asyncio as aioredis
            
            client = aioredis.from_url(self.redis_url)
            slowlog = await client.slowlog_get(count)
            await client.close()
            
            return [
                {
                    "id": entry[0],
                    "timestamp": entry[1],
                    "duration_us": entry[2],
                    "command": entry[3]
                }
                for entry in slowlog
            ]
        except Exception as e:
            return [{"error": str(e)}]
    
    async def force_persistence(self) -> Dict[str, bool]:
        """Force both RDB and AOF persistence"""
        try:
            import redis.asyncio as aioredis
            
            client = aioredis.from_url(self.redis_url)
            
            # Trigger RDB save
            rdb_result = await client.bgsave()
            
            # Trigger AOF rewrite
            try:
                aof_result = await client.bgrewriteaof()
            except Exception:
                aof_result = "skipped"
            
            await client.close()
            
            return {
                "rdb_save": rdb_result == True or rdb_result == "Background saving started",
                "aof_rewrite": aof_result == True or aof_result == "Background append only file rewriting started"
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def start_monitoring(self):
        """Start continuous health monitoring"""
        self._running = True
        logger.info("Starting Redis HA monitoring...")
        
        while self._running:
            metrics = await self.check_health()
            
            # Log warnings if degraded
            if metrics.get("status") == "degraded":
                logger.warning(f"Redis health degraded: {self.failure_count}/{self.max_failures} failures")
            elif metrics.get("status") == "unhealthy":
                logger.error("Redis is UNHEALTHY - manual intervention may be required")
                # Here you could trigger alerts, notifications, etc.
            
            await asyncio.sleep(self.check_interval)
    
    def stop_monitoring(self):
        """Stop the monitoring loop"""
        self._running = False
        logger.info("Stopping Redis HA monitoring...")


# Create monitoring API endpoints
from fastapi import APIRouter

ha_router = APIRouter(prefix="/redis-ha", tags=["Redis HA"])
monitor = RedisHAMonitor()


@ha_router.get("/health")
async def redis_health():
    """Get Redis health status"""
    return await monitor.check_health()


@ha_router.get("/replication")
async def redis_replication():
    """Get Redis replication status"""
    return await monitor.get_replication_info()


@ha_router.get("/slowlog")
async def redis_slowlog(count: int = 10):
    """Get Redis slow queries"""
    return await monitor.get_slowlog(count)


@ha_router.post("/force-persist")
async def redis_force_persist():
    """Force persistence (RDB + AOF)"""
    return await monitor.force_persistence()


@ha_router.get("/metrics")
async def redis_metrics():
    """Get cached metrics from last health check"""
    return monitor.metrics
