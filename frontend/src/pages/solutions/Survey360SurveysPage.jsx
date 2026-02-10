import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, MoreVertical, Play, Pause, Copy, Trash2, Edit3, BarChart3, ExternalLink, Link2, Share2, QrCode, Code, Download, Check, LayoutTemplate, Smile, Users, Calendar, Package, TrendingUp, Globe, Sparkles, ArrowRight, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useOrgStore } from '../../store';
import survey360Api from '../../lib/survey360Api';
import { toast } from 'sonner';

// Template icons mapping
const templateIcons = {
  smile: Smile,
  users: Users,
  calendar: Calendar,
  package: Package,
  'trending-up': TrendingUp,
  globe: Globe
};

// Template Library Component
function TemplateLibrary({ open, onOpenChange, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await survey360Api.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    setCreating(templateId);
    try {
      const response = await survey360Api.post(`/templates/${templateId}/create`);
      toast.success('Survey created from template!');
      onSelectTemplate(response.data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create from template:', error);
      toast.error(error.response?.data?.detail || 'Failed to create survey');
    } finally {
      setCreating(null);
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'hr', name: 'HR & Team' },
    { id: 'events', name: 'Events' },
    { id: 'research', name: 'Research' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1628] border-white/10 max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            Quick-Start Templates
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a template to get started quickly with pre-built questions
          </DialogDescription>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap py-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id 
                ? 'bg-teal-500 text-white border-0' 
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/10" />
                    <div className="flex-1">
                      <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-white/10 rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No templates found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              {filteredTemplates.map(template => {
                const IconComponent = templateIcons[template.icon] || ClipboardList;
                return (
                  <div 
                    key={template.id}
                    className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:border-teal-500/50 transition-all cursor-pointer"
                    onClick={() => handleCreateFromTemplate(template.id)}
                    data-testid={`template-${template.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: template.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold group-hover:text-teal-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-gray-500">
                            {template.questions.length} questions
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 capitalize">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {creating === template.id ? (
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-teal-500 flex items-center justify-center transition-colors">
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-white/10 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Share Modal Component
function ShareModal({ survey, open, onOpenChange }) {
  const [copied, setCopied] = useState(null);
  const qrRef = useRef(null);
  
  if (!survey) return null;
  
  const publicUrl = `${window.location.origin}/s/${survey.id}`;
  
  const embedCode = `<iframe 
  src="${publicUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border: none; border-radius: 8px;"
  title="${survey.name}"
></iframe>`;

  const embedCodeMinimal = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${survey.name.replace(/[^a-z0-9]/gi, '_')}_qr.png`;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1d32] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-400" />
            Share Survey
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {survey.name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="link" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              <Link2 className="w-4 h-4 mr-2" />Link
            </TabsTrigger>
            <TabsTrigger value="qr" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              <QrCode className="w-4 h-4 mr-2" />QR Code
            </TabsTrigger>
            <TabsTrigger value="embed" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              <Code className="w-4 h-4 mr-2" />Embed
            </TabsTrigger>
          </TabsList>
          
          {/* Link Tab */}
          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Public Survey Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={publicUrl} 
                  readOnly 
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                />
                <Button 
                  onClick={() => copyToClipboard(publicUrl, 'link')}
                  className="bg-teal-500 hover:bg-teal-600 text-white shrink-0"
                >
                  {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Share this link with anyone to collect responses. No login required for respondents.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.open(publicUrl, '_blank')}
              className="w-full border-white/10 text-gray-300 hover:bg-white/5"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Survey in New Tab
            </Button>
          </TabsContent>
          
          {/* QR Code Tab */}
          <TabsContent value="qr" className="mt-4 space-y-4">
            <div className="flex flex-col items-center">
              <div ref={qrRef} className="bg-white p-4 rounded-lg">
                <QRCodeSVG 
                  value={publicUrl} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Scan this QR code to open the survey on any device
              </p>
            </div>
            <Button 
              onClick={downloadQR}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code (PNG)
            </Button>
          </TabsContent>
          
          {/* Embed Tab */}
          <TabsContent value="embed" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Embed Code</Label>
              <div className="relative">
                <pre className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {embedCode}
                </pre>
                <Button 
                  size="sm"
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-600 text-white h-7 px-2"
                >
                  {copied === 'embed' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Paste this code into your website's HTML to embed the survey directly on your page.
            </p>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Minimal Version</Label>
              <div className="flex gap-2">
                <Input 
                  value={embedCodeMinimal} 
                  readOnly 
                  className="bg-white/5 border-white/10 text-white font-mono text-xs"
                />
                <Button 
                  onClick={() => copyToClipboard(embedCodeMinimal, 'minimal')}
                  className="bg-teal-500 hover:bg-teal-600 text-white shrink-0"
                >
                  {copied === 'minimal' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function Survey360SurveysPage() {
  const navigate = useNavigate();
  const { currentOrg } = useOrgStore();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSurveyForShare, setSelectedSurveyForShare] = useState(null);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, [currentOrg]);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const response = await survey360Api.get('/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (survey) => {
    setSurveys([...surveys, survey]);
    navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`);
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.name.trim()) { 
      toast.error('Survey name is required'); 
      return; 
    }
    setCreating(true);
    try {
      const response = await survey360Api.post('/surveys', {
        name: newSurvey.name,
        description: newSurvey.description,
        questions: []
      });
      setSurveys([...surveys, response.data]);
      setCreateDialogOpen(false);
      setNewSurvey({ name: '', description: '' });
      toast.success('Survey created');
      navigate(`/solutions/survey360/app/surveys/${response.data.id}/edit`);
    } catch (error) {
      console.error('Failed to create survey:', error);
      toast.error('Failed to create survey');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (e, survey) => {
    e.stopPropagation();
    try {
      if (survey.status === 'published') {
        // Unpublish - update status to draft
        await survey360Api.put(`/surveys/${survey.id}`, { status: 'draft' });
        setSurveys(surveys.map(s => s.id === survey.id ? { ...s, status: 'draft' } : s));
        toast.success('Survey unpublished');
      } else {
        // Publish
        await survey360Api.post(`/surveys/${survey.id}/publish`);
        setSurveys(surveys.map(s => s.id === survey.id ? { ...s, status: 'published' } : s));
        toast.success('Survey published');
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update survey status');
    }
  };

  const handleDuplicate = async (e, survey) => {
    e.stopPropagation();
    try {
      const response = await survey360Api.post(`/surveys/${survey.id}/duplicate`);
      setSurveys([...surveys, response.data]);
      toast.success('Survey duplicated');
    } catch (error) {
      console.error('Failed to duplicate survey:', error);
      toast.error('Failed to duplicate survey');
    }
  };

  const handleDelete = async (e, survey) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${survey.name}"?`)) return;
    try {
      await survey360Api.delete(`/surveys/${survey.id}`);
      setSurveys(surveys.filter(s => s.id !== survey.id));
      toast.success('Survey deleted');
    } catch (error) {
      console.error('Failed to delete survey:', error);
      toast.error('Failed to delete survey');
    }
  };

  const openShareModal = (e, survey) => {
    e.stopPropagation();
    setSelectedSurveyForShare(survey);
    setShareModalOpen(true);
  };

  const openPublicSurvey = (e, survey) => {
    e.stopPropagation();
    window.open(`/s/${survey.id}`, '_blank');
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6" data-testid="surveys-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-white">Surveys</h1><p className="text-gray-400">Create and manage your surveys</p></div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setTemplateLibraryOpen(true)} 
            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
            data-testid="templates-btn"
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Start from Template
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0" data-testid="new-survey-btn"><Plus className="w-4 h-4 mr-2" />New Survey</Button></DialogTrigger>
            <DialogContent className="bg-[#0f1d32] border-white/10">
              <DialogHeader><DialogTitle className="text-white">Create Survey</DialogTitle><DialogDescription className="text-gray-400">Add a new survey</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label className="text-gray-300">Survey Name</Label><Input value={newSurvey.name} onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="e.g., Customer Feedback" data-testid="survey-name-input" /></div>
                <div className="space-y-2"><Label className="text-gray-300">Description</Label><Textarea value={newSurvey.description} onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })} className="bg-white/5 border-white/10 text-white" rows={3} data-testid="survey-desc-input" /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-white/10 text-gray-300">Cancel</Button><Button onClick={handleCreateSurvey} disabled={creating} className="bg-teal-500 text-white" data-testid="create-survey-btn">{creating ? 'Creating...' : 'Create'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><Input placeholder="Search surveys..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white" data-testid="search-surveys" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40 bg-white/5 border-white/10 text-gray-300"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0f1d32] border-white/10"><SelectItem value="all" className="text-gray-300">All Status</SelectItem><SelectItem value="draft" className="text-gray-300">Draft</SelectItem><SelectItem value="published" className="text-gray-300">Published</SelectItem></SelectContent></Select>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardHeader><Skeleton className="h-6 w-3/4 bg-white/10" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full bg-white/10 mb-2" /><Skeleton className="h-4 w-1/2 bg-white/10" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No surveys yet</h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            Create your first survey to start collecting responses
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-teal-500 text-white">
            <Plus className="w-4 h-4 mr-2" />Create Survey
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="bg-white/5 border-white/10 hover:border-teal-500/50 cursor-pointer group" data-testid={`survey-card-${survey.id}`} onClick={() => navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-teal-400" /></div>
                    <div>
                      <CardTitle className="text-lg text-white group-hover:text-teal-400 line-clamp-1">{survey.name}</CardTitle>
                      <Badge className={survey.status === 'published' ? 'bg-teal-500/20 text-teal-400 border-0' : 'bg-white/10 text-gray-400 border-0'}>{survey.status}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0f1d32] border-white/10" align="end">
                      <DropdownMenuItem onClick={(e) => navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`)} className="text-gray-300 cursor-pointer">
                        <Edit3 className="w-4 h-4 mr-2" />Edit Survey
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleTogglePublish(e, survey)} className="text-gray-300 cursor-pointer">
                        {survey.status === 'published' ? (
                          <><Pause className="w-4 h-4 mr-2" />Unpublish</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" />Publish</>
                        )}
                      </DropdownMenuItem>
                      {survey.status === 'published' && (
                        <>
                          <DropdownMenuItem onClick={(e) => openShareModal(e, survey)} className="text-gray-300 cursor-pointer">
                            <Share2 className="w-4 h-4 mr-2" />Share (Link, QR, Embed)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => openPublicSurvey(e, survey)} className="text-gray-300 cursor-pointer">
                            <ExternalLink className="w-4 h-4 mr-2" />Open Public Form
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={(e) => handleDuplicate(e, survey)} className="text-gray-300 cursor-pointer">
                        <Copy className="w-4 h-4 mr-2" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDelete(e, survey)} className="text-red-400 cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{survey.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span><Edit3 className="w-3 h-3 inline mr-1" />{survey.question_count} questions</span>
                    <span><BarChart3 className="w-3 h-3 inline mr-1" />{survey.response_count} responses</span>
                  </div>
                  <span className="text-gray-600">{formatDate(survey.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Share Modal */}
      <ShareModal 
        survey={selectedSurveyForShare} 
        open={shareModalOpen} 
        onOpenChange={setShareModalOpen} 
      />

      {/* Template Library Modal */}
      <TemplateLibrary
        open={templateLibraryOpen}
        onOpenChange={setTemplateLibraryOpen}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}

export default Survey360SurveysPage;
