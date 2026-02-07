/**
 * Report Builder - Create professional analysis reports
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { FileText, Plus, Trash2, MoveUp, MoveDown, Download, Save, FileType, Table, BarChart3, Type, Minus, Loader2, File, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function ReportBuilder({ formId, snapshotId, orgId, getToken }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState({ title: 'Analysis Report', subtitle: '', author: '', sections: [] });

  useEffect(() => {
    fetchTemplates();
  }, [orgId]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/templates/${orgId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setTemplates(await response.json());
    } catch (error) { console.error(error); }
  };

  const addSection = (type) => {
    setReport(prev => ({
      ...prev,
      sections: [...prev.sections, { id: `s_${Date.now()}`, type, title: '', content: '' }]
    }));
  };

  const generateReport = async (format) => {
    setLoading(true);
    try {
      const saveResp = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ org_id: orgId, ...report, form_id: formId, snapshot_id: snapshotId })
      });
      if (!saveResp.ok) throw new Error('Save failed');
      const { id } = await saveResp.json();

      const genResp = await fetch(`${API_URL}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ report_id: id, format, include_appendix: true, include_methodology: true })
      });
      if (genResp.ok) {
        const blob = await genResp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `report.${format}`; a.click();
        toast.success(`Downloaded ${format.toUpperCase()}`);
      }
    } catch (e) { toast.error('Export failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Report Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Title</Label><Input value={report.title} onChange={e => setReport({...report, title: e.target.value})} /></div>
            <div><Label>Author</Label><Input value={report.author} onChange={e => setReport({...report, author: e.target.value})} /></div>
          </div>
          <Separator />
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={() => addSection('text')}><Type className="h-4 w-4 mr-1" />Text</Button>
            <Button size="sm" variant="outline" onClick={() => addSection('table')}><Table className="h-4 w-4 mr-1" />Table</Button>
            <Button size="sm" variant="outline" onClick={() => addSection('page_break')}><Minus className="h-4 w-4 mr-1" />Break</Button>
          </div>
          <ScrollArea className="h-[300px]">
            {report.sections.map((s, i) => (
              <div key={s.id} className="border rounded p-3 mb-2 bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <Badge>{s.type}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => setReport(p => ({...p, sections: p.sections.filter((_,j) => j !== i)}))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                {s.type === 'text' && <Textarea value={s.content} onChange={e => { const secs = [...report.sections]; secs[i].content = e.target.value; setReport({...report, sections: secs}); }} placeholder="Enter content..." />}
                {s.type === 'table' && <p className="text-sm text-slate-500">Table from analysis</p>}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Export</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" variant="outline" onClick={() => generateReport('pdf')} disabled={loading}><File className="h-4 w-4 mr-2" />PDF</Button>
          <Button className="w-full" variant="outline" onClick={() => generateReport('docx')} disabled={loading}><FileSpreadsheet className="h-4 w-4 mr-2" />Word</Button>
          <Button className="w-full" variant="outline" onClick={() => generateReport('html')} disabled={loading}><FileType className="h-4 w-4 mr-2" />HTML</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportBuilder;
