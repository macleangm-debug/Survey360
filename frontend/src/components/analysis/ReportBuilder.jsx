/**
 * Report Builder - Create professional analysis reports
 * Supports PDF, Word, HTML export with templates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  FileText,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Download,
  Save,
  FileType,
  Table,
  BarChart3,
  Type,
  Minus,
  Loader2,
  File,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SECTION_TYPES = [
  { id: 'text', label: 'Text/Narrative', icon: Type },
  { id: 'table', label: 'Data Table', icon: Table },
  { id: 'chart', label: 'Chart', icon: BarChart3 },
  { id: 'page_break', label: 'Page Break', icon: Minus }
];

export function ReportBuilder({ formId, snapshotId, orgId, getToken }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [report, setReport] = useState({
    title: 'Analysis Report',
    subtitle: '',
    author: '',
    sections: []
  });

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [orgId]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/templates/${orgId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setReport(prev => ({
      ...prev,
      sections: template.sections.map((s, i) => ({
        ...s,
        id: `section_${i}_${Date.now()}`
      }))
    }));
    toast.success(`Template "${template.name}" applied`);
  };

  const addSection = (type) => {
    const newSection = {
      id: `section_${Date.now()}`,
      type,
      title: '',
      content: '',
      data: {}
    };
    setReport(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (index, updates) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => 
        i === index ? { ...s, ...updates } : s
      )
    }));
  };

  const removeSection = (index) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= report.sections.length) return;
    
    setReport(prev => {
      const sections = [...prev.sections];
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections };
    });
  };

  const saveReport = async () => {
    if (!report.title.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          org_id: orgId,
          title: report.title,
          subtitle: report.subtitle,
          author: report.author,
          form_id: formId,
          snapshot_id: snapshotId,
          sections: report.sections,
          template_id: selectedTemplate
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Report saved successfully');
        return data.id;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async (format) => {
    setLoading(true);
    try {
      // First save the report
      const reportId = await saveReport();
      if (!reportId) return;

      // Then generate
      const response = await fetch(`${API_URL}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          report_id: reportId,
          format,
          include_appendix: true,
          include_methodology: true
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${report.title.replace(/\s+/g, '_')}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`Report downloaded as ${format.toUpperCase()}`);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Report Editor */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Builder
              </CardTitle>
              <CardDescription>Create and export analysis reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveReport} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Report Title</Label>
              <Input
                value={report.title}
                onChange={(e) => setReport({ ...report, title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input
                value={report.author}
                onChange={(e) => setReport({ ...report, author: e.target.value })}
                placeholder="Enter author name..."
              />
            </div>
            <div className="col-span-2">
              <Label>Subtitle</Label>
              <Input
                value={report.subtitle}
                onChange={(e) => setReport({ ...report, subtitle: e.target.value })}
                placeholder="Enter subtitle..."
              />
            </div>
          </div>

          <Separator />

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Report Sections</Label>
              <div className="flex gap-2">
                {SECTION_TYPES.map(type => (
                  <Button
                    key={type.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addSection(type.id)}
                  >
                    <type.icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {report.sections.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sections yet</p>
                  <p className="text-sm">Add sections using the buttons above or apply a template</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.sections.map((section, index) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      index={index}
                      total={report.sections.length}
                      onUpdate={(updates) => updateSection(index, updates)}
                      onRemove={() => removeSection(index)}
                      onMove={(dir) => moveSection(index, dir)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>Quick start with a template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-sky-500 bg-sky-50' 
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-slate-500">{template.description}</div>
                  <div className="flex gap-1 mt-2">
                    {template.sections?.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {s.type}
                      </Badge>
                    ))}
                    {template.sections?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.sections.length - 3}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Report</CardTitle>
            <CardDescription>Download in your preferred format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport('pdf')}
                disabled={loading}
              >
                <File className="h-4 w-4 mr-2 text-red-500" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport('docx')}
                disabled={loading}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                Download Word
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport('html')}
                disabled={loading}
              >
                <FileType className="h-4 w-4 mr-2 text-orange-500" />
                Download HTML
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Source</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-1">
            <p><strong>Form:</strong> {formId ? `${formId.slice(0, 8)}...` : 'None'}</p>
            <p><strong>Snapshot:</strong> {snapshotId ? `${snapshotId.slice(0, 8)}...` : 'Live'}</p>
            <p><strong>Org:</strong> {orgId?.slice(0, 8)}...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Section Editor Component
function SectionEditor({ section, index, total, onUpdate, onRemove, onMove }) {
  const typeInfo = SECTION_TYPES.find(t => t.id === section.type);
  const Icon = typeInfo?.icon || FileText;

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {typeInfo?.label || section.type}
          </Badge>
          <span className="text-xs text-slate-500">Section {index + 1}</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove('up')}
            disabled={index === 0}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {section.type !== 'page_break' && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Section Title</Label>
            <Input
              value={section.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter section title..."
              className="text-sm"
            />
          </div>

          {section.type === 'text' && (
            <div>
              <Label className="text-xs">Content (Markdown supported)</Label>
              <Textarea
                value={section.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter text content..."
                className="min-h-[100px] text-sm"
              />
            </div>
          )}

          {section.type === 'table' && (
            <div className="text-xs text-slate-500 bg-white p-2 rounded">
              Table data will be populated from the analysis results.
              Configure the data source in settings.
            </div>
          )}

          {section.type === 'chart' && (
            <div className="text-xs text-slate-500 bg-white p-2 rounded">
              Chart will be rendered from selected statistics.
              Configure the chart type and variables in settings.
            </div>
          )}
        </div>
      )}

      {section.type === 'page_break' && (
        <div className="text-center text-xs text-slate-500 py-2">
          — Page Break —
        </div>
      )}
    </div>
  );
}

export default ReportBuilder;
