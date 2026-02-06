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
  Briefcase,
  Map,
  Layout,
  Upload,
  BarChart3,
  Shield,
  Workflow,
  Languages,
  Key,
  Crown,
  Table2,
  Link2,
  Phone,
  ClipboardCheck,
  ArrowLeftRight,
  Brain,
  Puzzle
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
import { OfflineStatusIndicator, OfflineBanner } from '../components/OfflineStatus';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Forms', href: '/forms', icon: FileText },
  { name: 'Templates', href: '/templates', icon: Layout },
  { name: 'Submissions', href: '/submissions', icon: Database },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Import Cases', href: '/cases/import', icon: Upload },
  { name: 'Lookup Datasets', href: '/datasets', icon: Table2 },
  { name: 'Token Surveys', href: '/token-surveys', icon: Link2 },
  { name: 'CATI Center', href: '/cati', icon: Phone },
  { name: 'Back-check', href: '/backcheck', icon: ClipboardCheck },
  { name: 'Preload/Writeback', href: '/preload', icon: ArrowLeftRight },
  { name: 'Quality AI', href: '/quality-ai', icon: Brain },
  { name: 'Plugins', href: '/plugins', icon: Puzzle },
  { name: 'Quality', href: '/quality', icon: Activity },
  { name: 'GPS Map', href: '/map', icon: Map },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Exports', href: '/exports', icon: Download },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Roles', href: '/rbac', icon: Shield },
  { name: 'Translations', href: '/translations', icon: Languages },
  { name: 'API Security', href: '/security', icon: Key },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Super Admin', href: '/admin', icon: Crown },
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
          "fixed left-0 top-0 z-50 h-screen w-[280px] bg-card border-r border-border",
          "flex flex-col",
          "lg:translate-x-0 lg:static"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-barlow text-xl font-bold tracking-tight text-white">DataPulse</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Organization Selector */}
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-secondary/50 border-border text-foreground hover:bg-secondary">
                <span className="truncate">{currentOrg?.name || 'Select Organization'}</span>
                <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[248px]">
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => useOrgStore.getState().setCurrentOrg(org)}
                  className={cn(currentOrg?.id === org.id && "bg-accent")}
                >
                  {org.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/organizations/new')}>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
            {/* Offline Status */}
            <OfflineStatusIndicator />
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2 ml-4">
        <Activity className="w-5 h-5 text-primary" />
        <span className="font-barlow font-bold">DataPulse</span>
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
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      {/* Offline Banner */}
      <OfflineBanner />
    </div>
  );
}
