"""
Survey360 - Background Job Queue System
Celery-based task queue for heavy operations with fallback to sync execution
"""

import os
import asyncio
import logging
from typing import Optional, Any, Dict, Callable
from datetime import datetime, timezone
from functools import wraps
from enum import Enum
import uuid
import json

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

# Try to import Celery
try:
    from celery import Celery
    from celery.schedules import crontab
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    logger.warning("Celery not available, tasks will run synchronously")


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobPriority(int, Enum):
    LOW = 1
    NORMAL = 5
    HIGH = 10
    CRITICAL = 20


# In-memory job store (fallback when Redis not available)
_job_store: Dict[str, Dict] = {}


class JobConfig:
    """Job queue configuration"""
    BROKER_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/0")
    RESULT_BACKEND = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/0")
    TASK_TIMEOUT = 300  # 5 minutes
    RESULT_EXPIRES = 3600  # 1 hour
    MAX_RETRIES = 3
    RETRY_DELAY = 60  # 1 minute


# Initialize Celery app (if available)
celery_app = None
if CELERY_AVAILABLE:
    celery_app = Celery(
        'survey360_jobs',
        broker=JobConfig.BROKER_URL,
        backend=JobConfig.RESULT_BACKEND
    )
    celery_app.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_soft_time_limit=JobConfig.TASK_TIMEOUT,
        task_time_limit=JobConfig.TASK_TIMEOUT + 30,
        result_expires=JobConfig.RESULT_EXPIRES,
        task_acks_late=True,
        task_reject_on_worker_lost=True,
        worker_prefetch_multiplier=1,
        task_queues={
            'default': {'exchange': 'default', 'routing_key': 'default'},
            'high_priority': {'exchange': 'high_priority', 'routing_key': 'high_priority'},
        },
        task_default_queue='default',
        task_routes={
            'generate_analytics': {'queue': 'high_priority'},
            'export_responses': {'queue': 'default'},
            'bulk_send_invitations': {'queue': 'default'},
        },
        # Periodic tasks (Celery Beat)
        beat_schedule={
            'cleanup-old-jobs-daily': {
                'task': 'cleanup_old_jobs',
                'schedule': crontab(hour=2, minute=0),  # Run at 2 AM daily
            },
        },
    )


