"""DataPulse - Advanced Statistics Module
Comprehensive statistical analysis for survey data.

Features:
- Descriptive statistics with effect sizes
- Hypothesis testing (t-tests, ANOVA, chi-square, non-parametric)
- Correlation analysis
- Reliability analysis (Cronbach's alpha)
- Factor analysis (PCA, EFA)
- Regression models (OLS, logistic, GLM)
"""

from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from scipy import stats as scipy_stats
import warnings

from utils.audit import log_action

router = APIRouter(prefix="/statistics", tags=["Advanced Statistics"])

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')


# ============ Models ============

class DescriptiveRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    variables: List[str]
    include_normality: bool = False
    percentiles: List[float] = [25, 50, 75]


class TTestRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    test_type: str = "independent"  # independent, paired, one_sample
    variable: str
    group_var: Optional[str] = None  # For independent t-test
    mu: Optional[float] = None  # For one-sample t-test


class ANOVARequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    dependent_var: str
    factor_var: str
    post_hoc: bool = True


class CorrelationRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    variables: List[str]
    method: str = "pearson"  # pearson, spearman, kendall


class ReliabilityRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    items: List[str]  # Variables that form a scale


class FactorAnalysisRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    variables: List[str]
    n_factors: Optional[int] = None  # Auto-detect if None
    rotation: str = "varimax"  # varimax, promax, oblimin


class ClusteringRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    variables: List[str]
    method: str = "kmeans"  # kmeans, hierarchical
    n_clusters: Optional[int] = None  # Auto-detect if None (elbow method)
    linkage: str = "ward"  # For hierarchical: ward, complete, average, single


class RegressionRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    dependent_var: str
    independent_vars: List[str]
    model_type: str = "ols"  # ols, logistic, poisson
    robust_se: bool = False


# ============ Helper Functions ============

async def get_analysis_data(db, snapshot_id: str = None, form_id: str = None):
    """Get data for analysis from snapshot or live"""
    if snapshot_id:
        snapshot_data = await db.snapshot_data.find_one({"snapshot_id": snapshot_id})
        if not snapshot_data:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        return pd.DataFrame(snapshot_data.get("data", [])), snapshot_data.get("schema", [])
    else:
        submissions = await db.submissions.find({
            "form_id": form_id,
            "status": "approved"
        }).to_list(None)
        data = [s.get("data", {}) for s in submissions]
        form = await db.forms.find_one({"id": form_id})
        schema = form.get("fields", []) if form else []
        return pd.DataFrame(data), schema


def calculate_effect_size(stat_type: str, **kwargs):
    """Calculate effect size for various tests"""
    if stat_type == "t_test":
        # Cohen's d
        mean1, mean2 = kwargs.get("mean1"), kwargs.get("mean2")
        std1, std2 = kwargs.get("std1"), kwargs.get("std2")
        n1, n2 = kwargs.get("n1"), kwargs.get("n2")
        
        pooled_std = np.sqrt(((n1-1)*std1**2 + (n2-1)*std2**2) / (n1+n2-2))
        if pooled_std > 0:
            d = (mean1 - mean2) / pooled_std
            return {"cohens_d": round(d, 4), "interpretation": interpret_cohens_d(d)}
        return None
    
    elif stat_type == "anova":
        # Eta-squared
        ss_between = kwargs.get("ss_between")
        ss_total = kwargs.get("ss_total")
        if ss_total > 0:
            eta_sq = ss_between / ss_total
            return {"eta_squared": round(eta_sq, 4), "interpretation": interpret_eta_squared(eta_sq)}
        return None
    
    return None


def interpret_cohens_d(d):
    """Interpret Cohen's d effect size"""
    d = abs(d)
    if d < 0.2:
        return "negligible"
    elif d < 0.5:
        return "small"
    elif d < 0.8:
        return "medium"
    else:
        return "large"


def interpret_eta_squared(eta):
    """Interpret eta-squared effect size"""
    if eta < 0.01:
        return "negligible"
    elif eta < 0.06:
        return "small"
    elif eta < 0.14:
        return "medium"
    else:
        return "large"


# ============ Descriptive Statistics ============

