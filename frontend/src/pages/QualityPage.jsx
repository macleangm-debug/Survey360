import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useOrgStore, useProjectStore } from '../store';
import { dashboardAPI, projectAPI } from '../lib/api';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-barlow font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-4">
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function QualityPage() {
  const { currentOrg } = useOrgStore();
  const { projects } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [quality, setQuality] = useState(null);
  const [enumerators, setEnumerators] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (currentOrg) {
      loadProjects();
      loadQualityData();
    }
  }, [currentOrg]);

  useEffect(() => {
    if (currentOrg) {
      loadQualityData();
    }
  }, [selectedProject, days]);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.list(currentOrg.id);
      useProjectStore.getState().setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadQualityData = async () => {
    setLoading(true);
    try {
      const projectId = selectedProject === 'all' ? null : selectedProject;
      const [qualityRes, enumeratorsRes] = await Promise.all([
        dashboardAPI.getQualityMetrics(currentOrg.id, projectId),
        dashboardAPI.getEnumeratorPerformance(currentOrg.id, projectId, days)
      ]);
      setQuality(qualityRes.data);
      setEnumerators(enumeratorsRes.data);
    } catch (error) {
      toast.error('Failed to load quality data');
    } finally {
      setLoading(false);
    }
  };

  const pieData = quality ? [
    { name: 'Approved', value: quality.approved_count, color: '#22c55e' },
    { name: 'Rejected', value: quality.rejected_count, color: '#ef4444' },
    { name: 'Pending', value: quality.total_count - quality.approved_count - quality.rejected_count - quality.flagged_count, color: '#3b82f6' },
    { name: 'Flagged', value: quality.flagged_count, color: '#f59e0b' },
  ].filter(d => d.value > 0) : [];

  const flagData = quality?.flag_distribution ? 
    Object.entries(quality.flag_distribution).map(([key, value]) => ({
      name: key.replace('_', ' ').replace(':', ': '),
      count: value
    })).slice(0, 10) : [];

  if (!currentOrg) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please select an organization first</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="quality-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-barlow text-3xl font-bold tracking-tight">Data Quality</h1>
            <p className="text-muted-foreground">Monitor data quality and enumerator performance</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-20" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Average Quality Score"
              value={`${quality?.avg_quality_score?.toFixed(1) || 0}%`}
              icon={Target}
              color={quality?.avg_quality_score >= 80 ? 'green' : quality?.avg_quality_score >= 60 ? 'yellow' : 'red'}
            />
            <MetricCard
              title="Total Submissions"
              value={quality?.total_count || 0}
              subtitle={`${quality?.approved_count || 0} approved`}
              icon={BarChart3}
              color="primary"
            />
            <MetricCard
              title="Flagged Issues"
              value={quality?.flagged_count || 0}
              subtitle="Require review"
              icon={AlertTriangle}
              color="yellow"
            />
            <MetricCard
              title="Rejection Rate"
              value={`${quality?.total_count ? ((quality?.rejected_count / quality?.total_count) * 100).toFixed(1) : 0}%`}
              icon={XCircle}
              color="red"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submission Status Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="font-barlow">Submission Status</CardTitle>
              <CardDescription>Distribution by review status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px]" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="font-barlow">Quality Flags</CardTitle>
              <CardDescription>Most common data issues</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px]" />
              ) : flagData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={flagData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No quality flags detected</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enumerator Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="font-barlow">Enumerator Performance</CardTitle>
            <CardDescription>Individual performance metrics for the last {days} days</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : enumerators.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enumerator</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Avg Quality</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Approval Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enumerators.map((enum_item) => (
                    <TableRow key={enum_item.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {enum_item.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{enum_item.name}</p>
                            <p className="text-xs text-muted-foreground">{enum_item.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{enum_item.submission_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={enum_item.avg_quality_score} className="w-16 h-2" />
                          <span className={`text-sm font-mono ${
                            enum_item.avg_quality_score >= 80 ? 'text-green-500' : 
                            enum_item.avg_quality_score >= 60 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {enum_item.avg_quality_score}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-green-500 font-mono">{enum_item.approved_count}</TableCell>
                      <TableCell className="text-red-500 font-mono">{enum_item.rejected_count}</TableCell>
                      <TableCell>
                        <Badge variant={enum_item.approval_rate >= 80 ? 'default' : 'secondary'}>
                          {enum_item.approval_rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No enumerator data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
