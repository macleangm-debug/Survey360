import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, MoreVertical, Play, Pause, Copy, Trash2, Edit3, BarChart3, ExternalLink, Link2, Share2, QrCode, Code, Download, Check, LayoutTemplate, Smile, Users, Calendar, Package, TrendingUp, Globe, Sparkles, ArrowRight, X, Clock, Mail, Send, FileSpreadsheet, RefreshCw, AlertCircle } from 'lucide-react';
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
import { Switch } from '../../components/ui/switch';
import { useOrgStore, useUIStore } from '../../store';
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
  const [shortenedLinks, setShortenedLinks] = useState({});
  const [shorteningUrl, setShorteningUrl] = useState(null);
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

  // Shorten link function
  const shortenLink = async (url) => {
    // Check if we already have this shortened
    if (shortenedLinks[url]) {
      navigator.clipboard.writeText(shortenedLinks[url]);
      toast.success('Short link copied to clipboard!');
      return;
    }

    setShorteningUrl(url);
    try {
      const res = await survey360Api.post('/shorten-url', { url });
      
      if (res.data.success && res.data.short_url) {
        setShortenedLinks(prev => ({ ...prev, [url]: res.data.short_url }));
        navigator.clipboard.writeText(res.data.short_url);
        toast.success('Short link copied to clipboard!');
      } else {
        toast.error(res.data.error || 'Failed to shorten link');
      }
    } catch (error) {
      console.error('Shortening error:', error);
      toast.error('Failed to shorten link');
    } finally {
      setShorteningUrl(null);
    }
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

            {/* Shortened Link Display */}
            {shortenedLinks[publicUrl] && (
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Shortened Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shortenedLinks[publicUrl]}
                    readOnly
                    className="font-mono text-sm bg-teal-500/10 border-teal-500/30 text-teal-400"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(shortenedLinks[publicUrl]);
                      toast.success('Short link copied!');
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Shorten Button */}
            <Button
              variant="outline"
              onClick={() => shortenLink(publicUrl)}
              disabled={shorteningUrl === publicUrl}
              className="w-full border-white/10 text-gray-300 hover:bg-white/5"
            >
              {shorteningUrl === publicUrl ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Shortening...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  {shortenedLinks[publicUrl] ? 'Copy Short Link' : 'Shorten & Copy'}
                </>
              )}
            </Button>

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