@router.post("/descriptives")
@log_action("run_descriptive_stats", target_type="analysis")
async def get_descriptive_stats(
    request: Request,
    req: DescriptiveRequest
):
    """Get detailed descriptive statistics with optional normality tests"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available", "variables": []}
    
    results = []
    for var_id in req.variables:
        if var_id not in df.columns:
            continue
        
        series = pd.to_numeric(df[var_id], errors='coerce').dropna()
        
        if len(series) == 0:
            continue
        
        field_schema = next((f for f in schema if f.get("id") == var_id), {})
        
        stats = {
            "variable": var_id,
            "label": field_schema.get("label", var_id),
            "n": int(len(series)),
            "missing": int(len(df) - len(series)),
            "mean": round(float(series.mean()), 4),
            "std": round(float(series.std()), 4),
            "variance": round(float(series.var()), 4),
            "sem": round(float(series.sem()), 4),
            "min": round(float(series.min()), 4),
            "max": round(float(series.max()), 4),
            "range": round(float(series.max() - series.min()), 4),
            "skewness": round(float(series.skew()), 4),
            "kurtosis": round(float(series.kurtosis()), 4),
            "percentiles": {}
        }
        
        # Calculate requested percentiles
        for p in req.percentiles:
            stats["percentiles"][f"p{int(p)}"] = round(float(series.quantile(p/100)), 4)
        
        # Normality tests
        if req.include_normality and len(series) >= 8:
            # Shapiro-Wilk (best for n < 5000)
            if len(series) < 5000:
                shapiro_stat, shapiro_p = scipy_stats.shapiro(series)
                stats["normality"] = {
                    "shapiro_wilk": {
                        "statistic": round(float(shapiro_stat), 4),
                        "p_value": round(float(shapiro_p), 4),
                        "normal": bool(shapiro_p > 0.05)
                    }
                }
            
            # D'Agostino-Pearson (for larger samples)
            if len(series) >= 20:
                dagostino_stat, dagostino_p = scipy_stats.normaltest(series)
                if "normality" not in stats:
                    stats["normality"] = {}
                stats["normality"]["dagostino"] = {
                    "statistic": round(float(dagostino_stat), 4),
                    "p_value": round(float(dagostino_p), 4),
                    "normal": bool(dagostino_p > 0.05)
                }
        
        results.append(stats)
    
    return {"total_n": len(df), "variables": results}


# ============ T-Tests ============

@router.post("/ttest")
async def run_ttest(
    request: Request,
    req: TTestRequest
):
    """Run t-test (independent, paired, or one-sample)"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    if req.variable not in df.columns:
        raise HTTPException(status_code=400, detail=f"Variable {req.variable} not found")
    
    field_schema = next((f for f in schema if f.get("id") == req.variable), {})
    
    if req.test_type == "one_sample":
        # One-sample t-test
        series = pd.to_numeric(df[req.variable], errors='coerce').dropna()
        
        if len(series) < 2:
            return {"error": "Insufficient data for t-test"}
        
        mu = req.mu if req.mu is not None else 0
        t_stat, p_value = scipy_stats.ttest_1samp(series, mu)
        
        return {
            "test_type": "one_sample",
            "variable": req.variable,
            "label": field_schema.get("label", req.variable),
            "hypothesized_mean": mu,
            "sample_mean": round(float(series.mean()), 4),
            "sample_std": round(float(series.std()), 4),
            "n": int(len(series)),
            "t_statistic": round(float(t_stat), 4),
            "p_value": round(float(p_value), 4),
            "significant": bool(p_value < 0.05),
            "confidence_interval": {
                "lower": round(float(series.mean() - 1.96 * series.sem()), 4),
                "upper": round(float(series.mean() + 1.96 * series.sem()), 4)
            }
        }
    
    elif req.test_type == "independent":
        # Independent samples t-test
        if not req.group_var or req.group_var not in df.columns:
            raise HTTPException(status_code=400, detail="Group variable required for independent t-test")
        
        groups = df[req.group_var].dropna().unique()
        if len(groups) != 2:
            if len(groups) > 2:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Independent samples t-test requires exactly 2 groups, but found {len(groups)} groups in '{req.group_var}'. "
                           f"Please use ANOVA (Analysis of Variance) for comparing 3 or more groups, "
                           f"or filter your data to include only 2 groups."
                )
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Independent samples t-test requires exactly 2 groups, but found only {len(groups)} group(s) in '{req.group_var}'."
                )
        
        group1_data = pd.to_numeric(df[df[req.group_var] == groups[0]][req.variable], errors='coerce').dropna()
        group2_data = pd.to_numeric(df[df[req.group_var] == groups[1]][req.variable], errors='coerce').dropna()
        
        if len(group1_data) < 2 or len(group2_data) < 2:
            return {"error": "Insufficient data in one or both groups"}
        
        # Levene's test for equality of variances
        levene_stat, levene_p = scipy_stats.levene(group1_data, group2_data)
        equal_var = bool(levene_p > 0.05)
        
        # T-test
        t_stat, p_value = scipy_stats.ttest_ind(group1_data, group2_data, equal_var=equal_var)
        
        # Effect size
        effect_size = calculate_effect_size(
            "t_test",
            mean1=group1_data.mean(),
            mean2=group2_data.mean(),
            std1=group1_data.std(),
            std2=group2_data.std(),
            n1=len(group1_data),
            n2=len(group2_data)
        )
        
        return {
            "test_type": "independent",
            "variable": req.variable,
            "label": field_schema.get("label", req.variable),
            "group_variable": req.group_var,
            "groups": {
                str(groups[0]): {
                    "n": int(len(group1_data)),
                    "mean": round(float(group1_data.mean()), 4),
                    "std": round(float(group1_data.std()), 4)
                },
                str(groups[1]): {
                    "n": int(len(group2_data)),
                    "mean": round(float(group2_data.mean()), 4),
                    "std": round(float(group2_data.std()), 4)
                }
            },
            "levene_test": {
                "statistic": round(float(levene_stat), 4),
                "p_value": round(float(levene_p), 4),
                "equal_variances": equal_var
            },
            "t_statistic": round(float(t_stat), 4),
            "p_value": round(float(p_value), 4),
            "significant": bool(p_value < 0.05),
            "effect_size": effect_size
        }
    
    elif req.test_type == "paired":
        # Need two variables for paired t-test
        raise HTTPException(status_code=400, detail="Paired t-test requires two variables - use /ttest/paired endpoint")
    
    raise HTTPException(status_code=400, detail=f"Unknown test type: {req.test_type}")


# ============ ANOVA ============