class JobManager:
    """Manages background jobs with fallback to sync execution"""
    
    def __init__(self, db=None):
        self.db = db
        self._task_registry: Dict[str, Callable] = {}
    
    def register_task(self, name: str, func: Callable):
        """Register a task function"""
        self._task_registry[name] = func
        
        # Also register with Celery if available
        if CELERY_AVAILABLE and celery_app:
            celery_app.task(name=name, bind=True)(func)
    
    async def create_job(
        self,
        task_name: str,
        params: Dict[str, Any],
        priority: JobPriority = JobPriority.NORMAL,
        user_id: str = None,
        org_id: str = None,
        description: str = None
    ) -> str:
        """Create and queue a new job"""
        job_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        job = {
            "id": job_id,
            "task_name": task_name,
            "params": params,
            "status": JobStatus.PENDING,
            "priority": priority,
            "user_id": user_id,
            "org_id": org_id,
            "description": description or task_name,
            "progress": 0,
            "result": None,
            "error": None,
            "created_at": now,
            "started_at": None,
            "completed_at": None,
            "retries": 0
        }
        
        # Store job in database
        if self.db:
            await self.db.survey360_jobs.insert_one(job)
        else:
            _job_store[job_id] = job
        
        # Queue the job
        await self._enqueue_job(job_id, task_name, params, priority)
        
        return job_id
    
    async def _enqueue_job(
        self,
        job_id: str,
        task_name: str,
        params: Dict[str, Any],
        priority: JobPriority
    ):
        """Enqueue job for processing"""
        if CELERY_AVAILABLE and celery_app:
            try:
                # Send to Celery
                celery_app.send_task(
                    task_name,
                    args=[job_id, params],
                    task_id=job_id,
                    priority=priority.value
                )
                logger.info(f"Job {job_id} queued to Celery")
                return
            except Exception as e:
                logger.warning(f"Celery enqueue failed, falling back to sync: {e}")
        
        # Fallback: run synchronously in background
        asyncio.create_task(self._run_job_sync(job_id, task_name, params))
    
    async def _run_job_sync(self, job_id: str, task_name: str, params: Dict[str, Any]):
        """Run job synchronously (fallback when Celery unavailable)"""
        await self.update_job_status(job_id, JobStatus.RUNNING)
        
        try:
            task_func = self._task_registry.get(task_name)
            if not task_func:
                raise ValueError(f"Unknown task: {task_name}")
            
            # Run the task
            if asyncio.iscoroutinefunction(task_func):
                result = await task_func(job_id, params, self)
            else:
                result = task_func(job_id, params, self)
            
            await self.complete_job(job_id, result)
            
        except Exception as e:
            logger.error(f"Job {job_id} failed: {e}")
            await self.fail_job(job_id, str(e))
    
    async def get_job(self, job_id: str) -> Optional[Dict]:
        """Get job by ID"""
        if self.db:
            job = await self.db.survey360_jobs.find_one({"id": job_id}, {"_id": 0})
            return job
        return _job_store.get(job_id)
    
    async def get_user_jobs(
        self,
        user_id: str,
        org_id: str,
        status: JobStatus = None,
        limit: int = 20
    ) -> list:
        """Get jobs for a user"""
        query = {"user_id": user_id, "org_id": org_id}
        if status:
            query["status"] = status
        
        if self.db:
            cursor = self.db.survey360_jobs.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
            return await cursor.to_list(length=limit)
        
        jobs = [j for j in _job_store.values() if j.get("user_id") == user_id and j.get("org_id") == org_id]
        if status:
            jobs = [j for j in jobs if j.get("status") == status]
        return sorted(jobs, key=lambda x: x.get("created_at", ""), reverse=True)[:limit]
    
    async def update_job_status(self, job_id: str, status: JobStatus):
        """Update job status"""
        update = {"status": status}
        if status == JobStatus.RUNNING:
            update["started_at"] = datetime.now(timezone.utc).isoformat()
        
        if self.db:
            await self.db.survey360_jobs.update_one({"id": job_id}, {"$set": update})
        elif job_id in _job_store:
            _job_store[job_id].update(update)
    
    async def update_job_progress(self, job_id: str, progress: int, message: str = None):
        """Update job progress (0-100)"""
        update = {"progress": min(100, max(0, progress))}
        if message:
            update["progress_message"] = message
        
        if self.db:
            await self.db.survey360_jobs.update_one({"id": job_id}, {"$set": update})
        elif job_id in _job_store:
            _job_store[job_id].update(update)
    
    async def complete_job(self, job_id: str, result: Any = None):
        """Mark job as completed"""
        update = {
            "status": JobStatus.COMPLETED,
            "progress": 100,
            "result": result,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.db:
            await self.db.survey360_jobs.update_one({"id": job_id}, {"$set": update})
        elif job_id in _job_store:
            _job_store[job_id].update(update)
        
        logger.info(f"Job {job_id} completed successfully")
    
    async def fail_job(self, job_id: str, error: str):
        """Mark job as failed"""
        job = await self.get_job(job_id)
        retries = job.get("retries", 0) if job else 0
        
        if retries < JobConfig.MAX_RETRIES:
            # Retry the job
            update = {
                "status": JobStatus.PENDING,
                "retries": retries + 1,
                "error": error
            }
            if self.db:
                await self.db.survey360_jobs.update_one({"id": job_id}, {"$set": update})
            elif job_id in _job_store:
                _job_store[job_id].update(update)
            
            # Re-enqueue after delay
            await asyncio.sleep(JobConfig.RETRY_DELAY)
            if job:
                await self._enqueue_job(job_id, job["task_name"], job["params"], JobPriority(job.get("priority", 5)))
        else:
            # Max retries reached, mark as failed
            update = {
                "status": JobStatus.FAILED,
                "error": error,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
            if self.db:
                await self.db.survey360_jobs.update_one({"id": job_id}, {"$set": update})
            elif job_id in _job_store:
                _job_store[job_id].update(update)
            
            logger.error(f"Job {job_id} failed permanently: {error}")
    
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a pending job"""
        job = await self.get_job(job_id)
        if not job or job["status"] not in [JobStatus.PENDING, JobStatus.RUNNING]:
            return False
        
        # Revoke from Celery if available
        if CELERY_AVAILABLE and celery_app:
            celery_app.control.revoke(job_id, terminate=True)
        
        update = {
            "status": JobStatus.CANCELLED,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.db:
            await self.db.survey360_jobs.update_one({"id": job_id}, {"$set": update})
        elif job_id in _job_store:
            _job_store[job_id].update(update)
        
        return True
    
    async def cleanup_old_jobs(self, days: int = 7):
        """Clean up jobs older than specified days"""
        from datetime import timedelta
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        
        if self.db:
            result = await self.db.survey360_jobs.delete_many({
                "completed_at": {"$lt": cutoff},
                "status": {"$in": [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]}
            })
            logger.info(f"Cleaned up {result.deleted_count} old jobs")
        else:
            global _job_store
            _job_store = {k: v for k, v in _job_store.items() 
                         if v.get("completed_at", "9999") > cutoff or v.get("status") == JobStatus.PENDING}


# ============================================
# PRE-DEFINED TASKS
# ============================================

async def task_export_responses(job_id: str, params: Dict, job_manager: JobManager):
    """Export survey responses to CSV"""
    survey_id = params.get("survey_id")
    format_type = params.get("format", "csv")
    
    await job_manager.update_job_progress(job_id, 10, "Loading responses...")
    
    # Get database from job manager
    db = job_manager.db
    if not db:
        raise ValueError("Database not available")
    
    # Fetch responses
    responses = await db.survey360_responses.find(
        {"survey_id": survey_id}
    ).to_list(length=None)
    
    await job_manager.update_job_progress(job_id, 50, f"Processing {len(responses)} responses...")
    
    # Generate export (simplified - in production, save to file storage)
    import csv
    import io
    
    if responses:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=responses[0].get("answers", {}).keys())
        writer.writeheader()
        for r in responses:
            writer.writerow(r.get("answers", {}))
        
        await job_manager.update_job_progress(job_id, 90, "Finalizing export...")
        
        return {
            "rows_exported": len(responses),
            "format": format_type,
            "download_ready": True
        }
    
    return {"rows_exported": 0, "format": format_type}


async def task_generate_analytics(job_id: str, params: Dict, job_manager: JobManager):
    """Generate comprehensive analytics for a survey"""
    survey_id = params.get("survey_id")
    
    await job_manager.update_job_progress(job_id, 10, "Fetching survey data...")
    
    db = job_manager.db
    if not db:
        raise ValueError("Database not available")
    
    # Get survey and responses
    survey = await db.survey360_surveys.find_one({"id": survey_id})
    responses = await db.survey360_responses.find({"survey_id": survey_id}).to_list(length=None)
    
    await job_manager.update_job_progress(job_id, 30, "Calculating statistics...")
    
    # Calculate analytics
    total_responses = len(responses)
    questions = survey.get("questions", [])
    
    analytics = {
        "survey_id": survey_id,
        "total_responses": total_responses,
        "completion_rate": 100,  # Simplified
        "questions": []
    }
    
    for i, q in enumerate(questions):
        await job_manager.update_job_progress(
            job_id, 
            30 + int(60 * (i / len(questions))), 
            f"Analyzing question {i+1}/{len(questions)}"
        )
        
        q_analytics = {
            "question_id": q.get("id"),
            "title": q.get("title"),
            "type": q.get("type"),
            "response_count": total_responses
        }
        analytics["questions"].append(q_analytics)
    
    await job_manager.update_job_progress(job_id, 95, "Saving analytics...")
    
    # Cache results
    from utils.cache import cache, CacheConfig
    await cache.set(
        f"survey360:analytics:{survey_id}", 
        analytics, 
        CacheConfig.ANALYTICS_TTL
    )
    
    return analytics


async def task_bulk_send_invitations(job_id: str, params: Dict, job_manager: JobManager):
    """Send survey invitations in bulk"""
    survey_id = params.get("survey_id")
    emails = params.get("emails", [])
    
    await job_manager.update_job_progress(job_id, 5, f"Preparing to send {len(emails)} invitations...")
    
    sent_count = 0
    failed_count = 0
    
    for i, email in enumerate(emails):
        try:
            # Simulate sending email (in production, use actual email service)
            await asyncio.sleep(0.1)  # Rate limiting
            sent_count += 1
        except Exception as e:
            failed_count += 1
        
        if i % 10 == 0:
            await job_manager.update_job_progress(
                job_id,
                5 + int(90 * (i / len(emails))),
                f"Sent {sent_count}/{len(emails)} invitations"
            )
    
    return {
        "total": len(emails),
        "sent": sent_count,
        "failed": failed_count
    }


# Global job manager instance (initialized with db in server.py)
job_manager: Optional[JobManager] = None


def get_job_manager() -> JobManager:
    """Get the global job manager instance"""
    global job_manager
    if job_manager is None:
        job_manager = JobManager()
    return job_manager


def init_job_manager(db) -> JobManager:
    """Initialize job manager with database"""
    global job_manager
    job_manager = JobManager(db)
    
    # Register default tasks
    job_manager.register_task("export_responses", task_export_responses)
    job_manager.register_task("generate_analytics", task_generate_analytics)
    job_manager.register_task("bulk_send_invitations", task_bulk_send_invitations)
    
    return job_manager


# ============================================
# CELERY TASKS (Synchronous wrappers for workers)
# ============================================

if CELERY_AVAILABLE and celery_app:
    
    @celery_app.task(name='export_responses', bind=True, max_retries=3)
    def celery_export_responses(self, job_id: str, params: dict):
        """Celery task wrapper for export_responses"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Create temporary db connection for worker
            mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
            db_name = os.environ.get("DB_NAME", "survey360")
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            # Create job manager with db
            worker_job_manager = JobManager(db)
            
            result = loop.run_until_complete(
                task_export_responses(job_id, params, worker_job_manager)
            )
            
            loop.run_until_complete(worker_job_manager.complete_job(job_id, result))
            client.close()
            return result
            
        except Exception as e:
            logger.error(f"Celery task export_responses failed: {e}")
            raise self.retry(exc=e, countdown=60)
        finally:
            loop.close()
    
    @celery_app.task(name='generate_analytics', bind=True, max_retries=3)
    def celery_generate_analytics(self, job_id: str, params: dict):
        """Celery task wrapper for generate_analytics"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
            db_name = os.environ.get("DB_NAME", "survey360")
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            worker_job_manager = JobManager(db)
            
            result = loop.run_until_complete(
                task_generate_analytics(job_id, params, worker_job_manager)
            )
            
            loop.run_until_complete(worker_job_manager.complete_job(job_id, result))
            client.close()
            return result
            
        except Exception as e:
            logger.error(f"Celery task generate_analytics failed: {e}")
            raise self.retry(exc=e, countdown=60)
        finally:
            loop.close()
    
    @celery_app.task(name='bulk_send_invitations', bind=True, max_retries=3)
    def celery_bulk_send_invitations(self, job_id: str, params: dict):
        """Celery task wrapper for bulk_send_invitations"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
            db_name = os.environ.get("DB_NAME", "survey360")
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            worker_job_manager = JobManager(db)
            
            result = loop.run_until_complete(
                task_bulk_send_invitations(job_id, params, worker_job_manager)
            )
            
            loop.run_until_complete(worker_job_manager.complete_job(job_id, result))
            client.close()
            return result
            
        except Exception as e:
            logger.error(f"Celery task bulk_send_invitations failed: {e}")
            raise self.retry(exc=e, countdown=60)
        finally:
            loop.close()
    
    @celery_app.task(name='cleanup_old_jobs')
    def celery_cleanup_old_jobs():
        """Periodic task to clean up old completed jobs"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
            db_name = os.environ.get("DB_NAME", "survey360")
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            worker_job_manager = JobManager(db)
            loop.run_until_complete(worker_job_manager.cleanup_old_jobs(days=7))
            client.close()
            
            logger.info("Cleanup task completed")
            return {"status": "completed"}
            
        except Exception as e:
            logger.error(f"Cleanup task failed: {e}")
            return {"status": "failed", "error": str(e)}
        finally:
            loop.close()

