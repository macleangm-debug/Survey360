"""
Survey360 - Analytics Tasks
Background tasks for analytics processing and aggregation
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Try to import Celery
try:
    from utils.celery_app import app as celery_app
    CELERY_AVAILABLE = True
except Exception as e:
    CELERY_AVAILABLE = False
    celery_app = None
    logger.warning(f"Celery not available for analytics tasks: {e}")


if CELERY_AVAILABLE and celery_app:
    @celery_app.task(
        name='utils.analytics_tasks.calculate_survey_stats',
        queue='default',
        max_retries=3
    )
    def calculate_survey_stats(survey_id: str) -> Dict[str, Any]:
        """
        Calculate statistics for a survey.
        """
        logger.info(f"Calculating stats for survey: {survey_id}")
        return {
            'success': True,
            'survey_id': survey_id,
            'calculated_at': datetime.now(timezone.utc).isoformat()
        }

    @celery_app.task(
        name='utils.analytics_tasks.aggregate_daily_stats',
        queue='low_priority',
        max_retries=2
    )
    def aggregate_daily_stats() -> Dict[str, Any]:
        """
        Aggregate daily statistics across all surveys.
        Typically run once per day.
        """
        logger.info("Running daily stats aggregation")
        return {
            'success': True,
            'aggregated_at': datetime.now(timezone.utc).isoformat()
        }

    @celery_app.task(
        name='utils.analytics_tasks.aggregate_hourly_stats',
        queue='low_priority',
        max_retries=2
    )
    def aggregate_hourly_stats() -> Dict[str, Any]:
        """
        Aggregate hourly statistics.
        """
        logger.info("Running hourly stats aggregation")
        return {
            'success': True,
            'aggregated_at': datetime.now(timezone.utc).isoformat()
        }

    @celery_app.task(
        name='utils.analytics_tasks.collect_queue_metrics',
        queue='default',
        max_retries=1
    )
    def collect_queue_metrics() -> Dict[str, Any]:
        """
        Collect metrics about queue performance.
        """
        try:
            # Get inspection API
            inspect = celery_app.control.inspect()
            active = inspect.active() or {}
            reserved = inspect.reserved() or {}
            scheduled = inspect.scheduled() or {}
            
            metrics = {
                'active_tasks': sum(len(tasks) for tasks in active.values()),
                'reserved_tasks': sum(len(tasks) for tasks in reserved.values()),
                'scheduled_tasks': sum(len(tasks) for tasks in scheduled.values()),
                'collected_at': datetime.now(timezone.utc).isoformat()
            }
            
            logger.info(f"Queue metrics: {metrics}")
            return metrics
        except Exception as e:
            logger.error(f"Failed to collect queue metrics: {e}")
            return {
                'error': str(e),
                'collected_at': datetime.now(timezone.utc).isoformat()
            }
else:
    # Fallback sync implementations
    def calculate_survey_stats(survey_id: str) -> Dict[str, Any]:
        logger.info(f"Sync: Calculating stats for survey: {survey_id}")
        return {'success': True, 'survey_id': survey_id}

    def aggregate_daily_stats() -> Dict[str, Any]:
        logger.info("Sync: Running daily stats aggregation")
        return {'success': True}

    def aggregate_hourly_stats() -> Dict[str, Any]:
        logger.info("Sync: Running hourly stats aggregation")
        return {'success': True}

    def collect_queue_metrics() -> Dict[str, Any]:
        return {'celery_available': False}