@router.post("/anova")
async def run_anova(
    request: Request,
    req: ANOVARequest
):
    """Run one-way ANOVA with optional post-hoc tests"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    if req.dependent_var not in df.columns or req.factor_var not in df.columns:
        raise HTTPException(status_code=400, detail="Variable not found")
    
    # Prepare data
    df_clean = df[[req.dependent_var, req.factor_var]].dropna()
    df_clean[req.dependent_var] = pd.to_numeric(df_clean[req.dependent_var], errors='coerce')
    df_clean = df_clean.dropna()
    
    groups = df_clean.groupby(req.factor_var)[req.dependent_var].apply(list).to_dict()
    
    if len(groups) < 2:
        return {"error": "Need at least 2 groups for ANOVA"}
    
    # Calculate group statistics
    group_stats = {}
    for group_name, values in groups.items():
        group_stats[str(group_name)] = {
            "n": len(values),
            "mean": round(np.mean(values), 4),
            "std": round(np.std(values, ddof=1), 4) if len(values) > 1 else 0,
            "sem": round(np.std(values, ddof=1) / np.sqrt(len(values)), 4) if len(values) > 1 else 0
        }
    
    # One-way ANOVA
    f_stat, p_value = scipy_stats.f_oneway(*groups.values())
    
    # Calculate effect size (eta-squared)
    grand_mean = df_clean[req.dependent_var].mean()
    ss_between = sum(len(v) * (np.mean(v) - grand_mean)**2 for v in groups.values())
    ss_total = sum((x - grand_mean)**2 for v in groups.values() for x in v)
    
    effect_size = calculate_effect_size("anova", ss_between=ss_between, ss_total=ss_total)
    
    result = {
        "dependent_variable": req.dependent_var,
        "factor_variable": req.factor_var,
        "n_groups": len(groups),
        "total_n": len(df_clean),
        "group_statistics": group_stats,
        "anova": {
            "f_statistic": round(float(f_stat), 4),
            "p_value": round(float(p_value), 4),
            "significant": bool(p_value < 0.05)
        },
        "effect_size": effect_size
    }
    
    # Post-hoc tests (Tukey HSD)
    if req.post_hoc and len(groups) > 2:
        try:
            import pingouin as pg
            
            posthoc = pg.pairwise_tukey(
                data=df_clean,
                dv=req.dependent_var,
                between=req.factor_var
            )
            
            result["post_hoc_tukey"] = []
            for _, row in posthoc.iterrows():
                result["post_hoc_tukey"].append({
                    "group_a": str(row["A"]),
                    "group_b": str(row["B"]),
                    "mean_diff": round(float(row["diff"]), 4),
                    "p_value": round(float(row["p-tukey"]), 4),
                    "significant": bool(row["p-tukey"] < 0.05)
                })
        except Exception as e:
            result["post_hoc_error"] = str(e)
    
    return result


# ============ Correlation ============

@router.post("/correlation")
async def run_correlation(
    request: Request,
    req: CorrelationRequest
):
    """Calculate correlation matrix with significance tests"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    # Filter to requested variables and convert to numeric
    valid_vars = [v for v in req.variables if v in df.columns]
    df_subset = df[valid_vars].apply(pd.to_numeric, errors='coerce')
    
    if len(valid_vars) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 variables for correlation")
    
    # Calculate correlation matrix
    if req.method == "pearson":
        corr_matrix = df_subset.corr(method='pearson')
    elif req.method == "spearman":
        corr_matrix = df_subset.corr(method='spearman')
    elif req.method == "kendall":
        corr_matrix = df_subset.corr(method='kendall')
    else:
        raise HTTPException(status_code=400, detail=f"Unknown method: {req.method}")
    
    # Calculate p-values
    n = len(df_subset.dropna())
    p_values = pd.DataFrame(np.ones((len(valid_vars), len(valid_vars))), 
                           index=valid_vars, columns=valid_vars)
    
    for i, var1 in enumerate(valid_vars):
        for j, var2 in enumerate(valid_vars):
            if i != j:
                mask = df_subset[[var1, var2]].dropna()
                if len(mask) > 2:
                    if req.method == "pearson":
                        _, p = scipy_stats.pearsonr(mask[var1], mask[var2])
                    elif req.method == "spearman":
                        _, p = scipy_stats.spearmanr(mask[var1], mask[var2])
                    elif req.method == "kendall":
                        _, p = scipy_stats.kendalltau(mask[var1], mask[var2])
                    p_values.loc[var1, var2] = p
    
    # Format output
    correlations = []
    for i, var1 in enumerate(valid_vars):
        for j, var2 in enumerate(valid_vars):
            if i < j:  # Only upper triangle
                r = corr_matrix.loc[var1, var2]
                p = p_values.loc[var1, var2]
                correlations.append({
                    "var1": var1,
                    "var2": var2,
                    "correlation": round(float(r), 4) if not np.isnan(r) else None,
                    "p_value": round(float(p), 4) if not np.isnan(p) else None,
                    "significant": bool(p < 0.05) if not np.isnan(p) else None
                })
    
    # Convert correlation matrix to serializable format
    corr_dict = {}
    for col in corr_matrix.columns:
        corr_dict[str(col)] = {str(k): (round(float(v), 4) if not np.isnan(v) else None) 
                               for k, v in corr_matrix[col].items()}
    
    p_val_dict = {}
    for col in p_values.columns:
        p_val_dict[str(col)] = {str(k): (round(float(v), 4) if not np.isnan(v) else None) 
                                for k, v in p_values[col].items()}
    
    return {
        "method": req.method,
        "n": n,
        "variables": valid_vars,
        "correlation_matrix": corr_dict,
        "p_value_matrix": p_val_dict,
        "pairwise_correlations": correlations
    }


# ============ Reliability Analysis ============

