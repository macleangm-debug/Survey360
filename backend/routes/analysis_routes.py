"""DataPulse - Data Analysis Module
Comprehensive analytics engine for survey data analysis.

This module provides:
- Response browsing and filtering
- Dataset snapshots for reproducible analysis
- Statistical analysis (descriptive, inferential, regression)
- AI-powered natural language analysis
- Export capabilities
"""

from fastapi import APIRouter, HTTPException, Request, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone, timedelta
from enum import Enum
import pandas as pd
import numpy as np
import json
import hashlib
import io

router = APIRouter(prefix="/analysis", tags=["Data Analysis"])


# ============ Enums ============

class VariableType(str, Enum):
    STRING = "string"
    NUMERIC = "numeric"
    DATE = "date"
    CATEGORICAL = "categorical"


class MeasurementLevel(str, Enum):
    NOMINAL = "nominal"
    ORDINAL = "ordinal"
    SCALE = "scale"


class SnapshotStatus(str, Enum):
    CREATING = "creating"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"


# ============ Models ============

class ResponseFilter(BaseModel):
    form_id: str
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    status: Optional[List[str]] = None
    language: Optional[str] = None
    field_filters: Optional[Dict[str, Any]] = None  # {"field_id": {"operator": "eq", "value": "x"}}
    page: int = 1
    page_size: int = 50


class SnapshotConfig(BaseModel):
    form_id: str
    org_id: str
    name: str
    description: Optional[str] = None
    include_statuses: List[str] = ["approved"]
    include_metadata: bool = True
    include_paradata: bool = False
    anonymize_pii: bool = False


class QuickStatsRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    variables: List[str]  # Field IDs to analyze
    group_by: Optional[str] = None  # Optional grouping variable


class CrosstabRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    row_var: str
    col_var: str
    weight_var: Optional[str] = None


class ExportRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    format: str = "csv"  # csv, xlsx, spss, stata, r
    include_labels: bool = True
    include_codebook: bool = False
    variables: Optional[List[str]] = None  # None = all


# ============ Response Browsing ============

@router.post("/responses/browse")
async def browse_responses(
    request: Request,
    filters: ResponseFilter
):
    """Browse and filter individual responses"""
    db = request.app.state.db
    
    # Build query
    query = {"form_id": filters.form_id}
    
    if filters.date_from:
        query["submitted_at"] = {"$gte": datetime.fromisoformat(filters.date_from)}
    if filters.date_to:
        if "submitted_at" in query:
            query["submitted_at"]["$lte"] = datetime.fromisoformat(filters.date_to)
        else:
            query["submitted_at"] = {"$lte": datetime.fromisoformat(filters.date_to)}
    
    if filters.status:
        query["status"] = {"$in": filters.status}
    
    if filters.language:
        query["language"] = filters.language
    
    # Field-level filters
    if filters.field_filters:
        for field_id, condition in filters.field_filters.items():
            op = condition.get("operator", "eq")
            val = condition.get("value")
            
            if op == "eq":
                query[f"data.{field_id}"] = val
            elif op == "ne":
                query[f"data.{field_id}"] = {"$ne": val}
            elif op == "gt":
                query[f"data.{field_id}"] = {"$gt": val}
            elif op == "lt":
                query[f"data.{field_id}"] = {"$lt": val}
            elif op == "contains":
                query[f"data.{field_id}"] = {"$regex": val, "$options": "i"}
            elif op == "in":
                query[f"data.{field_id}"] = {"$in": val}
    
    # Execute query with pagination
    skip = (filters.page - 1) * filters.page_size
    
    total = await db.submissions.count_documents(query)
    submissions = await db.submissions.find(query).skip(skip).limit(filters.page_size).to_list(filters.page_size)
    
    # Format response
    for s in submissions:
        s["_id"] = str(s.get("_id", ""))
        if s.get("submitted_at"):
            s["submitted_at"] = s["submitted_at"].isoformat()
        if s.get("created_at"):
            s["created_at"] = s["created_at"].isoformat()
    
    return {
        "total": total,
        "page": filters.page,
        "page_size": filters.page_size,
        "total_pages": (total + filters.page_size - 1) // filters.page_size,
        "responses": submissions
    }


