"""
Survey360 - High-Throughput Submission Routes
API endpoints optimized for 500K+ concurrent submissions
"""

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging

from utils.submission_processor import (
    high_throughput_submitter,
    submission_buffer,
    HighThroughputSubmitter
)
from utils.high_throughput_db import (
    HighThroughputWriter,
    initialize_high_throughput_db
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/survey360/submissions", tags=["High-Throughput Submissions"])


# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class SubmissionRequest(BaseModel):
    """Single submission request"""
    responses: Dict[str, Any] = Field(..., description="Question responses")
    respondent_id: Optional[str] = Field(None, description="Optional respondent ID")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Device info, location, etc.")
    priority: Optional[str] = Field("normal", description="Priority: critical, high, normal, low")


class BulkSubmissionRequest(BaseModel):
    """Bulk submission request"""
    submissions: List[Dict[str, Any]] = Field(..., description="List of submissions")


class SubmissionResponse(BaseModel):
    """Submission response"""
    success: bool
    submission_id: str
    survey_id: str
    status: str
    priority: str


class BulkSubmissionResponse(BaseModel):
    """Bulk submission response"""
    success: bool
    survey_id: str
    count: int
    status: str


class MetricsResponse(BaseModel):
    """Metrics response"""
    total_received: int
    total_processed: int
    total_failed: int
    buffer_pending: int
    celery_available: bool


# ============================================
# SUBMISSION ENDPOINTS
# ============================================

@router.post("/{survey_id}", response_model=SubmissionResponse)
async def submit_response(
    survey_id: str,
    request: Request,
    submission: SubmissionRequest
):
    """
    Submit a single survey response.
    
    Optimized for high-throughput with automatic batching and priority queuing.
    
    Priority levels:
    - critical: Immediate processing (real-time updates)
    - high: Fast processing with minimal batching
    - normal: Standard batched processing
    - low: Background processing
    """
    try:
        result = await high_throughput_submitter.submit(
            survey_id=survey_id,
            responses=submission.responses,
            respondent_id=submission.respondent_id,
            metadata=submission.metadata,
            priority=submission.priority
        )
        
        return SubmissionResponse(
            success=result['success'],
            submission_id=result['submission_id'],
            survey_id=result['survey_id'],
            status=result['status'],
            priority=result['priority']
        )
        
    except Exception as e:
        logger.error(f"Submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{survey_id}/bulk", response_model=BulkSubmissionResponse)
async def submit_bulk_responses(
    survey_id: str,
    request: Request,
    bulk_request: BulkSubmissionRequest
):
    """
    Submit multiple survey responses in bulk.
    
    Optimized for:
    - Data migrations
    - Offline sync
    - High-volume imports
    
    Maximum 10,000 submissions per request.
    """
    if len(bulk_request.submissions) > 10000:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10,000 submissions per bulk request"
        )
    
    try:
        result = await high_throughput_submitter.submit_batch(
            survey_id=survey_id,
            submissions=bulk_request.submissions
        )
        
        return BulkSubmissionResponse(
            success=result['success'],
            survey_id=result['survey_id'],
            count=result['count'],
            status=result['status']
        )
        
    except Exception as e:
        logger.error(f"Bulk submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics", response_model=MetricsResponse)
async def get_submission_metrics():
    """
    Get real-time submission metrics.
    
    Returns:
    - Total received submissions
    - Processing statistics
    - Buffer status
    - Queue health
    """
    metrics = high_throughput_submitter.get_metrics()
    buffer_stats = submission_buffer.get_stats()
    
    return MetricsResponse(
        total_received=metrics.get('total_received', 0),
        total_processed=buffer_stats.get('total_flushed', 0),
        total_failed=metrics.get('total_failed', 0),
        buffer_pending=buffer_stats.get('pending', 0),
        celery_available=metrics.get('celery_available', False)
    )


@router.post("/flush")
async def force_flush_buffer(background_tasks: BackgroundTasks):
    """
    Force flush all pending submissions in the buffer.
    
    Use this endpoint to ensure all submissions are processed
    before maintenance or shutdown.
    """
    try:
        await submission_buffer.force_flush()
        return {"success": True, "message": "Buffer flushed successfully"}
    except Exception as e:
        logger.error(f"Flush error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# DATABASE INITIALIZATION ENDPOINT
# ============================================

@router.post("/init-db")
async def initialize_database(request: Request):
    """
    Initialize high-throughput database collections and indexes.
    
    Creates:
    - Time-series collections for responses
    - Optimized indexes
    - Sharding configuration (if on sharded cluster)
    
    Should be called once during initial deployment.
    """
    try:
        db = request.app.state.db
        result = await initialize_high_throughput_db(db)
        return result
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# HEALTH & STATS ENDPOINTS
# ============================================

@router.get("/health")
async def submissions_health():
    """
    Health check for submission system.
    
    Returns system status including:
    - Buffer health
    - Queue connectivity
    - Processing capacity
    """
    buffer_stats = submission_buffer.get_stats()
    metrics = high_throughput_submitter.get_metrics()
    
    # Calculate health status
    pending = buffer_stats.get('pending', 0)
    is_healthy = pending < 10000  # Alert if more than 10K pending
    
    return {
        "status": "healthy" if is_healthy else "degraded",
        "buffer": {
            "pending": pending,
            "total_flushed": buffer_stats.get('total_flushed', 0),
            "last_flush": buffer_stats.get('last_flush')
        },
        "processing": {
            "celery_available": metrics.get('celery_available', False),
            "total_received": metrics.get('total_received', 0)
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/stats/detailed")
async def detailed_submission_stats(request: Request):
    """
    Get detailed submission statistics.
    
    Includes:
    - Throughput metrics
    - Latency percentiles
    - Error rates
    - Queue depths
    """
    buffer_stats = submission_buffer.get_stats()
    metrics = high_throughput_submitter.get_metrics()
    
    # Calculate throughput
    start_time = metrics.get('start_time')
    total_received = metrics.get('total_received', 0)
    
    if start_time and total_received > 0:
        start_dt = datetime.fromisoformat(start_time)
        elapsed = (datetime.now(timezone.utc) - start_dt).total_seconds()
        throughput = total_received / max(elapsed, 1)
    else:
        throughput = 0
    
    return {
        "throughput": {
            "submissions_per_second": round(throughput, 2),
            "total_received": total_received,
            "total_processed": buffer_stats.get('total_flushed', 0)
        },
        "buffer": buffer_stats,
        "system": {
            "celery_available": metrics.get('celery_available', False),
            "start_time": start_time
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