@router.post("/reliability")
async def run_reliability(
    request: Request,
    req: ReliabilityRequest
):
    """Calculate Cronbach's alpha and item-total statistics"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    # Filter to requested items
    valid_items = [v for v in req.items if v in df.columns]
    df_items = df[valid_items].apply(pd.to_numeric, errors='coerce').dropna()
    
    if len(valid_items) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 items for reliability analysis")
    
    if len(df_items) < 10:
        return {"error": "Insufficient data for reliability analysis (need at least 10 complete cases)"}
    
    # Calculate Cronbach's alpha
    item_vars = df_items.var(axis=0)
    total_var = df_items.sum(axis=1).var()
    n_items = len(valid_items)
    
    alpha = (n_items / (n_items - 1)) * (1 - item_vars.sum() / total_var)
    
    # Item-total statistics
    item_stats = []
    for item in valid_items:
        # Correlation with total (excluding this item)
        other_items = [i for i in valid_items if i != item]
        total_without = df_items[other_items].sum(axis=1)
        item_total_corr = df_items[item].corr(total_without)
        
        # Alpha if item deleted
        remaining_items = df_items[other_items]
        remaining_var = remaining_items.var(axis=0).sum()
        remaining_total_var = remaining_items.sum(axis=1).var()
        alpha_if_deleted = ((n_items - 1) / (n_items - 2)) * (1 - remaining_var / remaining_total_var)
        
        field_schema = next((f for f in schema if f.get("id") == item), {})
        
        item_stats.append({
            "item": item,
            "label": field_schema.get("label", item),
            "mean": round(float(df_items[item].mean()), 4),
            "std": round(float(df_items[item].std()), 4),
            "item_total_correlation": round(float(item_total_corr), 4),
            "alpha_if_deleted": round(float(alpha_if_deleted), 4)
        })
    
    # Interpret alpha
    if alpha >= 0.9:
        interpretation = "Excellent"
    elif alpha >= 0.8:
        interpretation = "Good"
    elif alpha >= 0.7:
        interpretation = "Acceptable"
    elif alpha >= 0.6:
        interpretation = "Questionable"
    elif alpha >= 0.5:
        interpretation = "Poor"
    else:
        interpretation = "Unacceptable"
    
    return {
        "n_items": n_items,
        "n_cases": len(df_items),
        "cronbachs_alpha": round(float(alpha), 4),
        "interpretation": interpretation,
        "scale_mean": round(float(df_items.sum(axis=1).mean()), 4),
        "scale_std": round(float(df_items.sum(axis=1).std()), 4),
        "item_statistics": item_stats
    }


# ============ Factor Analysis ============

@router.post("/factor-analysis")
async def run_factor_analysis(
    request: Request,
    req: FactorAnalysisRequest
):
    """Run exploratory factor analysis (EFA) with visualization data"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    # Filter to requested variables
    valid_vars = [v for v in req.variables if v in df.columns]
    if len(valid_vars) < 3:
        raise HTTPException(status_code=400, detail="Factor analysis requires at least 3 variables")
    
    df_numeric = df[valid_vars].apply(pd.to_numeric, errors='coerce').dropna()
    
    if len(df_numeric) < 50:
        return {"error": "Factor analysis requires at least 50 complete cases"}
    
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    
    # Standardize data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_numeric)
    
    # Determine number of factors using Kaiser criterion (eigenvalue > 1)
    pca_full = PCA()
    pca_full.fit(X_scaled)
    eigenvalues = pca_full.explained_variance_
    
    if req.n_factors:
        n_factors = min(req.n_factors, len(valid_vars))
    else:
        # Kaiser criterion: eigenvalues > 1
        n_factors = max(1, sum(eigenvalues > 1))
    
    # Run PCA with determined factors
    pca = PCA(n_components=n_factors)
    pca.fit_transform(X_scaled)  # Fit the model
    loadings = pca.components_.T  # Variables x Factors
    
    # Calculate variance explained
    explained_variance = pca.explained_variance_ratio_
    cumulative_variance = np.cumsum(explained_variance)
    
    # Determine communalities
    communalities = np.sum(loadings ** 2, axis=1)
    
    # Apply rotation if requested (simplified varimax)
    if req.rotation == "varimax" and n_factors > 1:
        # Simple varimax approximation
        rotated_loadings = loadings.copy()
        for _ in range(10):
            for i in range(n_factors):
                for j in range(i + 1, n_factors):
                    # Calculate rotation angle
                    u = rotated_loadings[:, i] ** 2 - rotated_loadings[:, j] ** 2
                    v = 2 * rotated_loadings[:, i] * rotated_loadings[:, j]
                    C = np.sum(u ** 2 - v ** 2)
                    D = np.sum(2 * u * v)
                    
                    if C ** 2 + D ** 2 > 1e-10:
                        phi = 0.25 * np.arctan2(D, C)
                        cos_phi = np.cos(phi)
                        sin_phi = np.sin(phi)
                        
                        temp_i = rotated_loadings[:, i] * cos_phi + rotated_loadings[:, j] * sin_phi
                        temp_j = -rotated_loadings[:, i] * sin_phi + rotated_loadings[:, j] * cos_phi
                        rotated_loadings[:, i] = temp_i
                        rotated_loadings[:, j] = temp_j
        loadings = rotated_loadings
    
    # Build loading matrix
    loading_matrix = {}
    for i, var in enumerate(valid_vars):
        loading_matrix[var] = {
            f"Factor_{j+1}": round(float(loadings[i, j]), 4) 
            for j in range(n_factors)
        }
        loading_matrix[var]["communality"] = round(float(communalities[i]), 4)
    
    # Scree plot data
    scree_data = [
        {
            "component": i + 1,
            "eigenvalue": round(float(eigenvalues[i]), 4),
            "variance_explained": round(float(pca_full.explained_variance_ratio_[i] * 100), 2),
            "cumulative_variance": round(float(np.cumsum(pca_full.explained_variance_ratio_)[i] * 100), 2)
        }
        for i in range(min(len(eigenvalues), 10))
    ]
    
    # KMO and Bartlett test approximation
    corr_matrix = np.corrcoef(df_numeric.values.T)
    det_corr = np.linalg.det(corr_matrix) if np.abs(np.linalg.det(corr_matrix)) > 1e-10 else 1e-10
    n_vars = len(valid_vars)
    n_obs = len(df_numeric)
    
    # Chi-square for Bartlett's test
    bartlett_chi2 = -((n_obs - 1) - (2 * n_vars + 5) / 6) * np.log(det_corr)
    bartlett_df = n_vars * (n_vars - 1) / 2
    bartlett_p = 1 - scipy_stats.chi2.cdf(bartlett_chi2, bartlett_df) if bartlett_chi2 > 0 else 1.0
    
    # Simplified KMO
    inv_corr = np.linalg.pinv(corr_matrix)
    partial_corr = -inv_corr / np.sqrt(np.outer(np.diag(inv_corr), np.diag(inv_corr)))
    np.fill_diagonal(partial_corr, 0)
    
    r_sq_sum = np.sum(corr_matrix ** 2) - n_vars
    q_sq_sum = np.sum(partial_corr ** 2)
    kmo = r_sq_sum / (r_sq_sum + q_sq_sum) if (r_sq_sum + q_sq_sum) > 0 else 0
    
    # KMO interpretation
    if kmo >= 0.9:
        kmo_interp = "Marvelous"
    elif kmo >= 0.8:
        kmo_interp = "Meritorious"
    elif kmo >= 0.7:
        kmo_interp = "Middling"
    elif kmo >= 0.6:
        kmo_interp = "Mediocre"
    elif kmo >= 0.5:
        kmo_interp = "Miserable"
    else:
        kmo_interp = "Unacceptable"
    
    return {
        "n_observations": len(df_numeric),
        "n_variables": len(valid_vars),
        "n_factors": n_factors,
        "rotation": req.rotation,
        "kmo": {
            "value": round(float(kmo), 4),
            "interpretation": kmo_interp
        },
        "bartlett_test": {
            "chi_square": round(float(bartlett_chi2), 2),
            "df": int(bartlett_df),
            "p_value": round(float(bartlett_p), 4),
            "significant": bartlett_p < 0.05
        },
        "variance_explained": {
            "by_factor": [round(float(v * 100), 2) for v in explained_variance],
            "cumulative": [round(float(v * 100), 2) for v in cumulative_variance],
            "total": round(float(cumulative_variance[-1] * 100), 2)
        },
        "loading_matrix": loading_matrix,
        "scree_plot": scree_data,
        "factor_interpretation": [
            {
                "factor": f"Factor_{i+1}",
                "high_loading_variables": [
                    {"variable": var, "loading": round(float(loadings[j, i]), 4)}
                    for j, var in enumerate(valid_vars)
                    if abs(loadings[j, i]) >= 0.4
                ]
            }
            for i in range(n_factors)
        ]
    }


