'use client';

import * as React from 'react';
import { useStore } from '../../store/store';
import { useShortcuts } from '../../hooks/use-shortcuts';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Folder, 
  Terminal, 
  Globe, 
  BarChart3, 
  Key, 
  Layers, 
  TerminalSquare, 
  CreditCard, 
  Settings, 
  User,
  ChevronLeft, 
  ChevronRight,
  Search,
  Bell,
  CloudLightning,
  BookOpen,
  HelpCircle,
  Plus,
  Users,
  Shield
} from 'lucide-react';
import { CommandMenu } from '../ui/command-menu';
import { Toaster, toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreateProjectClick: () => void;
  hideSidebar?: boolean;
}

export function SidebarLayout({ 
  children, 
  activeTab, 
  setActiveTab,
  onCreateProjectClick,
  hideSidebar = false
}: SidebarLayoutProps) {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const projects = useStore((s) => s.projects);
  const searchOpen = useStore((s) => s.searchOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const shortcutOverlayOpen = useStore((s) => s.shortcutOverlayOpen);
  const setShortcutOverlayOpen = useStore((s) => s.setShortcutOverlayOpen);

  // Custom resizing states
  const [sidebarWidth, setSidebarWidth] = React.useState(220);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeRef = React.useRef<HTMLDivElement>(null);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const userInitials = React.useMemo(() => {
    if (!user?.name) {
      if (user?.email) {
        return user.email.slice(0, 2).toUpperCase();
      }
      return 'MK';
    }
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user]);

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Mahesh Kumar');
  const userEmail = user?.email || 'mahesh@nebula-org.com';

  // Hook shortcuts
  useShortcuts(setActiveTab);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const pathname = usePathname() || '';

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: Folder, global: true },
    { id: 'deployments', label: 'Deployments', icon: Layers, global: true },
    { id: 'logs', label: 'Logs', icon: Terminal, global: true },
    { id: 'domains', label: 'Domains', icon: Globe, global: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, global: true },
    { id: 'env', label: 'Secrets', icon: Key, global: true },
    { id: 'api-keys', label: 'API Keys', icon: Key, global: true },
    { id: 'team', label: 'Team', icon: Users, global: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, global: true },
    { id: 'cli', label: 'CLI', icon: TerminalSquare, global: true },
    { id: 'billing', label: 'Billing', icon: CreditCard, global: true },
    { id: 'user-settings', label: 'User Settings', icon: User, global: true },
    { id: 'settings', label: 'Settings', icon: Settings, global: true }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'nebula-infra', href: '/dashboard' }];
    let currentPath = '';

    segments.forEach((seg) => {
      currentPath += `/${seg}`;
      let label = seg;
      if (seg === 'dashboard') return; // skip dashboard to avoid duplicate navigation hierarchy if desirable, or map it. Let's map it:
      if (seg === 'project') {
        label = 'projects';
      } else if (seg === 'user-settings') {
        label = 'profile';
      } else if (seg === 'env') {
        label = 'secrets';
      }
      
      if (activeProjectId && seg === activeProjectId && activeProject) {
        label = activeProject.name;
      }
      
      crumbs.push({ label, href: currentPath });
    });
    
    // De-duplicate if last item is redundant or clean it up.
    // For example: if segments contains both 'project' and '[projectId]', the paths would be '/project' and '/project/some-id'.
    // The mapped crumbs will be: 'nebula-infra' -> 'projects' -> 'project-name'. That's extremely clean!
    return crumbs;
  };

  // Resize Handlers
  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 160 && newWidth < 360) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#09090B] ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      <Toaster position="bottom-right" theme="dark" toastOptions={{
        style: {
          background: '#111113',
          border: '1px solid #1f1f1f',
          color: '#FAFAFA',
          borderRadius: '4px',
          fontFamily: 'var(--font-sans)',
        }
      }} />

      <CommandMenu onTabChange={setActiveTab} />

      {/* Keyboard Shortcuts Dialog */}
      {shortcutOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-[1px]" onClick={() => setShortcutOverlayOpen(false)} />
          <div className="relative w-full max-w-md border border-[#1f1f1f] bg-[#111113] p-4 text-[#FAFAFA] rounded-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2 mb-4">
              <h3 className="text-sm font-semibold tracking-tight">Keyboard Shortcuts</h3>
              <kbd className="rounded border border-[#1f1f1f] bg-[#09090B] px-1.5 font-mono text-[10px] text-[#71717A]">?</kbd>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-[#18181B]">
                <span className="text-[#A1A1AA]">Global Search</span>
                <span className="text-[#FAFAFA]">Ctrl + K</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#18181B]">
                <span className="text-[#A1A1AA]">Focus Search</span>
                <span className="text-[#FAFAFA]">/</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#18181B]">
                <span className="text-[#A1A1AA]">Go to Projects</span>
                <span className="text-[#FAFAFA]">g then p</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#18181B]">
                <span className="text-[#A1A1AA]">Go to Deployments</span>
                <span className="text-[#FAFAFA]">g then d</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#18181B]">
                <span className="text-[#A1A1AA]">Go to Logs</span>
                <span className="text-[#FAFAFA]">g then l</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#18181B]">
                <span className="text-[#A1A1AA]">New Deployment</span>
                <span className="text-[#FAFAFA]">Shift + D</span>
              </div>
            </div>
            <button 
              onClick={() => setShortcutOverlayOpen(false)}
              className="mt-6 w-full py-1.5 border border-[#1f1f1f] bg-[#09090B] text-xs font-medium hover:bg-[#111113] active:bg-[#18181B] rounded-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Panel Layout */}
      <div className="flex h-full w-full">
        
        {/* Sidebar container */}
        {!hideSidebar && (
          <aside 
            style={{ width: sidebarCollapsed ? '50px' : `${sidebarWidth}px` }}
            className="flex flex-col h-full bg-[#111113] border-r border-[#1f1f1f] shrink-0 transition-[width] duration-150"
          >
            {/* Header Branding */}
            <div className="flex h-12 items-center justify-between border-b border-[#1f1f1f] px-3 shrink-0">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <CloudLightning className="h-4 w-4 text-white" />
                  <span className="font-semibold text-xs tracking-tight text-white">NEBULA</span>
                  <span className="text-[8px] font-mono border border-[#1f1f1f] px-1 bg-[#09090B] text-[#71717A] rounded-sm">BETA</span>
                </div>
              )}
              {sidebarCollapsed && (
                <CloudLightning className="h-4 w-4 mx-auto text-white" />
              )}
              <button 
                onClick={toggleSidebar}
                className="text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1"
              >
                {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Project Context Info Selector */}
            {!sidebarCollapsed && activeProjectId && (
              <div className="p-3 border-b border-[#1f1f1f] bg-[#09090B]/40 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-mono text-[#71717A] uppercase">Active Project</p>
                    <p className="text-xs font-semibold text-[#FAFAFA] truncate max-w-[100px]">{activeProject?.name}</p>
                  </div>
                  <button
                    onClick={() => setActiveProjectId(null)}
                    className="text-[9px] font-mono px-1 py-0.5 border border-[#1f1f1f] bg-[#111113] hover:bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] rounded-sm"
                  >
                    Exit
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 space-y-0.5 p-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1 text-left text-xs transition-colors rounded-sm ${
                      isSelected
                        ? 'bg-[#18181B] text-[#FAFAFA] font-semibold'
                        : 'text-[#A1A1AA] hover:bg-[#18181B]/55 hover:text-[#FAFAFA]'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Branding / Links */}
            <div className="border-t border-[#1f1f1f] p-2 space-y-1 bg-[#09090B]/20 shrink-0">
              <a 
                href="https://nebula.dev/docs" 
                target="_blank" 
                className="flex items-center gap-2 px-2 py-1 text-xs text-[#71717A] hover:text-[#FAFAFA]"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {!sidebarCollapsed && <span className="text-[10px] font-mono">docs.nebula.dev</span>}
              </a>
              <div className="flex items-center justify-between px-2 py-1">
                {!sidebarCollapsed ? (
                  <div className="flex items-center gap-1">
                    <span className="h-1 w-1 bg-[#22C55E] rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono text-[#71717A]">all edge networks online</span>
                  </div>
                ) : (
                  <span className="h-1 w-1 bg-[#22C55E] rounded-full mx-auto" />
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Drag Resizer Handle */}
        {!hideSidebar && !sidebarCollapsed && (
          <div 
            ref={resizeRef}
            onMouseDown={startResizing}
            className={`w-[3px] cursor-col-resize hover:bg-[#3F3F46] active:bg-white transition-colors shrink-0 ${isResizing ? 'bg-white' : 'bg-[#1f1f1f]'}`}
          />
        )}

        {/* Content Container */}
        <div className="flex flex-col flex-1 h-full min-w-0 bg-[#09090B]">
          
          {/* Top Navbar */}
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1f1f1f] px-4 bg-[#111113]/30">
            <div className="flex items-center gap-1.5 text-xs font-mono select-none">
              {getBreadcrumbs().map((crumb, idx) => {
                const isLast = idx === getBreadcrumbs().length - 1;
                return (
                  <React.Fragment key={crumb.href + idx}>
                    {idx > 0 && <span className="text-[#1f1f1f] text-xs">/</span>}
                    {isLast ? (
                      <span className="text-[#FAFAFA] font-semibold truncate max-w-[120px]">{crumb.label}</span>
                    ) : (
                      <Link 
                        href={crumb.href}
                        className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors truncate max-w-[120px]"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Global Search shortcut button */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="flex h-7 items-center gap-2 rounded border border-[#1f1f1f] bg-[#111113] px-2 text-[10px] font-mono text-[#71717A] hover:bg-[#18181B] hover:text-[#FAFAFA] transition-colors"
              >
                <Search className="h-3 w-3" />
                <span>Search...</span>
                <kbd className="pointer-events-none text-[8px] font-mono bg-[#09090B] px-1 py-0.5 rounded border border-[#1f1f1f]">⌘K</kbd>
              </button>

              {/* Notification Bell */}
              <button 
                onClick={() => toast.info('No new notification alerts.')}
                className="p-1 border border-border bg-surface hover:bg-surface-hover rounded-sm text-muted-text hover:text-foreground transition-colors"
              >
                <Bell className="h-3.5 w-3.5" />
              </button>

              {/* Theme Toggler */}
              <AnimatedThemeToggler />

              {/* Create/Import project option */}
              <button
                onClick={onCreateProjectClick}
                className="flex h-7 items-center gap-1 bg-[#FAFAFA] dark:bg-white text-black dark:text-[#09090B] hover:bg-neutral-200 active:bg-neutral-300 px-2.5 text-[11px] font-bold rounded-sm transition-colors font-sans"
              >
                <Plus className="h-3 w-3" />
                <span>Deploy Git Repo</span>
              </button>

              {/* User profile dropdown selector */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="h-7 w-7 rounded-full border border-[#1f1f1f] bg-[#09090B] hover:border-white transition-colors overflow-hidden flex items-center justify-center text-[10px] font-mono font-semibold text-white cursor-pointer"
                >
                  {user?.image ? (
                    <img src={user.image} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </button>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-52 border border-[#1f1f1f] bg-[#111113] p-2 text-xs font-mono text-[#FAFAFA] rounded-md shadow-2xl z-40 space-y-1">
                      <div className="px-2.5 py-2 border-b border-[#1f1f1f]/70 text-[#71717A] text-[10px] leading-tight">
                        <p className="font-semibold text-zinc-300">{userName}</p>
                        <p className="truncate">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('user-settings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#18181B] rounded-sm text-zinc-300 hover:text-white"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('billing');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#18181B] rounded-sm text-zinc-300 hover:text-white"
                      >
                        Billing settings
                      </button>
                      <div className="h-[1px] bg-[#1f1f1f]" />
                      <button
                        onClick={async () => {
                          useStore.getState().setIsAuthenticated(false);
                          setShowProfileMenu(false);
                          toast.info('Signed out of Nebula workspace');
                          await signOut({ callbackUrl: '/login' });
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-red-500/10 hover:text-[#EF4444] rounded-sm text-[#EF4444]"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main workspace scroll area */}
          <main className="flex-1 overflow-y-auto min-w-0">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
