import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ClipboardList,
  Globe,
  WifiOff,
  Shield,
  BarChart3,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  FileText,
  MapPin,
  Languages,
  Smartphone,
  Cloud
} from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Drag & Drop Builder',
    description: 'Create complex surveys with our intuitive questionnaire builder. No coding required.'
  },
  {
    icon: Languages,
    title: 'Multi-Language Support',
    description: 'Deploy surveys in multiple languages including English and Swahili.'
  },
  {
    icon: WifiOff,
    title: 'Offline Data Collection',
    description: 'Collect responses anywhere, even without internet. Auto-sync when connected.'
  },
  {
    icon: Shield,
    title: 'Real-Time Quality Monitoring',
    description: 'AI-powered quality checks ensure data integrity during collection.'
  },
  {
    icon: Zap,
    title: 'Skip Logic & Validation',
    description: 'Build smart surveys with conditional logic and real-time validation.'
  },
  {
    icon: MapPin,
    title: 'GPS & Multimedia',
    description: 'Capture location data, photos, videos, and audio alongside responses.'
  }
];

const stats = [
  { value: '10M+', label: 'Responses Collected' },
  { value: '50+', label: 'Countries Served' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '500+', label: 'Organizations' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-teal flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Survey360</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-teal border-0">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-teal-500/10 text-teal-500 border-teal-500/20">
                End-to-End Survey Management
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Complete Survey Lifecycle{' '}
                <span className="text-gradient">Management</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                From design to analysis, Survey360 handles every aspect of your survey operations. 
                Built for organizations that demand reliability, scalability, and actionable insights.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="gradient-teal border-0">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-background flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-500" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-foreground">500+ organizations</span>
                  <span className="text-muted-foreground"> trust Survey360</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-teal-500/20 border border-border">
                <div className="aspect-[4/3] bg-gradient-to-br from-teal-950 to-teal-900 p-6">
                  {/* Mock Dashboard UI */}
                  <div className="bg-card/50 backdrop-blur rounded-xl p-4 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-8 bg-teal-500/20 rounded-lg w-3/4" />
                      <div className="h-24 bg-teal-500/10 rounded-lg" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-16 bg-teal-500/20 rounded-lg" />
                        <div className="h-16 bg-teal-500/20 rounded-lg" />
                        <div className="h-16 bg-teal-500/20 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">1,234 responses</p>
                    <p className="text-xs text-muted-foreground">collected today</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-display font-bold text-gradient">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-500 border-teal-500/20">Features</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need for Survey Excellence
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for research teams, M&E professionals, and data-driven organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-teal-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl gradient-teal flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl gradient-teal p-8 sm:p-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Ready to Transform Your Survey Operations?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Join 500+ organizations already using Survey360 to collect better data, faster.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="bg-white text-teal-700 hover:bg-white/90">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-foreground">Survey360</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Survey360. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