# ============ Clustering ============

@router.post("/clustering")
async def run_clustering(
    request: Request,
    req: ClusteringRequest
):
    """Run cluster analysis (k-means or hierarchical)"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    # Filter to requested variables
    valid_vars = [v for v in req.variables if v in df.columns]
    if len(valid_vars) < 2:
        raise HTTPException(status_code=400, detail="Clustering requires at least 2 variables")
    
    df_numeric = df[valid_vars].apply(pd.to_numeric, errors='coerce').dropna()
    
    if len(df_numeric) < 10:
        return {"error": "Clustering requires at least 10 complete cases"}
    
    from sklearn.preprocessing import StandardScaler
    from sklearn.cluster import KMeans, AgglomerativeClustering
    from sklearn.metrics import silhouette_score, calinski_harabasz_score
    
    # Standardize data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_numeric)
    
    # Determine optimal number of clusters if not specified
    if req.n_clusters is None:
        # Elbow method + silhouette
        inertias = []
        silhouettes = []
        K_range = range(2, min(11, len(df_numeric) // 2))
        
        for k in K_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X_scaled)
            inertias.append(kmeans.inertia_)
            silhouettes.append(silhouette_score(X_scaled, kmeans.labels_))
        
        # Find elbow (maximum silhouette)
        optimal_k = K_range[silhouettes.index(max(silhouettes))]
        n_clusters = optimal_k
        
        elbow_data = [
            {"k": k, "inertia": round(float(inertias[i]), 2), "silhouette": round(float(silhouettes[i]), 4)}
            for i, k in enumerate(K_range)
        ]
    else:
        n_clusters = req.n_clusters
        elbow_data = None
    
    result = {
        "method": req.method,
        "n_clusters": n_clusters,
        "n_observations": len(df_numeric),
        "variables": valid_vars
    }
    
    if req.method == "kmeans":
        # K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        
        # Cluster centers (back-transformed)
        centers_scaled = kmeans.cluster_centers_
        centers = scaler.inverse_transform(centers_scaled)
        
        # Metrics
        silhouette = silhouette_score(X_scaled, labels)
        calinski = calinski_harabasz_score(X_scaled, labels)
        
        # Cluster profiles
        df_numeric['cluster'] = labels
        cluster_profiles = []
        for i in range(n_clusters):
            cluster_data = df_numeric[df_numeric['cluster'] == i]
            profile = {
                "cluster": i,
                "n": len(cluster_data),
                "percent": round(float(len(cluster_data) / len(df_numeric) * 100), 1),
                "center": {var: round(float(centers[i, j]), 4) for j, var in enumerate(valid_vars)},
                "means": {var: round(float(cluster_data[var].mean()), 4) for var in valid_vars}
            }
            cluster_profiles.append(profile)
        
        result.update({
            "silhouette_score": round(float(silhouette), 4),
            "calinski_harabasz": round(float(calinski), 2),
            "inertia": round(float(kmeans.inertia_), 2),
            "cluster_profiles": cluster_profiles,
            "elbow_data": elbow_data
        })
    
    elif req.method == "hierarchical":
        # Hierarchical clustering
        from scipy.cluster.hierarchy import dendrogram, linkage as scipy_linkage
        
        # Compute linkage matrix
        Z = scipy_linkage(X_scaled, method=req.linkage)
        
        # Cut tree at n_clusters
        hc = AgglomerativeClustering(n_clusters=n_clusters, linkage=req.linkage)
        labels = hc.fit_predict(X_scaled)
        
        # Metrics
        silhouette = silhouette_score(X_scaled, labels)
        
        # Cluster profiles
        df_numeric['cluster'] = labels
        cluster_profiles = []
        for i in range(n_clusters):
            cluster_data = df_numeric[df_numeric['cluster'] == i]
            profile = {
                "cluster": i,
                "n": len(cluster_data),
                "percent": round(float(len(cluster_data) / len(df_numeric) * 100), 1),
                "means": {var: round(float(cluster_data[var].mean()), 4) for var in valid_vars}
            }
            cluster_profiles.append(profile)
        
        # Dendrogram data (simplified for plotting)
        dendro_data = {
            "icoord": [[round(x, 2) for x in row] for row in dendrogram(Z, no_plot=True)['icoord'][:50]],
            "dcoord": [[round(x, 2) for x in row] for row in dendrogram(Z, no_plot=True)['dcoord'][:50]]
        }
        
        result.update({
            "linkage": req.linkage,
            "silhouette_score": round(float(silhouette), 4),
            "cluster_profiles": cluster_profiles,
            "dendrogram": dendro_data
        })
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown clustering method: {req.method}")
    
    return result


# ============ Nonparametric Tests ============

class NonparametricRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    test_type: str  # mann_whitney, wilcoxon, kruskal_wallis, friedman
    dependent_var: str
    group_var: Optional[str] = None  # For Mann-Whitney and Kruskal-Wallis
    paired_var: Optional[str] = None  # For Wilcoxon signed-rank


@router.post("/nonparametric")
async def run_nonparametric_test(
    request: Request,
    req: NonparametricRequest
):
    """Run nonparametric statistical tests"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    # Validate variables
    if req.dependent_var not in df.columns:
        raise HTTPException(status_code=400, detail=f"Variable {req.dependent_var} not found")
    
    # Convert to numeric
    df[req.dependent_var] = pd.to_numeric(df[req.dependent_var], errors='coerce')
    
    result = {
        "test_type": req.test_type,
        "dependent_var": req.dependent_var
    }
    
    if req.test_type == "mann_whitney":
        # Mann-Whitney U test (two independent samples)
        if not req.group_var or req.group_var not in df.columns:
            raise HTTPException(status_code=400, detail="Group variable required for Mann-Whitney test")
        
        groups = df[req.group_var].dropna().unique()
        if len(groups) != 2:
            raise HTTPException(status_code=400, detail=f"Mann-Whitney test requires exactly 2 groups, found {len(groups)}")
        
        group1_data = df[df[req.group_var] == groups[0]][req.dependent_var].dropna()
        group2_data = df[df[req.group_var] == groups[1]][req.dependent_var].dropna()
        
        if len(group1_data) < 3 or len(group2_data) < 3:
            return {"error": "Each group needs at least 3 observations"}
        
        statistic, p_value = scipy_stats.mannwhitneyu(group1_data, group2_data, alternative='two-sided')
        
        # Effect size (rank-biserial correlation)
        n1, n2 = len(group1_data), len(group2_data)
        r = 1 - (2 * statistic) / (n1 * n2)
        
        result.update({
            "group_var": req.group_var,
            "groups": [
                {"name": str(groups[0]), "n": len(group1_data), "median": round(float(group1_data.median()), 4), "mean_rank": round(float(scipy_stats.rankdata(list(group1_data) + list(group2_data))[:len(group1_data)].mean()), 2)},
                {"name": str(groups[1]), "n": len(group2_data), "median": round(float(group2_data.median()), 4), "mean_rank": round(float(scipy_stats.rankdata(list(group1_data) + list(group2_data))[len(group1_data):].mean()), 2)}
            ],
            "U_statistic": round(float(statistic), 4),
            "p_value": round(float(p_value), 4),
            "effect_size_r": round(float(r), 4),
            "significant": p_value < 0.05,
            "interpretation": "Significant difference between groups" if p_value < 0.05 else "No significant difference between groups"
        })
    
    elif req.test_type == "wilcoxon":
        # Wilcoxon signed-rank test (paired samples)
        if not req.paired_var or req.paired_var not in df.columns:
            raise HTTPException(status_code=400, detail="Paired variable required for Wilcoxon test")
        
        df[req.paired_var] = pd.to_numeric(df[req.paired_var], errors='coerce')
        paired_df = df[[req.dependent_var, req.paired_var]].dropna()
        
        if len(paired_df) < 6:
            return {"error": "Wilcoxon test requires at least 6 paired observations"}
        
        var1 = paired_df[req.dependent_var]
        var2 = paired_df[req.paired_var]
        
        statistic, p_value = scipy_stats.wilcoxon(var1, var2)
        
        # Effect size (matched-pairs rank-biserial)
        diff = var1 - var2
        n = len(diff[diff != 0])
        r = 1 - (2 * statistic) / (n * (n + 1) / 2) if n > 0 else 0
        
        result.update({
            "paired_var": req.paired_var,
            "n_pairs": len(paired_df),
            "var1_median": round(float(var1.median()), 4),
            "var2_median": round(float(var2.median()), 4),
            "median_diff": round(float((var1 - var2).median()), 4),
            "W_statistic": round(float(statistic), 4),
            "p_value": round(float(p_value), 4),
            "effect_size_r": round(float(r), 4),
            "significant": bool(p_value < 0.05),
            "interpretation": "Significant difference between paired observations" if p_value < 0.05 else "No significant difference between paired observations"
        })
    
    elif req.test_type == "kruskal_wallis":
        # Kruskal-Wallis H test (>2 independent groups)
        if not req.group_var or req.group_var not in df.columns:
            raise HTTPException(status_code=400, detail="Group variable required for Kruskal-Wallis test")
        
        groups = df[req.group_var].dropna().unique()
        if len(groups) < 2:
            raise HTTPException(status_code=400, detail="Kruskal-Wallis test requires at least 2 groups")
        
        group_data = []
        group_stats = []
        for g in groups:
            gdata = df[df[req.group_var] == g][req.dependent_var].dropna()
            if len(gdata) >= 2:
                group_data.append(gdata)
                group_stats.append({
                    "name": str(g),
                    "n": len(gdata),
                    "median": round(float(gdata.median()), 4),
                    "mean": round(float(gdata.mean()), 4)
                })
        
        if len(group_data) < 2:
            return {"error": "Need at least 2 groups with sufficient data"}
        
        statistic, p_value = scipy_stats.kruskal(*group_data)
        
        # Effect size (eta-squared)
        n_total = sum(len(g) for g in group_data)
        k = len(group_data)
        eta_sq = (statistic - k + 1) / (n_total - k) if n_total > k else 0
        
        # Post-hoc Dunn test (pairwise comparisons)
        posthoc_results = []
        if p_value < 0.05 and len(groups) > 2:
            for i, g1 in enumerate(groups):
                for j, g2 in enumerate(groups):
                    if i < j:
                        d1 = df[df[req.group_var] == g1][req.dependent_var].dropna()
                        d2 = df[df[req.group_var] == g2][req.dependent_var].dropna()
                        if len(d1) >= 2 and len(d2) >= 2:
                            u_stat, u_p = scipy_stats.mannwhitneyu(d1, d2, alternative='two-sided')
                            # Bonferroni correction
                            adj_p = min(1.0, u_p * (len(groups) * (len(groups) - 1) / 2))
                            posthoc_results.append({
                                "group1": str(g1),
                                "group2": str(g2),
                                "U_statistic": round(float(u_stat), 4),
                                "p_value": round(float(u_p), 4),
                                "adj_p_value": round(float(adj_p), 4),
                                "significant": bool(adj_p < 0.05)
                            })
        
        result.update({
            "group_var": req.group_var,
            "n_groups": len(group_data),
            "groups": group_stats,
            "H_statistic": round(float(statistic), 4),
            "df": len(group_data) - 1,
            "p_value": round(float(p_value), 4),
            "eta_squared": round(float(eta_sq), 4),
            "significant": bool(p_value < 0.05),
            "posthoc": posthoc_results if posthoc_results else None,
            "interpretation": "Significant difference among groups" if p_value < 0.05 else "No significant difference among groups"
        })
    
    elif req.test_type == "friedman":
        # Friedman test (repeated measures, >2 conditions)
        raise HTTPException(status_code=501, detail="Friedman test requires repeated measures data structure")
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown test type: {req.test_type}")
    
    return result


# ============ Proportions Tests ============

class ProportionsRequest(BaseModel):
    snapshot_id: Optional[str] = None
    form_id: Optional[str] = None
    org_id: str
    test_type: str  # one_sample, two_sample, chi_square
    variable: str
    success_value: Optional[str] = None  # Value to count as "success"
    hypothesized_prop: Optional[float] = None  # For one-sample test
    group_var: Optional[str] = None  # For two-sample test


@router.post("/proportions")
async def run_proportions_test(
    request: Request,
    req: ProportionsRequest
):
    """Run proportions tests (one-sample, two-sample, chi-square)"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    if req.variable not in df.columns:
        raise HTTPException(status_code=400, detail=f"Variable {req.variable} not found")
    
    result = {
        "test_type": req.test_type,
        "variable": req.variable
    }
    
    if req.test_type == "one_sample":
        # One-sample proportions test
        if req.hypothesized_prop is None:
            raise HTTPException(status_code=400, detail="Hypothesized proportion required")
        if not req.success_value:
            raise HTTPException(status_code=400, detail="Success value required")
        
        valid_data = df[req.variable].dropna()
        n = len(valid_data)
        successes = (valid_data == req.success_value).sum()
        observed_prop = successes / n if n > 0 else 0
        
        # Z-test for proportion
        p0 = req.hypothesized_prop
        se = np.sqrt(p0 * (1 - p0) / n) if n > 0 else 0
        z = (observed_prop - p0) / se if se > 0 else 0
        p_value = 2 * (1 - scipy_stats.norm.cdf(abs(z)))
        
        # Confidence interval
        se_ci = np.sqrt(observed_prop * (1 - observed_prop) / n) if n > 0 else 0
        ci_lower = observed_prop - 1.96 * se_ci
        ci_upper = observed_prop + 1.96 * se_ci
        
        result.update({
            "success_value": req.success_value,
            "n": n,
            "successes": int(successes),
            "observed_proportion": round(float(observed_prop), 4),
            "hypothesized_proportion": req.hypothesized_prop,
            "z_statistic": round(float(z), 4),
            "p_value": round(float(p_value), 4),
            "ci_95": [round(float(max(0, ci_lower)), 4), round(float(min(1, ci_upper)), 4)],
            "significant": p_value < 0.05
        })
    
    elif req.test_type == "two_sample":
        # Two-sample proportions test
        if not req.group_var or req.group_var not in df.columns:
            raise HTTPException(status_code=400, detail="Group variable required")
        if not req.success_value:
            raise HTTPException(status_code=400, detail="Success value required")
        
        groups = df[req.group_var].dropna().unique()
        if len(groups) != 2:
            raise HTTPException(status_code=400, detail="Two-sample test requires exactly 2 groups")
        
        g1_data = df[df[req.group_var] == groups[0]][req.variable].dropna()
        g2_data = df[df[req.group_var] == groups[1]][req.variable].dropna()
        
        n1, n2 = len(g1_data), len(g2_data)
        x1 = (g1_data == req.success_value).sum()
        x2 = (g2_data == req.success_value).sum()
        p1, p2 = x1/n1 if n1 > 0 else 0, x2/n2 if n2 > 0 else 0
        
        # Pooled proportion
        p_pooled = (x1 + x2) / (n1 + n2) if (n1 + n2) > 0 else 0
        se = np.sqrt(p_pooled * (1 - p_pooled) * (1/n1 + 1/n2)) if n1 > 0 and n2 > 0 else 0
        z = (p1 - p2) / se if se > 0 else 0
        p_value = 2 * (1 - scipy_stats.norm.cdf(abs(z)))
        
        result.update({
            "group_var": req.group_var,
            "success_value": req.success_value,
            "groups": [
                {"name": str(groups[0]), "n": n1, "successes": int(x1), "proportion": round(float(p1), 4)},
                {"name": str(groups[1]), "n": n2, "successes": int(x2), "proportion": round(float(p2), 4)}
            ],
            "difference": round(float(p1 - p2), 4),
            "z_statistic": round(float(z), 4),
            "p_value": round(float(p_value), 4),
            "significant": p_value < 0.05
        })
    
    elif req.test_type == "chi_square":
        # Chi-square test for independence
        if not req.group_var or req.group_var not in df.columns:
            raise HTTPException(status_code=400, detail="Group variable required for chi-square test")
        
        # Create contingency table
        contingency = pd.crosstab(df[req.variable], df[req.group_var])
        
        chi2, p_value, dof, expected = scipy_stats.chi2_contingency(contingency)
        
        # Effect size (Cramér's V)
        n = contingency.sum().sum()
        min_dim = min(contingency.shape) - 1
        cramers_v = np.sqrt(chi2 / (n * min_dim)) if n > 0 and min_dim > 0 else 0
        
        result.update({
            "group_var": req.group_var,
            "contingency_table": contingency.to_dict(),
            "chi_square": round(float(chi2), 4),
            "df": int(dof),
            "p_value": round(float(p_value), 4),
            "cramers_v": round(float(cramers_v), 4),
            "significant": p_value < 0.05
        })
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown test type: {req.test_type}")
    
    return result


# ============ Regression ============

@router.post("/regression")
async def run_regression(
    request: Request,
    req: RegressionRequest
):
    """Run regression analysis (OLS, logistic, or Poisson)"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, req.snapshot_id, req.form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    # Check variables exist
    all_vars = [req.dependent_var] + req.independent_vars
    missing_vars = [v for v in all_vars if v not in df.columns]
    if missing_vars:
        raise HTTPException(status_code=400, detail=f"Variables not found: {missing_vars}")
    
    # Prepare data
    df_model = df[all_vars].apply(pd.to_numeric, errors='coerce').dropna()
    
    if len(df_model) < len(req.independent_vars) + 10:
        return {"error": "Insufficient data for regression"}
    
    import statsmodels.api as sm
    
    y = df_model[req.dependent_var]
    X = df_model[req.independent_vars]
    X = sm.add_constant(X)  # Add intercept
    
    try:
        if req.model_type == "ols":
            model = sm.OLS(y, X)
            if req.robust_se:
                results = model.fit(cov_type='HC3')
            else:
                results = model.fit()
        
        elif req.model_type == "logistic":
            model = sm.Logit(y, X)
            results = model.fit(disp=0)
        
        elif req.model_type == "poisson":
            model = sm.Poisson(y, X)
            results = model.fit(disp=0)
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown model type: {req.model_type}")
        
        # Extract results
        coef_df = pd.DataFrame({
            'coefficient': results.params,
            'std_error': results.bse,
            't_statistic' if req.model_type == "ols" else 'z_statistic': results.tvalues,
            'p_value': results.pvalues,
            'ci_lower': results.conf_int()[0],
            'ci_upper': results.conf_int()[1]
        })
        
        coefficients = []
        for var_name, row in coef_df.iterrows():
            field_schema = next((f for f in schema if f.get("id") == var_name), {})
            coefficients.append({
                "variable": var_name,
                "label": field_schema.get("label", var_name),
                "coefficient": round(float(row['coefficient']), 4),
                "std_error": round(float(row['std_error']), 4),
                "test_statistic": round(float(row['t_statistic' if req.model_type == "ols" else 'z_statistic']), 4),
                "p_value": round(float(row['p_value']), 4),
                "significant": bool(row['p_value'] < 0.05),
                "ci_95": [round(float(row['ci_lower']), 4), round(float(row['ci_upper']), 4)]
            })
        
        model_fit = {
            "n_observations": int(results.nobs),
            "df_model": int(results.df_model),
            "df_residuals": int(results.df_resid)
        }
        
        if req.model_type == "ols":
            model_fit.update({
                "r_squared": round(float(results.rsquared), 4),
                "r_squared_adj": round(float(results.rsquared_adj), 4),
                "f_statistic": round(float(results.fvalue), 4),
                "f_p_value": round(float(results.f_pvalue), 4),
                "aic": round(float(results.aic), 2),
                "bic": round(float(results.bic), 2)
            })
        else:
            model_fit.update({
                "pseudo_r_squared": round(float(results.prsquared), 4),
                "log_likelihood": round(float(results.llf), 2),
                "aic": round(float(results.aic), 2),
                "bic": round(float(results.bic), 2)
            })
        
        return {
            "model_type": req.model_type,
            "dependent_variable": req.dependent_var,
            "independent_variables": req.independent_vars,
            "robust_standard_errors": req.robust_se,
            "model_fit": model_fit,
            "coefficients": coefficients
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model estimation failed: {str(e)}")


# ============ Non-parametric Tests ============

@router.post("/nonparametric/mannwhitney")
async def run_mann_whitney(
    request: Request,
    snapshot_id: Optional[str] = None,
    form_id: Optional[str] = None,
    org_id: str = Query(...),
    variable: str = Query(...),
    group_var: str = Query(...)
):
    """Mann-Whitney U test (non-parametric alternative to independent t-test)"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, snapshot_id, form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    groups = df[group_var].dropna().unique()
    if len(groups) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 groups required")
    
    group1 = pd.to_numeric(df[df[group_var] == groups[0]][variable], errors='coerce').dropna()
    group2 = pd.to_numeric(df[df[group_var] == groups[1]][variable], errors='coerce').dropna()
    
    stat, p_value = scipy_stats.mannwhitneyu(group1, group2, alternative='two-sided')
    
    # Effect size (rank-biserial correlation)
    n1, n2 = len(group1), len(group2)
    r = 1 - (2 * stat) / (n1 * n2)
    
    return {
        "test": "Mann-Whitney U",
        "variable": variable,
        "group_variable": group_var,
        "groups": {
            str(groups[0]): {"n": int(n1), "median": round(float(group1.median()), 4)},
            str(groups[1]): {"n": int(n2), "median": round(float(group2.median()), 4)}
        },
        "u_statistic": round(float(stat), 4),
        "p_value": round(float(p_value), 4),
        "significant": bool(p_value < 0.05),
        "effect_size": {
            "rank_biserial_r": round(float(r), 4),
            "interpretation": "small" if abs(r) < 0.3 else "medium" if abs(r) < 0.5 else "large"
        }
    }


@router.post("/nonparametric/kruskal")
async def run_kruskal_wallis(
    request: Request,
    snapshot_id: Optional[str] = None,
    form_id: Optional[str] = None,
    org_id: str = Query(...),
    variable: str = Query(...),
    group_var: str = Query(...)
):
    """Kruskal-Wallis H test (non-parametric alternative to one-way ANOVA)"""
    db = request.app.state.db
    
    df, schema = await get_analysis_data(db, snapshot_id, form_id)
    
    if df.empty:
        return {"error": "No data available"}
    
    df_clean = df[[variable, group_var]].dropna()
    df_clean[variable] = pd.to_numeric(df_clean[variable], errors='coerce')
    df_clean = df_clean.dropna()
    
    groups = df_clean.groupby(group_var)[variable].apply(list).to_dict()
    
    if len(groups) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 groups")
    
    h_stat, p_value = scipy_stats.kruskal(*groups.values())
    
    # Effect size (epsilon-squared)
    n = len(df_clean)
    epsilon_sq = (h_stat - len(groups) + 1) / (n - len(groups))
    
    group_stats = {}
    for name, values in groups.items():
        group_stats[str(name)] = {
            "n": len(values),
            "median": round(float(np.median(values)), 4),
            "iqr": round(float(np.percentile(values, 75) - np.percentile(values, 25)), 4)
        }
    
    return {
        "test": "Kruskal-Wallis H",
        "variable": variable,
        "group_variable": group_var,
        "n_groups": len(groups),
        "total_n": n,
        "group_statistics": group_stats,
        "h_statistic": round(float(h_stat), 4),
        "p_value": round(float(p_value), 4),
        "significant": bool(p_value < 0.05),
        "effect_size": {
            "epsilon_squared": round(float(epsilon_sq), 4)
        }
    }
