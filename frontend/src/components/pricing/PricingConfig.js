/**
 * Survey360 Pricing Configuration
 * Customizable pricing tiers with 80% profit margin
 * 
 * Cost Analysis:
 * - Infrastructure: $0.50/user
 * - Email: $0.001/email
 * - Storage: $0.023/GB
 * - LLM API: $0.10/user
 * - Support: $0.20/user
 */

// Pricing Tiers with 80% margin
export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Survey360',
    icon: 'Rocket',
    color: 'from-slate-500 to-slate-600',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: {
      users: 1,
      responses: 100,
      surveys: 3,
      emails: 0,
      storageMB: 100,
    },
    features: [
      '3 active surveys',
      '100 responses/month',
      '10 question types',
      'Basic analytics',
      'CSV export',
      'Email support',
    ],
    disabledFeatures: [
      'AI Assistant',
      'Custom branding',
      'Skip logic',
      'Email invitations',
      'Team collaboration',
      'Priority support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small teams',
    icon: 'Zap',
    color: 'from-blue-500 to-cyan-500',
    monthlyPrice: 19,
    annualPrice: 152, // ~$12.67/mo (33% off)
    limits: {
      users: 3,
      responses: 1000,
      surveys: -1, // Unlimited
      emails: 500,
      storageMB: 1024, // 1GB
    },
    features: [
      'Unlimited surveys',
      '1,000 responses/month',
      '3 team members',
      '500 email invitations/month',
      '1GB storage',
      'Skip logic & branching',
      'Remove Survey360 branding',
      'Excel & CSV export',
      'Email support',
    ],
    disabledFeatures: [
      'AI Assistant',
      'Custom logo',
      'Priority support',
      'API access',
    ],
    cta: 'Get Started',
    popular: false,
    margin: 84.7, // Actual margin
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams and businesses',
    icon: 'Sparkles',
    color: 'from-teal-500 to-emerald-500',
    monthlyPrice: 49,
    annualPrice: 392, // ~$32.67/mo (33% off)
    limits: {
      users: 10,
      responses: 10000,
      surveys: -1,
      emails: 5000,
      storageMB: 10240, // 10GB
    },
    features: [
      'Unlimited surveys',
      '10,000 responses/month',
      '10 team members',
      '5,000 email invitations/month',
      '10GB storage',
      'AI Assistant (GPT-5.2)',
      'Custom branding & logo',
      'Advanced analytics',
      'Scheduled surveys',
      'Webhooks',
      'Priority email support',
    ],
    disabledFeatures: [
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Start Free Trial',
    popular: true,
    badge: 'Most Popular',
    margin: 81.2,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For large teams and organizations',
    icon: 'Building2',
    color: 'from-purple-500 to-pink-500',
    monthlyPrice: 99,
    annualPrice: 792, // ~$66/mo (33% off)
    limits: {
      users: 25,
      responses: 50000,
      surveys: -1,
      emails: 25000,
      storageMB: 51200, // 50GB
    },
    features: [
      'Unlimited surveys',
      '50,000 responses/month',
      '25 team members',
      '25,000 email invitations/month',
      '50GB storage',
      'AI Assistant (GPT-5.2)',
      'Custom branding & logo',
      'Advanced analytics & reports',
      'API access',
      'Webhooks & integrations',
      'Dedicated account manager',
      'Phone support',
      '99.9% SLA guarantee',
    ],
    disabledFeatures: [],
    cta: 'Get Started',
    popular: false,
    margin: 75.8,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    icon: 'Crown',
    color: 'from-amber-500 to-orange-500',
    monthlyPrice: -1, // Custom
    annualPrice: -1,
    limits: {
      users: -1,
      responses: -1,
      surveys: -1,
      emails: -1,
      storageMB: -1,
    },
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Unlimited responses',
      'Unlimited storage',
      'Custom integrations',
      'On-premise deployment option',
      'SAML SSO',
      'Audit logs',
      'Custom SLA',
      '24/7 premium support',
      'Dedicated success manager',
      'Custom training',
    ],
    disabledFeatures: [],
    cta: 'Contact Sales',
    popular: false,
    isCustom: true,
  },
];

