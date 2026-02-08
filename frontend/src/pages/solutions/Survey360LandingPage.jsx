import React, { useState } from 'react';
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
  Smartphone,
  Cloud,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Drag & Drop Builder',
    description: 'Create beautiful surveys in minutes with our intuitive drag-and-drop interface. 10+ question types supported.'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track responses as they come in. Visualize trends and export data in multiple formats.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team. Share surveys, assign roles, and manage permissions.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Surveys that look great on any device. Responsive design for maximum completion rates.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, GDPR compliance, and SOC 2 Type II certified infrastructure.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed. Surveys load instantly and responses are captured in real-time.'
  }
];

const STATS = [
  { value: '10M+', label: 'Responses Collected' },
  { value: '50+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
  { value: '500+', label: 'Organizations' }
];

const TESTIMONIALS = [
  {
    quote: "Survey360 transformed how we collect field data. The offline capability alone saved us thousands of hours.",
    author: "Dr. Sarah Kimani",
    role: "Research Director, APHRC",
    rating: 5
  },
  {
    quote: "The best survey platform we've used. Simple yet powerful, with excellent support.",
    author: "James Okonkwo",
    role: "M&E Manager, World Bank",
    rating: 5
  }
];

export function Survey360LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Survey360</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
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
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
                onClick={() => navigate('/solutions/survey360/register')}
                data-testid="nav-getstarted-btn"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-teal-500/5" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                <span className="text-teal-400 text-sm font-medium">End-to-End Survey Management</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Complete Survey
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                  Lifecycle Management
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                From design to analysis, Survey360 handles every aspect of your survey operations. 
                Built for organizations that demand reliability, scalability, and actionable insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 px-8"
                  onClick={() => navigate('/solutions/survey360/register')}
                  data-testid="hero-start-btn"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-white/5"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-[#0a1628] flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-semibold">500+</span> organizations trust Survey360
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-[#0f2137] to-[#0a1628] rounded-2xl border border-white/10 p-2 shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-white rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">1,234 responses</p>
                    <p className="text-xs text-gray-500">collected today</p>
                  </div>
                </div>
                
                <div className="bg-[#0f2137] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-8 bg-teal-500/20 rounded-lg border border-teal-500/30" />
                    <div className="h-20 bg-teal-500/10 rounded-lg border border-teal-500/20" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-teal-500/20 rounded-lg border border-teal-500/30" />
                      <div className="h-16 bg-teal-500/10 rounded-lg border border-teal-500/20" />
                      <div className="h-16 bg-teal-500/20 rounded-lg border border-teal-500/30" />
                    </div>
                    <div className="h-24 bg-teal-500/10 rounded-lg border border-teal-500/20" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                  {stat.value}
                </p>
                <p className="text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need for professional surveys
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for research teams, NGOs, and data-driven organizations.
            </p>
          </div>

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
                >
                  <Card className="bg-white/5 border-white/10 hover:border-teal-500/50 transition-colors h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-teal-400" />
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-teal-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by leading organizations
            </h2>
            <p className="text-gray-400">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 text-lg mb-6 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to transform your data collection?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join 500+ organizations already using Survey360 to collect better data, faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 px-8"
                onClick={() => navigate('/solutions/survey360/register')}
                data-testid="cta-start-btn"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-white/5"
                onClick={() => navigate('/solutions/survey360/login')}
              >
                Sign In
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
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
              © 2025 Survey360. A product of DataVision International.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Survey360LandingPage;
