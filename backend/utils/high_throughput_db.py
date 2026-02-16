"""
Survey360 - High-Throughput Database Configuration
MongoDB optimizations for 500K+ concurrent submissions
- Time-series collections for responses
- Optimized write concerns
- Connection pooling
- Sharding configuration
"""

import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import WriteConcern, ReadPreference
from pymongo.errors import CollectionInvalid

logger = logging.getLogger(__name__)

# ============================================
# CONNECTION CONFIGURATION
# ============================================

class DatabaseConfig:
    """Database configuration for high-throughput scenarios"""
    
    # Connection pool settings
    MAX_POOL_SIZE = 200  # Maximum connections in pool
    MIN_POOL_SIZE = 50   # Minimum connections in pool
    MAX_IDLE_TIME_MS = 60000  # Max idle time before closing connection
    WAIT_QUEUE_TIMEOUT_MS = 10000  # Timeout for waiting for connection
    
    # Write concern levels
    WRITE_CONCERN_FAST = WriteConcern(w=1, j=False)  # Fast, eventual durability
    WRITE_CONCERN_SAFE = WriteConcern(w='majority', j=True)  # Safe, durable
    WRITE_CONCERN_BULK = WriteConcern(w=1, j=False, wtimeout=5000)  # Bulk operations
    
    # Read preferences
    READ_PRIMARY = ReadPreference.PRIMARY
    READ_SECONDARY = ReadPreference.SECONDARY_PREFERRED
    READ_NEAREST = ReadPreference.NEAREST
    
    @classmethod
    def get_connection_options(cls) -> Dict[str, Any]:
        """Get optimized connection options"""
        return {
            'maxPoolSize': cls.MAX_POOL_SIZE,
            'minPoolSize': cls.MIN_POOL_SIZE,
            'maxIdleTimeMS': cls.MAX_IDLE_TIME_MS,
            'waitQueueTimeoutMS': cls.WAIT_QUEUE_TIMEOUT_MS,
            'retryWrites': True,
            'retryReads': True,
            'connectTimeoutMS': 10000,
            'serverSelectionTimeoutMS': 30000,
            'socketTimeoutMS': 45000,
            'compressors': ['zstd', 'snappy', 'zlib'],  # Wire compression
        }


def create_optimized_client(mongo_url: str) -> AsyncIOMotorClient:
    """Create an optimized MongoDB client for high throughput"""
    options = DatabaseConfig.get_connection_options()
    return AsyncIOMotorClient(mongo_url, **options)


# ============================================
# TIME-SERIES COLLECTION FOR RESPONSES
# ============================================

async def setup_timeseries_collections(db) -> Dict[str, bool]:
    """
    Create time-series collections optimized for survey responses.
    Time-series collections provide:
    - Automatic bucketing of data
    - Efficient time-based queries
    - Reduced storage through compression
    - Optimized aggregations
    """
    results = {}
    
    # Survey responses time-series collection
    try:
        await db.create_collection(
            "survey360_responses_ts",
            timeseries={
                "timeField": "submitted_at",
                "metaField": "meta",
                "granularity": "seconds"  # High-frequency submissions
            },
            expireAfterSeconds=31536000  # 1 year retention (optional)
        )
        results['survey360_responses_ts'] = True
        logger.info("Created time-series collection: survey360_responses_ts")
    except CollectionInvalid:
        results['survey360_responses_ts'] = False
        logger.info("Time-series collection survey360_responses_ts already exists")
    
    # Analytics events time-series collection
    try:
        await db.create_collection(
            "survey360_analytics_events",
            timeseries={
                "timeField": "timestamp",
                "metaField": "event_meta",
                "granularity": "minutes"
            },
            expireAfterSeconds=7776000  # 90 days retention
        )
        results['survey360_analytics_events'] = True
        logger.info("Created time-series collection: survey360_analytics_events")
    except CollectionInvalid:
        results['survey360_analytics_events'] = False
        logger.info("Time-series collection survey360_analytics_events already exists")
    
    # Submission metrics time-series (for monitoring)
    try:
        await db.create_collection(
            "survey360_submission_metrics",
            timeseries={
                "timeField": "timestamp",
                "metaField": "metric_meta",
                "granularity": "minutes"
            },
            expireAfterSeconds=604800  # 7 days retention
        )
        results['survey360_submission_metrics'] = True
        logger.info("Created time-series collection: survey360_submission_metrics")
    except CollectionInvalid:
        results['survey360_submission_metrics'] = False
    
    return results


