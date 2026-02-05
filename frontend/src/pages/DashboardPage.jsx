import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  FileText,
  Database,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Activity,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DashboardLayout, DataVisionLogo } from '../layouts/DashboardLayout';
import { useOrgStore } from '../store';
import { dashboardAPI, orgAPI } from '../lib/api';
import { formatRelativeTime, getQualityColor } from '../lib/utils';
import { toast } from 'sonner';

const StatCard = ({ title, value, icon: Icon, trend, description, color = 'red', onClick }) => {
  const colorClasses = {
    red: {
      bg: 'bg-gradient-to-br from-[#E53935]/10 to-[#E53935]/5',
      border: 'border-l-4 border-l-[#E53935]',
      icon: 'bg-[#E53935]/10 text-[#E53935]',
      trend: 'text-[#E53935]'
    },
    navy: {
      bg: 'bg-gradient-to-br from-[#1A237E]/10 to-[#1A237E]/5',
      border: 'border-l-4 border-l-[#1A237E]',
      icon: 'bg-[#1A237E]/10 text-[#1A237E]',
      trend: 'text-[#1A237E]'
    },
    gray: {
      bg: 'bg-gradient-to-br from-[#78909C]/10 to-[#78909C]/5',
      border: 'border-l-4 border-l-[#78909C]',
      icon: 'bg-[#78909C]/10 text-[#78909C]',
      trend: 'text-[#78909C]'
    },
    green: {
      bg: 'bg-gradient-to-br from-[#4CAF50]/10 to-[#4CAF50]/5',
      border: 'border-l-4 border-l-[#4CAF50]',
      icon: 'bg-[#4CAF50]/10 text-[#4CAF50]',
      trend: 'text-[#4CAF50]'
    }
  };
  
  const c = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`${c.bg} ${c.border} border-t-0 border-r-0 border-b-0 hover:shadow-lg transition-all cursor-pointer`}
        onClick={onClick}
        data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-barlow font-bold tracking-tight">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-2">{description}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-[#4CAF50]' : 'text-[#E53935]'}`} />
              <span className={`text-sm ${trend >= 0 ? 'text-[#4CAF50]' : 'text-[#E53935]'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last week</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E53935]/20 to-[#1A237E]/20 flex items-center justify-center mt-0.5">
      <Database className="w-4 h-4 text-[#1A237E]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm">
        <span className="font-medium">{activity.user_name}</span>
        {' submitted to '}
        <span className="font-medium text-[#E53935]">{activity.form_name}</span>
      </p>
      <div className="flex items-center gap-2 mt-1">
        <Badge 
          variant="outline" 
          className={activity.status === 'approved' 
            ? 'border-[#4CAF50]/50 text-[#4CAF50] bg-[#4CAF50]/10' 
            : 'border-[#78909C]/50 text-[#78909C] bg-[#78909C]/10'
          }
        >
          {activity.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(activity.timestamp)}
        </span>
      </div>
    </div>
  </div>
);

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentOrg, setCurrentOrg, setOrganizations } = useOrgStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [quality, setQuality] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (currentOrg) {
      loadDashboardData();
    }
  }, [currentOrg]);

  const loadOrganizations = async () => {
    try {
      const response = await orgAPI.list();
      setOrganizations(response.data);
      if (response.data.length > 0 && !currentOrg) {
        setCurrentOrg(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const [statsRes, trendsRes, qualityRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(currentOrg.id),
        dashboardAPI.getSubmissionTrends(currentOrg.id, 14),
        dashboardAPI.getQualityMetrics(currentOrg.id),
        dashboardAPI.getRecentActivity(currentOrg.id, 10)
      ]);
      
      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setQuality(qualityRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrg) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="no-org-message">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E53935]/20 to-[#1A237E]/20 flex items-center justify-center mb-6">
            <DataVisionLogo size="lg" />
          </div>
          <h2 className="font-barlow text-2xl font-bold mb-2">
            Welcome to <span className="text-[#E53935]">Data</span><span className="text-[#1A237E]">Pulse</span>
          </h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create your first organization to start collecting data with DataVision&apos;s powerful platform
          </p>
          <Button 
            onClick={() => navigate('/organizations/new')} 
            className="bg-gradient-to-r from-[#E53935] to-[#C62828] hover:from-[#C62828] hover:to-[#B71C1C]"
            data-testid="create-org-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-content">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-barlow text-3xl font-bold tracking-tight">
              <span className="text-[#E53935]">Dash</span>board
            </h1>
            <p className="text-muted-foreground">{currentOrg.name} overview</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/projects')}
              className="border-[#1A237E]/30 text-[#1A237E] hover:bg-[#1A237E]/5"
            >
              <FolderKanban className="w-4 h-4 mr-2" />
              Projects
            </Button>
            <Button 
              onClick={() => navigate('/forms/new')} 
              className="bg-gradient-to-r from-[#E53935] to-[#C62828] hover:from-[#C62828] hover:to-[#B71C1C]"
              data-testid="new-form-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Form
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatCard
                title="Total Projects"
                value={stats?.total_projects || 0}
                icon={FolderKanban}
                color="red"
                onClick={() => navigate('/projects')}
              />
              <StatCard
                title="Active Forms"
                value={stats?.total_forms || 0}
                icon={FileText}
                color="navy"
                onClick={() => navigate('/forms')}
              />
              <StatCard
                title="Submissions"
                value={stats?.total_submissions || 0}
                icon={Database}
                color="gray"
                description={`${stats?.submissions_today || 0} today`}
                onClick={() => navigate('/submissions')}
              />
              <StatCard
                title="Pending Reviews"
                value={stats?.pending_reviews || 0}
                icon={AlertCircle}
                color="green"
                onClick={() => navigate('/submissions?status=pending')}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Trends */}
          <Card className="lg:col-span-2 border-t-4 border-t-[#E53935]">
            <CardHeader>
              <CardTitle className="font-barlow">
                <span className="text-[#E53935]">Submission</span> Trends
              </CardTitle>
              <CardDescription>Last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E53935" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1A237E" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#E53935" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorSubmissions)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Data Quality */}
          <Card className="border-t-4 border-t-[#1A237E]">
            <CardHeader>
              <CardTitle className="font-barlow">
                Data <span className="text-[#1A237E]">Quality</span>
              </CardTitle>
              <CardDescription>Overall quality metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : quality ? (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Avg Quality Score</span>
                      <span className={`text-sm font-mono font-medium ${getQualityColor(quality.avg_quality_score)}`}>
                        {quality.avg_quality_score}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#E53935] to-[#1A237E] rounded-full transition-all"
                        style={{ width: `${quality.avg_quality_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-[#4CAF50]/10 border border-[#4CAF50]/20">
                      <CheckCircle className="w-5 h-5 text-[#4CAF50] mx-auto mb-1" />
                      <p className="text-2xl font-barlow font-bold text-[#4CAF50]">{quality.approved_count}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#E53935]/10 border border-[#E53935]/20">
                      <AlertCircle className="w-5 h-5 text-[#E53935] mx-auto mb-1" />
                      <p className="text-2xl font-barlow font-bold text-[#E53935]">{quality.rejected_count}</p>
                      <p className="text-xs text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#FF9800]/10 border border-[#FF9800]/20">
                    <p className="text-2xl font-barlow font-bold text-[#FF9800]">{quality.flagged_count}</p>
                    <p className="text-xs text-muted-foreground">Flagged for Review</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-t-4 border-t-[#78909C]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-barlow">
                  Recent <span className="text-[#78909C]">Activity</span>
                </CardTitle>
                <CardDescription>Latest submissions</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/submissions')}
                className="text-[#E53935] hover:text-[#C62828] hover:bg-[#E53935]/10"
              >
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.length > 0 ? (
                <div className="space-y-1">
                  {activity.map((item, idx) => (
                    <ActivityItem key={idx} activity={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-l-4 border-l-[#E53935]">
            <CardHeader>
              <CardTitle className="font-barlow">
                Quick <span className="text-[#E53935]">Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start border-[#E53935]/20 hover:bg-[#E53935]/5 hover:border-[#E53935]/40" 
                onClick={() => navigate('/projects/new')}
              >
                <FolderKanban className="w-4 h-4 mr-2 text-[#E53935]" />
                New Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-[#1A237E]/20 hover:bg-[#1A237E]/5 hover:border-[#1A237E]/40" 
                onClick={() => navigate('/forms/new')}
              >
                <FileText className="w-4 h-4 mr-2 text-[#1A237E]" />
                New Form
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-[#78909C]/20 hover:bg-[#78909C]/5 hover:border-[#78909C]/40" 
                onClick={() => navigate('/team')}
              >
                <Users className="w-4 h-4 mr-2 text-[#78909C]" />
                Manage Team
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-[#4CAF50]/20 hover:bg-[#4CAF50]/5 hover:border-[#4CAF50]/40" 
                onClick={() => navigate('/exports')}
              >
                <Activity className="w-4 h-4 mr-2 text-[#4CAF50]" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Powered by DataVision footer */}
        <div className="text-center pt-8 pb-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <span className="font-semibold">
              <span className="text-[#E53935]">Data</span>
              <span className="text-[#1A237E]">Vision</span>
            </span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
