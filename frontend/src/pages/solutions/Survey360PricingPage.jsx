/**
 * Survey360 Pricing Page
 * Uses reusable pricing components library
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUIStore } from '../../store';
import survey360Api from '../../lib/survey360Api';
import {
  PricingSection,
  PRICING_TIERS,
  FEATURE_CATEGORIES,
  FAQ_ITEMS,
} from '../../components/pricing';

export function Survey360PricingPage() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [currentPlan, setCurrentPlan] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);

  useEffect(() => {
    // Try to get current subscription if logged in
    const loadSubscription = async () => {
      try {
        const response = await survey360Api.get('/pricing/subscription');
        setCurrentPlan(response.data.plan);
      } catch (e) {
        // Not logged in or no subscription
      }
    };
    loadSubscription();
  }, []);

  const handleSelectTier = async (tier) => {
    if (tier.id === 'free') {
      navigate('/survey360/register');
      return;
    }
    
    if (tier.id === 'enterprise') {
      window.location.href = 'mailto:sales@survey360.com?subject=Enterprise Plan Inquiry';
      return;
    }

    // For paid plans, check if logged in
    try {
      const response = await survey360Api.post('/pricing/upgrade', {
        plan: tier.id,
        billing_cycle: 'annual'
      });
      toast.success(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.info('Please sign in to upgrade');
        navigate('/survey360/login');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to process request');
      }
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
        toast.info('Please sign in to start your trial');
        navigate('/survey360/login');
      } else if (error.response?.status === 400) {
        toast.error('You have already used your trial. Please upgrade to continue.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to start trial');
      }
    } finally {
      setStartingTrial(false);
    }
  };

  return (
    <div 
      className={`min-h-screen py-16 px-4 ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'}`}
      data-testid="pricing-page"
    >
      <div className="max-w-7xl mx-auto">
        <PricingSection
          tiers={PRICING_TIERS}
          categories={FEATURE_CATEGORIES}
          faqItems={FAQ_ITEMS}
          onSelectTier={handleSelectTier}
          onStartTrial={handleStartTrial}
          currentPlan={currentPlan}
          showComparison={true}
          showFaq={true}
          showTrial={true}
          showTrustBadges={true}
        />
      </div>
    </div>
  );
}

export default Survey360PricingPage;
