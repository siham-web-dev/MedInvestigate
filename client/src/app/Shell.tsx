import { Outlet, NavLink, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Plus, ClipboardList, Settings, Bell,
  Activity, ChevronRight, User, Shield, Search, HelpCircle,
  FlaskConical, ChevronDown, Menu, X, LogOut,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const NAV = [
  {
    label: null,
    items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Investigations',
    items: [
      { name: 'New Incident', href: '/incidents/new', icon: Plus },
      { name: 'All Investigations', href: '/investigations', icon: ClipboardList },
    ],
  },
  {
    label: 'System',
    items: [{ name: 'Settings', href: '/settings', icon: Settings }],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/incidents/new': 'New Incident',
  '/investigations': 'Investigations',
  '/settings': 'Settings',
};

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full" style={{ background: 'var(--sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--sidebar-primary)' }}>
          <FlaskConical size={15} className="text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight tracking-tight">MedInvestigate</div>
          <div className="text-[10px] leading-none" style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}>AI Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
            {group.label && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm mb-0.5 transition-colors ${
                    isActive
                      ? 'text-white font-medium'
                      : 'font-normal hover:text-white'
                  }`}
                  style={{
                    background: isActive ? 'var(--sidebar-accent)' : 'transparent',
                    color: isActive ? 'var(--sidebar-accent-foreground)' : 'var(--sidebar-foreground)',
                  }}
                >
                  <item.icon size={15} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-semibold">SC</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">Dr. Sarah Chen</div>
            <div className="text-[10px] truncate" style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}>Investigator</div>
          </div>
          <ChevronDown size={12} style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}

function TopBar({ onMenuToggle, isSmallScreen }: { onMenuToggle: () => void; isSmallScreen: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    navigate('/');
  };

  const title = PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/investigations/') ? 'Investigation Workspace' : '');

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 md:px-5 gap-4 flex-shrink-0">
      {isSmallScreen && (
        <button
          onClick={onMenuToggle}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
        >
          <Menu size={16} />
        </button>
      )}

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
        {location.pathname.startsWith('/investigations/') && (
          <>
            <span
              className="hover:text-foreground cursor-pointer transition-colors hidden sm:inline"
              onClick={() => navigate('/investigations')}
            >
              Investigations
            </span>
            <ChevronRight size={13} className="hidden sm:block" />
          </>
        )}
        <span className="text-foreground font-medium truncate">{title}</span>
      </div>

      <div className="flex-1" />

      <button className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted border border-border rounded-md px-3 py-1.5 hover:text-foreground transition-colors">
        <Search size={12} />
        <span className="hidden md:inline">Search…</span>
        <span className="hidden md:inline ml-2 font-mono text-[10px] bg-background border border-border rounded px-1 py-0.5">⌘K</span>
      </button>

      <button className="hidden sm:flex relative p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
      </button>
      <button className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
        <HelpCircle size={16} />
      </button>
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-blue-700 transition-colors"
        >
          <span className="text-white text-[10px] font-semibold">SC</span>
        </button>

        {userMenuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-md shadow-lg overflow-hidden z-50 min-w-48">
            <button
              onClick={() => {
                navigate('/settings');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left border-b border-border"
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                window.open('https://support.example.com', '_blank');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left border-b border-border"
            >
              <HelpCircle size={14} />
              <span>Support</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 471);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 471);
      if (window.innerWidth >= 471) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {!isSmallScreen && <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />}
      {isSmallScreen && sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}
      {isSmallScreen && (
        <aside
          className="fixed left-0 top-0 bottom-0 w-[220px] flex-shrink-0 flex flex-col h-full z-50 transition-transform"
          style={{
            background: 'var(--sidebar)',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </aside>
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSmallScreen={isSmallScreen} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