@router.get("/responses/{submission_id}")
async def get_response_detail(
    request: Request,
    submission_id: str
):
    """Get detailed view of a single response with metadata"""
    db = request.app.state.db
    
    submission = await db.submissions.find_one({"id": submission_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Response not found")
    
    submission["_id"] = str(submission.get("_id", ""))
    
    # Get paradata if available
    paradata = await db.paradata.find_one({"submission_id": submission_id})
    if paradata:
        paradata["_id"] = str(paradata.get("_id", ""))
        submission["paradata"] = paradata
    
    # Get revision history
    revisions = await db.revisions.find({"submission_id": submission_id}).to_list(50)
    for r in revisions:
        r["_id"] = str(r.get("_id", ""))
    submission["revisions"] = revisions
    
    return submission


@router.get("/responses/{form_id}/summary")
async def get_response_summary(
    request: Request,
    form_id: str,
    org_id: str
):
    """Get quick summary statistics for a form's responses"""
    db = request.app.state.db
    
    # Aggregation pipeline
    pipeline = [
        {"$match": {"form_id": form_id}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "approved": {"$sum": {"$cond": [{"$eq": ["$status", "approved"]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$eq": ["$status", "submitted"]}, 1, 0]}},
            "rejected": {"$sum": {"$cond": [{"$eq": ["$status", "rejected"]}, 1, 0]}},
            "draft": {"$sum": {"$cond": [{"$eq": ["$status", "draft"]}, 1, 0]}},
            "first_submission": {"$min": "$submitted_at"},
            "last_submission": {"$max": "$submitted_at"}
        }}
    ]
    
    result = await db.submissions.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "total": 0,
            "by_status": {},
            "date_range": None
        }
    
    stats = result[0]
    return {
        "total": stats["total"],
        "by_status": {
            "approved": stats["approved"],
            "pending": stats["pending"],
            "rejected": stats["rejected"],
            "draft": stats["draft"]
        },
        "date_range": {
            "first": stats["first_submission"].isoformat() if stats["first_submission"] else None,
            "last": stats["last_submission"].isoformat() if stats["last_submission"] else None
        }
    }


# ============ Dataset Snapshots ============

@router.post("/snapshots/create")
async def create_snapshot(
    request: Request,
    config: SnapshotConfig,
    background_tasks: BackgroundTasks
):
    """Create an immutable dataset snapshot for analysis"""
    db = request.app.state.db
    
    snapshot_id = f"snap_{config.form_id}_{int(datetime.now(timezone.utc).timestamp())}"
    
    # Create snapshot record
    snapshot = {
        "id": snapshot_id,
        "form_id": config.form_id,
        "org_id": config.org_id,
        "name": config.name,
        "description": config.description,
        "config": config.dict(),
        "status": SnapshotStatus.CREATING,
        "row_count": 0,
        "created_at": datetime.now(timezone.utc),
        "created_by": None,  # TODO: Add user
        "schema_hash": None,
        "data_hash": None
    }
    
    await db.snapshots.insert_one(snapshot)
    
    # Process in background
    background_tasks.add_task(
        process_snapshot_creation,
        db, snapshot_id, config
    )
    
    return {
        "snapshot_id": snapshot_id,
        "status": "creating",
        "message": "Snapshot creation started"
    }


async def process_snapshot_creation(db, snapshot_id: str, config: SnapshotConfig):
    """Background task to create snapshot data"""
    try:
        # Get form schema
        form = await db.forms.find_one({"id": config.form_id})
        if not form:
            await db.snapshots.update_one(
                {"id": snapshot_id},
                {"$set": {"status": SnapshotStatus.FAILED, "error": "Form not found"}}
            )
            return
        
        # Query submissions
        query = {
            "form_id": config.form_id,
            "status": {"$in": config.include_statuses}
        }
        
        submissions = await db.submissions.find(query).to_list(None)
        
        # Build snapshot data
        snapshot_data = []
        for sub in submissions:
            row = {
                "_submission_id": sub["id"],
                "_submitted_at": sub.get("submitted_at", "").isoformat() if sub.get("submitted_at") else None,
                "_status": sub.get("status"),
            }
            
            if config.include_metadata:
                row["_language"] = sub.get("language")
                row["_device"] = sub.get("device_type")
                row["_duration_seconds"] = sub.get("duration_seconds")
            
            # Add response data
            data = sub.get("data", {})
            for key, value in data.items():
                if config.anonymize_pii:
                    # Check if field is PII (simplified check)
                    field = next((f for f in form.get("fields", []) if f["id"] == key), None)
                    if field and field.get("pii"):
                        row[key] = "[REDACTED]"
                        continue
                row[key] = value
            
            snapshot_data.append(row)
        
        # Calculate hashes for reproducibility
        schema_str = json.dumps(form.get("fields", []), sort_keys=True)
        schema_hash = hashlib.sha256(schema_str.encode()).hexdigest()[:16]
        
        data_str = json.dumps(snapshot_data, sort_keys=True, default=str)
        data_hash = hashlib.sha256(data_str.encode()).hexdigest()[:16]
        
        # Store snapshot data
        await db.snapshot_data.insert_one({
            "snapshot_id": snapshot_id,
            "data": snapshot_data,
            "schema": form.get("fields", [])
        })
        
        # Update snapshot status
        await db.snapshots.update_one(
            {"id": snapshot_id},
            {"$set": {
                "status": SnapshotStatus.READY,
                "row_count": len(snapshot_data),
                "schema_hash": schema_hash,
                "data_hash": data_hash,
                "completed_at": datetime.now(timezone.utc)
            }}
        )
        
    except Exception as e:
        await db.snapshots.update_one(
            {"id": snapshot_id},
            {"$set": {"status": SnapshotStatus.FAILED, "error": str(e)}}
        )


@router.get("/snapshots/{org_id}")
async def list_snapshots(
    request: Request,
    org_id: str,
    form_id: Optional[str] = None
):
    """List all snapshots for an organization"""
    db = request.app.state.db
    
    query = {"org_id": org_id}
    if form_id:
        query["form_id"] = form_id
    
    snapshots = await db.snapshots.find(query).sort("created_at", -1).to_list(100)
    
    for s in snapshots:
        s["_id"] = str(s.get("_id", ""))
        if s.get("created_at"):
            s["created_at"] = s["created_at"].isoformat()
        if s.get("completed_at"):
            s["completed_at"] = s["completed_at"].isoformat()
    
    return snapshots


@router.get("/snapshots/detail/{snapshot_id}")
async def get_snapshot_detail(
    request: Request,
    snapshot_id: str
):
    """Get snapshot metadata and schema"""
    db = request.app.state.db
    
    snapshot = await db.snapshots.find_one({"id": snapshot_id})
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    
    snapshot["_id"] = str(snapshot.get("_id", ""))
    
    # Get schema
    snapshot_data = await db.snapshot_data.find_one({"snapshot_id": snapshot_id})
    if snapshot_data:
        snapshot["schema"] = snapshot_data.get("schema", [])
        snapshot["preview"] = snapshot_data.get("data", [])[:5]  # First 5 rows
    
    return snapshot


# ============ Quick Statistics ============

@router.post("/stats/quick")
async def get_quick_stats(
    request: Request,
    req: QuickStatsRequest
):
    """Get quick statistics for selected variables"""
    db = request.app.state.db
    
    # Get data
    if req.snapshot_id:
        snapshot_data = await db.snapshot_data.find_one({"snapshot_id": req.snapshot_id})
        if not snapshot_data:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        data = snapshot_data.get("data", [])
        schema = snapshot_data.get("schema", [])
    else:
        # Use live data
        submissions = await db.submissions.find({
            "form_id": req.form_id,
            "status": "approved"
        }).to_list(None)
        data = [s.get("data", {}) for s in submissions]
        form = await db.forms.find_one({"id": req.form_id})
        schema = form.get("fields", []) if form else []
    
    if not data:
        return {"variables": [], "total_n": 0}
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Calculate stats for each variable
    results = []
    for var_id in req.variables:
        if var_id not in df.columns:
            continue
        
        field_schema = next((f for f in schema if f.get("id") == var_id), {})
        field_type = field_schema.get("type", "text")
        
        series = df[var_id].dropna()
        
        if field_type in ["number", "integer", "decimal"]:
            # Numeric statistics
            numeric_series = pd.to_numeric(series, errors='coerce').dropna()
            stats = {
                "variable": var_id,
                "label": field_schema.get("label", var_id),
                "type": "numeric",
                "n": len(numeric_series),
                "missing": len(df) - len(numeric_series),
                "mean": float(numeric_series.mean()) if len(numeric_series) > 0 else None,
                "median": float(numeric_series.median()) if len(numeric_series) > 0 else None,
                "std": float(numeric_series.std()) if len(numeric_series) > 1 else None,
                "min": float(numeric_series.min()) if len(numeric_series) > 0 else None,
                "max": float(numeric_series.max()) if len(numeric_series) > 0 else None,
                "percentiles": {
                    "25": float(numeric_series.quantile(0.25)) if len(numeric_series) > 0 else None,
                    "50": float(numeric_series.quantile(0.50)) if len(numeric_series) > 0 else None,
                    "75": float(numeric_series.quantile(0.75)) if len(numeric_series) > 0 else None
                }
            }
        else:
            # Categorical statistics
            value_counts = series.value_counts()
            total = len(series)
            
            frequencies = []
            for val, count in value_counts.items():
                frequencies.append({
                    "value": str(val),
                    "count": int(count),
                    "percent": round(count / total * 100, 1) if total > 0 else 0
                })
            
            stats = {
                "variable": var_id,
                "label": field_schema.get("label", var_id),
                "type": "categorical",
                "n": len(series),
                "missing": len(df) - len(series),
                "unique_values": len(value_counts),
                "frequencies": frequencies[:20],  # Top 20
                "mode": str(value_counts.index[0]) if len(value_counts) > 0 else None
            }
        
        results.append(stats)
    
    return {
        "total_n": len(df),
        "variables": results
    }


@router.post("/stats/crosstab")
async def get_crosstab(
    request: Request,
    req: CrosstabRequest
):
    """Generate a cross-tabulation with chi-square test"""
    db = request.app.state.db
    
    # Get data
    if req.snapshot_id:
        snapshot_data = await db.snapshot_data.find_one({"snapshot_id": req.snapshot_id})
        if not snapshot_data:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        data = snapshot_data.get("data", [])
    else:
        submissions = await db.submissions.find({
            "form_id": req.form_id,
            "status": "approved"
        }).to_list(None)
        data = [s.get("data", {}) for s in submissions]
    
    if not data:
        return {"error": "No data available"}
    
    df = pd.DataFrame(data)
    
    if req.row_var not in df.columns or req.col_var not in df.columns:
        raise HTTPException(status_code=400, detail="Variable not found in data")
    
    # Create crosstab
    crosstab = pd.crosstab(
        df[req.row_var],
        df[req.col_var],
        margins=True,
        margins_name="Total"
    )
    
    # Chi-square test
    from scipy import stats as scipy_stats
    
    # Remove margins for chi-square
    ct_no_margins = crosstab.iloc[:-1, :-1]
    
    chi2_result = None
    if ct_no_margins.shape[0] > 1 and ct_no_margins.shape[1] > 1:
        try:
            chi2, p_value, dof, expected = scipy_stats.chi2_contingency(ct_no_margins)
            chi2_result = {
                "chi_square": round(float(chi2), 4),
                "p_value": round(float(p_value), 4),
                "degrees_of_freedom": int(dof),
                "significant": bool(p_value < 0.05)
            }
        except:
            pass
    
    # Format output
    result = {
        "row_variable": req.row_var,
        "col_variable": req.col_var,
        "row_labels": [str(x) for x in crosstab.index.tolist()],
        "col_labels": [str(x) for x in crosstab.columns.tolist()],
        "counts": [[int(c) for c in row] for row in crosstab.values.tolist()],
        "chi_square_test": chi2_result
    }
    
    # Add percentages
    row_pcts = (crosstab.div(crosstab.iloc[:, -1], axis=0) * 100).round(1)
    result["row_percentages"] = [[float(c) for c in row] for row in row_pcts.values.tolist()]
    
    col_pcts = (crosstab.div(crosstab.iloc[-1, :], axis=1) * 100).round(1)
    result["col_percentages"] = [[float(c) for c in row] for row in col_pcts.values.tolist()]
    
    return result


# ============ Time Series / Trends ============

@router.get("/stats/trends/{form_id}")
async def get_submission_trends(
    request: Request,
    form_id: str,
    days: int = 30,
    group_by: Optional[str] = None
):
    """Get submission trends over time"""
    db = request.app.state.db
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    pipeline = [
        {"$match": {
            "form_id": form_id,
            "submitted_at": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$submitted_at"}}
            },
            "count": {"$sum": 1},
            "approved": {"$sum": {"$cond": [{"$eq": ["$status", "approved"]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$eq": ["$status", "submitted"]}, 1, 0]}}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    
    results = await db.submissions.aggregate(pipeline).to_list(None)
    
    trends = []
    for r in results:
        trends.append({
            "date": r["_id"]["date"],
            "count": r["count"],
            "approved": r["approved"],
            "pending": r["pending"]
        })
    
    return {"trends": trends, "period_days": days}
