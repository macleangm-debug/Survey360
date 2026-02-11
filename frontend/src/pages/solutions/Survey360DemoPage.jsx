import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Play,
  ArrowRight,
  BarChart3,
  Users,
  FileText,
  PieChart,
  ChevronDown,
  Sparkles,
  Eye,
  MousePointerClick,
  Layers,
  Share2,
  Download,
  Settings,
  Camera
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const DEMO_FEATURES = [
  {
    icon: ClipboardList,
    title: 'Survey Builder',
    description: 'Drag-and-drop interface with 10+ question types, skip logic, and customization.',
    color: '#14b8a6',
    stats: '3 sample surveys'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Interactive charts, response trends, and completion rates at a glance.',
    color: '#3b82f6',
    stats: '2,847 responses'
  },
  {
    icon: Users,
    title: 'Response Management',
    description: 'View individual responses, filter by date, and manage submissions.',
    color: '#8b5cf6',
    stats: '100% data visibility'
  },
  {
    icon: Share2,
    title: 'Distribution Tools',
    description: 'Share via link, QR code, embed code, or email invitations.',
    color: '#f59e0b',
    stats: 'Multiple channels'
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download responses as CSV or generate PDF reports.',
    color: '#ec4899',
    stats: 'CSV & PDF'
  },
  {
    icon: Settings,
    title: 'Survey Settings',
    description: 'Customize branding, set response limits, and configure notifications.',
    color: '#06b6d4',
    stats: 'Full control'
  }
];

export function Survey360DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/solutions/survey360" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Survey360</span>
            </Link>
            
            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-white/5 rounded-full p-1">
                <Link to="/solutions/survey360#features" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">Features</Link>
                <Link to="/solutions/survey360#how-it-works" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">How It Works</Link>
                <Link to="/solutions/survey360#use-cases" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">Use Cases</Link>
                <Link to="/solutions/survey360#pricing" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">Pricing</Link>
                <Link to="/solutions/survey360/demo" className="px-4 py-1.5 text-sm text-teal-400 bg-teal-500/10 rounded-full flex items-center gap-1.5">
                  <Play className="w-3 h-3" />
                  Demo
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white"
                onClick={() => navigate('/solutions/survey360/login')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Log in
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0"
                onClick={() => navigate('/solutions/survey360/register')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating decorative icons */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-[10%] w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
        >
          <BarChart3 className="w-6 h-6 text-blue-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-48 right-[10%] w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
        >
          <FileText className="w-6 h-6 text-purple-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-[5%] w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center"
        >
          <Users className="w-5 h-5 text-teal-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-48 right-[8%] w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"
        >
          <Camera className="w-5 h-5 text-cyan-400" />
        </motion.div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Interactive Demo
            </Badge>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            <span className="italic">Experience Survey360</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Before You Sign Up
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Explore our complete survey platform with real sample data. 
            No account needed - just click and discover.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0 px-8 py-6 text-lg shadow-xl shadow-teal-500/30"
              onClick={() => navigate('/solutions/survey360/demo/sandbox')}
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Interactive Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-white/5 px-8 py-6"
              onClick={() => navigate('/solutions/survey360/register')}
            >
              Start Free Trial
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-8 sm:gap-16 flex-wrap"
          >
            {[
              { value: '6', label: 'Interactive tabs' },
              { value: '3', label: 'Sample surveys' },
              { value: '2,847', label: 'Demo responses', highlight: true },
              { value: '47', label: 'Simulated users' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className={`text-2xl sm:text-3xl font-bold ${stat.highlight ? 'text-teal-400' : 'text-white'}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mt-12"
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </motion.div>
      </section>

      {/* What You'll Explore Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What You'll Explore
            </h2>
            <p className="text-gray-400">
              Click on any feature to see it in action within our interactive demo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-teal-500/50 transition-all group"
                  onClick={() => navigate('/solutions/survey360/demo/sandbox')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs">
                      {feature.stats}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0f1d32] p-2"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-1.5 text-sm text-gray-400">
                  <span className="text-gray-500">🔒</span>
                  app.survey360.io/dashboard
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                Live Demo
              </Badge>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 bg-[#0a1628] rounded-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-teal-400">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Sample data from Customer Feedback Survey — Actions like save & export are disabled</span>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Responses', value: '2,847', change: '+12%', color: 'teal' },
                  { label: 'Completion Rate', value: '94%', change: '+3%', color: 'green' },
                  { label: 'Avg. Time', value: '2:34', change: '-8%', color: 'blue' },
                  { label: 'Active Surveys', value: '3', change: '0', color: 'purple' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color === 'teal' ? '#14b8a6' : stat.color === 'green' ? '#10b981' : stat.color === 'blue' ? '#3b82f6' : '#8b5cf6'}15` }}
                      >
                        {stat.color === 'teal' && <FileText className="w-5 h-5 text-teal-400" />}
                        {stat.color === 'green' && <PieChart className="w-5 h-5 text-green-400" />}
                        {stat.color === 'blue' && <Eye className="w-5 h-5 text-blue-400" />}
                        {stat.color === 'purple' && <Layers className="w-5 h-5 text-purple-400" />}
                      </div>
                      <Badge className={`text-xs ${stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : stat.change.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Sample survey cards */}
              <div className="grid lg:grid-cols-3 gap-4">
                {[
                  { name: 'Customer Satisfaction', responses: '1,247', status: 'active', progress: 62 },
                  { name: 'Product Feedback', responses: '892', status: 'active', progress: 45 },
                  { name: 'Event Registration', responses: '708', status: 'completed', progress: 100 }
                ].map((survey, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-teal-400" />
                      </div>
                      <Badge className={survey.status === 'active' ? 'bg-green-500/20 text-green-400 border-0' : 'bg-gray-500/20 text-gray-400 border-0'}>
                        {survey.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-white mb-1">{survey.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{survey.responses} responses</p>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{survey.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                        style={{ width: `${survey.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Try It Yourself?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Launch the interactive demo to explore all features with real sample data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0 px-8 py-6 text-lg shadow-xl shadow-teal-500/30"
              onClick={() => navigate('/solutions/survey360/demo/sandbox')}
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Interactive Demo
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-white/5 px-8 py-6"
              onClick={() => navigate('/solutions/survey360/register')}
            >
              Start Free Trial
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 500 free responses • Full onboarding included
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Survey360</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Survey360. A product of DataVision International.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Survey360DemoPage;
