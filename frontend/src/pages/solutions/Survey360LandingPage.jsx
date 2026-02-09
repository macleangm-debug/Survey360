import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Play,
  Star,
  Globe,
  Smartphone,
  ChevronRight,
  QrCode,
  Code,
  PieChart,
  GitBranch,
  Palette,
  Image,
  Download,
  Clock,
  Target,
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Drag & Drop Builder',
    description: '10+ question types including ratings, multiple choice, and open text. Build surveys in minutes.',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    icon: GitBranch,
    title: 'Smart Skip Logic',
    description: 'Show or hide questions based on previous answers. Create dynamic, personalized surveys.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: QrCode,
    title: 'QR Code & Embed',
    description: 'Generate QR codes instantly. Embed surveys on your website with one click.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: PieChart,
    title: 'Real-Time Analytics',
    description: 'Beautiful charts and graphs. Watch responses come in live with instant insights.',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description: 'Upload your logo, choose brand colors. Make surveys match your identity.',
    color: 'from-rose-500 to-red-500'
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Download responses as CSV. Analyze in Excel, Google Sheets, or any tool.',
    color: 'from-green-500 to-lime-500'
  }
];

const STATS = [
  { value: '10K+', label: 'Surveys Created', icon: ClipboardList },
  { value: '1M+', label: 'Responses', icon: Users },
  { value: '99.9%', label: 'Uptime', icon: Zap },
  { value: '50+', label: 'Countries', icon: Globe }
];

const TESTIMONIALS = [
  {
    quote: "Survey360 transformed how we collect customer feedback. Setup took 5 minutes and we had insights the same day.",
    author: "Sarah Chen",
    role: "Product Manager, TechCorp",
    rating: 5,
    avatar: "SC"
  },
  {
    quote: "The skip logic feature alone saved us hours of manual data cleaning. Finally, surveys that make sense!",
    author: "James Wilson",
    role: "Research Lead, DataFirst",
    rating: 5,
    avatar: "JW"
  },
  {
    quote: "We embedded surveys on our website and response rates went up 3x. The QR codes are perfect for events.",
    author: "Maria Garcia",
    role: "Marketing Director, GrowthCo",
    rating: 5,
    avatar: "MG"
  }
];

const USE_CASES = [
  { title: 'Customer Feedback', icon: Users, description: 'Understand what your customers really think' },
  { title: 'Market Research', icon: Target, description: 'Validate ideas before you build' },
  { title: 'Employee Surveys', icon: ClipboardList, description: 'Measure engagement and satisfaction' },
  { title: 'Event Registration', icon: QrCode, description: 'Collect RSVPs with QR codes' }
];

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  
  useEffect(() => {
    let start = 0;
    const increment = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue, duration]);
  
  return <>{count.toLocaleString()}{suffix}</>;
};

// Floating animation for screenshots
const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export function Survey360LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/solutions/survey360" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25"
              >
                <ClipboardList className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">Survey360</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/solutions/survey360/login')}
                data-testid="nav-signin-btn"
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0 shadow-lg shadow-teal-500/25"
                onClick={() => navigate('/solutions/survey360/register')}
                data-testid="nav-getstarted-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/30 mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-teal-300 text-sm font-medium">No credit card required</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Create Surveys
                <br />
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 animate-gradient">
                    That Get Answers
                  </span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                Build beautiful surveys in minutes. Collect responses anywhere. 
                Get insights instantly. <span className="text-white font-medium">It's that simple.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0 px-8 py-6 text-lg shadow-xl shadow-teal-500/30 w-full sm:w-auto"
                    onClick={() => navigate('/solutions/survey360/register')}
                    data-testid="hero-start-btn"
                  >
                    <MousePointerClick className="w-5 h-5 mr-2" />
                    Create Your First Survey
                  </Button>
                </motion.div>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-white/5 hover:border-teal-500/50 px-6 py-6"
                  onClick={() => navigate('/solutions/survey360/login')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  See Demo
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['SC', 'JW', 'MG', 'AK'].map((initials, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 border-2 border-[#0a1628] flex items-center justify-center text-xs font-bold text-white"
                      >
                        {initials}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-semibold">2,000+</span> happy users
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-400 ml-1">4.9/5</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Screenshot/Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main dashboard mockup */}
              <motion.div 
                animate={floatAnimation}
                className="relative bg-gradient-to-br from-[#0f2137] to-[#0a1628] rounded-2xl border border-white/10 p-1 shadow-2xl shadow-teal-500/10"
              >
                {/* Browser chrome */}
                <div className="bg-[#1a2d47] rounded-t-xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-[#0f2137] rounded-lg px-3 py-1 text-xs text-gray-500 text-center">
                    survey360.io/dashboard
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="bg-[#0f2137] rounded-b-xl p-4 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 rounded-lg p-3 border border-teal-500/20">
                      <p className="text-xs text-teal-400">Surveys</p>
                      <p className="text-xl font-bold text-white">12</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs text-purple-400">Responses</p>
                      <p className="text-xl font-bold text-white">1,847</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-3 border border-orange-500/20">
                      <p className="text-xs text-orange-400">Rate</p>
                      <p className="text-xl font-bold text-white">94%</p>
                    </div>
                  </div>
                  
                  {/* Chart mockup */}
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent responses */}
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + i * 0.15 }}
                        className="flex items-center gap-3 bg-white/5 rounded-lg p-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500" />
                        <div className="flex-1">
                          <div className="h-2 bg-white/20 rounded w-24" />
                          <div className="h-2 bg-white/10 rounded w-16 mt-1" />
                        </div>
                        <Badge className="bg-teal-500/20 text-teal-400 border-0 text-xs">New</Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">New response!</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </motion.div>

              {/* Floating QR code */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 2.8, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl p-3 shadow-xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Scan to respond</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-purple-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 mb-4">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Three steps to better insights
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get from zero to collecting responses in under 5 minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create', description: 'Build your survey with our drag-and-drop builder. Add questions, logic, and branding.', icon: ClipboardList },
              { step: '02', title: 'Share', description: 'Send via link, QR code, or embed on your website. Reach respondents anywhere.', icon: QrCode },
              { step: '03', title: 'Analyze', description: 'Watch responses come in. View charts, export data, and make decisions.', icon: PieChart }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-teal-500/50 to-transparent z-0" />
                  )}
                  <Card className="bg-white/5 border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-2 relative z-10">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl font-bold text-teal-500/20 mb-4">{item.step}</div>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">Powerful Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built for simplicity without sacrificing power
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-teal-500/50 transition-all duration-300 h-full group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Perfect for every use case
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-teal-500/50 transition-all"
                >
                  <Icon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">{useCase.title}</h3>
                  <p className="text-sm text-gray-500">{useCase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by thousands
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 h-full hover:border-yellow-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{testimonial.author}</p>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-teal-500/10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create your first survey in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0 px-10 py-6 text-lg shadow-xl shadow-teal-500/30"
                onClick={() => navigate('/solutions/survey360/register')}
                data-testid="cta-start-btn"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
            </motion.div>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-white/5 px-8 py-6"
              onClick={() => navigate('/solutions/survey360/login')}
            >
              Sign In
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            <CheckCircle className="w-4 h-4 inline mr-1 text-teal-500" />
            Free forever for basic use
            <span className="mx-2">•</span>
            <CheckCircle className="w-4 h-4 inline mr-1 text-teal-500" />
            No credit card needed
            <span className="mx-2">•</span>
            <CheckCircle className="w-4 h-4 inline mr-1 text-teal-500" />
            Setup in 2 minutes
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
        </div>
      </footer>
    </div>
  );
}

export default Survey360LandingPage;
