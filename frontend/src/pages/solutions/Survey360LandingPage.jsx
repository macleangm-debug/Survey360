import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChevronDown,
  QrCode,
  PieChart,
  GitBranch,
  Palette,
  Download,
  Sparkles,
  MousePointerClick,
  Building2,
  GraduationCap,
  Heart,
  ShoppingBag,
  Briefcase,
  HeartPulse,
  Calendar,
  Hotel,
  Send,
  Share2,
  FileText,
  Lock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const FEATURES = [
  { icon: ClipboardList, title: 'Drag & Drop Builder', description: '10+ question types. Build beautiful surveys in minutes.', color: '#14b8a6' },
  { icon: GitBranch, title: 'Smart Skip Logic', description: 'Show questions based on previous answers.', color: '#3b82f6' },
  { icon: QrCode, title: 'QR & Embed', description: 'Share via QR codes or embed on any website.', color: '#8b5cf6' },
  { icon: Lock, title: 'Secure Responses', description: 'All data encrypted and stored securely.', color: '#f59e0b' },
  { icon: Palette, title: 'Custom Branding', description: 'Your logo, your colors, your identity.', color: '#ec4899' },
  { icon: Share2, title: 'Easy Sharing', description: 'Public links, private invites, email distribution.', color: '#06b6d4' },
  { icon: PieChart, title: 'Real-Time Analytics', description: 'Charts and insights as responses come in.', color: '#10b981' },
  { icon: Download, title: 'Export Anywhere', description: 'Download as CSV for any analysis tool.', color: '#6366f1' }
];

const USE_CASES = [
  {
    title: 'Customer Experience',
    icon: Heart,
    description: 'Understand your customers better with feedback surveys, NPS tracking, and satisfaction measurement.',
    examples: ['Customer satisfaction', 'Product feedback', 'Support ratings']
  },
  {
    title: 'Market Research',
    icon: BarChart3,
    description: 'Validate ideas and understand your market with targeted research surveys and concept testing.',
    examples: ['Consumer insights', 'Brand awareness', 'Pricing research']
  },
  {
    title: 'Employee Engagement',
    icon: Users,
    description: 'Build a better workplace with engagement surveys, pulse checks, and 360° feedback.',
    examples: ['Engagement surveys', 'Exit interviews', 'Team feedback']
  },
  {
    title: 'Events & Registration',
    icon: Calendar,
    description: 'Manage events effortlessly with registration forms, RSVPs, and post-event surveys.',
    examples: ['Event registration', 'Attendee feedback', 'Speaker ratings']
  },
  {
    title: 'Education & Academia',
    icon: GraduationCap,
    description: 'Improve learning outcomes with course evaluations, student feedback, and research studies.',
    examples: ['Course evaluations', 'Student surveys', 'Research studies']
  },
  {
    title: 'Healthcare',
    icon: HeartPulse,
    description: 'Enhance patient care with satisfaction surveys, intake forms, and health assessments.',
    examples: ['Patient satisfaction', 'Appointment follow-up', 'Health screenings']
  }
];

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    features: ['3 surveys', '100 responses/month', '10 question types', 'Basic analytics', 'CSV export'],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['Unlimited surveys', '2,500 responses/month', 'Skip logic', 'Custom branding', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    features: ['Everything in Pro', '10,000 responses/month', 'Team collaboration', 'API access', 'SSO'],
    cta: 'Contact Sales',
    popular: false
  }
];

