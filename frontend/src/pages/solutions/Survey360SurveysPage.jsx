import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, MoreVertical, Play, Copy, Archive, Edit3, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const MOCK_SURVEYS = [
  { id: '1', name: 'Customer Satisfaction Survey', description: 'Measure customer satisfaction', status: 'published', question_count: 15, response_count: 234, updated_at: new Date().toISOString() },
  { id: '2', name: 'Employee Engagement Survey', description: 'Annual employee feedback', status: 'draft', question_count: 25, response_count: 0, updated_at: new Date(Date.now() - 86400000).toISOString() },
];

export function Survey360SurveysPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState(MOCK_SURVEYS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ name: '', description: '' });

  const handleCreateSurvey = () => {
    if (!newSurvey.name.trim()) { toast.error('Survey name is required'); return; }
    const survey = { id: Date.now().toString(), ...newSurvey, status: 'draft', question_count: 0, response_count: 0, updated_at: new Date().toISOString() };
    setSurveys([...surveys, survey]);
    setCreateDialogOpen(false);
    setNewSurvey({ name: '', description: '' });
    toast.success('Survey created');
    navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`);
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-white">Surveys</h1><p className="text-gray-400">Create and manage your surveys</p></div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"><Plus className="w-4 h-4 mr-2" />New Survey</Button></DialogTrigger>
          <DialogContent className="bg-[#0f1d32] border-white/10">
            <DialogHeader><DialogTitle className="text-white">Create Survey</DialogTitle><DialogDescription className="text-gray-400">Add a new survey</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label className="text-gray-300">Survey Name</Label><Input value={newSurvey.name} onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="e.g., Customer Feedback" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Description</Label><Textarea value={newSurvey.description} onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })} className="bg-white/5 border-white/10 text-white" rows={3} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-white/10 text-gray-300">Cancel</Button><Button onClick={handleCreateSurvey} className="bg-teal-500 text-white">Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40 bg-white/5 border-white/10 text-gray-300"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0f1d32] border-white/10"><SelectItem value="all" className="text-gray-300">All</SelectItem><SelectItem value="draft" className="text-gray-300">Draft</SelectItem><SelectItem value="published" className="text-gray-300">Published</SelectItem></SelectContent></Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurveys.map((survey) => (
          <Card key={survey.id} className="bg-white/5 border-white/10 hover:border-teal-500/50 cursor-pointer group" onClick={() => navigate(`/solutions/survey360/app/surveys/${survey.id}/edit`)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-teal-400" /></div>
                  <div><CardTitle className="text-lg text-white group-hover:text-teal-400">{survey.name}</CardTitle><Badge className={survey.status === 'published' ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-gray-400'}>{survey.status}</Badge></div>
                </div>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-gray-500 mb-4">{survey.description || 'No description'}</p><div className="flex gap-4 text-xs text-gray-500"><span><Edit3 className="w-3 h-3 inline mr-1" />{survey.question_count} questions</span><span><BarChart3 className="w-3 h-3 inline mr-1" />{survey.response_count} responses</span></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Survey360SurveysPage;
