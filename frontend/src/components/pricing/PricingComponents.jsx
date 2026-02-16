/**
 * Survey360 Reusable Pricing Components
 * Drop-in components for consistent pricing display
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3,
  ArrowRight,
  Star,
  Clock,
  Shield,
  CreditCard,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  PRICING_TIERS,
  FEATURE_CATEGORIES,
  FAQ_ITEMS,
  TRIAL_CONFIG,
  ANNUAL_DISCOUNT_PERCENT,
  formatPrice,
  formatLimit,
  formatStorage,
  calculateAnnualMonthly,
  calculateSavings,
} from './PricingConfig';

// Icon mapping
const ICONS = {
  Rocket,
  Zap,
  Sparkles,
  Building2,
  Crown,
};

// ============================================
// PRICING TOGGLE (Monthly/Annual)
// ============================================
export function PricingToggle({ value, onChange, showSavings = true, className = '' }) {
  const isAnnual = value === 'annual';
  
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className={`font-medium transition-colors ${
        !isAnnual ? 'text-white' : 'text-gray-500'
      }`}>
        Monthly
      </span>
      <Switch
        checked={isAnnual}
        onCheckedChange={(checked) => onChange(checked ? 'annual' : 'monthly')}
        className="data-[state=checked]:bg-teal-500"
      />
      <span className={`font-medium transition-colors ${
        isAnnual ? 'text-white' : 'text-gray-500'
      }`}>
        Annual
      </span>
      {showSavings && isAnnual && (
        <Badge className="bg-green-500/20 text-green-400 border-0">
          Save {ANNUAL_DISCOUNT_PERCENT}%
        </Badge>
      )}
    </div>
  );
}

// ============================================
// PRICING CARD
// ============================================
export function PricingCard({
  tier,
  billingCycle = 'monthly',
  onSelect,
  currentPlan = null,
  showFeatures = true,
  maxFeatures = 6,
  className = '',
}) {
  const Icon = ICONS[tier.icon] || Rocket;
  const isAnnual = billingCycle === 'annual';
  const isCurrentPlan = currentPlan === tier.id;
  
  const displayPrice = tier.isCustom
    ? 'Custom'
    : isAnnual
      ? calculateAnnualMonthly(tier.annualPrice)
      : formatPrice(tier.monthlyPrice);
  
  const savings = calculateSavings(tier.monthlyPrice, tier.annualPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      {tier.popular && tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 px-4 py-1 shadow-lg">
            <Star className="w-3 h-3 mr-1" /> {tier.badge}
          </Badge>
        </div>
      )}
      
      <Card className={`h-full flex flex-col ${
        tier.popular
          ? 'border-teal-500 border-2 shadow-xl shadow-teal-500/20'
          : 'bg-white/5 border-white/10'
      }`}>
        <CardHeader className="pb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
          <CardDescription className="text-gray-400">{tier.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{displayPrice}</span>
              {tier.monthlyPrice > 0 && (
                <span className="text-gray-500">/month</span>
              )}
            </div>
            {isAnnual && savings > 0 && (
              <p className="text-sm text-green-400 mt-1">
                ${tier.annualPrice}/year (save {savings}%)
              </p>
            )}
          </div>

          {/* Key Limits */}
          <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">
                {formatLimit(tier.limits.users)} team member{tier.limits.users !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">
                {formatLimit(tier.limits.responses)} responses/mo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400" />
              <span className="text-gray-300">
                {formatLimit(tier.limits.emails)} emails/mo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-orange-400" />
              <span className="text-gray-300">
                {formatStorage(tier.limits.storageMB)} storage
              </span>
            </div>
          </div>

          {/* Features */}
          {showFeatures && (
            <div className="space-y-2 flex-1">
              {tier.features.slice(0, maxFeatures).map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
              {tier.disabledFeatures.slice(0, 2).map((feature, i) => (
                <div key={i} className="flex items-start gap-2 opacity-50">
                  <X className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-6 pt-4">
            {isCurrentPlan ? (
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className={`w-full ${
                  tier.popular
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0'
                    : ''
                }`}
                variant={tier.popular ? 'default' : 'outline'}
                onClick={() => onSelect?.(tier)}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// PRICING GRID
// ============================================
export function PricingGrid({
  tiers = PRICING_TIERS,
  billingCycle = 'monthly',
  onSelectTier,
  currentPlan = null,
  columns = 5,
  className = '',
}) {
  const gridClass = {
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[columns] || 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

  return (
    <div className={`grid gap-6 ${gridClass} ${className}`}>
      {tiers.map((tier, index) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          billingCycle={billingCycle}
          onSelect={onSelectTier}
          currentPlan={currentPlan}
        />
      ))}
    </div>
  );
}

// ============================================
// PRICING COMPARISON TABLE
// ============================================
export function PricingComparison({
  tiers = PRICING_TIERS,
  categories = FEATURE_CATEGORIES,
  className = '',
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-4 px-4 text-left"></th>
            {tiers.map(tier => (
              <th key={tier.id} className="py-4 px-4 text-center text-white font-medium">
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, catIndex) => (
            <React.Fragment key={catIndex}>
              <tr className="bg-white/5">
                <td colSpan={tiers.length + 1} className="py-3 px-4 font-semibold text-white">
                  {category.name}
                </td>
              </tr>
              {category.features.map((feature, featIndex) => (
                <tr key={featIndex} className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">{feature.name}</td>
                  {tiers.map((tier, tierIndex) => {
                    let value;
                    if (feature.key && feature.type === 'limit') {
                      value = formatLimit(tier.limits[feature.key]);
                    } else if (feature.key && feature.type === 'storage') {
                      value = formatStorage(tier.limits.storageMB);
                    } else if (feature.values) {
                      value = feature.values[tierIndex];
                    }

                    return (
                      <td key={tier.id} className="py-4 px-4 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="w-5 h-5 text-teal-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-300">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// PRICING FAQ
// ============================================
export function PricingFAQ({ items = FAQ_ITEMS, className = '' }) {
  return (
    <Accordion type="single" collapsible className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="rounded-lg px-6 bg-white/5 border-white/10"
        >
          <AccordionTrigger className="text-left text-white hover:text-gray-300">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-400">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// ============================================
// TRIAL CTA BANNER
// ============================================
export function TrialBanner({
  config = TRIAL_CONFIG,
  planName = 'Pro',
  onStartTrial,
  loading = false,
  className = '',
}) {
  if (!config.enabled) return null;

  return (
    <Card className={`bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-teal-500/30 ${className}`}>
      <CardContent className="p-8 sm:p-12 text-center">
        <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-0">
          <Clock className="w-3 h-3 mr-1" /> {config.durationDays}-Day Free Trial
        </Badge>
        <h2 className="text-3xl font-bold mb-4 text-white">
          Try {planName} Free for {config.durationDays} Days
        </h2>
        <p className="mb-8 max-w-xl mx-auto text-gray-400">
          Get full access to all {planName} features including AI Assistant,
          custom branding, and advanced analytics. No credit card required.
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 px-8"
          onClick={onStartTrial}
          disabled={loading}
        >
          {loading ? 'Starting Trial...' : 'Start Your Free Trial'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="mt-4 text-sm text-gray-500">
          No credit card required • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// TRUST BADGES
// ============================================
export function TrustBadges({ className = '' }) {
  const badges = [
    { icon: Shield, text: '256-bit SSL Encryption' },
    { icon: CreditCard, text: 'Secure Payments' },
    { icon: Clock, text: '30-Day Money Back' },
    { icon: Headphones, text: '24/7 Support' },
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-6 ${className}`}>
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2 text-gray-400">
          <badge.icon className="w-5 h-5" />
          <span className="text-sm">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// FULL PRICING SECTION
// ============================================
export function PricingSection({
  tiers = PRICING_TIERS,
  categories = FEATURE_CATEGORIES,
  faqItems = FAQ_ITEMS,
  onSelectTier,
  onStartTrial,
  currentPlan = null,
  showComparison = true,
  showFaq = true,
  showTrial = true,
  showTrustBadges = true,
  className = '',
}) {
  const [billingCycle, setBillingCycle] = useState('annual');

  return (
    <div className={`space-y-16 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-0 px-4 py-1">
          Simple, Transparent Pricing
        </Badge>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
          Choose the perfect plan for your team
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-400">
          Start free, scale as you grow. All plans include our core survey features.
        </p>
        <PricingToggle value={billingCycle} onChange={setBillingCycle} />
      </div>

      {/* Pricing Grid */}
      <PricingGrid
        tiers={tiers}
        billingCycle={billingCycle}
        onSelectTier={onSelectTier}
        currentPlan={currentPlan}
      />

      {/* Trust Badges */}
      {showTrustBadges && <TrustBadges />}

      {/* Comparison Table */}
      {showComparison && (
        <div>
          <h3 className="text-3xl font-bold mb-8 text-center text-white">
            Compare All Features
          </h3>
          <PricingComparison tiers={tiers} categories={categories} />
        </div>
      )}

      {/* Trial Banner */}
      {showTrial && (
        <TrialBanner onStartTrial={onStartTrial} />
      )}

      {/* FAQ */}
      {showFaq && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center text-white">
            Frequently Asked Questions
          </h3>
          <PricingFAQ items={faqItems} />
        </div>
      )}
    </div>
  );
}

export default PricingSection;
