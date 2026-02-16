import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  Building2,
  Sparkles,
  Crown,
  Rocket,
  Users,
  Mail,
  HardDrive,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Star,
  Clock,
  Headphones
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import survey360Api from '../../lib/survey360Api';
import { useUIStore } from '../../store';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PLAN_ICONS = {
  free: Rocket,
  starter: Zap,
  pro: Sparkles,
  business: Building2,
  enterprise: Crown
};

const PLAN_COLORS = {
  free: 'from-slate-500 to-slate-600',
  starter: 'from-blue-500 to-cyan-500',
  pro: 'from-teal-500 to-emerald-500',
  business: 'from-purple-500 to-pink-500',
  enterprise: 'from-amber-500 to-orange-500'
};

const FAQ_ITEMS = [
  {
    question: "How does the 14-day free trial work?",
    answer: "When you sign up, you automatically get a 14-day free trial of our Pro plan with all features unlocked. No credit card required. At the end of the trial, you can choose to upgrade or continue with our Free plan."
  },
  {
    question: "Can I change my plan at any time?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at your next billing cycle."
  },
  {
    question: "What happens if I exceed my response limit?",
    answer: "We'll notify you when you're approaching your limit. If you exceed it, new responses will be queued until your next billing cycle or you upgrade. You won't lose any data."
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes! Annual billing saves you 33% compared to monthly billing. That's like getting 4 months free every year."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us within 30 days for a full refund."
  }
];

