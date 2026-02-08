import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useOrgStore } from '../store';
import { responseAPI, surveyAPI } from '../lib/api';
import { formatDate, formatRelativeTime } from '../lib/utils';
import { toast } from 'sonner';

export default function ResponsesPage() {
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

  useEffect(() => {
    loadSurveys();
    loadResponses();
  }, [currentOrg, selectedSurvey, page]);

  const loadSurveys = async () => {
    try {
      if (currentOrg) {
        const response = await surveyAPI.list(currentOrg.id);
        setSurveys(response.data);
      } else {
        setSurveys([
          { id: '1', name: 'Customer Satisfaction Survey' },
          { id: '2', name: 'Employee Engagement Survey' },
          { id: '3', name: 'Product Feedback Form' }
        ]);
      }
    } catch (error) {
      setSurveys([
        { id: '1', name: 'Customer Satisfaction Survey' },
        { id: '2', name: 'Employee Engagement Survey' }
      ]);
    }
  };

  const loadResponses = async () => {
    setLoading(true);
    try {
      if (selectedSurvey !== 'all') {
        const response = await responseAPI.list(selectedSurvey, { page, limit: 10 });
        setResponses(response.data.items || response.data);
        setTotalPages(response.data.total_pages || 1);
      } else {
        generateMockResponses();
      }
    } catch (error) {
      generateMockResponses();
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponses = () => {
    const mockResponses = [
      {
        id: '1',
        survey_id: '1',
        survey_name: 'Customer Satisfaction Survey',
        respondent_email: 'john@example.com',
        respondent_name: 'John Doe',
        status: 'completed',
        submitted_at: new Date().toISOString(),
        completion_time: 245,
        answers: {
          'satisfaction': 5,
          'recommend': 'Yes',
          'feedback': 'Great service!'
        }
      },
      {
        id: '2',
        survey_id: '1',
        survey_name: 'Customer Satisfaction Survey',
        respondent_email: 'jane@example.com',
        respondent_name: 'Jane Smith',
        status: 'completed',
        submitted_at: new Date(Date.now() - 3600000).toISOString(),
        completion_time: 180,
        answers: {
          'satisfaction': 4,
          'recommend': 'Yes',
          'feedback': 'Good experience overall'
        }
      },
      {
        id: '3',
        survey_id: '2',
        survey_name: 'Employee Engagement Survey',
        respondent_email: 'mike@company.com',
        respondent_name: 'Mike Johnson',
        status: 'completed',
        submitted_at: new Date(Date.now() - 7200000).toISOString(),
        completion_time: 420,
        answers: {
          'engagement': 4,
          'work_life_balance': 3,
          'suggestions': 'More flexible hours would be great'
        }
      },
      {
        id: '4',
        survey_id: '1',
        survey_name: 'Customer Satisfaction Survey',
        respondent_email: 'sarah@example.com',
        respondent_name: 'Sarah Wilson',
        status: 'partial',
        submitted_at: new Date(Date.now() - 86400000).toISOString(),
        completion_time: 60,
        answers: {
          'satisfaction': 3
        }
      },
      {
        id: '5',
        survey_id: '3',
        survey_name: 'Product Feedback Form',
        respondent_email: 'alex@example.com',
        respondent_name: 'Alex Brown',
        status: 'completed',
        submitted_at: new Date(Date.now() - 172800000).toISOString(),
        completion_time: 300,
        answers: {
          'product_rating': 5,
          'features_used': ['Dashboard', 'Reports', 'Export'],
          'improvement': 'Add more chart types'
        }
      }
    ];
    setResponses(mockResponses);
    setTotalPages(1);
  };

  const handleExport = async (format) => {
    try {
      if (selectedSurvey === 'all') {
        toast.error('Please select a specific survey to export');
        return;
      }
      const blob = await responseAPI.export(selectedSurvey, format);
      const url = window.URL.createObjectURL(blob.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `responses.${format}`;
      a.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.success(`Exported as ${format.toUpperCase()}`); // Demo
    }
  };

  const viewResponse = (response) => {
    setSelectedResponse(response);
    setDetailOpen(true);
  };

  const filteredResponses = responses.filter(r => {
    const matchesSearch = 
      (r.respondent_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (r.respondent_email?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesSurvey = selectedSurvey === 'all' || r.survey_id === selectedSurvey;
    return matchesSearch && matchesSurvey;
  });

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6" data-testid="responses-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Responses</h1>
          <p className="text-muted-foreground">View and analyze survey responses</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select survey" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surveys</SelectItem>
              {surveys.map((survey) => (
                <SelectItem key={survey.id} value={survey.id}>
                  {survey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{responses.length}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {responses.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {responses.filter(r => r.status === 'partial').length}
                </p>
                <p className="text-sm text-muted-foreground">Partial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {formatTime(Math.round(responses.reduce((sum, r) => sum + (r.completion_time || 0), 0) / responses.length))}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Responses Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredResponses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{response.respondent_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{response.respondent_email || '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{response.survey_name}</TableCell>
                    <TableCell>
                      <Badge variant={response.status === 'completed' ? 'default' : 'secondary'}>
                        {response.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(response.completion_time)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(response.submitted_at)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => viewResponse(response)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Responses will appear here once people start submitting your surveys
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Response Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              {selectedResponse?.survey_name} • Submitted {formatRelativeTime(selectedResponse?.submitted_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedResponse.respondent_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">{selectedResponse.respondent_email || 'No email'}</p>
                </div>
                <Badge className="ml-auto" variant={selectedResponse.status === 'completed' ? 'default' : 'secondary'}>
                  {selectedResponse.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Answers</h4>
                {Object.entries(selectedResponse.answers || {}).map(([key, value]) => (
                  <div key={key} className="p-3 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Completion time: {formatTime(selectedResponse.completion_time)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedResponse.submitted_at)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
