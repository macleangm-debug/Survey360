import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Users,
  FileText,
  PieChart,
  Home,
  Settings,
  Download,
  Share2,
  Eye,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Lock,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Play,
  Filter,
  Calendar,
  Heart,
  Star,
  MessageSquare,
  Layers,
  RefreshCw,
  X,
  HelpCircle,
  ChevronLeft,
  MousePointer,
  Zap,
  Target,
  Gift
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

// Tour Steps Configuration
const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Survey360! 👋',
    description: 'Let us show you around the dashboard. This quick tour will help you discover all the powerful features available.',
    target: null,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Your command center! See total responses, active surveys, completion rates, and items pending review at a glance.',
    target: 'stats-cards',
    position: 'bottom'
  },
  {
    id: 'surveys',
    title: 'Active Surveys',
    description: 'Track all your surveys in one place. Monitor progress, response counts, and team assignments for each project.',
    target: 'surveys-section',
    position: 'right'
  },
  {
    id: 'activity',
    title: 'Recent Activity',
    description: 'Stay informed with real-time updates. See who submitted responses and track survey engagement.',
    target: 'activity-section',
    position: 'left'
  },
  {
    id: 'navigation',
    title: 'Easy Navigation',
    description: 'Access Surveys, Responses, Analytics, Team management, and Settings from the sidebar menu.',
    target: 'sidebar-nav',
    position: 'right'
  },
  {
    id: 'analytics',
    title: 'Powerful Analytics',
    description: 'Click "Analytics" to explore response trends, satisfaction breakdowns, and detailed insights.',
    target: 'nav-analytics',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Explore freely! Remember, this is demo mode - start a free trial to unlock all features and create your own surveys.',
    target: null,
    position: 'center'
  }
];