export function Survey360PricingPage() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [trialInfo, setTrialInfo] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const [plansRes, trialRes] = await Promise.all([
        survey360Api.get('/pricing/plans'),
        survey360Api.get('/pricing/trial-info')
      ]);
      setPlans(plansRes.data);
      setTrialInfo(trialRes.data);
      
      // Try to get current subscription if logged in
      try {
        const subRes = await survey360Api.get('/pricing/subscription');
        setCurrentPlan(subRes.data.plan);
      } catch (e) {
        // Not logged in or no subscription
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
      toast.error('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const response = await survey360Api.post('/pricing/start-trial');
      toast.success(response.data.message);
      navigate('/survey360/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please sign in to start your trial');
        navigate('/survey360/login');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to start trial');
      }
    } finally {
      setStartingTrial(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.id === 'free') {
      navigate('/survey360/register');
      return;
    }
    
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:sales@survey360.com?subject=Enterprise Plan Inquiry';
      return;
    }
    
    try {
      const response = await survey360Api.post('/pricing/upgrade', {
        plan: plan.id,
        billing_cycle: isAnnual ? 'annual' : 'monthly'
      });
      toast.success(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please sign in to upgrade');
        navigate('/survey360/login');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to process upgrade');
      }
    }
  };

  const formatNumber = (num) => {
    if (num === -1) return 'Unlimited';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'}`} data-testid="pricing-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-0 px-4 py-1">
              Simple, Transparent Pricing
            </Badge>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Choose the perfect plan for your team
            </h1>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start free, scale as you grow. All plans include our core survey features.
              {trialInfo?.enabled && (
                <span className="block mt-2 text-teal-400 font-medium">
                  Try Pro free for {trialInfo.duration_days} days - no credit card required!
                </span>
              )}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${!isAnnual ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-teal-500"
              />
              <span className={`font-medium ${isAnnual ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  Save 33%
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, index) => {
            const Icon = PLAN_ICONS[plan.id] || Rocket;
            const color = PLAN_COLORS[plan.id] || 'from-gray-500 to-gray-600';
            const isCurrentPlan = currentPlan === plan.id;
            const price = isAnnual ? plan.annual_monthly_equivalent : plan.monthly_price_display;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 px-4 py-1 shadow-lg">
                      <Star className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full flex flex-col ${
                  plan.popular 
                    ? 'border-teal-500 border-2 shadow-xl shadow-teal-500/20' 
                    : isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                } ${plan.popular && !isDark && 'bg-gradient-to-b from-teal-50/50 to-white'}`}>
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Price */}
                    <div className="mb-6">
                      {plan.is_custom ? (
                        <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Custom
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {price}
                            </span>
                            {plan.monthly_price > 0 && (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>/month</span>
                            )}
                          </div>
                          {isAnnual && plan.savings_percent > 0 && (
                            <p className="text-sm text-green-400 mt-1">
                              {plan.annual_price_display}/year (save {plan.savings_percent}%)
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Key Limits */}
                    <div className={`space-y-3 mb-6 pb-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {formatNumber(plan.users)} team member{plan.users !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {formatNumber(plan.responses_per_month)} responses/mo
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-teal-400" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {formatNumber(plan.emails_per_month)} emails/mo
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-orange-400" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {plan.storage_display} storage
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 flex-1">
                      {plan.features.slice(0, 6).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                      {plan.disabled_features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 opacity-50">
                          <X className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6 pt-4">
                      {isCurrentPlan ? (
                        <Button className="w-full" variant="outline" disabled>
                          Current Plan
                        </Button>
                      ) : plan.id === 'enterprise' ? (
                        <Button
                          className={`w-full bg-gradient-to-r ${color} text-white border-0`}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          Contact Sales
                        </Button>
                      ) : plan.id === 'free' ? (
                        <Button
                          className="w-full"
                          variant={isDark ? "outline" : "secondary"}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          Get Started Free
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${plan.popular ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0' : ''}`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {plan.id === 'pro' && trialInfo?.enabled ? 'Start Free Trial' : 'Get Started'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className={`py-16 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Compare All Features
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Find the plan that's right for you
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className={isDark ? 'border-b border-white/10' : 'border-b border-gray-200'}>
                  <th className="py-4 px-4 text-left"></th>
                  {plans.map(plan => (
                    <th key={plan.id} className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Team Members', key: 'users', icon: Users },
                  { label: 'Responses/Month', key: 'responses_per_month', icon: BarChart3 },
                  { label: 'Active Surveys', key: 'surveys', icon: MessageSquare },
                  { label: 'Email Invitations', key: 'emails_per_month', icon: Mail },
                  { label: 'Storage', key: 'storage_display', icon: HardDrive },
                ].map((row) => (
                  <tr key={row.key} className={isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}>
                    <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-2">
                        <row.icon className="w-4 h-4 text-gray-400" />
                        {row.label}
                      </div>
                    </td>
                    {plans.map(plan => (
                      <td key={plan.id} className={`py-4 px-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.key === 'storage_display' 
                          ? plan.storage_display 
                          : formatNumber(plan[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
                {[
                  { label: 'AI Assistant', key: 'ai' },
                  { label: 'Custom Branding', key: 'branding' },
                  { label: 'Skip Logic', key: 'logic' },
                  { label: 'API Access', key: 'api' },
                  { label: 'Priority Support', key: 'support' },
                ].map((feature) => (
                  <tr key={feature.key} className={isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}>
                    <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature.label}
                    </td>
                    {plans.map(plan => {
                      const hasFeature = !plan.disabled_features.some(f => 
                        f.toLowerCase().includes(feature.label.toLowerCase().split(' ')[0])
                      );
                      return (
                        <td key={plan.id} className="py-4 px-4 text-center">
                          {hasFeature ? (
                            <Check className="w-5 h-5 text-teal-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-500 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trial CTA */}
      {trialInfo?.enabled && (
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className={`bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-teal-500/30 ${!isDark && 'shadow-lg'}`}>
                <CardContent className="p-8 sm:p-12 text-center">
                  <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-0">
                    <Clock className="w-3 h-3 mr-1" /> {trialInfo.duration_days}-Day Free Trial
                  </Badge>
                  <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Try {trialInfo.plan_name} Free for {trialInfo.duration_days} Days
                  </h2>
                  <p className={`mb-8 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get full access to all {trialInfo.plan_name} features including AI Assistant, 
                    custom branding, and advanced analytics. No credit card required.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 px-8"
                    onClick={handleStartTrial}
                    disabled={startingTrial}
                  >
                    {startingTrial ? 'Starting Trial...' : 'Start Your Free Trial'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    No credit card required • Cancel anytime
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className={`py-16 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={`rounded-lg px-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <AccordionTrigger className={`text-left ${isDark ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'}`}>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Need a custom solution?
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Contact our sales team to discuss Enterprise pricing, custom integrations, 
            and volume discounts.
          </p>
          <Button
            variant="outline"
            className={isDark ? 'border-white/20 hover:bg-white/10' : ''}
            onClick={() => window.location.href = 'mailto:sales@survey360.com'}
          >
            <Headphones className="w-4 h-4 mr-2" />
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Survey360PricingPage;
