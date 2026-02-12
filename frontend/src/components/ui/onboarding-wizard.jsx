import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  FileText,
  Settings,
  BarChart3,
  Share2,
  Users,
  Palette,
  Bell,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

/**
 * OnboardingWizard - A reusable onboarding/tour component
 * 
 * @param {boolean} isOpen - Whether the wizard is active
 * @param {function} onClose - Callback when wizard closes
 * @param {function} onComplete - Callback when wizard completes
 * @param {array} steps - Array of step objects (optional, uses default Survey360 steps)
 */

// Default Survey360 onboarding steps
const SURVEY360_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Survey360!',
    description: 'Your complete survey management platform. Let\'s take a quick tour to help you get started.',
    target: null, // null means centered modal
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Get a quick overview of your surveys, responses, and analytics all in one place.',
    target: '[data-tour="dashboard"]',
    icon: LayoutDashboard,
    position: 'bottom'
  },
  {
    id: 'create-survey',
    title: 'Create New Survey',
    description: 'Click here to create a new survey. Choose from templates or start from scratch.',
    target: '[data-tour="new-survey"]',
    icon: FileText,
    position: 'right'
  },
  {
    id: 'surveys-list',
    title: 'Manage Your Surveys',
    description: 'View, edit, and organize all your surveys. Filter by status, search, and more.',
    target: '[data-tour="surveys"]',
    icon: FileText,
    position: 'right'
  },
  {
    id: 'responses',
    title: 'View Responses',
    description: 'See all collected responses in real-time. Export data and analyze individual submissions.',
    target: '[data-tour="responses"]',
    icon: Users,
    position: 'right'
  },
  {
    id: 'analytics',
    title: 'Powerful Analytics',
    description: 'Dive deep into your data with charts, trends, and insights. Export reports in multiple formats.',
    target: '[data-tour="analytics"]',
    icon: BarChart3,
    position: 'bottom'
  },
  {
    id: 'share',
    title: 'Share Your Survey',
    description: 'Get shareable links, QR codes, and embed codes to distribute your survey anywhere.',
    target: '[data-tour="share"]',
    icon: Share2,
    position: 'left'
  },
  {
    id: 'customization',
    title: 'Customize Appearance',
    description: 'Add your logo, choose brand colors, and customize the look and feel of your surveys.',
    target: '[data-tour="settings-btn"]',
    icon: Palette,
    position: 'left'
  },
  {
    id: 'settings',
    title: 'Account Settings',
    description: 'Manage your profile, organization, billing, and notification preferences.',
    target: '[data-tour="settings"]',
    icon: Settings,
    position: 'right'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start creating amazing surveys. Need help? Check out our documentation or contact support.',
    target: null,
    icon: HelpCircle,
    position: 'center'
  }
];

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  steps = SURVEY360_STEPS
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState('top');

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Calculate tooltip position based on target element
  const calculatePosition = useCallback(() => {
    if (!step?.target || step.position === 'center') {
      setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setArrowPosition('none');
      return;
    }

    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setArrowPosition('none');
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 16;
    const arrowSize = 12;

    let top, left;
    let arrow = step.position;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + padding + arrowSize;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrow = 'top';
        break;
      case 'top':
        top = rect.top - tooltipHeight - padding - arrowSize;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrow = 'bottom';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding - arrowSize;
        arrow = 'right';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding + arrowSize;
        arrow = 'left';
        break;
      default:
        top = rect.bottom + padding;
        left = rect.left;
        arrow = 'top';
    }

    // Keep tooltip in viewport
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    setTooltipPosition({ top: `${top}px`, left: `${left}px` });
    setArrowPosition(arrow);

    // Highlight target element
    targetEl.classList.add('tour-highlight');
    return () => targetEl.classList.remove('tour-highlight');
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      const cleanup = calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        cleanup?.();
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
        // Remove highlight from all elements
        document.querySelectorAll('.tour-highlight').forEach(el => {
          el.classList.remove('tour-highlight');
        });
      };
    }
  }, [isOpen, currentStep, calculatePosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Remove highlight from current target
      if (step?.target) {
        const el = document.querySelector(step.target);
        el?.classList.remove('tour-highlight');
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      if (step?.target) {
        const el = document.querySelector(step.target);
        el?.classList.remove('tour-highlight');
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save to localStorage so we don't show again
    localStorage.setItem('survey360_onboarding_complete', 'true');
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('survey360_onboarding_complete', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const StepIcon = step?.icon || Sparkles;
  const isCentered = step?.position === 'center' || !step?.target;

  return (
    <>
      {/* Backdrop with spotlight effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[100]"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            "fixed z-[101] w-[320px]",
            isCentered && "transform -translate-x-1/2 -translate-y-1/2"
          )}
          style={isCentered ? { top: '50%', left: '50%' } : tooltipPosition}
        >
          {/* Arrow */}
          {arrowPosition !== 'none' && (
            <div
              className={cn(
                "absolute w-0 h-0 border-8 border-transparent",
                arrowPosition === 'top' && "top-[-16px] left-1/2 -translate-x-1/2 border-b-slate-800",
                arrowPosition === 'bottom' && "bottom-[-16px] left-1/2 -translate-x-1/2 border-t-slate-800",
                arrowPosition === 'left' && "left-[-16px] top-1/2 -translate-y-1/2 border-r-slate-800",
                arrowPosition === 'right' && "right-[-16px] top-1/2 -translate-y-1/2 border-l-slate-800"
              )}
            />
          )}

          {/* Content */}
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <StepIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-base">
                        {step?.title}
                      </h3>
                      <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                        {currentStep + 1}/{steps.length}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-white -mt-1 -mr-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="px-4 pb-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {step?.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pb-3">
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="px-4 pb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-slate-400 hover:text-white disabled:opacity-30 h-9 w-9"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-9"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="text-slate-400 hover:text-white h-9 w-9"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Global styles for tour highlight */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 100;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          animation: pulse-highlight 2s ease-in-out infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.4);
          }
        }
      `}</style>
    </>
  );
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('survey360_onboarding_complete');
    if (!completed) {
      // Delay to let the page load
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startOnboarding = () => setShowOnboarding(true);
  const closeOnboarding = () => setShowOnboarding(false);
  const resetOnboarding = () => {
    localStorage.removeItem('survey360_onboarding_complete');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    startOnboarding,
    closeOnboarding,
    resetOnboarding
  };
}

export default OnboardingWizard;
