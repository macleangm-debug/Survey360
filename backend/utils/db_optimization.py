"""
Survey360 - Database Optimization & Query Helpers
Optimized queries, indexes, and connection pooling for high traffic
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


# ============================================
# INDEX DEFINITIONS
# ============================================

SURVEY360_INDEXES = [
    # Surveys collection
    {
        "collection": "survey360_surveys",
        "indexes": [
            {"keys": [("org_id", 1), ("created_at", -1)], "name": "org_surveys_idx"},
            {"keys": [("status", 1), ("org_id", 1)], "name": "status_org_idx"},
            {"keys": [("id", 1)], "name": "survey_id_idx", "unique": True},
        ]
    },
    # Responses collection
    {
        "collection": "survey360_responses",
        "indexes": [
            {"keys": [("survey_id", 1), ("submitted_at", -1)], "name": "survey_responses_idx"},
            {"keys": [("survey_id", 1), ("respondent_id", 1)], "name": "survey_respondent_idx"},
            {"keys": [("org_id", 1), ("submitted_at", -1)], "name": "org_responses_idx"},
            {"keys": [("id", 1)], "name": "response_id_idx", "unique": True},
        ]
    },
    # Users collection
    {
        "collection": "survey360_users",
        "indexes": [
            {"keys": [("email", 1)], "name": "user_email_idx", "unique": True},
            {"keys": [("org_id", 1)], "name": "user_org_idx"},
            {"keys": [("id", 1)], "name": "user_id_idx", "unique": True},
        ]
    },
    # Organizations collection
    {
        "collection": "survey360_organizations",
        "indexes": [
            {"keys": [("id", 1)], "name": "org_id_idx", "unique": True},
            {"keys": [("slug", 1)], "name": "org_slug_idx", "unique": True},
        ]
    },
    # Jobs collection
    {
        "collection": "survey360_jobs",
        "indexes": [
            {"keys": [("user_id", 1), ("org_id", 1), ("created_at", -1)], "name": "user_jobs_idx"},
            {"keys": [("status", 1), ("created_at", -1)], "name": "status_jobs_idx"},
            {"keys": [("id", 1)], "name": "job_id_idx", "unique": True},
        ]
    },
]


async def create_indexes(db) -> Dict[str, int]:
    """Create all required indexes for Survey360 collections"""
    results = {}
    
    for collection_config in SURVEY360_INDEXES:
        collection_name = collection_config["collection"]
        collection = db[collection_name]
        created = 0
        
        for index_config in collection_config["indexes"]:
            try:
                await collection.create_index(
                    index_config["keys"],
                    name=index_config.get("name"),
                    unique=index_config.get("unique", False),
                    background=True
                )
                created += 1
            except Exception as e:
                logger.warning(f"Index creation warning for {collection_name}: {e}")
        
        results[collection_name] = created
        logger.info(f"Created {created} indexes for {collection_name}")
    
    return results


# ============================================
# OPTIMIZED QUERY HELPERS
# ============================================

class OptimizedQueries:
    """Collection of optimized queries for Survey360"""
    
    def __init__(self, db):
        self.db = db
    
    async def get_surveys_paginated(
        self,
        org_id: str,
        status: str = None,
        page: int = 1,
        page_size: int = 20,
        search: str = None
    ) -> Dict[str, Any]:
        """Get paginated surveys with optimized query"""
        query = {"org_id": org_id}
        
        if status and status != "all":
            query["status"] = status
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Use aggregation for efficient counting and pagination
        pipeline = [
            {"$match": query},
            {"$sort": {"created_at": -1}},
            {"$facet": {
                "metadata": [{"$count": "total"}],
                "data": [
                    {"$skip": (page - 1) * page_size},
                    {"$limit": page_size},
                    {"$project": {"_id": 0}}
                ]
            }}
        ]
        
        result = await self.db.survey360_surveys.aggregate(pipeline).to_list(length=1)
        
        if result:
            total = result[0]["metadata"][0]["total"] if result[0]["metadata"] else 0
            surveys = result[0]["data"]
        else:
            total = 0
            surveys = []
        
        return {
            "surveys": surveys,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    
    async def get_responses_with_stats(
        self,
        survey_id: str,
        page: int = 1,
        page_size: int = 50
    ) -> Dict[str, Any]:
        """Get responses with aggregated statistics"""
        pipeline = [
            {"$match": {"survey_id": survey_id}},
            {"$facet": {
                "metadata": [
                    {"$group": {
                        "_id": None,
                        "total": {"$sum": 1},
                        "first_response": {"$min": "$submitted_at"},
                        "last_response": {"$max": "$submitted_at"},
                        "avg_duration": {"$avg": "$duration_seconds"}
                    }}
                ],
                "data": [
                    {"$sort": {"submitted_at": -1}},
                    {"$skip": (page - 1) * page_size},
                    {"$limit": page_size},
                    {"$project": {"_id": 0}}
                ]
            }}
        ]
        
        result = await self.db.survey360_responses.aggregate(pipeline).to_list(length=1)
        
        if result:
            metadata = result[0]["metadata"][0] if result[0]["metadata"] else {}
            responses = result[0]["data"]
        else:
            metadata = {}
            responses = []
        
        return {
            "responses": responses,
            "stats": {
                "total": metadata.get("total", 0),
                "first_response": metadata.get("first_response"),
                "last_response": metadata.get("last_response"),
                "avg_duration": metadata.get("avg_duration")
            },
            "page": page,
            "page_size": page_size
        }
    
    async def get_survey_analytics_optimized(self, survey_id: str) -> Dict[str, Any]:
        """Get comprehensive survey analytics with single aggregation"""
        pipeline = [
            {"$match": {"survey_id": survey_id}},
            {"$group": {
                "_id": None,
                "total_responses": {"$sum": 1},
                "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
                "avg_duration": {"$avg": "$duration_seconds"},
                "devices": {"$push": "$device_type"},
                "sources": {"$push": "$source"},
                "daily_counts": {
                    "$push": {
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": {"$toDate": "$submitted_at"}}}
                    }
                }
            }},
            {"$project": {
                "_id": 0,
                "total_responses": 1,
                "completed": 1,
                "completion_rate": {
                    "$multiply": [
                        {"$divide": ["$completed", {"$max": ["$total_responses", 1]}]},
                        100
                    ]
                },
                "avg_duration": 1,
                "device_breakdown": {
                    "$arrayToObject": {
                        "$map": {
                            "input": {"$setUnion": "$devices"},
                            "as": "device",
                            "in": {
                                "k": {"$ifNull": ["$$device", "unknown"]},
                                "v": {
                                    "$size": {
                                        "$filter": {
                                            "input": "$devices",
                                            "cond": {"$eq": ["$$this", "$$device"]}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }}
        ]
        
        result = await self.db.survey360_responses.aggregate(pipeline).to_list(length=1)
        
        if result:
            return result[0]
        
        return {
            "total_responses": 0,
            "completed": 0,
            "completion_rate": 0,
            "avg_duration": 0,
            "device_breakdown": {}
        }
    
    async def bulk_insert_responses(self, responses: List[Dict]) -> int:
        """Bulk insert responses efficiently"""
        if not responses:
            return 0
        
        # Add timestamps if not present
        now = datetime.now(timezone.utc).isoformat()
        for r in responses:
            if "submitted_at" not in r:
                r["submitted_at"] = now
        
        result = await self.db.survey360_responses.insert_many(responses, ordered=False)
        return len(result.inserted_ids)
    
    async def get_org_usage_stats(self, org_id: str) -> Dict[str, Any]:
        """Get organization usage statistics efficiently"""
        pipeline = [
            {"$match": {"org_id": org_id}},
            {"$group": {
                "_id": "$survey_id",
                "response_count": {"$sum": 1}
            }},
            {"$group": {
                "_id": None,
                "total_surveys": {"$sum": 1},
                "total_responses": {"$sum": "$response_count"}
            }}
        ]
        
        result = await self.db.survey360_responses.aggregate(pipeline).to_list(length=1)
        
        if result:
            return {
                "total_surveys": result[0].get("total_surveys", 0),
                "total_responses": result[0].get("total_responses", 0)
            }
        
        return {"total_surveys": 0, "total_responses": 0}


# ============================================
# CONNECTION POOL MONITOR
# ============================================

class ConnectionPoolMonitor:
    """Monitor MongoDB connection pool health"""
    
    def __init__(self, client):
        self.client = client
    
    async def get_pool_stats(self) -> Dict[str, Any]:
        """Get connection pool statistics"""
        try:
            server_status = await self.client.admin.command("serverStatus")
            connections = server_status.get("connections", {})
            
            return {
                "current": connections.get("current", 0),
                "available": connections.get("available", 0),
                "total_created": connections.get("totalCreated", 0),
                "active": connections.get("active", 0)
            }
        except Exception as e:
            logger.error(f"Failed to get pool stats: {e}")
            return {}
    
    async def health_check(self) -> bool:
        """Check if database connection is healthy"""
        try:
            await self.client.admin.command("ping")
            return True
        except Exception:
            return False


# ============================================
# QUERY CACHE DECORATOR
# ============================================

def cache_query(ttl: int = 300):
    """Decorator to cache query results"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            from utils.cache import cache
            
            # Generate cache key from function name and arguments
            cache_key = f"query:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try cache first
            cached = await cache.get(cache_key)
            if cached is not None:
                return cached
            
            # Execute query
            result = await func(*args, **kwargs)
            
            # Cache result
            if result is not None:
                await cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator
