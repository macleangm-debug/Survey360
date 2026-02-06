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

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from scipy import stats as scipy_stats
import warnings

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
                        "statistic": round(shapiro_stat, 4),
                        "p_value": round(shapiro_p, 4),
                        "normal": shapiro_p > 0.05
                    }
                }
            
            # D'Agostino-Pearson (for larger samples)
            if len(series) >= 20:
                dagostino_stat, dagostino_p = scipy_stats.normaltest(series)
                if "normality" not in stats:
                    stats["normality"] = {}
                stats["normality"]["dagostino"] = {
                    "statistic": round(dagostino_stat, 4),
                    "p_value": round(dagostino_p, 4),
                    "normal": dagostino_p > 0.05
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
            "significant": p_value < 0.05,
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
            raise HTTPException(status_code=400, detail="Exactly 2 groups required for independent t-test")
        
        group1_data = pd.to_numeric(df[df[req.group_var] == groups[0]][req.variable], errors='coerce').dropna()
        group2_data = pd.to_numeric(df[df[req.group_var] == groups[1]][req.variable], errors='coerce').dropna()
        
        if len(group1_data) < 2 or len(group2_data) < 2:
            return {"error": "Insufficient data in one or both groups"}
        
        # Levene's test for equality of variances
        levene_stat, levene_p = scipy_stats.levene(group1_data, group2_data)
        equal_var = levene_p > 0.05
        
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
            "significant": p_value < 0.05,
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
            "significant": p_value < 0.05
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
                    "significant": row["p-tukey"] < 0.05
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
                    "significant": p < 0.05 if not np.isnan(p) else None
                })
    
    return {
        "method": req.method,
        "n": n,
        "variables": valid_vars,
        "correlation_matrix": corr_matrix.round(4).to_dict(),
        "p_value_matrix": p_values.round(4).to_dict(),
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
                "significant": row['p_value'] < 0.05,
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
        "significant": p_value < 0.05,
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
        "significant": p_value < 0.05,
        "effect_size": {
            "epsilon_squared": round(float(epsilon_sq), 4)
        }
    }
