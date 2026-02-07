/**
 * Advanced Statistics Panel
 * Provides T-tests, ANOVA, Correlation, and Regression analysis
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import {
  Calculator,
  TrendingUp,
  BarChart3,
  GitCompare,
  Percent,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function AdvancedStatsPanel({ 
  formId, 
  snapshotId, 
  orgId, 
  fields, 
  getToken 
}) {
  const [activeTest, setActiveTest] = useState('ttest');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // T-Test state
  const [ttestConfig, setTtestConfig] = useState({
    testType: 'independent',
    variable: '',
    groupVar: '',
    mu: 0
  });

  // ANOVA state
  const [anovaConfig, setAnovaConfig] = useState({
    dependentVar: '',
    factorVar: '',
    postHoc: true
  });

  // Correlation state
  const [corrConfig, setCorrConfig] = useState({
    variables: [],
    method: 'pearson'
  });

  // Regression state
  const [regConfig, setRegConfig] = useState({
    dependentVar: '',
    independentVars: [],
    modelType: 'ols',
    robustSE: false
  });

  const numericFields = fields.filter(f => f.type === 'number' || f.type === 'integer' || f.type === 'decimal');
  const categoricalFields = fields.filter(f => f.type === 'select' || f.type === 'radio' || f.type === 'text');

  const runTTest = async () => {
    if (!ttestConfig.variable) {
      toast.error('Please select a variable');
      return;
    }
    if (ttestConfig.testType === 'independent' && !ttestConfig.groupVar) {
      toast.error('Please select a grouping variable');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/statistics/ttest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          snapshot_id: snapshotId || null,
          form_id: snapshotId ? null : formId,
          org_id: orgId,
          test_type: ttestConfig.testType,
          variable: ttestConfig.variable,
          group_var: ttestConfig.groupVar || null,
          mu: ttestConfig.testType === 'one_sample' ? parseFloat(ttestConfig.mu) : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults({ type: 'ttest', data });
        toast.success('T-test completed');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'T-test failed');
      }
    } catch (error) {
      toast.error('T-test failed');
    } finally {
      setLoading(false);
    }
  };

  const runANOVA = async () => {
    if (!anovaConfig.dependentVar || !anovaConfig.factorVar) {
      toast.error('Please select both variables');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/statistics/anova`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          snapshot_id: snapshotId || null,
          form_id: snapshotId ? null : formId,
          org_id: orgId,
          dependent_var: anovaConfig.dependentVar,
          factor_var: anovaConfig.factorVar,
          post_hoc: anovaConfig.postHoc
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults({ type: 'anova', data });
        toast.success('ANOVA completed');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'ANOVA failed');
      }
    } catch (error) {
      toast.error('ANOVA failed');
    } finally {
      setLoading(false);
    }
  };

  const runCorrelation = async () => {
    if (corrConfig.variables.length < 2) {
      toast.error('Select at least 2 variables');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/statistics/correlation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          snapshot_id: snapshotId || null,
          form_id: snapshotId ? null : formId,
          org_id: orgId,
          variables: corrConfig.variables,
          method: corrConfig.method
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults({ type: 'correlation', data });
        toast.success('Correlation analysis completed');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Correlation failed');
      }
    } catch (error) {
      toast.error('Correlation failed');
    } finally {
      setLoading(false);
    }
  };

  const runRegression = async () => {
    if (!regConfig.dependentVar || regConfig.independentVars.length === 0) {
      toast.error('Select dependent and independent variables');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/statistics/regression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          snapshot_id: snapshotId || null,
          form_id: snapshotId ? null : formId,
          org_id: orgId,
          dependent_var: regConfig.dependentVar,
          independent_vars: regConfig.independentVars,
          model_type: regConfig.modelType,
          robust_se: regConfig.robustSE
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults({ type: 'regression', data });
        toast.success('Regression completed');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Regression failed');
      }
    } catch (error) {
      toast.error('Regression failed');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    switch (results.type) {
      case 'ttest':
        return <TTestResults data={results.data} />;
      case 'anova':
        return <ANOVAResults data={results.data} />;
      case 'correlation':
        return <CorrelationResults data={results.data} />;
      case 'regression':
        return <RegressionResults data={results.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Advanced Statistics
          </CardTitle>
          <CardDescription>Configure and run statistical tests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTest} onValueChange={setActiveTest}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="ttest">T-Test</TabsTrigger>
              <TabsTrigger value="anova">ANOVA</TabsTrigger>
              <TabsTrigger value="correlation">Correlation</TabsTrigger>
              <TabsTrigger value="regression">Regression</TabsTrigger>
            </TabsList>

            {/* T-Test Configuration */}
            <TabsContent value="ttest" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label>Test Type</Label>
                  <Select 
                    value={ttestConfig.testType} 
                    onValueChange={(v) => setTtestConfig({...ttestConfig, testType: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="independent">Independent Samples</SelectItem>
                      <SelectItem value="one_sample">One Sample</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Test Variable (Numeric)</Label>
                  <Select 
                    value={ttestConfig.variable} 
                    onValueChange={(v) => setTtestConfig({...ttestConfig, variable: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variable..." />
                    </SelectTrigger>
                    <SelectContent>
                      {numericFields.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {ttestConfig.testType === 'independent' && (
                  <div>
                    <Label>Grouping Variable</Label>
                    <Select 
                      value={ttestConfig.groupVar} 
                      onValueChange={(v) => setTtestConfig({...ttestConfig, groupVar: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grouping variable..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoricalFields.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {ttestConfig.testType === 'one_sample' && (
                  <div>
                    <Label>Population Mean (μ₀)</Label>
                    <Input 
                      type="number" 
                      value={ttestConfig.mu}
                      onChange={(e) => setTtestConfig({...ttestConfig, mu: e.target.value})}
                      placeholder="Enter hypothesized mean"
                    />
                  </div>
                )}

                <Button onClick={runTTest} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run T-Test
                </Button>
              </div>
            </TabsContent>

            {/* ANOVA Configuration */}
            <TabsContent value="anova" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label>Dependent Variable (Numeric)</Label>
                  <Select 
                    value={anovaConfig.dependentVar} 
                    onValueChange={(v) => setAnovaConfig({...anovaConfig, dependentVar: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variable..." />
                    </SelectTrigger>
                    <SelectContent>
                      {numericFields.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Factor Variable (Categorical)</Label>
                  <Select 
                    value={anovaConfig.factorVar} 
                    onValueChange={(v) => setAnovaConfig({...anovaConfig, factorVar: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select factor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categoricalFields.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="posthoc"
                    checked={anovaConfig.postHoc}
                    onCheckedChange={(c) => setAnovaConfig({...anovaConfig, postHoc: c})}
                  />
                  <Label htmlFor="posthoc">Include Post-hoc Tests (Tukey HSD)</Label>
                </div>

                <Button onClick={runANOVA} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run One-Way ANOVA
                </Button>
              </div>
            </TabsContent>

            {/* Correlation Configuration */}
            <TabsContent value="correlation" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label>Correlation Method</Label>
                  <Select 
                    value={corrConfig.method} 
                    onValueChange={(v) => setCorrConfig({...corrConfig, method: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pearson">Pearson (Linear)</SelectItem>
                      <SelectItem value="spearman">Spearman (Rank)</SelectItem>
                      <SelectItem value="kendall">Kendall Tau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Variables (select 2+)</Label>
                  <ScrollArea className="h-[200px] border rounded-md p-2">
                    {numericFields.map(f => (
                      <div key={f.id} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`corr-${f.id}`}
                          checked={corrConfig.variables.includes(f.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCorrConfig({...corrConfig, variables: [...corrConfig.variables, f.id]});
                            } else {
                              setCorrConfig({...corrConfig, variables: corrConfig.variables.filter(v => v !== f.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`corr-${f.id}`} className="text-sm">{f.label || f.id}</Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                <Button onClick={runCorrelation} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Calculate Correlations
                </Button>
              </div>
            </TabsContent>

            {/* Regression Configuration */}
            <TabsContent value="regression" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label>Model Type</Label>
                  <Select 
                    value={regConfig.modelType} 
                    onValueChange={(v) => setRegConfig({...regConfig, modelType: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ols">OLS (Linear)</SelectItem>
                      <SelectItem value="logistic">Logistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dependent Variable (Y)</Label>
                  <Select 
                    value={regConfig.dependentVar} 
                    onValueChange={(v) => setRegConfig({...regConfig, dependentVar: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome..." />
                    </SelectTrigger>
                    <SelectContent>
                      {numericFields.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Independent Variables (X)</Label>
                  <ScrollArea className="h-[150px] border rounded-md p-2">
                    {fields.filter(f => f.id !== regConfig.dependentVar).map(f => (
                      <div key={f.id} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`reg-${f.id}`}
                          checked={regConfig.independentVars.includes(f.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRegConfig({...regConfig, independentVars: [...regConfig.independentVars, f.id]});
                            } else {
                              setRegConfig({...regConfig, independentVars: regConfig.independentVars.filter(v => v !== f.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`reg-${f.id}`} className="text-sm">{f.label || f.id}</Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="robust"
                    checked={regConfig.robustSE}
                    onCheckedChange={(c) => setRegConfig({...regConfig, robustSE: c})}
                  />
                  <Label htmlFor="robust">Use Robust Standard Errors</Label>
                </div>

                <Button onClick={runRegression} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run Regression
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Results
          </CardTitle>
          <CardDescription>Statistical test output</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : results ? (
            <ScrollArea className="h-[500px]">
              {renderResults()}
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Run a test to see results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// T-Test Results Component
function TTestResults({ data }) {
  const isSignificant = data.significant;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isSignificant ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Significant
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Not Significant
          </Badge>
        )}
        <span className="text-sm text-slate-500">
          {data.test_type === 'independent' ? 'Independent Samples T-Test' : 'One Sample T-Test'}
        </span>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">T-Statistic</p>
          <p className="text-lg font-semibold">{data.t_statistic}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">P-Value</p>
          <p className={`text-lg font-semibold ${isSignificant ? 'text-red-600' : ''}`}>
            {data.p_value < 0.001 ? '< 0.001' : data.p_value}
          </p>
        </div>
      </div>

      {data.groups && (
        <>
          <Separator />
          <h4 className="font-medium">Group Statistics</h4>
          <div className="space-y-2">
            {Object.entries(data.groups).map(([group, stats]) => (
              <div key={group} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium">{group}</span>
                <span className="text-sm text-slate-600">
                  N={stats.n}, M={stats.mean}, SD={stats.std}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.effect_size && (
        <>
          <Separator />
          <div>
            <p className="text-sm text-slate-500">Effect Size (Cohen's d)</p>
            <p className="text-lg font-semibold">
              {data.effect_size.cohens_d} 
              <span className="text-sm text-slate-500 ml-2">
                ({data.effect_size.interpretation})
              </span>
            </p>
          </div>
        </>
      )}

      {data.confidence_interval && (
        <div className="p-3 bg-sky-50 rounded-lg">
          <p className="text-sm text-slate-600">95% Confidence Interval</p>
          <p className="font-medium">
            [{data.confidence_interval.lower}, {data.confidence_interval.upper}]
          </p>
        </div>
      )}
    </div>
  );
}

// ANOVA Results Component
function ANOVAResults({ data }) {
  const isSignificant = data.anova?.significant;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isSignificant ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Significant
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Not Significant
          </Badge>
        )}
        <span className="text-sm text-slate-500">One-Way ANOVA</span>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-slate-500">F-Statistic</p>
          <p className="text-lg font-semibold">{data.anova?.f_statistic}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">P-Value</p>
          <p className={`text-lg font-semibold ${isSignificant ? 'text-red-600' : ''}`}>
            {data.anova?.p_value < 0.001 ? '< 0.001' : data.anova?.p_value}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Groups</p>
          <p className="text-lg font-semibold">{data.n_groups}</p>
        </div>
      </div>

      {data.group_statistics && (
        <>
          <Separator />
          <h4 className="font-medium">Group Statistics</h4>
          <div className="space-y-2">
            {Object.entries(data.group_statistics).map(([group, stats]) => (
              <div key={group} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium">{group}</span>
                <span className="text-sm text-slate-600">
                  N={stats.n}, M={stats.mean?.toFixed(2)}, SD={stats.std?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.effect_size && (
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-slate-600">Effect Size (η²)</p>
          <p className="font-medium">
            {data.effect_size.eta_squared} 
            <span className="text-sm text-slate-500 ml-2">
              ({data.effect_size.interpretation})
            </span>
          </p>
        </div>
      )}

      {data.post_hoc_tukey && data.post_hoc_tukey.length > 0 && (
        <>
          <Separator />
          <h4 className="font-medium">Post-hoc Comparisons (Tukey HSD)</h4>
          <div className="space-y-2">
            {data.post_hoc_tukey.map((comparison, idx) => (
              <div 
                key={idx} 
                className={`flex justify-between items-center p-2 rounded ${
                  comparison.significant ? 'bg-red-50' : 'bg-slate-50'
                }`}
              >
                <span className="text-sm">
                  {comparison.group_a} vs {comparison.group_b}
                </span>
                <span className="text-sm">
                  Δ = {comparison.mean_diff}, p = {comparison.p_value}
                  {comparison.significant && <span className="text-red-600 ml-1">*</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Correlation Results Component
function CorrelationResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{data.method} Correlation</Badge>
        <span className="text-sm text-slate-500">N = {data.n}</span>
      </div>

      <Separator />

      <h4 className="font-medium">Correlation Matrix</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left"></th>
              {data.variables.map(v => (
                <th key={v} className="p-2 text-center font-medium">{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.variables.map(v1 => (
              <tr key={v1} className="border-b">
                <td className="p-2 font-medium">{v1}</td>
                {data.variables.map(v2 => {
                  const r = data.correlation_matrix?.[v1]?.[v2];
                  const p = data.p_value_matrix?.[v1]?.[v2];
                  const isSignificant = p !== null && p < 0.05;
                  return (
                    <td 
                      key={v2} 
                      className={`p-2 text-center ${
                        v1 === v2 ? 'bg-slate-100' : 
                        isSignificant ? 'bg-sky-50' : ''
                      }`}
                    >
                      {r !== null ? r.toFixed(3) : '-'}
                      {isSignificant && v1 !== v2 && <span className="text-sky-600">*</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pairwise_correlations && data.pairwise_correlations.length > 0 && (
        <>
          <Separator />
          <h4 className="font-medium">Significant Correlations</h4>
          <div className="space-y-2">
            {data.pairwise_correlations
              .filter(c => c.significant)
              .map((corr, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-sky-50 rounded">
                  <span className="text-sm">{corr.var1} ↔ {corr.var2}</span>
                  <span className="text-sm font-medium">
                    r = {corr.correlation}, p = {corr.p_value < 0.001 ? '< .001' : corr.p_value}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

// Regression Results Component
function RegressionResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {data.model_type === 'ols' ? 'OLS Regression' : 'Logistic Regression'}
        </Badge>
        <span className="text-sm text-slate-500">N = {data.n}</span>
      </div>

      <Separator />

      {/* Model Fit */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-slate-50 rounded">
          <p className="text-sm text-slate-500">R²</p>
          <p className="text-lg font-semibold">{data.model_fit?.r_squared?.toFixed(4)}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <p className="text-sm text-slate-500">Adj. R²</p>
          <p className="text-lg font-semibold">{data.model_fit?.adj_r_squared?.toFixed(4)}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <p className="text-sm text-slate-500">F-Statistic</p>
          <p className="text-lg font-semibold">{data.model_fit?.f_statistic?.toFixed(2)}</p>
          <p className="text-xs text-slate-500">p = {data.model_fit?.f_pvalue?.toFixed(4)}</p>
        </div>
      </div>

      <Separator />

      {/* Coefficients Table */}
      <h4 className="font-medium">Coefficients</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-2 text-left">Variable</th>
              <th className="p-2 text-right">Coef</th>
              <th className="p-2 text-right">SE</th>
              <th className="p-2 text-right">t</th>
              <th className="p-2 text-right">p-value</th>
              <th className="p-2 text-center">Sig</th>
            </tr>
          </thead>
          <tbody>
            {data.coefficients && Object.entries(data.coefficients).map(([varName, coef]) => (
              <tr key={varName} className="border-b">
                <td className="p-2 font-medium">{varName}</td>
                <td className="p-2 text-right">{coef.coefficient?.toFixed(4)}</td>
                <td className="p-2 text-right">{coef.std_error?.toFixed(4)}</td>
                <td className="p-2 text-right">{coef.t_value?.toFixed(2)}</td>
                <td className="p-2 text-right">
                  {coef.p_value < 0.001 ? '< .001' : coef.p_value?.toFixed(4)}
                </td>
                <td className="p-2 text-center">
                  {coef.significant ? (
                    <span className="text-red-600 font-bold">*</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Diagnostics */}
      {data.diagnostics && (
        <>
          <Separator />
          <h4 className="font-medium">Model Diagnostics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-sm text-slate-500">AIC</p>
              <p className="font-medium">{data.diagnostics.aic?.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-sm text-slate-500">BIC</p>
              <p className="font-medium">{data.diagnostics.bic?.toFixed(2)}</p>
            </div>
          </div>
        </>
      )}

      <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
        <Info className="h-4 w-4 text-amber-600 mt-0.5" />
        <p className="text-sm text-amber-800">
          * indicates significance at p &lt; 0.05 level
        </p>
      </div>
    </div>
  );
}

export default AdvancedStatsPanel;
