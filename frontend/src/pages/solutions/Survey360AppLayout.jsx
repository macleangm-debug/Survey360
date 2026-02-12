import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  TooltipProvider,
} from '../../components/ui/tooltip';
import { DashboardHeader } from '../../components/ui/dashboard-header';
import { useAuthStore, useOrgStore, useUIStore } from '../../store';
import { cn } from '../../lib/utils';

const NAVIGATION = [
  { id: 'dashboard', label: 'Home', icon: Home, path: '/solutions/survey360/app/dashboard' },
  { id: 'surveys', label: 'Surveys', icon: ClipboardList, path: '/solutions/survey360/app/surveys' },
  { id: 'responses', label: 'Responses', icon: BarChart3, path: '/solutions/survey360/app/responses' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/solutions/survey360/app/billing' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/solutions/survey360/app/settings' },
];

export function Survey360AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentOrg, organizations, setCurrentOrg } = useOrgStore();
  const { theme, setTheme } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/solutions/survey360/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/solutions/survey360/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Theme classes
  const isDark = theme === 'dark';
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const activeBg = isDark ? 'bg-teal-500/10' : 'bg-teal-50';
  const inputBg = isDark ? 'bg-white/5' : 'bg-gray-100';

  return (
    <TooltipProvider>
      <div className={`flex h-screen ${bgPrimary} transition-colors duration-300`}>
        {/* Sidebar */}
        <aside className={`hidden lg:flex flex-col w-64 ${bgSecondary} border-r ${borderColor} transition-colors duration-300`}>
          {/* Logo */}
          <div className={`h-16 flex items-center px-6 border-b ${borderColor}`}>
            <Link to="/solutions/survey360" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-xl ${textPrimary}`}>Survey360</span>
            </Link>
          </div>

          {/* Create Button */}
          <div className="p-4">
            <Button 
              onClick={() => navigate('/solutions/survey360/app/surveys/new')}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
              data-tour="new-survey"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Survey
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {NAVIGATION.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  data-tour={item.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive 
                      ? `${activeBg} text-teal-500 font-medium` 
                      : `${textSecondary} ${hoverBg} hover:text-teal-500`
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Organization Selector */}
          {organizations?.length > 0 && (
            <div className={`p-4 border-t ${borderColor}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${inputBg} ${hoverBg} transition-colors text-left`}>
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500 font-medium text-xs">
                      {currentOrg?.name?.charAt(0) || 'O'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textPrimary} truncate`}>
                        {currentOrg?.name || 'Select Org'}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${textMuted}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={`w-56 ${bgSecondary} ${borderColor}`}>
                  {organizations.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => setCurrentOrg(org)}
                      className={cn(
                        "text-gray-300 hover:text-white hover:bg-white/10",
                        currentOrg?.id === org.id && "bg-teal-500/10 text-teal-400"
                      )}
                    >
                      <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs mr-2">
                        {org.name?.charAt(0)}
                      </div>
                      {org.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* User Profile */}
          <div className={`p-4 border-t ${borderColor}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg ${hoverBg} transition-colors`}>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-teal-500/20 text-teal-500">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-medium ${textPrimary} truncate`}>{user?.name}</p>
                    <p className={`text-xs ${textMuted} truncate`}>{user?.email}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={`w-56 ${bgSecondary} ${borderColor}`}>
                <DropdownMenuItem 
                  onClick={() => navigate('/solutions/survey360/app/settings')}
                  className={`${textSecondary} hover:text-teal-500 ${hoverBg}`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={toggleTheme}
                  className={`${textSecondary} hover:text-teal-500 ${hoverBg}`}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className={borderColor} />
                <DropdownMenuItem onClick={handleLogout} className={`text-red-500 hover:text-red-400 ${hoverBg}`}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header - Using Reusable DashboardHeader */}
          <DashboardHeader
            user={user}
            theme={theme}
            onThemeToggle={toggleTheme}
            onLogout={handleLogout}
            onMenuClick={() => setMobileMenuOpen(true)}
            showMobileMenu={true}
            searchPlaceholder="Search surveys..."
            onSearch={(query) => console.log('Search:', query)}
          />

          {/* Main Content */}
          <main className={`flex-1 overflow-y-auto ${bgPrimary} transition-colors duration-300`}>
            <div className="p-6 lg:p-8">
              {children || <Outlet />}
            </div>
          </main>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className={`fixed left-0 top-0 bottom-0 w-[280px] ${bgSecondary} z-50 lg:hidden overflow-y-auto`}
              >
                <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-bold ${textPrimary}`}>Survey360</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${hoverBg}`}>
                    <X className={`w-5 h-5 ${textSecondary}`} />
                  </button>
                </div>

                <div className="p-4">
                  <Button 
                    onClick={() => { navigate('/solutions/survey360/app/surveys/new'); setMobileMenuOpen(false); }}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Survey
                  </Button>
                </div>

                <nav className="px-3 space-y-1">
                  {NAVIGATION.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                          isActive 
                            ? `${activeBg} text-teal-500 font-medium` 
                            : `${textSecondary} ${hoverBg} hover:text-teal-500`
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile User */}
                <div className={`p-4 border-t ${borderColor} mt-auto`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-teal-500/20 text-teal-500">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`font-medium text-sm ${textPrimary}`}>{user?.name}</p>
                      <p className={`text-xs ${textMuted}`}>{user?.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className={`w-full ${borderColor} ${textSecondary} ${hoverBg}`}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

export default Survey360AppLayout;
