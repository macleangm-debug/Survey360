import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore, useOrgStore } from '../store';
import { authAPI, orgAPI } from '../lib/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { setOrganizations, setCurrentOrg } = useOrgStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      login(response.data.user, response.data.access_token);
      
      // Load organizations
      try {
        const orgsRes = await orgAPI.list();
        setOrganizations(orgsRes.data);
        if (orgsRes.data.length > 0) {
          setCurrentOrg(orgsRes.data[0]);
        }
      } catch (e) {
        console.error('Failed to load orgs:', e);
      }
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-teal-500/5" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-lg gradient-teal flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-white">Survey360</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
              Complete Survey
              <br />
              Lifecycle Management
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              From design to analysis, Survey360 handles every aspect of your survey operations.
              Built for research teams and data-driven organizations.
            </p>
            
            <div className="mt-10 space-y-4">
              {[
                'Drag & drop survey builder',
                'Offline data collection',
                'Real-time quality monitoring'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white/70">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-border">
            <CardHeader className="text-center pb-2">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-teal flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Survey360</span>
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Demo Credentials */}
              <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <span className="font-medium text-teal-600 dark:text-teal-400 text-sm">Demo Credentials</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <code className="bg-background px-2 py-0.5 rounded text-teal-600 dark:text-teal-400 font-mono text-xs">demo@survey360.io</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Password:</span>
                    <code className="bg-background px-2 py-0.5 rounded text-teal-600 dark:text-teal-400 font-mono text-xs">Test123!</code>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-teal border-0" 
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium" data-testid="register-link">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
