import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useAuthStore } from '../store';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

// DataVision Logo Component
const DataVisionLogo = ({ size = 'lg' }) => {
  const sizes = {
    sm: { wrapper: 'gap-0.5', circle: 'w-6 h-6', text: 'text-xs', dot: 'w-1.5 h-1.5' },
    md: { wrapper: 'gap-1', circle: 'w-8 h-8', text: 'text-sm', dot: 'w-2 h-2' },
    lg: { wrapper: 'gap-1', circle: 'w-10 h-10', text: 'text-base', dot: 'w-2.5 h-2.5' },
    xl: { wrapper: 'gap-2', circle: 'w-14 h-14', text: 'text-xl', dot: 'w-3 h-3' },
  };
  const s = sizes[size];

  return (
    <div className={`inline-flex items-center ${s.wrapper}`}>
      {/* D Circle - Red */}
      <div className={`${s.circle} rounded-full flex items-center justify-center font-barlow font-bold text-white bg-gradient-to-br from-[#E53935] to-[#C62828] ${s.text}`}>
        d
      </div>
      {/* V Circle - Gray with red dot and navy V */}
      <div className={`${s.circle} rounded-full flex flex-col items-center justify-center relative bg-gradient-to-br from-[#90A4AE] to-[#78909C]`}>
        <div className={`absolute top-1 rounded-full bg-[#E53935] ${s.dot}`} />
        <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 mt-1" fill="#1A237E">
          <path d="M12 19L5 5h4l3 9 3-9h4l-7 14z" />
        </svg>
      </div>
    </div>
  );
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      setAuth(response.data.user, response.data.access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await authAPI.getSSOUrl(redirectUri);
      window.location.href = response.data.auth_url;
    } catch (error) {
      toast.error('Failed to initialize SSO login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient Background with Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E53935] via-[#78909C] to-[#1A237E] animate-gradient" />
        
        {/* Overlay patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <DataVisionLogo size="xl" />
              <span className="font-barlow text-4xl font-bold tracking-tight text-white">
                DataPulse
              </span>
            </div>
            <h1 className="font-barlow text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
              Field Data Collection
              <br />
              <span className="text-white/80">Reimagined</span>
            </h1>
            <p className="text-lg text-white/90 max-w-md leading-relaxed">
              Enterprise-grade platform for research, monitoring & evaluation. 
              Collect data anywhere, even offline. Powered by DataVision.
            </p>
            
            {/* Feature highlights */}
            <div className="mt-8 space-y-3">
              {['Offline-first collection', 'Real-time quality monitoring', 'Multi-language support'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-[#E53935]/10 shadow-xl shadow-[#E53935]/5">
            <CardHeader className="text-center pb-2">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <DataVisionLogo size="lg" />
                <span className="font-barlow text-2xl font-bold">
                  <span className="text-[#E53935]">Data</span>
                  <span className="text-[#1A237E]">Pulse</span>
                </span>
              </div>
              <CardTitle className="font-barlow text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909C]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-[#78909C]/30 focus:border-[#E53935] focus:ring-[#E53935]/20"
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909C]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-[#78909C]/30 focus:border-[#E53935] focus:ring-[#E53935]/20"
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#E53935] to-[#C62828] hover:from-[#C62828] hover:to-[#B71C1C] text-white shadow-lg shadow-[#E53935]/25" 
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="relative my-6">
                <Separator className="bg-[#78909C]/30" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-[#78909C]">
                  OR
                </span>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-[#1A237E]/30 text-[#1A237E] hover:bg-[#1A237E]/5 hover:border-[#1A237E]/50" 
                onClick={handleSSOLogin}
                data-testid="sso-login-btn"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue with Software Galaxy SSO
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-[#E53935] hover:text-[#C62828] font-medium hover:underline" data-testid="register-link">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
          
          {/* Powered by DataVision badge */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Powered by{' '}
            <span className="font-semibold">
              <span className="text-[#E53935]">Data</span>
              <span className="text-[#1A237E]">Vision</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function RegisterPage() {
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
      const response = await authAPI.register(email, password, name);
      setAuth(response.data.user, response.data.access_token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E53935]/5 via-transparent to-[#1A237E]/5" />
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[#E53935]/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-[#1A237E]/10 to-transparent blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-2 border-[#1A237E]/10 shadow-xl shadow-[#1A237E]/5">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DataVisionLogo size="lg" />
              <span className="font-barlow text-2xl font-bold">
                <span className="text-[#E53935]">Data</span>
                <span className="text-[#1A237E]">Pulse</span>
              </span>
            </div>
            <CardTitle className="font-barlow text-2xl">Create account</CardTitle>
            <CardDescription>Start collecting data with your team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909C]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 border-[#78909C]/30 focus:border-[#1A237E] focus:ring-[#1A237E]/20"
                    required
                    data-testid="register-name-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909C]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-[#78909C]/30 focus:border-[#1A237E] focus:ring-[#1A237E]/20"
                    required
                    data-testid="register-email-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909C]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-[#78909C]/30 focus:border-[#1A237E] focus:ring-[#1A237E]/20"
                    required
                    minLength={6}
                    data-testid="register-password-input"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#1A237E] to-[#0D47A1] hover:from-[#0D47A1] hover:to-[#1A237E] text-white shadow-lg shadow-[#1A237E]/25" 
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1A237E] hover:text-[#0D47A1] font-medium hover:underline" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
        
        {/* Powered by DataVision badge */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Powered by{' '}
          <span className="font-semibold">
            <span className="text-[#E53935]">Data</span>
            <span className="text-[#1A237E]">Vision</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSSOCallback = React.useCallback(async (code) => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await authAPI.ssoCallback(code, redirectUri);
      setAuth(response.data.user, response.data.access_token);
      toast.success('SSO login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('SSO authentication failed');
      navigate('/login');
    }
  }, [navigate, setAuth]);

  React.useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleSSOCallback(code);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, handleSSOCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E53935]/10 via-transparent to-[#1A237E]/10" />
      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <DataVisionLogo size="lg" />
        </div>
        <div className="w-8 h-8 border-3 border-[#E53935] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
