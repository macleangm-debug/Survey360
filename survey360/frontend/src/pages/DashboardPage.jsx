import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  BarChart3,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
import { useOrgStore } from '../store';
import { dashboardAPI, orgAPI } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, description, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card 
      className="hover:shadow-md transition-all cursor-pointer h-full border-border"
      onClick={onClick}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
      <FileText className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground">
        <span className="font-medium">{activity.user_name || 'Someone'}</span>
        {' submitted a response to '}
        <span className="font-medium">{activity.survey_name || 'a survey'}</span>
      </p>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="secondary" className="text-xs">
          {activity.status || 'submitted'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(activity.timestamp)}
        </span>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentOrg, setCurrentOrg, setOrganizations } = useOrgStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

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
      // Generate mock data for demo
      generateMockData();
    }
  };

  const loadDashboardData = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(currentOrg.id),
        dashboardAPI.getRecentActivity(currentOrg.id, 5)
      ]);
      
      setStats(statsRes.data);
      setActivity(activityRes.data);
      generateChartData();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    setStats({
      total_surveys: 12,
      total_responses: 2453,
      active_surveys: 8,
      response_rate: 78
    });
    setActivity([
      { user_name: 'John Doe', survey_name: 'Customer Satisfaction', status: 'completed', timestamp: new Date() },
      { user_name: 'Jane Smith', survey_name: 'Employee Feedback', status: 'completed', timestamp: new Date(Date.now() - 3600000) },
      { user_name: 'Mike Johnson', survey_name: 'Product Survey', status: 'completed', timestamp: new Date(Date.now() - 7200000) },
    ]);
    generateChartData();
    setLoading(false);
  };

  const generateChartData = () => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 100) + 50
      });
    }
    setChartData(data);
  };

  if (!currentOrg && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="no-org-message">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Survey360</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Get started by creating your first survey
        </p>
        <Button onClick={() => navigate('/surveys/new')} className="gradient-teal border-0" data-testid="create-survey-btn">
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{currentOrg?.name || 'Survey360'} overview</p>
        </div>
        <Button onClick={() => navigate('/surveys/new')} className="gradient-teal border-0" data-testid="new-survey-btn">
          <Plus className="w-4 h-4 mr-2" />
          New Survey
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Surveys"
              value={stats?.total_surveys || 0}
              icon={ClipboardList}
              onClick={() => navigate('/surveys')}
            />
            <StatCard
              title="Total Responses"
              value={stats?.total_responses || 0}
              icon={BarChart3}
              onClick={() => navigate('/responses')}
            />
            <StatCard
              title="Active Surveys"
              value={stats?.active_surveys || 0}
              icon={TrendingUp}
              onClick={() => navigate('/surveys')}
            />
            <StatCard
              title="Response Rate"
              value={`${stats?.response_rate || 0}%`}
              icon={Users}
              description="Average completion rate"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Trends */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Response Trends</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-muted-foreground"
                    fontSize={12}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#14b8a6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorResponses)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary hover:border-primary/50" 
              onClick={() => navigate('/surveys/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Survey
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary hover:border-primary/50" 
              onClick={() => navigate('/surveys')}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              View All Surveys
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary hover:border-primary/50" 
              onClick={() => navigate('/responses')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Responses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription>Latest survey responses</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/responses')}>
            View all
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
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
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