export function Survey360LandingPage() {
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
                <a href="#features" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">Features</a>
                <a href="#how-it-works" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">How It Works</a>
                <a href="#use-cases" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">Use Cases</a>
                <a href="#pricing" className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-full">Pricing</a>
                <button className="px-4 py-1.5 text-sm text-teal-400 bg-teal-500/10 rounded-full flex items-center gap-1.5 hover:bg-teal-500/20 transition-colors">
                  <Play className="w-3 h-3" />
                  Demo
                </button>
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating decorative icons */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-[10%] w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center"
        >
          <ClipboardList className="w-6 h-6 text-teal-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-48 right-[10%] w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
        >
          <PieChart className="w-6 h-6 text-purple-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-[8%] w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
        >
          <Send className="w-5 h-5 text-blue-400" />
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo and badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4 shadow-xl shadow-teal-500/30">
                <ClipboardList className="w-10 h-10 text-white" />
              </div>
              <span className="text-2xl font-bold text-white mb-2">Survey360</span>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                By DataVision International
              </Badge>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Beautiful Surveys
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Made Simple
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Create professional surveys in minutes. Collect responses anywhere. 
              Get insights instantly - all in one simple platform.
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
                onClick={() => navigate('/solutions/survey360/register')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/5 px-8 py-6"
                onClick={() => navigate('/solutions/survey360/login')}
              >
                <Play className="w-5 h-5 mr-2" />
                Try Interactive Demo
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
                { value: '500+', label: 'Free responses' },
                { value: '100%', label: 'Free forever' },
                { value: '10+', label: 'Question types' },
                { value: '24/7', label: 'Support' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mt-16"
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-white/10 text-gray-300 border-white/20 mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              From Idea to Insights in 4 Steps
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Survey360 simplifies the entire survey workflow - from design to analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                step: 1, 
                title: 'Design Survey', 
                description: 'Use our drag-and-drop builder. Add skip logic, branding, and more.',
                color: '#14b8a6',
                mockup: (
                  <div className="space-y-2 mt-4">
                    <div className="h-2 bg-teal-400 rounded w-3/4" />
                    <div className="h-2 bg-white/20 rounded w-full" />
                    <div className="h-2 bg-teal-400/60 rounded w-1/2" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-6 w-12 bg-teal-500 rounded" />
                      <div className="h-6 w-12 bg-white/10 rounded" />
                    </div>
                  </div>
                )
              },
              { 
                step: 2, 
                title: 'Share Anywhere', 
                description: 'Send via link, QR code, email, or embed on your website.',
                color: '#3b82f6',
                mockup: (
                  <div className="mt-4 relative">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Sharing
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-blue-400 rounded w-full" />
                        <div className="h-2 bg-white/20 rounded w-3/4" />
                        <div className="h-2 bg-white/20 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                )
              },
              { 
                step: 3, 
                title: 'Collect Responses', 
                description: 'Respondents fill out your survey. All data captured securely.',
                color: '#8b5cf6',
                mockup: (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      { icon: FileText, label: 'Form' },
                      { icon: QrCode, label: 'QR' },
                      { icon: Send, label: 'Email' },
                      { icon: Lock, label: 'Secure' }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                        <item.icon className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                        <span className="text-[10px] text-gray-500">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )
              },
              { 
                step: 4, 
                title: 'Analyze Results', 
                description: 'View real-time charts. Export data. Make decisions.',
                color: '#f59e0b',
                mockup: (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">Live</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Responses</span>
                      <span className="text-white font-semibold">1,234</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                )
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mb-4"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
                {item.mockup}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for Better Surveys
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">Use Cases</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Every Industry
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From startups to enterprises, teams worldwide use Survey360 to collect insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-teal-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{useCase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {useCase.examples.map((ex, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Also used in: Real Estate • Consulting • Non-profits • Hospitality • Retail • Government
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white/5 border rounded-xl p-6 ${
                  plan.popular ? 'border-teal-500 ring-1 ring-teal-500/50' : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  onClick={() => navigate('/solutions/survey360/register')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            All plans include SSL encryption and GDPR compliance.
          </p>
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
            Ready to Create Better Surveys?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of teams collecting insights with Survey360.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-0 px-8 py-6 text-lg shadow-xl shadow-teal-500/30"
              onClick={() => navigate('/solutions/survey360/register')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-white/5 px-8 py-6"
              onClick={() => navigate('/solutions/survey360/pricing')}
            >
              View Pricing
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

export default Survey360LandingPage;
