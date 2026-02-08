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
import { useOrgStore } from '../../store';
import survey360Api from '../../lib/survey360Api';

const StatCard = ({ title, value, icon: Icon, description, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card 
      className="bg-white/5 border-white/10 hover:border-teal-500/50 transition-all cursor-pointer h-full"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
            {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_surveys: 12, total_responses: 2453, active_surveys: 8, response_rate: 78 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({ date: date.toISOString().split('T')[0], count: Math.floor(Math.random() * 100) + 50 });
    }
    setChartData(data);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400">{currentOrg?.name || 'Survey360'} overview</p>
        </div>
        <Button onClick={() => navigate('/solutions/survey360/app/surveys/new')} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0">
          <Plus className="w-4 h-4 mr-2" />New Survey
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Surveys" value={stats.total_surveys} icon={ClipboardList} onClick={() => navigate('/solutions/survey360/app/surveys')} />
        <StatCard title="Total Responses" value={stats.total_responses} icon={BarChart3} onClick={() => navigate('/solutions/survey360/app/responses')} />
        <StatCard title="Active Surveys" value={stats.active_surveys} icon={TrendingUp} />
        <StatCard title="Response Rate" value={`${stats.response_rate}%`} icon={Users} description="Average completion rate" />
      </div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-white">Response Trends</CardTitle><CardDescription className="text-gray-400">Last 14 days</CardDescription></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString('en', { day: 'numeric', month: 'short' })} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f1d32', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorResponses)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Survey360DashboardPage;
