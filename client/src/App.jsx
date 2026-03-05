import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  Package,
  Menu,
  ChevronRight,
  LayoutDashboard,
  HelpCircle,
  Settings,
  Bell,
  Search,
  Minus,
  Square,
  X
} from 'lucide-react';
import classNames from 'classnames';

import { NotificationProvider, useNotifications } from './context/NotificationContext';
import Loader from './components/Loader';
import Preloader from './components/Preloader';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
const DocumentEditor = lazy(() => import('./pages/DocumentEditor'));
const Reports = lazy(() => import('./pages/Reports'));
const Help = lazy(() => import('./pages/Help'));
const Tasks = lazy(() => import('./pages/Tasks'));
const SessionManager = lazy(() => import('./pages/SessionManager'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification, unreadCount } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Desktop', icon: LayoutDashboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/help', label: 'Documentation', icon: HelpCircle },
  ];

  const pathnames = location.pathname.split('/').filter((x) => x);

  useEffect(() => {
    if (!isSearchOpen) return;
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const runSearch = (raw) => {
    const term = raw.trim();
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    params.set('focusSearch', '1');

    navigate(`/documents?${params.toString()}`);
    if (term) {
      showNotification(`Search applied: ${term}`, 'info');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(searchQuery);
    setIsSearchOpen(false);
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4 bg-white p-2 border-b border-[#c0c0c0] w-full overflow-x-auto whitespace-nowrap">
      <Link to="/" className="hover:text-amber-600 transition-colors">Main</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-black font-bold">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-amber-600 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f2f2f2]">
      {/* 1C Top Toolbar */}
      <header className="header-1c h-10 select-none shrink-0 w-full">
        <div className="flex items-center space-x-2 mr-3 sm:mr-6 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden hover:text-amber-600 p-1"
            title="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="bg-[#ffd700] p-1 rounded-sm border border-black/10">
            <Package className="h-4 w-4 text-black" />
          </div>
          <span className="font-bold text-sm text-slate-800 whitespace-nowrap">1C Remix</span>
        </div>

        <div className="hidden md:flex flex-1 items-center space-x-1 h-full px-4 overflow-hidden">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={classNames(
                  "h-full flex items-center px-4 text-xs font-medium border-x border-transparent transition-colors whitespace-nowrap",
                  isActive ? "bg-white border-[#c0c0c0] text-black border-t-2 border-t-[#ffd700]" : "text-slate-600 hover:bg-slate-200"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        <div className="md:hidden flex-1 text-xs font-bold text-slate-700 truncate">
          {pathnames.length ? pathnames[pathnames.length - 1].replace('-', ' ') : 'desktop'}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-slate-500 shrink-0">
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(true);
            }}
            className="hover:text-amber-600 p-1"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button onClick={() => navigate('/notifications')} className="hover:text-amber-600 p-1 relative" title="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] leading-4 text-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/settings')} className="hover:text-amber-600 p-1" title="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-2"></div>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-700">
            <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-white">AD</div>
            <span className="hidden md:inline">Administrator</span>
          </div>
          <div className="hidden md:flex space-x-1 ml-4 items-center">
            <Minus className="h-3 w-3 cursor-pointer hover:bg-slate-200" />
            <Square className="h-2.5 w-2.5 cursor-pointer hover:bg-slate-200 border border-slate-400" />
            <X className="h-3.5 w-3.5 cursor-pointer hover:bg-red-500 hover:text-white" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden w-full">
        {/* Sidebar */}
        <aside className="sidebar-1c hidden lg:flex lg:flex-col shrink-0">
          <div className="p-3 bg-[#e0e0e0] font-bold text-[10px] uppercase tracking-wider text-slate-600">Quick Access</div>
          <nav className="flex-1 py-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={classNames('sidebar-item-1c', isActive && 'active')}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[#c0c0c0] bg-white text-[10px] text-slate-400">
            v8.3.22.1709 (1CBAS Core)
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-hidden bg-white lg:border-l border-[#c0c0c0] flex flex-col">
          <Breadcrumbs />
          <div className="flex-1 p-4 overflow-auto animate-fade-in w-full">
            <Suspense fallback={<Loader />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="sidebar-1c absolute left-0 top-0 h-full w-72 flex flex-col shadow-2xl">
            <div className="p-3 bg-[#e0e0e0] font-bold text-[10px] uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Quick Access</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-1c h-8 px-2"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 py-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={`mobile-${item.path}`}
                    to={item.path}
                    className={classNames('sidebar-item-1c min-h-[44px]', isActive && 'active')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#c0c0c0] bg-white text-[10px] text-slate-400">
              v8.3.22.1709 (1CBAS Core)
            </div>
          </aside>
        </div>
      )}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/25">
        <div className="w-full max-w-xl bg-white border border-[#c0c0c0] shadow-xl">
          <div className="px-4 py-3 border-b border-[#c0c0c0] flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Search Documents</h3>
            <button className="btn-1c h-7 px-2 text-xs" onClick={() => setIsSearchOpen(false)}>Close</button>
          </div>
          <form onSubmit={handleSearchSubmit} className="p-4 space-y-3">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-1c w-full"
              placeholder="Enter number, type, or text..."
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-1c" onClick={() => setIsSearchOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary-1c">Search</button>
            </div>
          </form>
        </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // in case Preloader doesn't call onDone, ensure it hides after 3s
    const fallback = setTimeout(() => setShowPreloader(false), 3000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <NotificationProvider>
      {showPreloader && <Preloader onDone={() => setShowPreloader(false)} />}
      {!showPreloader && (
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/new/:type" element={<DocumentEditor />} />
              <Route path="/documents/edit/:id" element={<DocumentEditor />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/help" element={<Help />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/session-manager" element={<SessionManager />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      )}
    </NotificationProvider>
  );
}

export default App;
