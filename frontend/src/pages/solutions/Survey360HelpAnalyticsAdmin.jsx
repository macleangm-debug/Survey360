import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useUIStore } from '../../store';
import { cn } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Survey360HelpAnalyticsAdmin() {
  const navigate = useNavigate();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const bgTertiary = isDark ? 'bg-[#162236]' : 'bg-gray-100';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/help-assistant/analytics/admin`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      return;
    }
    
    try {
      setClearing(true);
      const response = await fetch(`${BACKEND_URL}/api/help-assistant/analytics/clear`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to clear data');
      await fetchAnalytics();
    } catch (err) {
      alert('Failed to clear analytics data: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  // Activity Chart Component
  const ActivityChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const maxMessages = Math.max(...data.map(d => d.messages), 1);
    const chartHeight = 120;
    
    return (
      <div className="relative h-[160px]">
        {/* Y-axis labels */}
        <div className={cn("absolute left-0 top-0 h-[120px] flex flex-col justify-between text-xs", textMuted)}>
          <span>{maxMessages}</span>
          <span>{Math.round(maxMessages / 2)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 h-[120px] flex items-end gap-1">
          {data.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              {/* Messages bar */}
              <div 
                className="w-full bg-teal-500/80 rounded-t transition-all hover:bg-teal-400 cursor-pointer group relative"
                style={{ height: `${(day.messages / maxMessages) * chartHeight}px`, minHeight: day.messages > 0 ? '4px' : '0' }}
                title={`${day.date}: ${day.messages} messages`}
              >
                {/* Tooltip */}
                <div className={cn(
                  "absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10",
                  bgTertiary, textPrimary, "border", borderColor
                )}>
                  {day.messages} msgs
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="ml-8 flex gap-1 mt-2">
          {data.map((day, idx) => (
            <div key={idx} className={cn("flex-1 text-center text-[10px]", textMuted)}>
              {idx % 2 === 0 ? day.date.slice(5) : ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Satisfaction Gauge Component
  const SatisfactionGauge = ({ rate }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (rate / 100) * circumference;
    const color = rate >= 70 ? 'text-green-500' : rate >= 50 ? 'text-yellow-500' : 'text-red-500';
    
    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            className={color}
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold", textPrimary)}>{rate}%</span>
          <span className={cn("text-xs", textSecondary)}>Satisfied</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", bgPrimary)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className={textSecondary}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", bgPrimary)}>
        <div className={cn("text-center p-8 rounded-xl", bgSecondary, "border", borderColor)}>
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className={cn("text-xl font-semibold mb-2", textPrimary)}>Failed to load analytics</h2>
          <p className={cn("mb-4", textSecondary)}>{error}</p>
          <Button onClick={fetchAnalytics} className="bg-teal-500 hover:bg-teal-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { summary, top_questions, needs_improvement, daily_activity, recent_feedback } = analytics || {};

  return (
    <div className={cn("min-h-screen", bgPrimary)}>
      {/* Header */}
      <header className={cn("border-b sticky top-0 z-40 backdrop-blur-xl", borderColor, bgPrimary + "/90")}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/solutions/survey360/settings')}
                className={textSecondary}
                data-testid="back-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={cn("text-xl font-bold", textPrimary)}>Help Center Analytics</h1>
                  <p className={cn("text-sm", textSecondary)}>AI Assistant usage & feedback insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalytics}
                className={cn("border", borderColor)}
                data-testid="refresh-btn"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                disabled={clearing}
                className={cn("border-red-500/50 text-red-500 hover:bg-red-500/10")}
                data-testid="clear-data-btn"
              >
                {clearing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Clear Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Total Sessions', 
              value: summary?.total_sessions || 0, 
              icon: Users, 
              color: 'from-blue-500 to-blue-600',
              description: 'Unique chat sessions'
            },
            { 
              label: 'Total Messages', 
              value: summary?.total_messages || 0, 
              icon: MessageSquare, 
              color: 'from-teal-500 to-teal-600',
              description: 'Questions asked'
            },
            { 
              label: 'Helpful Responses', 
              value: summary?.helpful_count || 0, 
              icon: ThumbsUp, 
              color: 'from-green-500 to-green-600',
              description: 'Positive feedback'
            },
            { 
              label: 'Needs Improvement', 
              value: summary?.not_helpful_count || 0, 
              icon: ThumbsDown, 
              color: 'from-orange-500 to-orange-600',
              description: 'Negative feedback'
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "rounded-xl p-5 border",
                bgSecondary, borderColor
              )}
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn("text-sm", textSecondary)}>{stat.label}</p>
                  <p className={cn("text-3xl font-bold mt-1", textPrimary)}>{stat.value.toLocaleString()}</p>
                  <p className={cn("text-xs mt-1", textMuted)}>{stat.description}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Satisfaction */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={cn("rounded-xl p-6 border", bgSecondary, borderColor)}
              data-testid="activity-chart"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={cn("text-lg font-semibold", textPrimary)}>Daily Activity</h2>
                  <p className={cn("text-sm", textSecondary)}>Messages over the last 14 days</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-teal-500" />
                    <span className={cn("text-xs", textSecondary)}>Messages</span>
                  </div>
                </div>
              </div>
              
              {daily_activity && daily_activity.length > 0 ? (
                <ActivityChart data={daily_activity} />
              ) : (
                <div className={cn("h-[160px] flex items-center justify-center", textMuted)}>
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No activity data yet</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Top Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn("rounded-xl p-6 border", bgSecondary, borderColor)}
              data-testid="top-questions"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={cn("text-lg font-semibold", textPrimary)}>Top Questions Asked</h2>
                  <p className={cn("text-sm", textSecondary)}>Most frequently asked questions</p>
                </div>
                <Badge variant="secondary" className="bg-teal-500/10 text-teal-400">
                  {top_questions?.length || 0} questions
                </Badge>
              </div>
              
              {top_questions && top_questions.length > 0 ? (
                <div className="space-y-3">
                  {top_questions.slice(0, 10).map((q, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg",
                        bgTertiary, "hover:bg-opacity-80 transition-colors"
                      )}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        idx < 3 ? "bg-teal-500 text-white" : cn(bgSecondary, textSecondary)
                      )}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", textPrimary)}>{q.question}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn("text-xs", textMuted)}>
                            Asked {q.count} times
                          </span>
                          <span className="flex items-center gap-1 text-xs text-green-500">
                            <ThumbsUp className="w-3 h-3" /> {q.helpful_count || 0}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-orange-500">
                            <ThumbsDown className="w-3 h-3" /> {q.not_helpful_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn("py-8 text-center", textMuted)}>
                  <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No questions recorded yet</p>
                  <p className="text-sm mt-1">Questions will appear here after users interact with the AI Assistant</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Satisfaction & Improvements */}
          <div className="space-y-6">
            {/* Satisfaction Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={cn("rounded-xl p-6 border", bgSecondary, borderColor)}
              data-testid="satisfaction-rate"
            >
              <h2 className={cn("text-lg font-semibold mb-4", textPrimary)}>Satisfaction Rate</h2>
              <SatisfactionGauge rate={summary?.satisfaction_rate || 0} />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={cn("p-3 rounded-lg text-center", bgTertiary)}>
                  <div className="flex items-center justify-center gap-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">{summary?.helpful_count || 0}</span>
                  </div>
                  <p className={cn("text-xs mt-1", textMuted)}>Helpful</p>
                </div>
                <div className={cn("p-3 rounded-lg text-center", bgTertiary)}>
                  <div className="flex items-center justify-center gap-1 text-orange-500">
                    <XCircle className="w-4 h-4" />
                    <span className="font-semibold">{summary?.not_helpful_count || 0}</span>
                  </div>
                  <p className={cn("text-xs mt-1", textMuted)}>Not Helpful</p>
                </div>
              </div>
            </motion.div>

            {/* Needs Improvement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={cn("rounded-xl p-6 border", bgSecondary, borderColor)}
              data-testid="needs-improvement"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h2 className={cn("text-lg font-semibold", textPrimary)}>Needs Improvement</h2>
              </div>
              <p className={cn("text-sm mb-4", textSecondary)}>
                Questions with more negative than positive feedback
              </p>
              
              {needs_improvement && needs_improvement.length > 0 ? (
                <div className="space-y-3">
                  {needs_improvement.map((q, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-3 rounded-lg border-l-4 border-orange-500",
                        bgTertiary
                      )}
                    >
                      <p className={cn("text-sm", textPrimary)}>{q.question}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <ThumbsUp className="w-3 h-3" /> {q.helpful_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-orange-500">
                          <ThumbsDown className="w-3 h-3" /> {q.not_helpful_count || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn("py-6 text-center", textMuted)}>
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-70" />
                  <p className="text-green-500">All responses are well-received!</p>
                  <p className="text-xs mt-1">No questions need improvement</p>
                </div>
              )}
            </motion.div>

            {/* Recent Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={cn("rounded-xl p-6 border", bgSecondary, borderColor)}
              data-testid="recent-feedback"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-teal-500" />
                <h2 className={cn("text-lg font-semibold", textPrimary)}>Recent Feedback</h2>
              </div>
              
              {recent_feedback && recent_feedback.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {recent_feedback.slice(0, 10).map((fb, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-3 rounded-lg flex items-start gap-3",
                        bgTertiary
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                        fb.is_helpful ? "bg-green-500/20" : "bg-orange-500/20"
                      )}>
                        {fb.is_helpful ? (
                          <ThumbsUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <ThumbsDown className="w-3 h-3 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", textPrimary)}>{fb.question}</p>
                        <p className={cn("text-xs mt-1", textMuted)}>
                          {fb.timestamp ? new Date(fb.timestamp).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn("py-6 text-center", textMuted)}>
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No feedback received yet</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
