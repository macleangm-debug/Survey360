"""DataPulse - Export Routes"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import io
import csv
import json

from models import ExportRequest, ExportJob
from auth import get_current_user

router = APIRouter(prefix="/exports", tags=["Exports"])


async def check_form_access(db, form_id: str, user_id: str):
    """Check if user has access to form's organization"""
    form = await db.forms.find_one({"id": form_id}, {"_id": 0})
    if not form:
        return None, None
    
    membership = await db.org_members.find_one(
        {"org_id": form["org_id"], "user_id": user_id},
        {"_id": 0}
    )
    return membership, form


def flatten_dict(d: Dict, parent_key: str = '', sep: str = '.') -> Dict:
    """Flatten nested dictionary"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


@router.post("/csv")
async def export_to_csv(
    request: Request,
    data: ExportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Export submissions to CSV"""
    db = request.app.state.db
    
    # Check form access
    membership, form = await check_form_access(db, data.form_id, current_user["user_id"])
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Build query
    query = {"form_id": data.form_id}
    query.update(data.filters)
    
    submissions = await db.submissions.find(query, {"_id": 0}).to_list(None)
    
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found")
    
    # Get field names from form
    field_names = ["id", "submitted_by", "submitted_at", "status", "quality_score"]
    for field in form.get("fields", []):
        field_names.append(field["name"])
    
    # Create CSV
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=field_names, extrasaction='ignore')
    writer.writeheader()
    
    for sub in submissions:
        row = {
            "id": sub["id"],
            "submitted_by": sub["submitted_by"],
            "submitted_at": sub["submitted_at"],
            "status": sub["status"],
            "quality_score": sub.get("quality_score")
        }
        # Flatten submission data
        flat_data = flatten_dict(sub.get("data", {}))
        row.update(flat_data)
        writer.writerow(row)
    
    output.seek(0)
    
    # Log export
    export_log = ExportJob(
        org_id=form["org_id"],
        user_id=current_user["user_id"],
        form_id=data.form_id,
        format="csv",
        status="completed",
        row_count=len(submissions),
        completed_at=datetime.now(timezone.utc)
    )
    log_dict = export_log.model_dump()
    log_dict["created_at"] = log_dict["created_at"].isoformat()
    log_dict["completed_at"] = log_dict["completed_at"].isoformat()
    await db.export_jobs.insert_one(log_dict)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={form['name'].replace(' ', '_')}_export.csv"
        }
    )


@router.post("/json")
async def export_to_json(
    request: Request,
    data: ExportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Export submissions to JSON"""
    db = request.app.state.db
    
    # Check form access
    membership, form = await check_form_access(db, data.form_id, current_user["user_id"])
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Build query
    query = {"form_id": data.form_id}
    query.update(data.filters)
    
    submissions = await db.submissions.find(query, {"_id": 0}).to_list(None)
    
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found")
    
    # Log export
    export_log = ExportJob(
        org_id=form["org_id"],
        user_id=current_user["user_id"],
        form_id=data.form_id,
        format="json",
        status="completed",
        row_count=len(submissions),
        completed_at=datetime.now(timezone.utc)
    )
    log_dict = export_log.model_dump()
    log_dict["created_at"] = log_dict["created_at"].isoformat()
    log_dict["completed_at"] = log_dict["completed_at"].isoformat()
    await db.export_jobs.insert_one(log_dict)
    
    return StreamingResponse(
        iter([json.dumps(submissions, default=str, indent=2)]),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename={form['name'].replace(' ', '_')}_export.json"
        }
    )


@router.post("/xlsx")
async def export_to_xlsx(
    request: Request,
    data: ExportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Export submissions to Excel"""
    db = request.app.state.db
    
    try:
        import xlsxwriter
    except ImportError:
        raise HTTPException(status_code=500, detail="Excel export not available")
    
    # Check form access
    membership, form = await check_form_access(db, data.form_id, current_user["user_id"])
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Build query
    query = {"form_id": data.form_id}
    query.update(data.filters)
    
    submissions = await db.submissions.find(query, {"_id": 0}).to_list(None)
    
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found")
    
    # Get field names
    field_names = ["id", "submitted_by", "submitted_at", "status", "quality_score"]
    for field in form.get("fields", []):
        field_names.append(field["name"])
    
    # Create Excel file
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet('Submissions')
    
    # Header format
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#4F46E5',
        'font_color': 'white'
    })
    
    # Write headers
    for col, name in enumerate(field_names):
        worksheet.write(0, col, name, header_format)
    
    # Write data
    for row_num, sub in enumerate(submissions, start=1):
        worksheet.write(row_num, 0, sub["id"])
        worksheet.write(row_num, 1, sub["submitted_by"])
        worksheet.write(row_num, 2, str(sub["submitted_at"]))
        worksheet.write(row_num, 3, sub["status"])
        worksheet.write(row_num, 4, sub.get("quality_score"))
        
        flat_data = flatten_dict(sub.get("data", {}))
        for col, field_name in enumerate(field_names[5:], start=5):
            value = flat_data.get(field_name, "")
            worksheet.write(row_num, col, str(value) if value else "")
    
    workbook.close()
    output.seek(0)
    
    # Log export
    export_log = ExportJob(
        org_id=form["org_id"],
        user_id=current_user["user_id"],
        form_id=data.form_id,
        format="xlsx",
        status="completed",
        row_count=len(submissions),
        completed_at=datetime.now(timezone.utc)
    )
    log_dict = export_log.model_dump()
    log_dict["created_at"] = log_dict["created_at"].isoformat()
    log_dict["completed_at"] = log_dict["completed_at"].isoformat()
    await db.export_jobs.insert_one(log_dict)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={form['name'].replace(' ', '_')}_export.xlsx"
        }
    )


@router.get("/history")
async def get_export_history(
    request: Request,
    org_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get export history for an organization"""
    db = request.app.state.db
    
    # Check org access
    membership = await db.org_members.find_one(
        {"org_id": org_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    exports = await db.export_jobs.find(
        {"org_id": org_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(100).to_list(100)
    
    # Enrich with form names
    result = []
    for exp in exports:
        form = await db.forms.find_one({"id": exp["form_id"]}, {"_id": 0, "name": 1})
        result.append({
            **exp,
            "form_name": form["name"] if form else "Unknown"
        })
    
    return result
