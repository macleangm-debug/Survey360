/**
 * HelpCenter Component
 * 
 * A comprehensive, reusable Help Center page with:
 * - Search functionality
 * - Expandable category sidebar
 * - Article content viewer
 * - FAQ section
 * - Troubleshooting guide
 * - Keyboard shortcuts reference
 * - What's New changelog
 * 
 * Usage:
 * import { HelpCenter } from './pages/HelpCenter';
 * <Route path="/help" element={<HelpCenter />} />
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Share2,
  FileText,
  Zap,
  AlertCircle,
  MessageCircle,
  Lightbulb,
  Target,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  Keyboard,
  Calendar,
  Mail,
  Shield,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  X,
  Home,
  ClipboardList,
  PieChart,
  Globe,
  Bell
} from 'lucide-react';

// Import the AI Assistant
import { HelpAssistant } from '../components/HelpAssistant';

// Utility function to merge class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ============================================================
// CUSTOMIZE THESE: Update categories for your application
// ============================================================

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics and get started',
    color: 'teal',
    articles: [
      { id: 'welcome', title: 'Welcome Guide', readTime: '2 min', popular: true },
      { id: 'first-project', title: 'Create Your First Project', readTime: '5 min', popular: true },
      { id: 'dashboard-overview', title: 'Dashboard Overview', readTime: '3 min' },
      { id: 'account-setup', title: 'Setting Up Your Account', readTime: '4 min' },
    ]
  },
  {
    id: 'features',
    title: 'Features',
    icon: ClipboardList,
    description: 'Explore all available features',
    color: 'blue',
    articles: [
      { id: 'feature-overview', title: 'Feature Overview', readTime: '6 min', popular: true },
      { id: 'advanced-features', title: 'Advanced Features', readTime: '8 min' },
      { id: 'integrations', title: 'Integrations', readTime: '5 min' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart3,
    description: 'View analytics and generate reports',
    color: 'orange',
    articles: [
      { id: 'analytics-overview', title: 'Analytics Dashboard', readTime: '4 min', popular: true },
      { id: 'export-reports', title: 'Export Reports', readTime: '3 min' },
    ]
  },
  {
    id: 'team',
    title: 'Team & Collaboration',
    icon: Users,
    description: 'Manage your team',
    color: 'pink',
    articles: [
      { id: 'team-management', title: 'Managing Team Members', readTime: '4 min' },
      { id: 'roles-permissions', title: 'Roles & Permissions', readTime: '5 min' },
    ]
  },
  {
    id: 'settings',
    title: 'Account & Settings',
    icon: Settings,
    description: 'Configure your account',
    color: 'gray',
    articles: [
      { id: 'profile-settings', title: 'Profile Settings', readTime: '2 min' },
      { id: 'notification-preferences', title: 'Notification Preferences', readTime: '3 min' },
      { id: 'security-settings', title: 'Security Settings', readTime: '4 min' },
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    icon: CreditCard,
    description: 'Manage subscriptions and payments',
    color: 'yellow',
    articles: [
      { id: 'pricing-plans', title: 'Understanding Pricing Plans', readTime: '4 min' },
      { id: 'upgrade-plan', title: 'Upgrading Your Plan', readTime: '3 min' },
      { id: 'billing-history', title: 'Viewing Billing History', readTime: '2 min' },
    ]
  },
];

// ============================================================
// CUSTOMIZE THESE: Update FAQ for your application
// ============================================================

const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is this product?',
        a: 'Our platform is a comprehensive solution that helps you manage your projects efficiently. It offers features like drag-and-drop builders, real-time analytics, team collaboration, and more.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! We offer a free tier that includes basic features. You can upgrade anytime to access more features and higher limits.'
      },
      {
        q: 'How do I get support?',
        a: 'You can use our AI Assistant for instant help, browse the Help Center, or contact our support team via email.'
      },
    ]
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'How do I create a new project?',
        a: 'Click "New Project" from the dashboard. You can start from scratch or use a template. Add your content using the drag-and-drop builder.'
      },
      {
        q: 'Can I share my projects?',
        a: 'Yes! After creating a project, click the Share button to get a link. You can also generate QR codes, send email invitations, or embed on your website.'
      },
    ]
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Settings > Billing and click "Upgrade Plan". Choose your desired plan and complete the payment process.'
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel anytime from Settings > Billing. Your access continues until the end of your billing period.'
      },
    ]
  },
];

// ============================================================
// CUSTOMIZE THESE: Update troubleshooting for your application
// ============================================================

const TROUBLESHOOTING_DATA = [
  {
    id: 'loading-issues',
    title: 'Page not loading',
    symptoms: ['Blank page', 'Loading forever', 'Error message'],
    solutions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Clear your browser cache',
      'Try a different browser',
      'Contact support if the issue persists',
    ]
  },
  {
    id: 'login-issues',
    title: 'Cannot log in',
    symptoms: ['Invalid password', 'Account locked', 'Email not found'],
    solutions: [
      'Double-check your email address',
      'Use the "Forgot Password" link to reset',
      'Clear browser cookies',
      'Try a different browser',
      'Contact support for account issues',
    ]
  },
];

// ============================================================
// CUSTOMIZE THESE: Update keyboard shortcuts for your application
// ============================================================

const KEYBOARD_SHORTCUTS = [
  { category: 'Navigation', shortcuts: [
    { keys: ['Ctrl', 'K'], action: 'Open search' },
    { keys: ['Ctrl', 'D'], action: 'Go to Dashboard' },
    { keys: ['Esc'], action: 'Close modal/dialog' },
  ]},
  { category: 'Actions', shortcuts: [
    { keys: ['Ctrl', 'N'], action: 'Create new item' },
    { keys: ['Ctrl', 'S'], action: 'Save changes' },
    { keys: ['Ctrl', 'Z'], action: 'Undo' },
    { keys: ['Ctrl', 'Y'], action: 'Redo' },
  ]},
  { category: 'General', shortcuts: [
    { keys: ['Ctrl', '/'], action: 'Show keyboard shortcuts' },
    { keys: ['Ctrl', 'L'], action: 'Toggle light/dark mode' },
    { keys: ['?'], action: 'Open help center' },
  ]},
];

// ============================================================
// CUSTOMIZE THESE: Update changelog for your application
// ============================================================

const WHATS_NEW = [
  {
    version: '2.0.0',
    date: 'February 2026',
    highlights: [
      { type: 'feature', title: 'AI Assistant', description: 'Get instant help with our AI-powered assistant' },
      { type: 'feature', title: 'Help Center', description: 'Comprehensive documentation and guides' },
      { type: 'improvement', title: 'Performance', description: 'Faster load times and smoother animations' },
    ]
  },
  {
    version: '1.5.0',
    date: 'January 2026',
    highlights: [
      { type: 'feature', title: 'Team Collaboration', description: 'Invite team members and set permissions' },
      { type: 'improvement', title: 'Analytics', description: 'New charts and export options' },
    ]
  },
];

// ============================================================
// CUSTOMIZE THESE: Update article content for your application
// ============================================================

const ARTICLE_CONTENT = {
  'welcome': {
    title: 'Welcome Guide',
    content: `Welcome to our platform! This guide will help you get started.

## What You Can Do

### Create Projects
Use our intuitive drag-and-drop builder to create professional projects in minutes.

### Share Everywhere
Distribute your work through:
- **Direct links** - Share via email or social media
- **QR codes** - Perfect for print materials
- **Email invitations** - Send personalized invitations
- **Website embed** - Add directly to your site

### Analyze Results
Get real-time insights with our analytics dashboard.

## Quick Start Guide

1. **Create a project** - Click "New" on your dashboard
2. **Add content** - Use the builder to add and customize
3. **Publish** - Click "Publish" when ready
4. **Share** - Get your link and start sharing
5. **Analyze** - View analytics in real-time

## Need Help?

- Browse our help articles by category
- Use the search to find specific topics
- Use our AI Assistant for instant answers
- Contact support if you need assistance
    `,
  },
  'dashboard-overview': {
    title: 'Dashboard Overview',
    content: `The Dashboard is your command center. Here's what you'll find:

## Main Dashboard Elements

### Statistics Cards
At the top, you'll see key metrics:
- **Total Items** - Number of items created
- **Total Views** - Combined views
- **Active Items** - Currently published
- **Performance** - Average metrics

### Activity Chart
A visual graph showing activity over time.

### Quick Actions
Fast access to common tasks.

### Recent Activity Feed
Shows the latest activities.

## Navigation Tips

- Use the sidebar to navigate
- Search bar helps find items quickly
- Toggle between light and dark mode
- Access help anytime via the ? icon
    `,
  },
  // Add more articles as needed...
};

// ============================================================
// Main Help Center Component
// ============================================================

export function HelpCenter({ isDark = true }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || null);
  const [activeArticle, setActiveArticle] = useState(searchParams.get('article') || null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [articleFeedback, setArticleFeedback] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Search functionality
  const searchResults = searchQuery.trim() ? 
    HELP_CATEGORIES.flatMap(cat => 
      cat.articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(article => ({ ...article, category: cat }))
    ) : [];

  // Handle article view
  const handleArticleClick = (categoryId, articleId) => {
    setActiveCategory(categoryId);
    setActiveArticle(articleId);
    setActiveTab('article');
    setSearchParams({ tab: 'article', category: categoryId, article: articleId });
  };

  // Get article content
  const getArticleContent = (articleId) => {
    return ARTICLE_CONTENT[articleId] || {
      title: 'Article Not Found',
      content: 'This article is not available yet. Please check back later or browse other articles.'
    };
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'article':
        const article = getArticleContent(activeArticle);
        return (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => { setActiveTab('home'); setSearchParams({}); }}
              className={cn("flex items-center gap-2 text-sm", textSecondary, hoverBg, "px-3 py-2 rounded-lg")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </button>
            
            {/* Article content */}
            <div className={cn(bgSecondary, borderColor, "border rounded-xl p-6")}>
              <h1 className={cn("text-2xl font-bold mb-4", textPrimary)}>{article.title}</h1>
              <div className={cn("prose prose-sm max-w-none", isDark ? "prose-invert" : "")}>
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </div>
            
            {/* Feedback */}
            <div className={cn(bgSecondary, borderColor, "border rounded-xl p-4")}>
              <p className={cn("text-sm font-medium mb-3", textPrimary)}>Was this article helpful?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setArticleFeedback(prev => ({ ...prev, [activeArticle]: 'yes' }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    articleFeedback[activeArticle] === 'yes'
                      ? "bg-green-500/20 text-green-400"
                      : cn(hoverBg, textSecondary)
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </button>
                <button
                  onClick={() => setArticleFeedback(prev => ({ ...prev, [activeArticle]: 'no' }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    articleFeedback[activeArticle] === 'no'
                      ? "bg-red-500/20 text-red-400"
                      : cn(hoverBg, textSecondary)
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </button>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>Frequently Asked Questions</h2>
            {FAQ_DATA.map((category, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <h3 className={cn("font-semibold", textPrimary)}>{category.category}</h3>
                {category.questions.map((faq, qIdx) => {
                  const faqId = `${catIdx}-${qIdx}`;
                  const isExpanded = expandedFaq === faqId;
                  return (
                    <div
                      key={qIdx}
                      className={cn(bgSecondary, borderColor, "border rounded-xl overflow-hidden")}
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                        className={cn("w-full flex items-center justify-between p-4 text-left", hoverBg)}
                      >
                        <span className={cn("font-medium", textPrimary)}>{faq.q}</span>
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          textSecondary,
                          isExpanded && "rotate-180"
                        )} />
                      </button>
                      {isExpanded && (
                        <div className={cn("px-4 pb-4", textSecondary)}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>Troubleshooting</h2>
            <div className="grid gap-4">
              {TROUBLESHOOTING_DATA.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(bgSecondary, borderColor, "border rounded-xl p-4 cursor-pointer", hoverBg)}
                  onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={cn("font-semibold", textPrimary)}>{issue.title}</h3>
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform",
                      textSecondary,
                      selectedIssue === issue.id && "rotate-90"
                    )} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {issue.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className={cn("text-xs px-2 py-1 rounded-full", isDark ? "bg-white/10" : "bg-gray-100", textSecondary)}
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                  {selectedIssue === issue.id && (
                    <div className="mt-4 space-y-2">
                      <p className={cn("text-sm font-medium", textPrimary)}>Solutions:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {issue.solutions.map((solution, idx) => (
                          <li key={idx} className={cn("text-sm", textSecondary)}>{solution}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>Keyboard Shortcuts</h2>
            {KEYBOARD_SHORTCUTS.map((group, idx) => (
              <div key={idx} className={cn(bgSecondary, borderColor, "border rounded-xl p-4")}>
                <h3 className={cn("font-semibold mb-3", textPrimary)}>{group.category}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between">
                      <span className={textSecondary}>{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className={cn(
                              "px-2 py-1 text-xs rounded font-mono",
                              isDark ? "bg-white/10" : "bg-gray-100",
                              textPrimary
                            )}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'whats-new':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>What's New</h2>
            {WHATS_NEW.map((release, idx) => (
              <div key={idx} className={cn(bgSecondary, borderColor, "border rounded-xl p-4")}>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("font-bold", textPrimary)}>v{release.version}</span>
                  <span className={textSecondary}>{release.date}</span>
                </div>
                <div className="space-y-2">
                  {release.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-3">
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded",
                        item.type === 'feature' ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {item.type}
                      </span>
                      <div>
                        <p className={cn("font-medium", textPrimary)}>{item.title}</p>
                        <p className={cn("text-sm", textSecondary)}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default: // home
        return (
          <div className="space-y-6">
            {/* Quick Links */}
            <div className={cn(bgSecondary, borderColor, "border rounded-xl p-5")}>
              <h2 className={cn("font-semibold mb-4", textPrimary)}>Quick Links</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                    borderColor, "border hover:border-teal-500/30"
                  )}
                >
                  <HelpCircle className="w-4 h-4 text-teal-500" />
                  <span className={cn("text-sm", textPrimary)}>FAQ</span>
                </button>
                <button
                  onClick={() => setActiveTab('troubleshooting')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                    borderColor, "border hover:border-teal-500/30"
                  )}
                >
                  <AlertCircle className="w-4 h-4 text-teal-500" />
                  <span className={cn("text-sm", textPrimary)}>Troubleshooting</span>
                </button>
                <button
                  onClick={() => setActiveTab('shortcuts')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                    borderColor, "border hover:border-teal-500/30"
                  )}
                >
                  <Keyboard className="w-4 h-4 text-teal-500" />
                  <span className={cn("text-sm", textPrimary)}>Shortcuts</span>
                </button>
              </div>
            </div>

            {/* Content Sections */}
            {HELP_CATEGORIES.slice(0, 4).map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className={cn(bgSecondary, borderColor, "border rounded-xl p-5")}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-teal-500" />
                    <h2 className={cn("font-semibold", textPrimary)}>{category.title}</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {category.articles.slice(0, 2).map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleClick(category.id, article.id)}
                        className={cn(
                          "text-left p-4 rounded-xl transition-all",
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                          borderColor, "border hover:border-teal-500/30"
                        )}
                      >
                        <h3 className={cn("font-medium mb-1", textPrimary)}>{article.title}</h3>
                        <p className={cn("text-sm", textSecondary)}>{category.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen p-6", bgPrimary)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={cn("text-3xl font-bold mb-2", textPrimary)}>Help Center</h1>
        <p className={textSecondary}>Find answers, tutorials, and documentation</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", textMuted)} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, guides, and tutorials..."
          className={cn(
            "w-full pl-12 py-4 rounded-xl text-sm",
            bgSecondary, borderColor, "border",
            textPrimary, "placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-500/50"
          )}
        />
        {searchQuery && searchResults.length > 0 && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto z-50 rounded-xl shadow-xl",
            bgSecondary, borderColor, "border"
          )}>
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => { handleArticleClick(result.category.id, result.id); setSearchQuery(''); }}
                className={cn("w-full text-left px-4 py-3 border-b last:border-0", borderColor, hoverBg)}
              >
                <p className={cn("text-sm font-medium", textPrimary)}>{result.title}</p>
                <p className={cn("text-xs", textMuted)}>{result.category.title} • {result.readTime}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left - Categories */}
        <div className={cn("w-72 flex-shrink-0 rounded-xl p-5", bgSecondary, borderColor, "border")}>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 rounded-lg bg-teal-500/10">
              <ClipboardList className="w-4 h-4 text-teal-500" />
            </div>
            <h2 className={cn("font-semibold", textPrimary)}>Categories</h2>
          </div>
          
          <nav className="space-y-1">
            {HELP_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;
              return (
                <div key={category.id}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isExpanded ? cn(isDark ? "bg-white/5" : "bg-gray-100", textPrimary) : cn(textSecondary, hoverBg)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-teal-500/70" />
                      <span>{category.title}</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-10 mt-1 space-y-1">
                      {category.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleClick(category.id, article.id)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-sm transition-colors",
                            textMuted, "hover:text-teal-400"
                          )}
                        >
                          {article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right - Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* AI Assistant */}
      <HelpAssistant isDark={isDark} />
    </div>
  );
}

export default HelpCenter;
