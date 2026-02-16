/**
 * Survey360 Pricing Examples
 * Ready-to-use implementations for various use cases
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  PricingSection,
  PricingGrid,
  PricingCard,
  PricingToggle,
  PricingComparison,
  PricingFAQ,
  TrialBanner,
  TrustBadges,
} from './PricingComponents';
import {
  PRICING_TIERS,
  FEATURE_CATEGORIES,
  FAQ_ITEMS,
  TRIAL_CONFIG,
} from './PricingConfig';

// ============================================
// EXAMPLE 1: Full Pricing Page
// ============================================
export function FullPricingPage() {
  const navigate = useNavigate();

  const handleSelectTier = (tier) => {
    if (tier.id === 'free') {
      navigate('/register');
    } else if (tier.id === 'enterprise') {
      window.location.href = 'mailto:sales@survey360.com';
    } else {
      toast.success(`Selected ${tier.name} plan!`);
      // Navigate to checkout or upgrade flow
    }
  };

  const handleStartTrial = () => {
    toast.success('Starting your 14-day Pro trial!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a1628] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <PricingSection
          onSelectTier={handleSelectTier}
          onStartTrial={handleStartTrial}
          showComparison={true}
          showFaq={true}
          showTrial={true}
          showTrustBadges={true}
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Landing Page Pricing Section
// ============================================
export function LandingPricingSection() {
  const [billingCycle, setBillingCycle] = useState('annual');

  return (
    <section className="py-20 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>
        
        <PricingToggle
          value={billingCycle}
          onChange={setBillingCycle}
          className="mb-12"
        />
        
        <PricingGrid
          tiers={PRICING_TIERS.slice(0, 4)} // Exclude Enterprise
          billingCycle={billingCycle}
          columns={4}
          onSelectTier={(tier) => console.log('Selected:', tier.name)}
        />
        
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Need more? <a href="/contact" className="text-teal-400 hover:underline">Contact us</a> for Enterprise pricing.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// EXAMPLE 3: Light Theme Pricing
// ============================================
export function LightThemePricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className={billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(b => b === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}>
              Annual <span className="text-green-600 text-sm">(Save 33%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_TIERS.slice(1, 4).map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-2xl shadow-lg p-8 ${
                tier.popular ? 'ring-2 ring-teal-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <span className="bg-teal-500 text-white text-sm px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mt-4">{tier.name}</h3>
              <p className="text-gray-500 mt-2">{tier.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'annual' ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              <button className={`w-full mt-6 py-3 rounded-lg font-medium ${
                tier.popular
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {tier.cta}
              </button>
              <ul className="mt-6 space-y-3">
                {tier.features.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="text-teal-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Minimal 3-Tier Pricing
// ============================================
export function MinimalPricing() {
  const tiers = PRICING_TIERS.filter(t => ['starter', 'pro', 'business'].includes(t.id));

  return (
    <div className="bg-[#0a1628] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Pick a Plan
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              showFeatures={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Pricing with Comparison Only
// ============================================
export function PricingComparisonOnly() {
  return (
    <div className="bg-[#0a1628] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Compare Plans
        </h2>
        <PricingComparison />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Custom Styled Pricing
// ============================================
export function CustomStyledPricing() {
  const [billing, setBilling] = useState('annual');

  return (
    <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-teal-900 min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm">
            💎 Premium Plans
          </span>
          <h1 className="text-5xl font-black text-white mt-6 mb-4">
            Unlock Your Potential
          </h1>
          <p className="text-xl text-gray-300">
            Enterprise-grade surveys at startup-friendly prices
          </p>
        </div>

        <PricingToggle value={billing} onChange={setBilling} className="mb-16" />

        <div className="grid lg:grid-cols-3 gap-8">
          {PRICING_TIERS.slice(1, 4).map((tier, index) => (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-8 ${
                tier.popular
                  ? 'bg-gradient-to-br from-teal-500/30 to-emerald-500/30 border-2 border-teal-400'
                  : 'bg-white/5 border border-white/10'
              }`}
              style={{
                transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {tier.popular && (
                <div className="absolute -top-4 right-8 bg-gradient-to-r from-teal-400 to-emerald-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                  RECOMMENDED
                </div>
              )}
              <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-white">
                  ${billing === 'annual' ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice}
                </span>
                <span className="text-gray-400 mb-2">/mo</span>
              </div>
              <p className="text-gray-400 mt-2">{tier.description}</p>
              
              <button className={`w-full mt-8 py-4 rounded-xl font-bold transition-all ${
                tier.popular
                  ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-black hover:shadow-lg hover:shadow-teal-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                Get Started →
              </button>

              <div className="mt-8 space-y-3">
                {tier.features.slice(0, 6).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="text-teal-400">✓</span>
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}

// Export all examples
export default {
  FullPricingPage,
  LandingPricingSection,
  LightThemePricing,
  MinimalPricing,
  PricingComparisonOnly,
  CustomStyledPricing,
};