# ============================================
# HIGH-THROUGHPUT RESPONSE WRITER
# ============================================

class HighThroughputWriter:
    """
    Optimized writer for high-volume survey submissions.
    Features:
    - Bulk writes with ordered=False for speed
    - Configurable write concerns
    - Automatic batching
    - Time-series support
    """
    
    def __init__(self, db, use_timeseries: bool = True):
        self.db = db
        self.use_timeseries = use_timeseries
        self.collection_name = "survey360_responses_ts" if use_timeseries else "survey360_responses"
        self.write_concern = DatabaseConfig.WRITE_CONCERN_FAST
        self.metrics = {
            'total_writes': 0,
            'total_batches': 0,
            'failed_writes': 0,
            'avg_batch_size': 0
        }
    
    async def write_single(
        self,
        response: Dict[str, Any],
        safe: bool = False
    ) -> str:
        """
        Write a single response.
        
        Args:
            response: The response document
            safe: Use safe write concern (slower but durable)
        
        Returns:
            Inserted document ID
        """
        collection = self.db[self.collection_name]
        
        if safe:
            collection = collection.with_options(write_concern=DatabaseConfig.WRITE_CONCERN_SAFE)
        else:
            collection = collection.with_options(write_concern=self.write_concern)
        
        # Prepare for time-series if needed
        if self.use_timeseries:
            response = self._prepare_timeseries_doc(response)
        
        result = await collection.insert_one(response)
        self.metrics['total_writes'] += 1
        
        return str(result.inserted_id)
    
    async def write_bulk(
        self,
        responses: List[Dict[str, Any]],
        ordered: bool = False
    ) -> Dict[str, Any]:
        """
        Write multiple responses in bulk.
        
        Args:
            responses: List of response documents
            ordered: If False, continues on errors (faster)
        
        Returns:
            Write result with counts
        """
        if not responses:
            return {'inserted': 0, 'failed': 0}
        
        collection = self.db[self.collection_name].with_options(
            write_concern=DatabaseConfig.WRITE_CONCERN_BULK
        )
        
        # Prepare documents
        docs = []
        for response in responses:
            if self.use_timeseries:
                docs.append(self._prepare_timeseries_doc(response))
            else:
                docs.append(response)
        
        try:
            result = await collection.insert_many(docs, ordered=ordered)
            inserted = len(result.inserted_ids)
            failed = len(responses) - inserted
        except Exception as e:
            logger.error(f"Bulk write error: {e}")
            # Partial success possible with ordered=False
            inserted = getattr(e, 'details', {}).get('nInserted', 0)
            failed = len(responses) - inserted
            self.metrics['failed_writes'] += failed
        
        self.metrics['total_writes'] += inserted
        self.metrics['total_batches'] += 1
        self.metrics['avg_batch_size'] = self.metrics['total_writes'] / self.metrics['total_batches']
        
        return {
            'inserted': inserted,
            'failed': failed,
            'batch_size': len(responses)
        }
    
    def _prepare_timeseries_doc(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare document for time-series collection"""
        # Ensure submitted_at is a datetime object
        submitted_at = response.get('submitted_at')
        if isinstance(submitted_at, str):
            submitted_at = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
        elif submitted_at is None:
            submitted_at = datetime.now(timezone.utc)
        
        return {
            'submitted_at': submitted_at,
            'meta': {
                'survey_id': response.get('survey_id'),
                'org_id': response.get('org_id'),
                'device_type': response.get('device_type', 'unknown'),
                'source': response.get('source', 'web')
            },
            'response_id': response.get('id'),
            'respondent_id': response.get('respondent_id'),
            'responses': response.get('responses', {}),
            'duration_seconds': response.get('duration_seconds'),
            'status': response.get('status', 'completed'),
            'metadata': response.get('metadata', {})
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get writer metrics"""
        return self.metrics


# ============================================
# SHARDING CONFIGURATION
# ============================================

async def setup_sharding(admin_db, db_name: str) -> Dict[str, Any]:
    """
    Configure sharding for Survey360 collections.
    Should be run on a mongos router connected to a sharded cluster.
    
    Sharding strategy:
    - Responses: Shard by survey_id (hashed) for even distribution
    - Surveys: Shard by org_id for tenant isolation
    """
    results = {}
    
    try:
        # Enable sharding on database
        await admin_db.command('enableSharding', db_name)
        results['database_sharding'] = True
        logger.info(f"Enabled sharding on database: {db_name}")
    except Exception as e:
        results['database_sharding'] = False
        logger.warning(f"Could not enable database sharding: {e}")
    
    # Shard keys configuration
    shard_configs = [
        {
            'collection': f'{db_name}.survey360_responses',
            'key': {'survey_id': 'hashed'},  # Hash-based for even distribution
            'unique': False
        },
        {
            'collection': f'{db_name}.survey360_responses_ts',
            'key': {'meta.survey_id': 'hashed'},
            'unique': False
        },
        {
            'collection': f'{db_name}.survey360_surveys',
            'key': {'org_id': 1, 'created_at': 1},  # Range-based for tenant queries
            'unique': False
        },
        {
            'collection': f'{db_name}.survey360_users',
            'key': {'org_id': 'hashed'},
            'unique': False
        },
    ]
    
    for config in shard_configs:
        try:
            await admin_db.command(
                'shardCollection',
                config['collection'],
                key=config['key'],
                unique=config['unique']
            )
            results[config['collection']] = True
            logger.info(f"Sharded collection: {config['collection']}")
        except Exception as e:
            results[config['collection']] = False
            logger.warning(f"Could not shard {config['collection']}: {e}")
    
    return results


# ============================================
# OPTIMIZED INDEXES FOR HIGH THROUGHPUT
# ============================================

HIGHTRAFFIC_INDEXES = [
    # Time-series responses - optimized queries
    {
        "collection": "survey360_responses_ts",
        "indexes": [
            {"keys": [("meta.survey_id", 1), ("submitted_at", -1)], "name": "ts_survey_time_idx"},
            {"keys": [("meta.org_id", 1), ("submitted_at", -1)], "name": "ts_org_time_idx"},
            {"keys": [("response_id", 1)], "name": "ts_response_id_idx"},
        ]
    },
    # Analytics events
    {
        "collection": "survey360_analytics_events",
        "indexes": [
            {"keys": [("event_meta.survey_id", 1), ("timestamp", -1)], "name": "analytics_survey_idx"},
            {"keys": [("event_meta.event_type", 1), ("timestamp", -1)], "name": "analytics_type_idx"},
        ]
    },
    # Submission metrics
    {
        "collection": "survey360_submission_metrics",
        "indexes": [
            {"keys": [("metric_meta.metric_name", 1), ("timestamp", -1)], "name": "metrics_name_idx"},
        ]
    },
]


async def create_hightraffic_indexes(db) -> Dict[str, int]:
    """Create indexes optimized for high-traffic scenarios"""
    results = {}
    
    for collection_config in HIGHTRAFFIC_INDEXES:
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
    
    return results


# ============================================
# DATABASE INITIALIZATION
# ============================================

async def initialize_high_throughput_db(db) -> Dict[str, Any]:
    """
    Initialize database for high-throughput operations.
    Should be called on application startup.
    """
    results = {
        'timeseries_collections': {},
        'indexes': {},
        'status': 'success'
    }
    
    try:
        # Create time-series collections
        results['timeseries_collections'] = await setup_timeseries_collections(db)
        
        # Create optimized indexes
        results['indexes'] = await create_hightraffic_indexes(db)
        
        logger.info("High-throughput database initialization complete")
        
    except Exception as e:
        results['status'] = 'error'
        results['error'] = str(e)
        logger.error(f"Database initialization error: {e}")
    
    return results
