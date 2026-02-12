import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  HelpCircle,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Book,
  MessageCircle,
  Keyboard,
  ExternalLink,
  X,
  Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './tooltip';
import { LanguageSelectorCompact } from './language-selector';
import { cn } from '../../lib/utils';

// Keyboard shortcuts modal content
const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Open search' },
  { keys: ['Ctrl', 'N'], description: 'New survey' },
  { keys: ['Ctrl', 'D'], description: 'Go to dashboard' },
  { keys: ['Ctrl', '/'], description: 'Show shortcuts' },
  { keys: ['Esc'], description: 'Close modal' },
];

// Sample notifications - can be passed as prop in real usage
const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New response received',
    description: 'Customer Satisfaction Survey got 5 new responses',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    title: 'Survey completed',
    description: 'Employee Feedback Survey reached its target',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    title: 'Weekly report ready',
    description: 'Your weekly analytics report is available',
    time: '3 hours ago',
    read: true,
  },
];

export function DashboardHeader({
  user,
  theme = 'dark',
  onThemeToggle,
  onLogout,
  onMenuClick,
  showMobileMenu = true,
  searchPlaceholder = 'Search...',
  onSearch,
  notifications = DEFAULT_NOTIFICATIONS,
  onNotificationClick,
  onClearNotifications,
  helpLinks = [],
  languages = LANGUAGES,
  currentLanguage = 'en',
  onLanguageChange,
  className,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  
  const isDark = theme === 'dark';
  
  // Theme classes
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const inputBg = isDark ? 'bg-white/5' : 'bg-gray-100';

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentLang = languages.find(l => l.code === selectedLanguage) || languages[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  const defaultHelpLinks = [
    { icon: Book, label: 'Documentation', href: '#docs' },
    { icon: MessageCircle, label: 'Contact Support', href: '#support' },
    { icon: Keyboard, label: 'Keyboard Shortcuts', action: () => setShowShortcuts(true) },
  ];

  const resolvedHelpLinks = helpLinks.length > 0 ? helpLinks : defaultHelpLinks;

  return (
    <>
      <header 
        className={cn(
          `h-14 ${bgSecondary} border-b ${borderColor} flex items-center px-4 lg:px-6 gap-4 transition-colors duration-300`,
          className
        )}
        data-testid="dashboard-header"
      >
        {/* Mobile Menu Toggle */}
        {showMobileMenu && (
          <button
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-lg ${hoverBg} ${textSecondary}`}
            data-testid="mobile-menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search - Left side */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                `w-full pl-9 pr-4 py-2 text-sm ${inputBg} border ${borderColor} rounded-lg`,
                `focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all`,
                `${textPrimary} placeholder:${textMuted}`
              )}
              data-testid="header-search-input"
            />
            <kbd className={`hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs ${textMuted} ${inputBg} rounded border ${borderColor}`}>
              ⌘K
            </kbd>
          </div>
        </form>

        {/* Spacer to push icons to far right */}
        <div className="flex-1" />

        {/* Right side actions - Far right */}
        <div className="flex items-center gap-1">
          {/* Language Selector */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${hoverBg} ${textSecondary}`}
                    data-testid="language-btn"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">{currentLang.flag}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Language</TooltipContent>
            </Tooltip>
            <DropdownMenuContent 
              align="end" 
              className={`w-48 ${bgSecondary} ${borderColor}`}
            >
              <DropdownMenuLabel className={textMuted}>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator className={borderColor} />
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={cn(
                    `${textSecondary} hover:text-teal-500 ${hoverBg} cursor-pointer`,
                    selectedLanguage === lang.code && 'text-teal-500'
                  )}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                  {selectedLanguage === lang.code && (
                    <Check className="w-4 h-4 ml-auto text-teal-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Menu */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}
                    data-testid="help-btn"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Help & Resources</TooltipContent>
            </Tooltip>
            <DropdownMenuContent 
              align="end" 
              className={`w-56 ${bgSecondary} ${borderColor}`}
            >
              <DropdownMenuLabel className={textMuted}>Help & Resources</DropdownMenuLabel>
              <DropdownMenuSeparator className={borderColor} />
              {resolvedHelpLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={link.action || (() => window.open(link.href, '_blank'))}
                    className={`${textSecondary} hover:text-teal-500 ${hoverBg} cursor-pointer`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                    {link.href && !link.action && (
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onThemeToggle}
                className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}
                data-testid="theme-toggle-btn"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</TooltipContent>
          </Tooltip>
          
          {/* Notifications */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={`p-2 rounded-lg ${hoverBg} ${textSecondary} relative`}
                    data-testid="notifications-btn"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
            <DropdownMenuContent 
              align="end" 
              className={`w-80 ${bgSecondary} ${borderColor}`}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className={`${textPrimary} p-0`}>Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button 
                    onClick={onClearNotifications}
                    className={`text-xs ${textMuted} hover:text-teal-500 transition-colors`}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator className={borderColor} />
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`px-3 py-6 text-center ${textMuted}`}>
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => onNotificationClick?.(notification)}
                      className={cn(
                        `flex-col items-start px-3 py-2.5 cursor-pointer ${hoverBg}`,
                        !notification.read && (isDark ? 'bg-teal-500/5' : 'bg-teal-50')
                      )}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {!notification.read && (
                          <span className="w-2 h-2 mt-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                        )}
                        <div className={cn("flex-1 min-w-0", notification.read && "ml-4")}>
                          <p className={`text-sm font-medium ${textPrimary} truncate`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs ${textMuted} mt-0.5 line-clamp-2`}>
                            {notification.description}
                          </p>
                          <p className={`text-xs ${textMuted} mt-1`}>
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator className={borderColor} />
                  <DropdownMenuItem 
                    className={`justify-center ${textSecondary} hover:text-teal-500 ${hoverBg}`}
                  >
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`flex items-center gap-2 p-1.5 rounded-lg ${hoverBg} ml-1`}
                data-testid="user-menu-btn"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-teal-500/20 text-teal-500 text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className={`w-4 h-4 ${textMuted} hidden sm:block`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={`w-56 ${bgSecondary} ${borderColor}`}
            >
              <div className={`px-3 py-2 border-b ${borderColor}`}>
                <p className={`text-sm font-medium ${textPrimary}`}>{user?.name}</p>
                <p className={`text-xs ${textMuted}`}>{user?.email}</p>
              </div>
              <DropdownMenuItem 
                onClick={() => navigate('/solutions/survey360/app/settings')}
                className={`${textSecondary} hover:text-teal-500 ${hoverBg} mt-1`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/solutions/survey360/app/settings')}
                className={`${textSecondary} hover:text-teal-500 ${hoverBg}`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className={borderColor} />
              <DropdownMenuItem 
                onClick={onLogout} 
                className={`text-red-500 hover:text-red-400 ${hoverBg}`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md ${bgSecondary} rounded-xl shadow-2xl z-50 border ${borderColor}`}
            >
              <div className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}>
                <h3 className={`font-semibold ${textPrimary}`}>Keyboard Shortcuts</h3>
                <button 
                  onClick={() => setShowShortcuts(false)}
                  className={`p-1.5 rounded-lg ${hoverBg} ${textSecondary}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`text-sm ${textSecondary}`}>{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className={`px-2 py-1 text-xs ${textPrimary} ${inputBg} rounded border ${borderColor} font-mono`}>
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className={textMuted}>+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default DashboardHeader;