// Tour Component
function GuidedTour({ isOpen, onClose, currentStep, setCurrentStep, onComplete }) {
  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isCenterPosition = step?.position === 'center';

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen || !step) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[100]" onClick={handleSkip} />
      
      {/* Spotlight for targeted elements */}
      {step.target && (
        <style>{`
          [data-tour="${step.target}"] {
            position: relative;
            z-index: 101;
            box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.5), 0 0 20px rgba(20, 184, 166, 0.3);
            border-radius: 12px;
          }
        `}</style>
      )}

      {/* Tour Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`fixed z-[102] ${
          isCenterPosition 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : 'bottom-8 right-8'
        }`}
      >
        <div className="bg-[#0f1d32] border border-teal-500/30 rounded-2xl p-6 shadow-2xl shadow-teal-500/20 max-w-md">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-xs text-gray-500">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-gray-400 hover:text-white -mr-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-gray-400 mb-6">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip Tour
            </Button>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button 
                  variant="outline" 
                  onClick={handlePrev}
                  className="border-white/10 text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                className="bg-teal-500 hover:bg-teal-400 text-white"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Gift className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Sample data
const SAMPLE_SURVEYS = [
  {
    id: 'csat-2026',
    name: 'Customer Satisfaction Survey 2026',
    description: 'Measuring customer happiness and loyalty across all touchpoints',
    status: 'active',
    responses: 1247,
    target: 2000,
    completion: 62,
    forms: 3,
    team: 24,
    lastActivity: '2 hours ago',
    trend: '+12%'
  },
  {
    id: 'product-feedback',
    name: 'Product Feedback Q1',
    description: 'Gathering user feedback on new features and improvements',
    status: 'active',
    responses: 892,
    target: 1500,
    completion: 59,
    forms: 2,
    team: 15,
    lastActivity: '30 mins ago',
    trend: '+8%'
  },
  {
    id: 'event-reg',
    name: 'Annual Conference Registration',
    description: 'Event registration and session preferences for Summit 2026',
    status: 'completed',
    responses: 708,
    target: 700,
    completion: 100,
    forms: 1,
    team: 8,
    lastActivity: '3 days ago',
    trend: '0%'
  }
];

const SAMPLE_RESPONSES = [
  { id: 1, respondent: 'john.doe@email.com', survey: 'Customer Satisfaction', submitted: '2 mins ago', rating: 5, status: 'completed' },
  { id: 2, respondent: 'sarah.smith@company.com', survey: 'Product Feedback', submitted: '5 mins ago', rating: 4, status: 'completed' },
  { id: 3, respondent: 'mike.johnson@org.net', survey: 'Customer Satisfaction', submitted: '12 mins ago', rating: 5, status: 'completed' },
  { id: 4, respondent: 'emma.wilson@business.io', survey: 'Event Registration', submitted: '18 mins ago', rating: null, status: 'completed' },
  { id: 5, respondent: 'alex.brown@startup.co', survey: 'Product Feedback', submitted: '25 mins ago', rating: 3, status: 'completed' },
  { id: 6, respondent: 'lisa.davis@corp.com', survey: 'Customer Satisfaction', submitted: '32 mins ago', rating: 4, status: 'completed' },
  { id: 7, respondent: 'chris.taylor@agency.io', survey: 'Customer Satisfaction', submitted: '45 mins ago', rating: 5, status: 'completed' },
  { id: 8, respondent: 'jessica.martin@retail.com', survey: 'Product Feedback', submitted: '1 hour ago', rating: 4, status: 'completed' },
];

const RECENT_ACTIVITY = [
  { user: 'Sarah Johnson', action: 'submitted response to Customer Satisfaction', time: '2 mins ago', avatar: 'SJ' },
  { user: 'Mike Chen', action: 'completed Product Feedback survey', time: '5 mins ago', avatar: 'MC' },
  { user: 'Emily Roberts', action: 'registered for Annual Conference', time: '12 mins ago', avatar: 'ER' },
  { user: 'David Kim', action: 'submitted response to Customer Satisfaction', time: '18 mins ago', avatar: 'DK' },
  { user: 'Anna Thompson', action: 'completed Product Feedback survey', time: '25 mins ago', avatar: 'AT' },
];

const ANALYTICS_DATA = {
  responsesByDay: [
    { day: 'Mon', count: 245 },
    { day: 'Tue', count: 312 },
    { day: 'Wed', count: 287 },
    { day: 'Thu', count: 356 },
    { day: 'Fri', count: 298 },
    { day: 'Sat', count: 189 },
    { day: 'Sun', count: 160 },
  ],
  satisfactionBreakdown: [
    { rating: '5 Stars', count: 512, percent: 41 },
    { rating: '4 Stars', count: 387, percent: 31 },
    { rating: '3 Stars', count: 224, percent: 18 },
    { rating: '2 Stars', count: 87, percent: 7 },
    { rating: '1 Star', count: 37, percent: 3 },
  ]
};

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'surveys', icon: ClipboardList, label: 'Surveys' },
  { id: 'responses', icon: FileText, label: 'Responses' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'team', icon: Users, label: 'Team' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Survey360DemoSandbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDemoToast, setShowDemoToast] = useState(true);
  
  // Tour state
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDemoToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Check if tour was already shown
  useEffect(() => {
    const tourShown = localStorage.getItem('survey360_tour_completed');
    if (!tourShown) {
      // Show tour after a short delay
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    setTourCompleted(true);
    localStorage.setItem('survey360_tour_completed', 'true');
  };

  const handleStartTour = () => {
    setTourStep(0);
    setShowTour(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView surveys={SAMPLE_SURVEYS} activity={RECENT_ACTIVITY} />;
      case 'surveys':
        return <SurveysView surveys={SAMPLE_SURVEYS} onSelect={setSelectedSurvey} />;
      case 'responses':
        return <ResponsesView responses={SAMPLE_RESPONSES} />;
      case 'analytics':
        return <AnalyticsView data={ANALYTICS_DATA} />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView surveys={SAMPLE_SURVEYS} activity={RECENT_ACTIVITY} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1d32] border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/solutions/survey360/demo" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Demo
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Survey360</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 flex items-center gap-1.5">
              <Heart className="w-3 h-3" />
              Customer Feedback
              <ChevronDown className="w-3 h-3" />
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleStartTour}
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Take a Tour
            </Button>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
              onClick={() => navigate('/solutions/survey360/register')}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Browser Frame */}
      <div className="pt-14 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Browser Frame */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0f1d32]">
            {/* Browser Chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a1628]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-1.5 text-sm text-gray-400 ml-4">
                  <Lock className="w-3 h-3 text-green-400" />
                  app.survey360.io/dashboard
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                Live Demo
              </Badge>
            </div>

            {/* Demo Banner */}
            <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-b border-teal-500/20 px-4 py-2">
              <div className="flex items-center justify-center gap-2 text-sm text-teal-300">
                <Play className="w-4 h-4" />
                Sample data from Customer Feedback Survey — Actions like save & export are disabled
              </div>
            </div>

            {/* App Layout */}
            <div className="flex min-h-[600px]">
              {/* Sidebar */}
              <div className="w-56 border-r border-white/10 bg-[#0a1628] p-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
                    D
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Demo User</p>
                    <p className="text-xs text-gray-500">demo@survey360.io</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive 
                            ? 'bg-teal-500/10 text-teal-400' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Demo Mode Card */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                  <div className="flex items-center gap-2 text-teal-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Demo Mode</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Unlock all features with a free trial
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white"
                    onClick={() => navigate('/solutions/survey360/register')}
                  >
                    Start Free Trial
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-auto">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Toast */}
      <AnimatePresence>
        {showDemoToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-[#0f1d32] border border-white/10 rounded-xl p-4 shadow-xl max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Interactive Demo Mode</p>
                <p className="text-sm text-gray-400">
                  Explore the dashboard freely. All data is simulated and resets periodically.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ surveys, activity }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your survey overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Responses', value: '2,847', icon: FileText, change: '+12%', up: true, color: 'teal' },
          { label: 'Active Surveys', value: '3', icon: ClipboardList, change: '+1', up: true, color: 'blue' },
          { label: 'Completion Rate', value: '94%', icon: CheckCircle, change: '+3%', up: true, color: 'green' },
          { label: 'Pending Review', value: '127', icon: Clock, change: '-8%', up: false, color: 'orange' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-500/10`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} style={{ color: stat.color === 'teal' ? '#14b8a6' : stat.color === 'blue' ? '#3b82f6' : stat.color === 'green' ? '#10b981' : '#f59e0b' }} />
                </div>
                <Badge className={`text-xs ${stat.up ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Surveys + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Survey Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Surveys</h2>
            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
              <Plus className="w-4 h-4 mr-1" />
              New Survey
              <Lock className="w-3 h-3 ml-2 text-gray-500" />
            </Button>
          </div>
          
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-teal-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{survey.name}</h3>
                    <p className="text-xs text-gray-500">{survey.description}</p>
                  </div>
                </div>
                <Badge className={survey.status === 'active' ? 'bg-green-500/20 text-green-400 border-0' : 'bg-gray-500/20 text-gray-400 border-0'}>
                  {survey.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{survey.completion}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${survey.completion}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{survey.responses.toLocaleString()} submissions</span>
                <span>Target: {survey.target.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {survey.forms} forms
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {survey.team} team
                </span>
                <span className="ml-auto">{survey.lastActivity}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5">
            {activity.map((item, idx) => (
              <div key={idx} className="p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">{item.user}</span>{' '}
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Surveys View Component
function SurveysView({ surveys, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Surveys</h1>
          <p className="text-gray-400">Manage and monitor all your surveys</p>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-400 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
          <Lock className="w-3 h-3 ml-2 opacity-50" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search surveys..." 
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <div 
            key={survey.id} 
            className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-teal-500/30 transition-colors cursor-pointer"
            onClick={() => onSelect(survey)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{survey.name}</h3>
                  <p className="text-sm text-gray-500">{survey.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={survey.status === 'active' ? 'bg-green-500/20 text-green-400 border-0' : 'bg-gray-500/20 text-gray-400 border-0'}>
                  {survey.status}
                </Badge>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-xs text-gray-500">Responses</p>
                <p className="text-lg font-semibold text-white">{survey.responses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completion</p>
                <p className="text-lg font-semibold text-white">{survey.completion}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Team</p>
                <p className="text-lg font-semibold text-white">{survey.team}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Trend</p>
                <p className={`text-lg font-semibold ${survey.trend.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                  {survey.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Responses View Component
function ResponsesView({ responses }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Responses</h1>
          <p className="text-gray-400">View and manage survey responses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
            <Lock className="w-3 h-3 ml-2 opacity-50" />
          </Button>
          <Button variant="outline" className="border-white/10 text-gray-300">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Respondent</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Survey</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {responses.map((response) => (
              <tr key={response.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm text-white">{response.respondent}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-400">{response.survey}</p>
                </td>
                <td className="px-4 py-3">
                  {response.rating ? (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < response.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge className="bg-green-500/20 text-green-400 border-0">
                    {response.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-500">{response.submitted}</p>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ data }) {
  const maxCount = Math.max(...data.responsesByDay.map(d => d.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Insights and trends from your surveys</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 days
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Responses Chart */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="font-semibold text-white mb-4">Responses This Week</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {data.responsesByDay.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-teal-500 to-cyan-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(day.count / maxCount) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Satisfaction Breakdown */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="font-semibold text-white mb-4">Satisfaction Breakdown</h3>
          <div className="space-y-3">
            {data.satisfactionBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.rating}</span>
                  <span className="text-white">{item.percent}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Team View Component
function TeamView() {
  const teamMembers = [
    { name: 'Sarah Johnson', role: 'Admin', email: 'sarah@company.com', surveys: 12, avatar: 'SJ' },
    { name: 'Mike Chen', role: 'Editor', email: 'mike@company.com', surveys: 8, avatar: 'MC' },
    { name: 'Emily Roberts', role: 'Viewer', email: 'emily@company.com', surveys: 5, avatar: 'ER' },
    { name: 'David Kim', role: 'Editor', email: 'david@company.com', surveys: 7, avatar: 'DK' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-gray-400">Manage team members and permissions</p>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-400 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
          <Lock className="w-3 h-3 ml-2 opacity-50" />
        </Button>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                {member.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{member.surveys}</p>
                <p className="text-xs text-gray-500">Surveys</p>
              </div>
              <Badge className="bg-white/10 text-gray-300 border-0">{member.role}</Badge>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings View Component
function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Configure your account and preferences</p>
      </div>

      <div className="grid gap-6">
        {[
          { title: 'Profile Settings', description: 'Update your name, email, and profile picture', icon: Users },
          { title: 'Branding', description: 'Customize colors, logo, and survey appearance', icon: Layers },
          { title: 'Notifications', description: 'Configure email and push notifications', icon: Bell },
          { title: 'Integrations', description: 'Connect with Slack, Zapier, and more', icon: Share2 },
          { title: 'Billing', description: 'Manage subscription and payment methods', icon: FileText },
          { title: 'API Access', description: 'Generate API keys and manage access', icon: Settings },
        ].map((setting, idx) => {
          const Icon = setting.icon;
          return (
            <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-center justify-between hover:border-teal-500/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{setting.title}</h3>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Survey360DemoSandbox;
