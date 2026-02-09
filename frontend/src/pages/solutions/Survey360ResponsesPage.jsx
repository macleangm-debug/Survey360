import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Search,
  Eye,
  User,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useOrgStore } from '../../store';
import survey360Api from '../../lib/survey360Api';
import { toast } from 'sonner';

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-white text-sm">{title}</h4>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 truncate max-w-[200px]">{item.name}</span>
              <span className="text-gray-500">{item.value} ({item.percent}%)</span>
            </div>
            <div className="h-6 bg-white/5 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded transition-all duration-500"
                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Pie Chart Component (CSS-based)
const SimplePieChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const colors = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ec4899'];
  let cumulativePercent = 0;
  
  const segments = data.map((item, idx) => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.percent;
    return {
      ...item,
      color: colors[idx % colors.length],
      startPercent,
      endPercent: cumulativePercent
    };
  });
  
  const gradientStops = segments.map(s => 
    `${s.color} ${s.startPercent}% ${s.endPercent}%`
  ).join(', ');
  
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-white text-sm">{title}</h4>
      <div className="flex items-center gap-6">
        <div 
          className="w-24 h-24 rounded-full"
          style={{ 
            background: `conic-gradient(${gradientStops})`,
          }}
        />
        <div className="flex-1 space-y-1">
          {segments.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
              <span className="text-gray-400 truncate">{item.name}</span>
              <span className="text-gray-500 ml-auto">{item.percent}%</span>
            </div>
          ))}
          {segments.length > 5 && (
            <p className="text-xs text-gray-600">+{segments.length - 5} more</p>
          )}
        </div>
      </div>
    </div>
  );
};

