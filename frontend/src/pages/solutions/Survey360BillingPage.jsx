import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  X,
  Zap,
  Building2,
  Sparkles,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Calendar,
  BarChart3,
  Users,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import survey360Api from '../../lib/survey360Api';
import { useUIStore } from '../../store';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals getting started',
    monthlyPrice: 0,
    icon: ClipboardList,
    color: 'from-gray-500 to-gray-600',
    limits: { surveys: 3, responses: 100 },
    features: ['3 surveys', '100 responses/month', '10 question types', 'Basic analytics']
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers and small teams',
    monthlyPrice: 15,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    limits: { surveys: -1, responses: 500 },
    features: ['Unlimited surveys', '500 responses/month', 'Skip logic', 'Remove branding', 'CSV export']
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    monthlyPrice: 39,
    icon: Sparkles,
    color: 'from-teal-500 to-emerald-500',
    popular: true,
    limits: { surveys: -1, responses: 2500 },
    features: ['Unlimited surveys', '2,500 responses/month', 'Logo & branding', 'Team (3 users)', 'Priority support']
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For larger teams',
    monthlyPrice: 79,
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    limits: { surveys: -1, responses: 10000 },
    features: ['Unlimited surveys', '10,000 responses/month', 'Unlimited team', 'Dedicated support', 'SLA guarantee']
  }
];

export function Survey360BillingPage() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    setLoading(true);
    try {
      const response = await survey360Api.get('/usage');
      setUsage(response.data);
    } catch (error) {
      console.error('Failed to load usage:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    return PLANS.find(p => p.id === usage?.plan) || PLANS[0];
  };

  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan);
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeConfirm = async () => {
    setUpgrading(true);
    // Simulate upgrade process (would connect to Stripe in production)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUpgrading(false);
    setUpgradeDialogOpen(false);
    toast.success(`Upgrade to ${selectedPlan.name} requested! We'll contact you shortly to complete the upgrade.`);
  };

  const surveyUsagePercent = usage && usage.surveys_limit > 0 
    ? (usage.surveys_used / usage.surveys_limit) * 100 
    : 0;
  
  const responseUsagePercent = usage && usage.responses_limit > 0 
    ? (usage.responses_used / usage.responses_limit) * 100 
    : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentPlan = getCurrentPlan();
  const currentPlanIndex = PLANS.findIndex(p => p.id === usage?.plan);

  return (
    <div className="space-y-8" data-testid="billing-page">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Billing & Usage</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Manage your subscription and monitor usage</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className={`h-48 w-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <Skeleton className={`h-64 w-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>
      ) : (
        <>
          {/* Current Plan & Usage */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current Plan Card */}
            <Card className={`bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 lg:col-span-1 ${!isDark && 'shadow-sm'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-teal-500/20 text-teal-400 border-0">Current Plan</Badge>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentPlan.color} flex items-center justify-center`}>
                    <currentPlan.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'} mt-2`}>{currentPlan.name}</CardTitle>
                <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>{currentPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${currentPlan.monthlyPrice}</span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>/month</span>
                </div>
                {currentPlanIndex < PLANS.length - 1 && (
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0"
                    onClick={() => handleUpgradeClick(PLANS[currentPlanIndex + 1])}
                  >
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className={`lg:col-span-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Usage This Period</CardTitle>
                    <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {formatDate(usage?.period_start)} - {formatDate(usage?.period_end)}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={loadUsage}
                    className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Surveys Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-blue-400" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Surveys</span>
                    </div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {usage?.surveys_used} / {usage?.surveys_limit === -1 ? '∞' : usage?.surveys_limit}
                    </span>
                  </div>
                  {usage?.surveys_limit > 0 && (
                    <Progress 
                      value={surveyUsagePercent} 
                      className={`h-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
                    />
                  )}
                  {usage?.surveys_limit > 0 && surveyUsagePercent >= 80 && (
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {surveyUsagePercent >= 100 ? 'Limit reached! Upgrade to create more surveys.' : 'Approaching survey limit'}
                    </p>
                  )}
                </div>

                {/* Responses Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Responses</span>
                    </div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {usage?.responses_used?.toLocaleString()} / {usage?.responses_limit === -1 ? '∞' : usage?.responses_limit?.toLocaleString()}
                    </span>
                  </div>
                  {usage?.responses_limit > 0 && (
                    <Progress 
                      value={responseUsagePercent} 
                      className={`h-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
                    />
                  )}
                  {usage?.responses_limit > 0 && responseUsagePercent >= 80 && (
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {responseUsagePercent >= 100 ? 'Limit reached! Upgrade to collect more responses.' : 'Approaching response limit'}
                    </p>
                  )}
                </div>

                {/* Period Info */}
                <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>Usage resets on {formatDate(usage?.period_end)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Plans */}
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Available Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan, idx) => {
                const Icon = plan.icon;
                const isCurrent = plan.id === usage?.plan;
                const isDowngrade = idx < currentPlanIndex;
                const isUpgrade = idx > currentPlanIndex;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`h-full ${isCurrent ? 'bg-teal-500/10 border-teal-500/50' : 'bg-white/5 border-white/10'} ${plan.popular && !isCurrent ? 'ring-2 ring-teal-500/50' : ''} hover:border-white/20 transition-all relative`}>
                      {plan.popular && !isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 text-xs">
                            Popular
                          </Badge>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-teal-500 text-white border-0 text-xs">
                            Current
                          </Badge>
                        </div>
                      )}
                      
                      <CardContent className="p-5 pt-6">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <h3 className="font-semibold text-white">{plan.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                        
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-2xl font-bold text-white">${plan.monthlyPrice}</span>
                          <span className="text-gray-500 text-sm">/mo</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {plan.features.slice(0, 3).map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs">
                              <Check className="w-3 h-3 text-teal-400" />
                              <span className="text-gray-400">{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <p className="text-xs text-gray-600">+{plan.features.length - 3} more</p>
                          )}
                        </div>
                        
                        {isCurrent ? (
                          <Button disabled className="w-full bg-white/10 text-gray-500 border-0" size="sm">
                            Current Plan
                          </Button>
                        ) : isUpgrade ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0" 
                            size="sm"
                            onClick={() => handleUpgradeClick(plan)}
                          >
                            Upgrade
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full border-white/10 text-gray-400" 
                            size="sm"
                            onClick={() => handleUpgradeClick(plan)}
                          >
                            Downgrade
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Billing History (Placeholder) */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Billing History</CardTitle>
              <CardDescription className="text-gray-400">Your recent invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400">No billing history yet</p>
                <p className="text-sm text-gray-600">Your invoices will appear here after your first payment</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="bg-[#0f1d32] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedPlan && (
                <>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center`}>
                    <selectedPlan.icon className="w-4 h-4 text-white" />
                  </div>
                  {currentPlanIndex < PLANS.findIndex(p => p.id === selectedPlan?.id) ? 'Upgrade' : 'Change'} to {selectedPlan?.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPlan && (
                <>
                  ${selectedPlan.monthlyPrice}/month • {selectedPlan.limits.responses.toLocaleString()} responses/month
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="py-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">What you'll get:</h4>
              <div className="space-y-2">
                {selectedPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUpgradeDialogOpen(false)}
              className="border-white/10 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0"
              onClick={handleUpgradeConfirm}
              disabled={upgrading}
            >
              {upgrading ? 'Processing...' : 'Confirm Upgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Survey360BillingPage;
