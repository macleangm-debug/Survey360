import React, { useState } from 'react';
import { Search, ChevronRight, Zap, ClipboardList, Share2, FileText, BarChart3, Users, Settings, CreditCard, Globe, Shield, HelpCircle } from 'lucide-react';

// ============ CUSTOMIZE THESE ============
const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics and get started',
    articles: [
      { id: 'welcome', title: 'Welcome Guide', readTime: '2 min' },
      { id: 'first-project', title: 'Create Your First Project', readTime: '5 min' },
      { id: 'dashboard', title: 'Dashboard Overview', readTime: '3 min' },
    ]
  },
  {
    id: 'forms',
    title: 'Forms & Data Collection',
    icon: ClipboardList,
    description: 'Create and manage forms',
    articles: [
      { id: 'form-builder', title: 'Form Builder Guide', readTime: '6 min' },
      { id: 'offline-data', title: 'Offline Data Collection', readTime: '4 min' },
    ]
  },
  {
    id: 'security',
    title: 'Security & Access',
    icon: Shield,
    description: 'Security settings and permissions',
    articles: [
      { id: 'permissions', title: 'User Permissions', readTime: '4 min' },
      { id: 'data-security', title: 'Data Security', readTime: '5 min' },
    ]
  },
  {
    id: 'team',
    title: 'Team Management',
    icon: Users,
    description: 'Manage your team',
    articles: [
      { id: 'invite-members', title: 'Invite Team Members', readTime: '3 min' },
      { id: 'roles', title: 'Roles & Permissions', readTime: '4 min' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart3,
    description: 'View analytics and generate reports',
    articles: [
      { id: 'dashboard-analytics', title: 'Analytics Dashboard', readTime: '4 min' },
      { id: 'export-reports', title: 'Export Reports', readTime: '3 min' },
    ]
  },
  {
    id: 'settings',
    title: 'Settings & Customization',
    icon: Settings,
    description: 'Configure your account',
    articles: [
      { id: 'account-settings', title: 'Account Settings', readTime: '3 min' },
      { id: 'notifications', title: 'Notification Preferences', readTime: '2 min' },
    ]
  },
];

const QUICK_LINKS = [
  { id: 'getting-started-guide', title: 'Getting Started Guide', icon: Zap, categoryId: 'getting-started', articleId: 'welcome' },
  { id: 'offline-mode', title: 'Offline Mode Guide', icon: Globe, categoryId: 'forms', articleId: 'offline-data' },
  { id: 'security', title: 'Security Options', icon: Shield, categoryId: 'security', articleId: 'permissions' },
];
// ==========================================

export function HelpCenter({ onArticleClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Search functionality
  const searchResults = searchQuery.trim() ? 
    HELP_CATEGORIES.flatMap(cat => 
      cat.articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(article => ({ ...article, category: cat }))
    ) : [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Help Center</h1>
        <p className="text-gray-400">Find answers, tutorials, and documentation</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, guides, and tutorials..."
          className="w-full pl-12 py-4 bg-[#0f1d32] border border-white/10 rounded-xl text-white placeholder-gray-500"
        />
        {searchQuery && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1d32] border border-white/10 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => { onArticleClick?.(result.category.id, result.id); setSearchQuery(''); }}
                className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/10 last:border-0"
              >
                <p className="text-sm font-medium text-white">{result.title}</p>
                <p className="text-xs text-gray-500">{result.category.title} • {result.readTime}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left - Categories */}
        <div className="w-72 flex-shrink-0 bg-[#0f1d32] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 rounded-lg bg-teal-500/10">
              <ClipboardList className="w-4 h-4 text-teal-500" />
            </div>
            <h2 className="font-semibold text-white">Categories</h2>
          </div>
          
          <nav className="space-y-1">
            {HELP_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;
              return (
                <div key={category.id}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${isExpanded ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-teal-500/70" />
                      <span>{category.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-10 mt-1 space-y-1">
                      {category.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => onArticleClick?.(category.id, article.id)}
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:text-teal-400 transition-colors"
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
        <div className="flex-1 space-y-6">
          {/* Quick Links */}
          <div className="bg-[#0f1d32] border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-3 gap-4">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => onArticleClick?.(link.categoryId, link.articleId)}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-teal-500/30 transition-all"
                  >
                    <Icon className="w-4 h-4 text-teal-500" />
                    <span className="text-sm text-white">{link.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Sections */}
          {HELP_CATEGORIES.slice(0, 4).map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="bg-[#0f1d32] border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-teal-500" />
                  <h2 className="font-semibold text-white">{category.title}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {category.articles.slice(0, 2).map((article) => (
                    <button
                      key={article.id}
                      onClick={() => onArticleClick?.(category.id, article.id)}
                      className="text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-teal-500/30 transition-all"
                    >
                      <h3 className="font-medium text-white mb-1">{article.title}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