export function Survey360ResponsesPage() {
  const navigate = useNavigate();
  const { currentOrg } = useOrgStore();
  const [responses, setResponses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, avgTime: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState('responses');

  useEffect(() => {
    loadSurveys();
  }, [currentOrg]);

  useEffect(() => {
    if (surveys.length > 0) {
      loadResponses();
    }
  }, [selectedSurvey, surveys]);

  useEffect(() => {
    if (selectedSurvey !== 'all' && activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [selectedSurvey, activeTab]);

  const loadSurveys = async () => {
    try {
      const response = await survey360Api.get('/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
  };

  const loadAnalytics = async () => {
    if (selectedSurvey === 'all') return;
    setLoadingAnalytics(true);
    try {
      const response = await survey360Api.get(`/surveys/${selectedSurvey}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadResponses = async () => {
    setLoading(true);
    try {
      let allResponses = [];
      
      if (selectedSurvey === 'all') {
        // Load responses from all surveys
        for (const survey of surveys) {
          try {
            const res = await survey360Api.get(`/surveys/${survey.id}/responses`);
            const responsesWithSurvey = res.data.map(r => ({
              ...r,
              survey_name: survey.name,
              survey_id: survey.id
            }));
            allResponses = [...allResponses, ...responsesWithSurvey];
          } catch (e) {
            // Survey might not have responses
          }
        }
      } else {
        const res = await survey360Api.get(`/surveys/${selectedSurvey}/responses`);
        const survey = surveys.find(s => s.id === selectedSurvey);
        allResponses = res.data.map(r => ({
          ...r,
          survey_name: survey?.name || 'Unknown',
          survey_id: selectedSurvey
        }));
      }
      
      // Sort by submitted_at descending
      allResponses.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      setResponses(allResponses);
      
      // Calculate stats
      const completed = allResponses.filter(r => r.status === 'completed').length;
      const avgTime = allResponses.length > 0
        ? Math.round(allResponses.reduce((sum, r) => sum + (r.completion_time || 0), 0) / allResponses.length)
        : 0;
      
      setStats({
        total: allResponses.length,
        completed,
        avgTime
      });
    } catch (error) {
      console.error('Failed to load responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (selectedSurvey === 'all') {
      toast.error('Please select a specific survey to export');
      return;
    }
    
    try {
      // Create CSV data
      const survey = surveys.find(s => s.id === selectedSurvey);
      const surveyResponses = responses.filter(r => r.survey_id === selectedSurvey);
      
      if (surveyResponses.length === 0) {
        toast.error('No responses to export');
        return;
      }
      
      // Build CSV
      const questions = survey?.questions || [];
      const headers = ['Response ID', 'Respondent Name', 'Respondent Email', 'Status', 'Submitted At', 'Completion Time (s)', ...questions.map(q => q.title)];
      
      const rows = surveyResponses.map(r => {
        const baseData = [
          r.id,
          r.respondent_name || 'Anonymous',
          r.respondent_email || '-',
          r.status,
          new Date(r.submitted_at).toLocaleString(),
          r.completion_time || '-'
        ];
        const answerData = questions.map(q => {
          const answer = r.answers?.[q.id];
          if (Array.isArray(answer)) return answer.join('; ');
          return answer || '-';
        });
        return [...baseData, ...answerData];
      });
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${survey?.name || 'survey'}_responses.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export downloaded');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const viewResponse = async (response) => {
    // Load full survey to get question titles
    try {
      const survey = surveys.find(s => s.id === response.survey_id);
      setSelectedResponse({ ...response, survey });
      setDetailOpen(true);
    } catch (error) {
      setSelectedResponse(response);
      setDetailOpen(true);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredResponses = responses.filter(r => {
    const matchesSearch = 
      (r.respondent_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (r.respondent_email?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6" data-testid="responses-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Responses</h1>
          <p className="text-gray-400">View and analyze survey responses</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
            <SelectTrigger className="w-56 bg-white/5 border-white/10 text-gray-300">
              <SelectValue placeholder="Select survey" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1d32] border-white/10">
              <SelectItem value="all" className="text-gray-300">All Surveys</SelectItem>
              {surveys.map((survey) => (
                <SelectItem key={survey.id} value={survey.id} className="text-gray-300">
                  {survey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={selectedSurvey === 'all'}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{stats.total}</p>
                <p className="text-sm text-gray-400">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{stats.completed}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{formatTime(stats.avgTime)}</p>
                <p className="text-sm text-gray-400">Avg. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{surveys.length}</p>
                <p className="text-sm text-gray-400">Surveys</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Responses and Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger 
            value="responses" 
            className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
          >
            <FileText className="w-4 h-4 mr-2" />
            Responses
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            disabled={selectedSurvey === 'all'}
            className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="responses" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Responses Table */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-white/10" />
                  ))}
                </div>
              ) : filteredResponses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Respondent</TableHead>
                      <TableHead className="text-gray-400">Survey</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Time</TableHead>
                      <TableHead className="text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-400 w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResponses.map((response) => (
                      <TableRow key={response.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-teal-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{response.respondent_name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{response.respondent_email || '-'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{response.survey_name}</TableCell>
                        <TableCell>
                          <Badge className="bg-teal-500/20 text-teal-400 border-0">
                            {response.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatTime(response.completion_time)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatRelativeTime(response.submitted_at)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => viewResponse(response)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No responses yet</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Responses will appear here once people start submitting your surveys
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {selectedSurvey === 'all' ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Survey</h3>
                <p className="text-gray-500">Choose a specific survey from the dropdown to view analytics</p>
              </CardContent>
            </Card>
          ) : loadingAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/2 mb-4 bg-white/10" />
                    <Skeleton className="h-32 w-full bg-white/10" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics && Object.keys(analytics.questions).length > 0 ? (
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Response Summary</CardTitle>
                  <CardDescription className="text-gray-400">
                    {analytics.total_responses} total responses
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(analytics.questions).map((q) => (
                  <Card key={q.question_id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      {q.question_type === 'single_choice' || q.question_type === 'dropdown' ? (
                        <SimplePieChart data={q.chart_data} title={q.question_title} />
                      ) : (
                        <SimpleBarChart data={q.chart_data} title={q.question_title} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
                <p className="text-gray-500">This survey has no responses with analyzable questions yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0f1d32] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Response Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedResponse?.survey_name} • Submitted {formatRelativeTime(selectedResponse?.submitted_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{selectedResponse.respondent_name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-400">{selectedResponse.respondent_email || 'No email'}</p>
                </div>
                <Badge className="ml-auto bg-teal-500/20 text-teal-400 border-0">
                  {selectedResponse.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Answers</h4>
                {selectedResponse.survey?.questions?.length > 0 ? (
                  selectedResponse.survey.questions.map((question, idx) => {
                    const answer = selectedResponse.answers?.[question.id];
                    return (
                      <div key={question.id} className="p-3 border border-white/10 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">
                          {idx + 1}. {question.title}
                        </p>
                        <p className="font-medium text-white">
                          {Array.isArray(answer) 
                            ? answer.join(', ') 
                            : answer || <span className="text-gray-500 italic">No answer</span>
                          }
                        </p>
                      </div>
                    );
                  })
                ) : (
                  Object.entries(selectedResponse.answers || {}).map(([key, value]) => (
                    <div key={key} className="p-3 border border-white/10 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="font-medium text-white">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Completion time: {formatTime(selectedResponse.completion_time)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedResponse.submitted_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Survey360ResponsesPage;
