import React from 'react';
import { BarChart3, Download, Search, Eye, User, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';

const MOCK_RESPONSES = [
  { id: '1', survey_name: 'Customer Satisfaction', respondent_name: 'John Doe', respondent_email: 'john@example.com', status: 'completed', submitted_at: new Date().toISOString() },
  { id: '2', survey_name: 'Customer Satisfaction', respondent_name: 'Jane Smith', respondent_email: 'jane@example.com', status: 'completed', submitted_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', survey_name: 'Employee Engagement', respondent_name: 'Mike Johnson', respondent_email: 'mike@company.com', status: 'completed', submitted_at: new Date(Date.now() - 7200000).toISOString() },
];

export function Survey360ResponsesPage() {
  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMins = Math.floor((now - then) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-white">Responses</h1><p className="text-gray-400">View and analyze survey responses</p></div>
        <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => toast.success('Export started')}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-teal-400" /></div><div><p className="text-2xl font-semibold text-white">{MOCK_RESPONSES.length}</p><p className="text-sm text-gray-400">Total Responses</p></div></div></CardContent></Card>
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-green-500" /></div><div><p className="text-2xl font-semibold text-white">{MOCK_RESPONSES.filter(r => r.status === 'completed').length}</p><p className="text-sm text-gray-400">Completed</p></div></div></CardContent></Card>
      </div>
      <div className="flex gap-4"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><Input placeholder="Search by name or email..." className="pl-10 bg-white/5 border-white/10 text-white" /></div></div>
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="border-white/10"><TableHead className="text-gray-400">Respondent</TableHead><TableHead className="text-gray-400">Survey</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Submitted</TableHead><TableHead className="text-gray-400 w-20">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {MOCK_RESPONSES.map((response) => (
                <TableRow key={response.id} className="border-white/10 hover:bg-white/5">
                  <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center"><User className="w-4 h-4 text-teal-400" /></div><div><p className="font-medium text-white">{response.respondent_name}</p><p className="text-xs text-gray-500">{response.respondent_email}</p></div></div></TableCell>
                  <TableCell className="text-gray-300">{response.survey_name}</TableCell>
                  <TableCell><Badge className="bg-teal-500/20 text-teal-400">{response.status}</Badge></TableCell>
                  <TableCell className="text-gray-400">{formatTime(response.submitted_at)}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Survey360ResponsesPage;
