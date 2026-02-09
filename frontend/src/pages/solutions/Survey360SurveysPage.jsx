import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, MoreVertical, Play, Pause, Copy, Trash2, Edit3, BarChart3, ExternalLink, Link2 } from 'lucide-react';
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
import { useOrgStore } from '../../store';
import survey360Api from '../../lib/survey360Api';
import { toast } from 'sonner';

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

  const copyPublicLink = (e, survey) => {
    e.stopPropagation();
    const publicUrl = `${window.location.origin}/s/${survey.id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Public link copied to clipboard');
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
                          <DropdownMenuItem onClick={(e) => openPublicSurvey(e, survey)} className="text-gray-300 cursor-pointer">
                            <ExternalLink className="w-4 h-4 mr-2" />Open Public Form
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => copyPublicLink(e, survey)} className="text-gray-300 cursor-pointer">
                            <Link2 className="w-4 h-4 mr-2" />Copy Public Link
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
    </div>
  );
}

export default Survey360SurveysPage;
