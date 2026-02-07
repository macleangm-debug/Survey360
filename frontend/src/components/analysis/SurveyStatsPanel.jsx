/**
 * Survey Statistics Panel - Complex survey design analysis
 * Supports weighted estimates, design effects, and survey regression
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
import { Scale, Layers, Users, TrendingUp, Calculator, Loader2, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function SurveyStatsPanel({ formId, snapshotId, orgId, fields, getToken }) {
  const [activeTest, setActiveTest] = useState('mean');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Survey Design
  const [design, setDesign] = useState({
    strata_var: '',
    cluster_var: '',
    weight_var: '',
    fpc_var: ''
  });

  // Mean config
  const [meanConfig, setMeanConfig] = useState({ variable: '', by_group: '' });
  
  // Proportion config
  const [propConfig, setPropConfig] = useState({ variable: '' });
  
  // Regression config
  const [regConfig, setRegConfig] = useState({
    dependent_var: '',
    independent_vars: [],
    model_type: 'linear'
  });

  // Design effects config
  const [deffConfig, setDeffConfig] = useState({ variables: [] });

  const numericFields = fields.filter(f => ['number', 'integer', 'decimal'].includes(f.type));
  const categoricalFields = fields.filter(f => ['select', 'radio', 'text'].includes(f.type));

  const runSurveyMean = async () => {
    if (!meanConfig.variable) { toast.error('Select a variable'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/survey/mean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          form_id: formId, snapshot_id: snapshotId, org_id: orgId,
          variable: meanConfig.variable,
          by_group: meanConfig.by_group || null,
          design
        })
      });
      if (response.ok) {
        setResults({ type: 'mean', data: await response.json() });
        toast.success('Survey mean calculated');
      } else { toast.error('Calculation failed'); }
    } catch (e) { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const runSurveyProportion = async () => {
    if (!propConfig.variable) { toast.error('Select a variable'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/survey/proportion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          form_id: formId, snapshot_id: snapshotId, org_id: orgId,
          variable: propConfig.variable,
          design
        })
      });
      if (response.ok) {
        setResults({ type: 'proportion', data: await response.json() });
        toast.success('Proportions calculated');
      } else { toast.error('Calculation failed'); }
    } catch (e) { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const runSurveyRegression = async () => {
    if (!regConfig.dependent_var || regConfig.independent_vars.length === 0) {
      toast.error('Select dependent and independent variables'); return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/survey/regression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          form_id: formId, snapshot_id: snapshotId, org_id: orgId,
          dependent_var: regConfig.dependent_var,
          independent_vars: regConfig.independent_vars,
          model_type: regConfig.model_type,
          design
        })
      });
      if (response.ok) {
        setResults({ type: 'regression', data: await response.json() });
        toast.success('Regression completed');
      } else { toast.error('Regression failed'); }
    } catch (e) { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const runDesignEffects = async () => {
    if (deffConfig.variables.length === 0) { toast.error('Select variables'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/survey/design-effects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          form_id: formId, snapshot_id: snapshotId, org_id: orgId,
          variables: deffConfig.variables,
          design
        })
      });
      if (response.ok) {
        setResults({ type: 'deff', data: await response.json() });
        toast.success('Design effects calculated');
      } else { toast.error('Calculation failed'); }
    } catch (e) { toast.error('Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Design & Config */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" />Survey Statistics</CardTitle>
          <CardDescription>Complex survey analysis with proper variance estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[550px] pr-4">
            {/* Survey Design Section */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium flex items-center gap-2"><Layers className="h-4 w-4" />Survey Design</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Strata Variable</Label>
                  <Select value={design.strata_var || "none"} onValueChange={v => setDesign({...design, strata_var: v === "none" ? "" : v})}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categoricalFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Cluster/PSU Variable</Label>
                  <Select value={design.cluster_var || "none"} onValueChange={v => setDesign({...design, cluster_var: v === "none" ? "" : v})}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {fields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Weight Variable</Label>
                  <Select value={design.weight_var || "none"} onValueChange={v => setDesign({...design, weight_var: v === "none" ? "" : v})}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {numericFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Analysis Type */}
            <Tabs value={activeTest} onValueChange={setActiveTest}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="mean">Mean</TabsTrigger>
                <TabsTrigger value="prop">Prop</TabsTrigger>
                <TabsTrigger value="reg">Reg</TabsTrigger>
                <TabsTrigger value="deff">DEFF</TabsTrigger>
              </TabsList>

              <TabsContent value="mean" className="space-y-3 mt-4">
                <div>
                  <Label>Variable</Label>
                  <Select value={meanConfig.variable} onValueChange={v => setMeanConfig({...meanConfig, variable: v})}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {numericFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Group By (optional)</Label>
                  <Select value={meanConfig.by_group} onValueChange={v => setMeanConfig({...meanConfig, by_group: v})}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categoricalFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={runSurveyMean} disabled={loading} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Calculate Mean
                </Button>
              </TabsContent>

              <TabsContent value="prop" className="space-y-3 mt-4">
                <div>
                  <Label>Categorical Variable</Label>
                  <Select value={propConfig.variable} onValueChange={v => setPropConfig({...propConfig, variable: v})}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {categoricalFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={runSurveyProportion} disabled={loading} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Calculate Proportions
                </Button>
              </TabsContent>

              <TabsContent value="reg" className="space-y-3 mt-4">
                <div>
                  <Label>Dependent Variable (Y)</Label>
                  <Select value={regConfig.dependent_var} onValueChange={v => setRegConfig({...regConfig, dependent_var: v})}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {numericFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model Type</Label>
                  <Select value={regConfig.model_type} onValueChange={v => setRegConfig({...regConfig, model_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear (OLS)</SelectItem>
                      <SelectItem value="logistic">Logistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Independent Variables</Label>
                  <div className="border rounded p-2 max-h-[120px] overflow-y-auto space-y-1">
                    {fields.filter(f => f.id !== regConfig.dependent_var).map(f => (
                      <div key={f.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={regConfig.independent_vars.includes(f.id)}
                          onCheckedChange={c => {
                            if (c) setRegConfig({...regConfig, independent_vars: [...regConfig.independent_vars, f.id]});
                            else setRegConfig({...regConfig, independent_vars: regConfig.independent_vars.filter(v => v !== f.id)});
                          }}
                        />
                        <span className="text-sm">{f.label || f.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={runSurveyRegression} disabled={loading} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Run Regression
                </Button>
              </TabsContent>

              <TabsContent value="deff" className="space-y-3 mt-4">
                <div>
                  <Label>Variables</Label>
                  <div className="border rounded p-2 max-h-[150px] overflow-y-auto space-y-1">
                    {numericFields.map(f => (
                      <div key={f.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={deffConfig.variables.includes(f.id)}
                          onCheckedChange={c => {
                            if (c) setDeffConfig({...deffConfig, variables: [...deffConfig.variables, f.id]});
                            else setDeffConfig({...deffConfig, variables: deffConfig.variables.filter(v => v !== f.id)});
                          }}
                        />
                        <span className="text-sm">{f.label || f.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={runDesignEffects} disabled={loading} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Calculate DEFF
                </Button>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Survey-weighted estimates with design-based standard errors</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>
          ) : results ? (
            <ScrollArea className="h-[500px]">
              {results.type === 'mean' && <MeanResults data={results.data} />}
              {results.type === 'proportion' && <ProportionResults data={results.data} />}
              {results.type === 'regression' && <RegressionResults data={results.data} />}
              {results.type === 'deff' && <DeffResults data={results.data} />}
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Configure survey design and run analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MeanResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-sky-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-sky-700">{data.estimate}</p>
          <p className="text-sm text-slate-600">Estimate</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg text-center">
          <p className="text-2xl font-bold">{data.std_error}</p>
          <p className="text-sm text-slate-600">Std. Error</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg text-center">
          <p className="text-2xl font-bold">{data.n}</p>
          <p className="text-sm text-slate-600">N</p>
        </div>
      </div>
      <div className="p-3 bg-amber-50 rounded-lg">
        <p className="text-sm"><strong>95% CI:</strong> [{data.confidence_interval?.lower}, {data.confidence_interval?.upper}]</p>
        <p className="text-sm"><strong>Design Effect:</strong> {data.design_effect} | <strong>Effective N:</strong> {data.effective_n}</p>
      </div>
      {data.subgroups && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Subgroup Estimates</h4>
          <div className="space-y-2">
            {Object.entries(data.subgroups).map(([group, stats]) => (
              <div key={group} className="flex justify-between p-2 bg-slate-50 rounded">
                <span>{group}</span>
                <span>M={stats.estimate} (SE={stats.std_error}, N={stats.n})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProportionResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge>{data.variable}</Badge>
        <span className="text-sm text-slate-500">N = {data.total_n}</span>
      </div>
      <div className="space-y-2">
        {data.proportions?.map((p, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{p.value}</span>
              <Badge variant="outline">{p.percent}%</Badge>
            </div>
            <div className="text-sm text-slate-600 mt-1">
              SE: {p.std_error} | 95% CI: [{p.confidence_interval?.lower?.toFixed(3)}, {p.confidence_interval?.upper?.toFixed(3)}]
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${p.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegressionResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge>{data.model_type === 'linear' ? 'OLS' : 'Logistic'} Regression</Badge>
        <Badge variant="outline">{data.se_type}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-slate-50 rounded"><p className="text-sm text-slate-500">R²</p><p className="font-bold">{data.model_fit?.r_squared || '-'}</p></div>
        <div className="p-3 bg-slate-50 rounded"><p className="text-sm text-slate-500">Adj R²</p><p className="font-bold">{data.model_fit?.adj_r_squared || '-'}</p></div>
        <div className="p-3 bg-slate-50 rounded"><p className="text-sm text-slate-500">N</p><p className="font-bold">{data.model_fit?.n}</p></div>
      </div>
      <h4 className="font-medium mt-4">Coefficients</h4>
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-slate-50"><th className="p-2 text-left">Variable</th><th className="p-2 text-right">Coef</th><th className="p-2 text-right">SE</th><th className="p-2 text-right">t</th><th className="p-2 text-right">p</th><th className="p-2">Sig</th></tr></thead>
        <tbody>
          {data.coefficients && Object.entries(data.coefficients).map(([name, c]) => (
            <tr key={name} className="border-b">
              <td className="p-2">{name}</td>
              <td className="p-2 text-right">{c.coefficient}</td>
              <td className="p-2 text-right">{c.std_error}</td>
              <td className="p-2 text-right">{c.t_value}</td>
              <td className="p-2 text-right">{c.p_value < 0.001 ? '<.001' : c.p_value}</td>
              <td className="p-2 text-center">{c.significant ? <CheckCircle className="h-4 w-4 text-green-500 inline" /> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeffResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-sky-50 rounded-lg">
        <p className="text-sm"><strong>Average DEFF:</strong> {data.average_deff}</p>
        <p className="text-sm text-slate-600">Observations: {data.design_info?.n_obs} | Clusters: {data.design_info?.n_clusters}</p>
      </div>
      <h4 className="font-medium">Variable Design Effects</h4>
      <div className="space-y-2">
        {data.effects?.map((e, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{e.variable}</span>
              <Badge variant={e.design_effect > 2 ? 'destructive' : 'outline'}>DEFF: {e.design_effect}</Badge>
            </div>
            <div className="text-sm text-slate-600 mt-1">
              N: {e.n} | Effective N: {e.effective_n}
            </div>
            <div className="text-xs text-slate-500 mt-1">{e.interpretation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurveyStatsPanel;
