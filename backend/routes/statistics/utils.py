"""Shared utilities for statistics routes"""
from typing import Optional, List, Tuple
from pydantic import BaseModel
import pandas as pd
import numpy as np


class BaseStatsRequest(BaseModel):
    """Base request model for statistics endpoints"""
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str


async def get_analysis_data(db, snapshot_id: str = None, form_id: str = None) -> Tuple[pd.DataFrame, list]:
    """Load data from snapshot or form submissions"""
    if snapshot_id:
        snapshot = await db.snapshots.find_one({"_id": snapshot_id})
        if not snapshot:
            return pd.DataFrame(), []
        df = pd.DataFrame(snapshot.get("data", []))
        schema = snapshot.get("schema", [])
    else:
        form = await db.forms.find_one({"id": form_id})
        submissions = await db.submissions.find({"form_id": form_id}).to_list(1000)
        df = pd.DataFrame([s.get("data", {}) for s in submissions])
        schema = form.get("fields", []) if form else []
    return df, schema


def calculate_effect_size(stat_type: str, **kwargs) -> dict:
    """Calculate effect size based on test type"""
    if stat_type == "ttest":
        t = kwargs.get("t_stat")
        n1, n2 = kwargs.get("n1", 30), kwargs.get("n2", 30)
        d = t * np.sqrt(1/n1 + 1/n2)
        return {
            "cohens_d": round(float(d), 3),
            "interpretation": interpret_cohens_d(d)
        }
    elif stat_type == "anova":
        ss_between = kwargs.get("ss_between", 0)
        ss_total = kwargs.get("ss_total", 1)
        eta_sq = ss_between / ss_total if ss_total > 0 else 0
        return {
            "eta_squared": round(float(eta_sq), 4),
            "interpretation": interpret_eta_squared(eta_sq)
        }
    return {}


def interpret_cohens_d(d: float) -> str:
    """Interpret Cohen's d effect size"""
    d = abs(d)
    if d < 0.2:
        return "negligible effect"
    elif d < 0.5:
        return "small effect"
    elif d < 0.8:
        return "medium effect"
    else:
        return "large effect"


def interpret_eta_squared(eta: float) -> str:
    """Interpret eta-squared effect size"""
    if eta < 0.01:
        return "negligible effect"
    elif eta < 0.06:
        return "small effect"
    elif eta < 0.14:
        return "medium effect"
    else:
        return "large effect"


def safe_float(val) -> float:
    """Safely convert value to float, handling numpy types"""
    if isinstance(val, (np.floating, np.integer)):
        return float(val)
    if isinstance(val, (np.bool_, bool)):
        return float(val)
    return float(val) if val is not None else 0.0


def safe_int(val) -> int:
    """Safely convert value to int"""
    if isinstance(val, (np.floating, np.integer)):
        return int(val)
    return int(val) if val is not None else 0


def format_p_value(p: float) -> str:
    """Format p-value for display"""
    if p < 0.001:
        return "< .001"
    elif p < 0.01:
        return f"= {p:.3f}"
    else:
        return f"= {p:.2f}"
