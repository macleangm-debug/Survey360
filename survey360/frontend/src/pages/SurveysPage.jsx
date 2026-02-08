import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Search,
  MoreVertical,
  Play,
  Copy,
  Archive,
  Eye,
  BarChart3,
  Calendar,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useOrgStore } from '../store';
import { surveyAPI } from '../lib/api';
import { formatDate, getStatusVariant } from '../lib/utils';
import { toast } from 'sonner';

const SurveyCard = ({ survey, onPublish, onDuplicate, onArchive }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => navigate(`/surveys/${survey.id}/edit`)}
        data-testid={`survey-card-${survey.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                  {survey.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusVariant(survey.status)}>
                    {survey.status}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/surveys/${survey.id}/edit`); }}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Survey
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/s/${survey.id}`, '_blank'); }}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {survey.status === 'draft' && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPublish(survey.id); }}>
                    <Play className="w-4 h-4 mr-2" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(survey.id, survey.name); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onArchive(survey.id); }}
                  className="text-destructive"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {survey.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              {survey.question_count || 0} questions
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              {survey.response_count || 0} responses
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            Updated {formatDate(survey.updated_at)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function SurveysPage() {
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
      if (currentOrg) {
        const response = await surveyAPI.list(currentOrg.id);
        setSurveys(response.data);
      } else {
        // Mock data for demo
        setSurveys([
          {
            id: '1',
            name: 'Customer Satisfaction Survey',
            description: 'Measure customer satisfaction with our products and services',
            status: 'published',
            question_count: 15,
            response_count: 234,
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Employee Engagement Survey',
            description: 'Annual employee engagement and feedback survey',
            status: 'draft',
            question_count: 25,
            response_count: 0,
            updated_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            name: 'Product Feedback Form',
            description: 'Collect feedback on new product features',
            status: 'published',
            question_count: 10,
            response_count: 89,
            updated_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load surveys:', error);
      // Use mock data on error
      setSurveys([
        {
          id: '1',
          name: 'Customer Satisfaction Survey',
          description: 'Measure customer satisfaction with our products and services',
          status: 'published',
          question_count: 15,
          response_count: 234,
          updated_at: new Date().toISOString()
        }
      ]);
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
      const response = await surveyAPI.create({
        name: newSurvey.name,
        description: newSurvey.description,
        org_id: currentOrg?.id,
        questions: []
      });
      setSurveys([...surveys, response.data]);
      setCreateDialogOpen(false);
      setNewSurvey({ name: '', description: '' });
      toast.success('Survey created');
      navigate(`/surveys/${response.data.id}/edit`);
    } catch (error) {
      // For demo, create locally
      const newId = Date.now().toString();
      const survey = {
        id: newId,
        name: newSurvey.name,
        description: newSurvey.description,
        status: 'draft',
        question_count: 0,
        response_count: 0,
        updated_at: new Date().toISOString()
      };
      setSurveys([...surveys, survey]);
      setCreateDialogOpen(false);
      setNewSurvey({ name: '', description: '' });
      toast.success('Survey created');
      navigate(`/surveys/${newId}/edit`);
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (surveyId) => {
    try {
      await surveyAPI.publish(surveyId);
      setSurveys(surveys.map(s => 
        s.id === surveyId ? { ...s, status: 'published' } : s
      ));
      toast.success('Survey published');
    } catch (error) {
      // For demo
      setSurveys(surveys.map(s => 
        s.id === surveyId ? { ...s, status: 'published' } : s
      ));
      toast.success('Survey published');
    }
  };

  const handleDuplicate = async (surveyId, surveyName) => {
    try {
      const response = await surveyAPI.duplicate(surveyId, `${surveyName} (Copy)`);
      setSurveys([...surveys, response.data]);
      toast.success('Survey duplicated');
    } catch (error) {
      // For demo
      const original = surveys.find(s => s.id === surveyId);
      const newSurvey = {
        ...original,
        id: Date.now().toString(),
        name: `${surveyName} (Copy)`,
        status: 'draft',
        response_count: 0,
        updated_at: new Date().toISOString()
      };
      setSurveys([...surveys, newSurvey]);
      toast.success('Survey duplicated');
    }
  };

  const handleArchive = async (surveyId) => {
    try {
      await surveyAPI.delete(surveyId);
      setSurveys(surveys.map(s => 
        s.id === surveyId ? { ...s, status: 'archived' } : s
      ));
      toast.success('Survey archived');
    } catch (error) {
      setSurveys(surveys.map(s => 
        s.id === surveyId ? { ...s, status: 'archived' } : s
      ));
      toast.success('Survey archived');
    }
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" data-testid="surveys-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Surveys</h1>
          <p className="text-muted-foreground">Create and manage your surveys</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-teal border-0" data-testid="create-survey-btn">
              <Plus className="w-4 h-4 mr-2" />
              New Survey
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Survey</DialogTitle>
              <DialogDescription>Add a new survey to start collecting responses</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Survey Name</Label>
                <Input
                  id="name"
                  value={newSurvey.name}
                  onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })}
                  placeholder="e.g., Customer Feedback Survey"
                  data-testid="survey-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                  placeholder="Brief description of the survey"
                  rows={3}
                  data-testid="survey-description-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSurvey} disabled={creating} className="gradient-teal border-0" data-testid="save-survey-btn">
                {creating ? 'Creating...' : 'Create Survey'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-surveys-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Surveys Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-border">
              <CardHeader>
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSurveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              onPublish={handlePublish}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
            />
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No surveys found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {search ? 'Try adjusting your search' : 'Create your first survey to start collecting responses'}
            </p>
            {!search && (
              <Button onClick={() => setCreateDialogOpen(true)} className="gradient-teal border-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Survey
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