// Schedule Modal Component
function ScheduleModal({ survey, open, onOpenChange, onScheduleUpdated }) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState({
    enabled: false,
    publish_at: '',
    close_at: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    recurring: false,
    recurrence_type: 'weekly',
    recurrence_interval: 1,
    recurrence_end_date: '',
    max_occurrences: null
  });

  useEffect(() => {
    if (open && survey) {
      loadSchedule();
    }
  }, [open, survey]);

  const loadSchedule = async () => {
    try {
      const response = await survey360Api.get(`/surveys/${survey.id}/schedule`);
      if (response.data.schedule) {
        setSchedule(prev => ({ ...prev, ...response.data.schedule }));
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await survey360Api.post(`/surveys/${survey.id}/schedule`, schedule);
      toast.success('Schedule saved successfully');
      onScheduleUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error(error.response?.data?.detail || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSchedule = async () => {
    setLoading(true);
    try {
      await survey360Api.delete(`/surveys/${survey.id}/schedule`);
      toast.success('Schedule removed');
      setSchedule({
        enabled: false,
        publish_at: '',
        close_at: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        recurring: false,
        recurrence_type: 'weekly',
        recurrence_interval: 1,
        recurrence_end_date: '',
        max_occurrences: null
      });
      onScheduleUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to remove schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1d32] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            Schedule Survey
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {survey.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Enable Schedule */}
          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Schedule</Label>
            <Switch
              checked={schedule.enabled}
              onCheckedChange={(checked) => setSchedule({ ...schedule, enabled: checked })}
            />
          </div>

          {schedule.enabled && (
            <>
              {/* Timezone */}
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Timezone</Label>
                <Select
                  value={schedule.timezone}
                  onValueChange={(value) => setSchedule({ ...schedule, timezone: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1d32] border-white/10">
                    {['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                      <SelectItem key={tz} value={tz} className="text-white hover:bg-white/5">{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Publish Date */}
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Publish Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={schedule.publish_at ? schedule.publish_at.slice(0, 16) : ''}
                  onChange={(e) => setSchedule({ ...schedule, publish_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Close Date */}
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Close Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={schedule.close_at ? schedule.close_at.slice(0, 16) : ''}
                  onChange={(e) => setSchedule({ ...schedule, close_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <Label className="text-white">Recurring Survey</Label>
                  <p className="text-xs text-gray-500">Automatically create new surveys on a schedule</p>
                </div>
                <Switch
                  checked={schedule.recurring}
                  onCheckedChange={(checked) => setSchedule({ ...schedule, recurring: checked })}
                />
              </div>

              {schedule.recurring && (
                <div className="space-y-4 pl-4 border-l-2 border-teal-500/30">
                  {/* Recurrence Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Repeat Every</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={schedule.recurrence_interval}
                        onChange={(e) => setSchedule({ ...schedule, recurrence_interval: parseInt(e.target.value) || 1 })}
                        className="w-20 bg-white/5 border-white/10 text-white"
                      />
                      <Select
                        value={schedule.recurrence_type}
                        onValueChange={(value) => setSchedule({ ...schedule, recurrence_type: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1d32] border-white/10">
                          <SelectItem value="daily" className="text-white hover:bg-white/5">Day(s)</SelectItem>
                          <SelectItem value="weekly" className="text-white hover:bg-white/5">Week(s)</SelectItem>
                          <SelectItem value="monthly" className="text-white hover:bg-white/5">Month(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">End Recurrence</Label>
                    <Input
                      type="date"
                      value={schedule.recurrence_end_date ? schedule.recurrence_end_date.slice(0, 10) : ''}
                      onChange={(e) => setSchedule({ ...schedule, recurrence_end_date: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  {/* Max Occurrences */}
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Max Occurrences (optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="No limit"
                      value={schedule.max_occurrences || ''}
                      onChange={(e) => setSchedule({ ...schedule, max_occurrences: e.target.value ? parseInt(e.target.value) : null })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {schedule.enabled && (
            <Button
              variant="ghost"
              onClick={handleRemoveSchedule}
              disabled={loading}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Remove Schedule
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Email Invitation Modal Component
function EmailInvitationModal({ survey, open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendReminder, setSendReminder] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [sentCount, setSentCount] = useState(0);

  const handleSend = async () => {
    const emailList = emails.split(/[\n,;]/).map(e => e.trim()).filter(e => e && e.includes('@'));
    
    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    setLoading(true);
    try {
      const recipients = emailList.map(email => ({
        email,
        name: email.split('@')[0]
      }));

      const response = await survey360Api.post(`/surveys/${survey.id}/invite`, {
        survey_id: survey.id,
        recipients,
        subject: subject || undefined,
        message: message || undefined,
        send_reminder: sendReminder,
        reminder_days: reminderDays
      });

      if (response.data.success) {
        toast.success(`${response.data.sent} invitation(s) sent successfully`);
        setSentCount(prev => prev + response.data.sent);
        setEmails('');
      } else {
        toast.warning(`Sent: ${response.data.sent}, Failed: ${response.data.failed}`);
      }
    } catch (error) {
      console.error('Failed to send invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1d32] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-400" />
            Send Invitations
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {survey.name}
          </DialogDescription>
        </DialogHeader>

        {survey.status !== 'published' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-400 font-medium">Survey Not Published</p>
              <p className="text-yellow-400/70">Publish your survey first before sending invitations.</p>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Email Addresses */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Email Addresses</Label>
            <Textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses (one per line, or comma/semicolon separated)"
              rows={4}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-gray-500">
              {emails.split(/[\n,;]/).filter(e => e.trim() && e.includes('@')).length} email(s) detected
            </p>
          </div>

          {/* Custom Subject */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Custom Subject (optional)</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`You're invited to take: ${survey.name}`}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Custom Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personalized message to your invitation..."
              rows={3}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <Label className="text-white">Send Reminder</Label>
              <p className="text-xs text-gray-500">Automatically remind non-responders</p>
            </div>
            <Switch
              checked={sendReminder}
              onCheckedChange={setSendReminder}
            />
          </div>

          {sendReminder && (
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Remind after (days)</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={reminderDays}
                onChange={(e) => setReminderDays(parseInt(e.target.value) || 3)}
                className="w-24 bg-white/5 border-white/10 text-white"
              />
            </div>
          )}

          {sentCount > 0 && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg px-4 py-2">
              <p className="text-sm text-teal-400">
                <Check className="w-4 h-4 inline mr-1" />
                {sentCount} invitation(s) sent in this session
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={loading || survey.status !== 'published' || !emails.trim()}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Invitations
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Survey360SurveysPage() {
  const navigate = useNavigate();
  const { currentOrg } = useOrgStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
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
        <div><h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Surveys</h1><p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Create and manage your surveys</p></div>
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
            <DialogContent className={isDark ? 'bg-[#0f1d32] border-white/10' : 'bg-white border-gray-200'}>
              <DialogHeader><DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Create Survey</DialogTitle><DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>Add a new survey</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Survey Name</Label><Input value={newSurvey.name} onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })} className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} placeholder="e.g., Customer Feedback" data-testid="survey-name-input" /></div>
                <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Description</Label><Textarea value={newSurvey.description} onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })} className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} rows={3} data-testid="survey-desc-input" /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setCreateDialogOpen(false)} className={isDark ? 'border-white/10 text-gray-300' : 'border-gray-300 text-gray-700'}>Cancel</Button><Button onClick={handleCreateSurvey} disabled={creating} className="bg-teal-500 text-white" data-testid="create-survey-btn">{creating ? 'Creating...' : 'Create'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md"><Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><Input placeholder="Search surveys..." value={search} onChange={(e) => setSearch(e.target.value)} className={`pl-10 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`} data-testid="search-surveys" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className={`w-40 ${isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`}><SelectValue /></SelectTrigger><SelectContent className={isDark ? 'bg-[#0f1d32] border-white/10' : 'bg-white border-gray-200'}><SelectItem value="all" className={isDark ? 'text-gray-300' : 'text-gray-700'}>All Status</SelectItem><SelectItem value="draft" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Draft</SelectItem><SelectItem value="published" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Published</SelectItem></SelectContent></Select>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
              <CardHeader><Skeleton className={`h-6 w-3/4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} /></CardHeader>
              <CardContent><Skeleton className={`h-4 w-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} mb-2`} /><Skeleton className={`h-4 w-1/2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} /></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
            <ClipboardList className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No surveys yet</h3>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-center max-w-md mb-4`}>
            Create your first survey to start collecting responses
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-teal-500 text-white">
            <Plus className="w-4 h-4 mr-2" />Create Survey
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'} hover:border-teal-500/50 cursor-pointer group`} data-testid={`survey-card-${survey.id}`} onClick={() => navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-teal-400" /></div>
                    <div>
                      <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} group-hover:text-teal-400 line-clamp-1`}>{survey.name}</CardTitle>
                      <Badge className={survey.status === 'published' ? 'bg-teal-500/20 text-teal-400 border-0' : `${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'} border-0`}>{survey.status}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={isDark ? 'bg-[#0f1d32] border-white/10' : 'bg-white border-gray-200'} align="end">
                      <DropdownMenuItem onClick={(e) => navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`)} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
                        <Edit3 className="w-4 h-4 mr-2" />Edit Survey
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleTogglePublish(e, survey)} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
                        {survey.status === 'published' ? (
                          <><Pause className="w-4 h-4 mr-2" />Unpublish</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" />Publish</>
                        )}
                      </DropdownMenuItem>
                      {survey.status === 'published' && (
                        <>
                          <DropdownMenuItem onClick={(e) => openShareModal(e, survey)} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
                            <Share2 className="w-4 h-4 mr-2" />Share (Link, QR, Embed)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => openPublicSurvey(e, survey)} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
                            <ExternalLink className="w-4 h-4 mr-2" />Open Public Form
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                      <DropdownMenuItem onClick={(e) => handleDuplicate(e, survey)} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
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
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4 line-clamp-2`}>{survey.description || 'No description'}</p>
                <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <div className="flex gap-4">
                    <span><Edit3 className="w-3 h-3 inline mr-1" />{survey.question_count} questions</span>
                    <span><BarChart3 className="w-3 h-3 inline mr-1" />{survey.response_count} responses</span>
                  </div>
                  <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>{formatDate(survey.updated_at)}</span>
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
