import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Database,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  Activity,
  Download,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuthStore, useOrgStore, useUIStore } from '../store';
import { cn } from '../lib/utils';

// DataVision Logo Component
const DataVisionLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { wrapper: 'gap-0.5', circle: 'w-6 h-6', text: 'text-xs', dot: 'w-1.5 h-1.5', triangle: '6px' },
    md: { wrapper: 'gap-1', circle: 'w-8 h-8', text: 'text-sm', dot: 'w-2 h-2', triangle: '8px' },
    lg: { wrapper: 'gap-1', circle: 'w-10 h-10', text: 'text-base', dot: 'w-2.5 h-2.5', triangle: '10px' },
    xl: { wrapper: 'gap-2', circle: 'w-14 h-14', text: 'text-xl', dot: 'w-3 h-3', triangle: '12px' },
  };
  const s = sizes[size];

  return (
    <div className={cn("inline-flex items-center", s.wrapper)}>
      {/* D Circle - Red */}
      <div className={cn(
        "rounded-full flex items-center justify-center font-barlow font-bold text-white",
        "bg-gradient-to-br from-[#E53935] to-[#C62828]",
        s.circle, s.text
      )}>
        d
      </div>
      {/* V Circle - Gray with red dot and navy V */}
      <div className={cn(
        "rounded-full flex flex-col items-center justify-center relative",
        "bg-gradient-to-br from-[#90A4AE] to-[#78909C]",
        s.circle
      )}>
        <div className={cn("absolute top-1 rounded-full bg-[#E53935]", s.dot)} />
        <svg 
          viewBox="0 0 24 24" 
          className="w-1/2 h-1/2 mt-1" 
          fill="#1A237E"
        >
          <path d="M12 19L5 5h4l3 9 3-9h4l-7 14z" />
        </svg>
      </div>
    </div>
  );
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Forms', href: '/forms', icon: FileText },
  { name: 'Submissions', href: '/submissions', icon: Database },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Quality', href: '/quality', icon: Activity },
  { name: 'Exports', href: '/exports', icon: Download },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, theme, toggleTheme, language, setLanguage } = useUIStore();
  const { user, logout } = useAuthStore();
  const { currentOrg, organizations } = useOrgStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] sidebar-gradient border-r border-border",
          "flex flex-col",
          "lg:translate-x-0 lg:static"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <DataVisionLogo size="md" />
            <span className="font-barlow text-xl font-bold tracking-tight">
              <span className="text-[#E53935]">Data</span>
              <span className="text-[#1A237E]">Pulse</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Organization Selector */}
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between border-[#E53935]/20 hover:border-[#E53935]/50 hover:bg-[#E53935]/5"
              >
                <span className="truncate">{currentOrg?.name || 'Select Organization'}</span>
                <ChevronDown className="w-4 h-4 ml-2 shrink-0 text-[#E53935]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[248px]">
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => useOrgStore.getState().setCurrentOrg(org)}
                  className={cn(currentOrg?.id === org.id && "bg-[#E53935]/10 text-[#E53935]")}
                >
                  {org.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/organizations/new')} className="text-[#1A237E]">
                + Create Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#E53935] to-[#C62828] text-white shadow-lg shadow-[#E53935]/25"
                    : "text-muted-foreground hover:bg-[#1A237E]/5 hover:text-[#1A237E]"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Theme & Language */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hover:bg-[#1A237E]/10 hover:text-[#1A237E]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-[#E53935]/10 hover:text-[#E53935]">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('sw')}>
                  Kiswahili {language === 'sw' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2 hover:bg-[#E53935]/5">
                <Avatar className="w-8 h-8 border-2 border-[#E53935]/30">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#E53935] to-[#1A237E] text-white text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[248px]">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-[#E53935]">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>
    </>
  );
}

export function TopBar() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 lg:hidden">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-[#E53935]/10">
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2 ml-4">
        <DataVisionLogo size="sm" />
        <span className="font-barlow font-bold">
          <span className="text-[#E53935]">Data</span>
          <span className="text-[#1A237E]">Pulse</span>
        </span>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }) {
  const { theme } = useUIStore();

  return (
    <div className={cn("min-h-screen bg-background", theme === 'dark' && 'dark')}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <TopBar />
          <main className="p-4 md:p-6 lg:p-8 hero-gradient min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export { DataVisionLogo };
