import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Check,
  X,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

const PLANS = [
  {
    name: 'Free',
    description: 'For individuals getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: ClipboardList,
    color: 'from-gray-500 to-gray-600',
    popular: false,
    buttonText: 'Start Free',
    buttonVariant: 'outline',
    limits: {
      surveys: 3,
      responses: 100,
      users: 1
    },
    features: [
      { text: '3 surveys', included: true },
      { text: '100 responses/month', included: true },
      { text: '10 question types', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'QR code & embed', included: true },
      { text: 'Skip logic', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Remove Survey360 branding', included: false },
      { text: 'Priority support', included: false },
    ]
  },
  {
    name: 'Starter',
    description: 'For freelancers and small teams',
    monthlyPrice: 15,
    annualPrice: 12,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    popular: false,
    buttonText: 'Get Started',
    buttonVariant: 'default',
    limits: {
      surveys: -1, // unlimited
      responses: 500,
      users: 1
    },
    features: [
      { text: 'Unlimited surveys', included: true },
      { text: '500 responses/month', included: true },
      { text: '10 question types', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'QR code & embed', included: true },
      { text: 'Skip logic', included: true },
      { text: 'Custom thank you page', included: true },
      { text: 'Remove Survey360 branding', included: true },
      { text: 'CSV export', included: true },
      { text: 'Email support', included: true },
    ]
  },
  {
    name: 'Professional',
    description: 'For growing businesses',
    monthlyPrice: 39,
    annualPrice: 32,
    icon: Sparkles,
    color: 'from-teal-500 to-emerald-500',
    popular: true,
    buttonText: 'Get Started',
    buttonVariant: 'default',
    limits: {
      surveys: -1,
      responses: 2500,
      users: 3
    },
    features: [
      { text: 'Unlimited surveys', included: true },
      { text: '2,500 responses/month', included: true },
      { text: 'Everything in Starter', included: true },
      { text: 'Logo upload', included: true },
      { text: 'Custom brand colors', included: true },
      { text: 'Close date & response limits', included: true },
      { text: 'Team collaboration (3 users)', included: true },
      { text: 'Priority support', included: true },
    ]
  },
  {
    name: 'Business',
    description: 'For larger teams and agencies',
    monthlyPrice: 79,
    annualPrice: 65,
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    popular: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'default',
    limits: {
      surveys: -1,
      responses: 10000,
      users: -1
    },
    features: [
      { text: 'Unlimited surveys', included: true },
      { text: '10,000 responses/month', included: true },
      { text: 'Everything in Professional', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'API access (coming soon)', included: true, upcoming: true },
    ]
  }
];

const FAQS = [
  {
    question: 'What counts as a response?',
    answer: 'A response is counted each time someone submits a completed survey. Partial submissions are not counted.'
  },
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
  },
  {
    question: 'What happens if I exceed my response limit?',
    answer: 'Your surveys will stop accepting new responses until the next billing cycle. You can upgrade anytime to continue collecting responses.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'We offer a 14-day free trial on all paid plans. No credit card required to start.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.'
  }
];

export function Survey360PricingPage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/solutions/survey360" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">Survey360</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white"
                onClick={() => navigate('/solutions/survey360/login')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
                onClick={() => navigate('/solutions/survey360/register')}
              >
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 mb-4">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start free and scale as you grow. No hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
              <Switch 
                checked={annual} 
                onCheckedChange={setAnnual}
                className="data-[state=checked]:bg-teal-500"
              />
              <span className={`text-sm ${annual ? 'text-white' : 'text-gray-500'}`}>
                Annual
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-0">Save 20%</Badge>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan, idx) => {
              const Icon = plan.icon;
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 px-4 py-1">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`h-full bg-white/5 border-white/10 ${plan.popular ? 'border-teal-500/50 shadow-lg shadow-teal-500/10' : ''} hover:border-white/20 transition-all`}>
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Price */}
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">${price}</span>
                          {price > 0 && <span className="text-gray-500">/month</span>}
                        </div>
                        {price > 0 && annual && (
                          <p className="text-sm text-gray-500 mt-1">
                            Billed annually (${price * 12}/year)
                          </p>
                        )}
                        {price === 0 && (
                          <p className="text-sm text-gray-500 mt-1">Free forever</p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white border-0' : plan.buttonVariant === 'outline' ? 'border-white/20 text-gray-300 hover:bg-white/5' : 'bg-white/10 hover:bg-white/20 text-white border-0'}`}
                        variant={plan.buttonVariant === 'outline' ? 'outline' : 'default'}
                        onClick={() => navigate('/solutions/survey360/register')}
                      >
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      {/* Features */}
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        {plan.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                              {feature.text}
                              {feature.upcoming && (
                                <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-0 text-xs">Soon</Badge>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Compare plans</h2>
            <p className="text-gray-400">See what's included in each plan</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  {PLANS.map((plan, idx) => (
                    <th key={idx} className="text-center py-4 px-4">
                      <span className={`font-semibold ${plan.popular ? 'text-teal-400' : 'text-white'}`}>
                        {plan.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Surveys</td>
                  <td className="py-4 px-4 text-center text-gray-400">3</td>
                  <td className="py-4 px-4 text-center text-gray-400">Unlimited</td>
                  <td className="py-4 px-4 text-center text-gray-400">Unlimited</td>
                  <td className="py-4 px-4 text-center text-gray-400">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Responses/month</td>
                  <td className="py-4 px-4 text-center text-gray-400">100</td>
                  <td className="py-4 px-4 text-center text-gray-400">500</td>
                  <td className="py-4 px-4 text-center text-gray-400">2,500</td>
                  <td className="py-4 px-4 text-center text-gray-400">10,000</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Team members</td>
                  <td className="py-4 px-4 text-center text-gray-400">1</td>
                  <td className="py-4 px-4 text-center text-gray-400">1</td>
                  <td className="py-4 px-4 text-center text-gray-400">3</td>
                  <td className="py-4 px-4 text-center text-gray-400">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Skip logic</td>
                  <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Custom branding</td>
                  <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Remove branding</td>
                  <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Priority support</td>
                  <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">Frequently asked questions</h2>
          </motion.div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="bg-white/5 border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{faq.question}</h3>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </div>
                    {openFaq === idx && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-gray-400 mt-3 text-sm"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-teal-500/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of teams already using Survey360 to collect insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 px-8"
              onClick={() => navigate('/solutions/survey360/register')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/5"
              onClick={() => navigate('/solutions/survey360')}
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            © 2026 Survey360. A product of DataVision International.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Survey360PricingPage;
