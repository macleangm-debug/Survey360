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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useOrgStore, useUIStore } from '../../store';
import survey360Api from '../../lib/survey360Api';

const StatCard = ({ title, value, icon: Icon, description, onClick, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card 
      className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'} hover:border-teal-500/50 transition-all cursor-pointer h-full`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{title}</p>
            <p className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            {description && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2`}>{description}</p>}
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export function Survey360DashboardPage() {
  const navigate = useNavigate();
  const { currentOrg, setCurrentOrg, setOrganizations } = useOrgStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_surveys: 0, total_responses: 0, active_surveys: 0, response_rate: 0 });
  const [activity, setActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load organizations
      try {
        const orgsRes = await survey360Api.get('/organizations');
        setOrganizations(orgsRes.data);
        if (orgsRes.data.length > 0 && !currentOrg) {
          setCurrentOrg(orgsRes.data[0]);
        }
      } catch (e) {
        console.error('Failed to load orgs:', e);
      }

      // Load dashboard stats
      const statsRes = await survey360Api.get('/dashboard/stats');
      setStats(statsRes.data);

      // Load recent activity
      const activityRes = await survey360Api.get('/dashboard/activity?limit=5');
      setActivity(activityRes.data);

      // Generate chart data (could be from API in future)
      generateChartData();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }
    setChartData(data);
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
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400">{currentOrg?.name || 'Survey360'} overview</p>
        </div>
        <Button 
          onClick={() => navigate('/solutions/survey360/app/surveys/new')} 
          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />New Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
                <Skeleton className="h-8 w-16 bg-white/10" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard 
              title="Total Surveys" 
              value={stats.total_surveys} 
              icon={ClipboardList} 
              onClick={() => navigate('/solutions/survey360/app/surveys')} 
            />
            <StatCard 
              title="Total Responses" 
              value={stats.total_responses} 
              icon={BarChart3} 
              onClick={() => navigate('/solutions/survey360/app/responses')} 
            />
            <StatCard 
              title="Active Surveys" 
              value={stats.active_surveys} 
              icon={TrendingUp} 
              onClick={() => navigate('/solutions/survey360/app/surveys')}
            />
            <StatCard 
              title="Response Rate" 
              value={`${stats.response_rate}%`} 
              icon={Users} 
              description="Average completion rate" 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Response Trends</CardTitle>
            <CardDescription className="text-gray-400">Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full bg-white/10" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en', { day: 'numeric', month: 'short' })} 
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1d32', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorResponses)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-teal-400" 
              onClick={() => navigate('/solutions/survey360/app/surveys/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Survey
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-teal-400" 
              onClick={() => navigate('/solutions/survey360/app/surveys')}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              View All Surveys
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-teal-400" 
              onClick={() => navigate('/solutions/survey360/app/responses')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Responses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest survey responses</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/solutions/survey360/app/responses')} 
            className="text-gray-400 hover:text-white"
          >
            View all
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2 bg-white/10" />
                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length > 0 ? (
            <div className="space-y-1">
              {activity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center mt-0.5">
                    <FileText className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{item.user_name || 'Someone'}</span>
                      {' submitted a response to '}
                      <span className="font-medium">{item.survey_name || 'a survey'}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-xs bg-teal-500/10 text-teal-400 border-0">
                        {item.status || 'completed'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-600 mt-1">Responses will appear here when people submit your surveys</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Survey360DashboardPage;
