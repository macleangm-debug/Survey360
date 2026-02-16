"""
Survey360 - Celery Application Configuration
High-throughput task processing with priority queues for 500K+ submissions
"""

import os
from celery import Celery
from kombu import Queue, Exchange
from datetime import timedelta

# Redis URL from environment
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', REDIS_URL)
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', REDIS_URL)

# Create Celery app
app = Celery(
    'survey360',
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        'utils.background_jobs',
        'utils.submission_processor',
        'utils.analytics_tasks',
    ]
)

# ============================================
# PRIORITY QUEUES CONFIGURATION
# ============================================

# Define exchanges
default_exchange = Exchange('default', type='direct')
priority_exchange = Exchange('priority', type='direct')
bulk_exchange = Exchange('bulk', type='direct')

# Queue definitions with priorities
app.conf.task_queues = (
    # Critical priority - Real-time submissions (fastest processing)
    Queue('critical', priority_exchange, routing_key='critical', 
          queue_arguments={'x-max-priority': 10}),
    
    # High priority - User-facing operations
    Queue('high_priority', priority_exchange, routing_key='high',
          queue_arguments={'x-max-priority': 8}),
    
    # Default priority - Standard operations
    Queue('default', default_exchange, routing_key='default',
          queue_arguments={'x-max-priority': 5}),
    
    # Low priority - Background analytics, reports
    Queue('low_priority', default_exchange, routing_key='low',
          queue_arguments={'x-max-priority': 3}),
    
    # Bulk operations - Large exports, migrations
    Queue('bulk', bulk_exchange, routing_key='bulk',
          queue_arguments={'x-max-priority': 1}),
    
    # Submissions queue - Dedicated for survey submissions
    Queue('submissions', priority_exchange, routing_key='submissions',
          queue_arguments={'x-max-priority': 10}),
)

# Route tasks to appropriate queues
app.conf.task_routes = {
    # Critical - Submissions
    'utils.submission_processor.process_submission': {'queue': 'submissions'},
    'utils.submission_processor.process_bulk_submissions': {'queue': 'submissions'},
    
    # High Priority - User actions
    'utils.background_jobs.export_responses': {'queue': 'high_priority'},
    'utils.background_jobs.send_email_invitation': {'queue': 'high_priority'},
    
    # Default - Standard operations
    'utils.background_jobs.generate_analytics': {'queue': 'default'},
    'utils.analytics_tasks.calculate_survey_stats': {'queue': 'default'},
    
    # Low Priority - Background tasks
    'utils.background_jobs.cleanup_old_jobs': {'queue': 'low_priority'},
    'utils.analytics_tasks.aggregate_daily_stats': {'queue': 'low_priority'},
    
    # Bulk - Large operations
    'utils.background_jobs.bulk_send_invitations': {'queue': 'bulk'},
    'utils.background_jobs.migrate_responses': {'queue': 'bulk'},
}

# ============================================
# WORKER CONFIGURATION
# ============================================

app.conf.update(
    # Worker settings
    worker_prefetch_multiplier=4,  # Number of tasks to prefetch
    worker_concurrency=4,  # Per worker process
    worker_max_tasks_per_child=1000,  # Restart worker after N tasks (memory leak prevention)
    worker_max_memory_per_child=512000,  # 512MB per worker
    
    # Task execution
    task_acks_late=True,  # Acknowledge after completion (reliability)
    task_reject_on_worker_lost=True,  # Re-queue if worker dies
    task_time_limit=3600,  # 1 hour hard limit
    task_soft_time_limit=3000,  # 50 min soft limit
    
    # Result backend
    result_expires=86400,  # Results expire after 24 hours
    result_compression='gzip',
    
    # Serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    
    # Timezone
    timezone='UTC',
    enable_utc=True,
    
    # Rate limiting
    task_annotations={
        'utils.submission_processor.process_submission': {
            'rate_limit': '10000/s',  # 10K submissions per second
        },
        'utils.background_jobs.send_email_invitation': {
            'rate_limit': '100/s',  # 100 emails per second
        },
    },
    
    # Broker connection
    broker_connection_retry_on_startup=True,
    broker_pool_limit=50,  # Connection pool size
    broker_heartbeat=30,
    
    # Redis specific
    redis_max_connections=100,
    redis_socket_timeout=30,
    redis_socket_connect_timeout=30,
)

# ============================================
# BEAT SCHEDULER (Periodic Tasks)
# ============================================

app.conf.beat_schedule = {
    # Cleanup old jobs every day at 2 AM
    'cleanup-old-jobs': {
        'task': 'utils.background_jobs.cleanup_old_jobs',
        'schedule': timedelta(hours=24),
        'options': {'queue': 'low_priority'}
    },
    
    # Aggregate daily stats every hour
    'aggregate-hourly-stats': {
        'task': 'utils.analytics_tasks.aggregate_hourly_stats',
        'schedule': timedelta(hours=1),
        'options': {'queue': 'low_priority'}
    },
    
    # Health check every 5 minutes
    'health-check': {
        'task': 'utils.background_jobs.health_check',
        'schedule': timedelta(minutes=5),
        'options': {'queue': 'default'}
    },
    
    # Queue metrics every minute
    'queue-metrics': {
        'task': 'utils.analytics_tasks.collect_queue_metrics',
        'schedule': timedelta(minutes=1),
        'options': {'queue': 'default'}
    },
}

# ============================================
# MONITORING & EVENTS
# ============================================

app.conf.update(
    # Enable task events for monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
    
    # Flower monitoring
    flower_persistent=True,
    flower_db='/var/lib/celery/flower.db',
)


if __name__ == '__main__':
    app.start()