// Feature categories for comparison table
export const FEATURE_CATEGORIES = [
  {
    name: 'Usage Limits',
    features: [
      { name: 'Team Members', key: 'users', type: 'limit' },
      { name: 'Responses/Month', key: 'responses', type: 'limit' },
      { name: 'Active Surveys', key: 'surveys', type: 'limit' },
      { name: 'Email Invitations', key: 'emails', type: 'limit' },
      { name: 'Storage', key: 'storage', type: 'storage' },
    ],
  },
  {
    name: 'Survey Builder',
    features: [
      { name: 'Question Types', values: ['10', '10', '15+', '20+', 'All'] },
      { name: 'Skip Logic', values: [false, true, true, true, true] },
      { name: 'Survey Templates', values: ['5', '20', '50+', '100+', 'Custom'] },
      { name: 'Multi-language', values: [false, false, true, true, true] },
    ],
  },
  {
    name: 'Branding & Design',
    features: [
      { name: 'Remove Branding', values: [false, true, true, true, true] },
      { name: 'Custom Logo', values: [false, false, true, true, true] },
      { name: 'Custom Colors', values: [false, true, true, true, true] },
      { name: 'Custom Domain', values: [false, false, false, true, true] },
    ],
  },
  {
    name: 'AI Features',
    features: [
      { name: 'AI Assistant', values: [false, false, true, true, true] },
      { name: 'Smart Suggestions', values: [false, false, true, true, true] },
      { name: 'Auto-Analysis', values: [false, false, true, true, true] },
    ],
  },
  {
    name: 'Analytics & Reporting',
    features: [
      { name: 'Basic Analytics', values: [true, true, true, true, true] },
      { name: 'Advanced Analytics', values: [false, false, true, true, true] },
      { name: 'Custom Reports', values: [false, false, false, true, true] },
      { name: 'CSV Export', values: [true, true, true, true, true] },
      { name: 'Excel Export', values: [false, true, true, true, true] },
      { name: 'API Access', values: [false, false, false, true, true] },
    ],
  },
  {
    name: 'Collaboration',
    features: [
      { name: 'Team Workspaces', values: [false, true, true, true, true] },
      { name: 'Role Permissions', values: [false, false, true, true, true] },
      { name: 'Audit Logs', values: [false, false, false, true, true] },
    ],
  },
  {
    name: 'Support',
    features: [
      { name: 'Email Support', values: [true, true, true, true, true] },
      { name: 'Priority Support', values: [false, false, true, true, true] },
      { name: 'Phone Support', values: [false, false, false, true, true] },
      { name: 'Dedicated Manager', values: [false, false, false, true, true] },
      { name: 'SLA Guarantee', values: [false, false, false, '99.9%', 'Custom'] },
    ],
  },
];

// FAQ Items
export const FAQ_ITEMS = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'When you sign up, you automatically get a 14-day free trial of our Pro plan with all features unlocked. No credit card required. At the end of the trial, you can choose to upgrade or continue with our Free plan.',
  },
  {
    question: 'Can I change my plan at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my response limit?',
    answer: 'We\'ll notify you when you\'re approaching your limit. If you exceed it, new responses will be queued until your next billing cycle or you upgrade. You won\'t lose any data.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: 'Yes! Annual billing saves you 33% compared to monthly billing. That\'s like getting 4 months free every year.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with your purchase, contact us within 30 days for a full refund.',
  },
  {
    question: 'Do you offer discounts for nonprofits or education?',
    answer: 'Yes! We offer 50% off for registered nonprofits and educational institutions. Contact our sales team to apply for the discount.',
  },
];

// Trial configuration
export const TRIAL_CONFIG = {
  enabled: true,
  planId: 'pro',
  durationDays: 14,
  creditCardRequired: false,
};

// Annual discount percentage
export const ANNUAL_DISCOUNT_PERCENT = 33;

// Helper functions
export const formatPrice = (price) => {
  if (price === -1) return 'Custom';
  if (price === 0) return '$0';
  return `$${price}`;
};

export const formatLimit = (value) => {
  if (value === -1) return 'Unlimited';
  return value.toLocaleString();
};

export const formatStorage = (mb) => {
  if (mb === -1) return 'Unlimited';
  if (mb >= 1024) return `${Math.round(mb / 1024)}GB`;
  return `${mb}MB`;
};

export const calculateAnnualMonthly = (annualPrice) => {
  if (annualPrice <= 0) return formatPrice(0);
  return `$${(annualPrice / 12).toFixed(2)}`;
};

export const calculateSavings = (monthlyPrice, annualPrice) => {
  if (monthlyPrice <= 0 || annualPrice <= 0) return 0;
  const yearlyFromMonthly = monthlyPrice * 12;
  return Math.round(((yearlyFromMonthly - annualPrice) / yearlyFromMonthly) * 100);
};

export const getTierById = (id) => PRICING_TIERS.find(t => t.id === id);

export const getPopularTier = () => PRICING_TIERS.find(t => t.popular);

// Cost calculation for margin analysis
export const calculateTierCost = (tier) => {
  const { limits } = tier;
  const userCost = (limits.users > 0 ? limits.users : 100) * 0.80; // $0.80/user (infra + support)
  const emailCost = (limits.emails > 0 ? limits.emails : 0) * 0.001;
  const storageCost = (limits.storageMB > 0 ? limits.storageMB / 1024 : 0) * 0.023;
  return userCost + emailCost + storageCost;
};

export const calculateMargin = (tier) => {
  if (tier.monthlyPrice <= 0) return 0;
  const cost = calculateTierCost(tier);
  return ((tier.monthlyPrice - cost) / tier.monthlyPrice * 100).toFixed(1);
};
