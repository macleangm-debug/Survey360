import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore, useOrgStore } from '../../store';
import survey360Api from '../../lib/survey360Api';
import { toast } from 'sonner';

export function Survey360LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { setOrganizations, setCurrentOrg } = useOrgStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Survey360 Login attempt:', { email, password: '***' });
    try {
      // Use the Survey360 backend
      console.log('Making API call to Survey360 backend...');
      const response = await survey360Api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      setAuth(response.data.user, response.data.access_token);
      
      // Load organizations
      try {
        const orgsRes = await survey360Api.get('/organizations');
        setOrganizations(orgsRes.data);
        if (orgsRes.data.length > 0) {
          setCurrentOrg(orgsRes.data[0]);
        }
      } catch (e) {
        console.error('Failed to load orgs:', e);
      }
      
      toast.success('Welcome back!');
      navigate('/solutions/survey360/app/dashboard');
    } catch (error) {
      console.error('Survey360 Login error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-teal-500/5" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/solutions/survey360" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-white">Survey360</span>
            </Link>
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
                'Real-time response tracking',
                'Advanced analytics & exports'
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
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="text-center pb-2">
              <Link to="/solutions/survey360" className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Survey360</span>
              </Link>
              <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
              <CardDescription className="text-gray-400">Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Demo Credentials */}
              <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <span className="font-medium text-teal-400 text-sm">Demo Credentials</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email:</span>
                    <code className="bg-white/5 px-2 py-0.5 rounded text-teal-400 font-mono text-xs">demo@survey360.io</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Password:</span>
                    <code className="bg-white/5 px-2 py-0.5 rounded text-teal-400 font-mono text-xs">Test123!</code>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0" 
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/solutions/survey360/register" className="text-teal-400 hover:underline font-medium" data-testid="register-link">
                  Sign up
                </Link>
              </p>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <Link 
                  to="/solutions/survey360" 
                  className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Survey360 Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export function Survey360RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await survey360Api.post('/auth/register', { email, password, name });
      setAuth(response.data.user, response.data.access_token);
      toast.success('Account created successfully!');
      navigate('/solutions/survey360/app/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="text-center pb-2">
            <Link to="/solutions/survey360" className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Survey360</span>
            </Link>
            <CardTitle className="text-2xl text-white">Create account</CardTitle>
            <CardDescription className="text-gray-400">Start managing your surveys today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                  data-testid="register-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                  data-testid="register-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                  minLength={6}
                  data-testid="register-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0" 
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/solutions/survey360/login" className="text-teal-400 hover:underline font-medium" data-testid="login-link">
                Sign in
              </Link>
            </p>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <Link 
                to="/solutions/survey360" 
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Survey360 Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Survey360LoginPage;
