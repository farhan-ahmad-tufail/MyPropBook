import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calculator,
  Receipt,
  LogOut,
  Menu,
  X,
  Zap,
  ShieldAlert,
  BarChart3,
  HelpCircle,
  Bell,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  FileText,
  Plus,
  IndianRupee,
  Share2,
  Sparkles,
  Home,
  Search,
  Command
} from 'lucide-react';
import Logo from './Logo';
import ProfileModal from './ProfileModal';
import CommandPalette from './CommandPalette';

const AVATAR_COLOR_MAP = {
  sage: '#2d5a47',
  navy: '#0f172a',
  blue: '#2563eb',
  purple: '#9333ea',
  emerald: '#059669'
};

const getAvatarBg = (color) => {
  if (!color) return '#2d5a47';
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  return AVATAR_COLOR_MAP[color] || '#2d5a47';
};

const navSections = [
  {
    title: 'WORKSPACE',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', protected: true },
      { to: '/properties', icon: Building2, label: 'Properties', protected: true },
      { to: '/tenants', icon: Users, label: 'Tenants', protected: true },
      { to: '/create-bill', icon: Zap, label: 'Create Bill', protected: true },
      { to: '/billing', icon: Receipt, label: 'Billing', protected: true },
    ]
  },
  {
    title: 'MANAGE',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Financial analytics', protected: true },
      { to: '/quick-calc', icon: Calculator, label: 'Quick Calculator', protected: false },
    ]
  }
];

/* ─── Help Guide Steps ─── */
const GUIDE_STEPS = [
  {
    icon: Building2,
    color: '#2d5a47',
    bgColor: '#edf5f1',
    title: 'Add your property',
    desc: 'Go to Properties → Add Property. Enter the property name, address, and electricity rate per unit.',
    link: '/properties',
    linkLabel: 'Go to Properties'
  },
  {
    icon: Home,
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    title: 'Create rooms',
    desc: 'Inside your property, add rooms with room numbers, types (Single/Double), and monthly rent.',
    link: '/properties',
    linkLabel: 'Manage Rooms'
  },
  {
    icon: Users,
    color: '#0369a1',
    bgColor: '#eff6ff',
    title: 'Add tenants & assign rooms',
    desc: 'Go to Tenants → Add Tenant. Fill in name, phone, and assign them to a room with a lease date.',
    link: '/tenants',
    linkLabel: 'Go to Tenants'
  },
  {
    icon: Zap,
    color: '#b45309',
    bgColor: '#fffbeb',
    title: 'Generate a bill',
    desc: 'Go to Create Bill. Select property, room, enter current meter reading — the bill is auto-calculated.',
    link: '/create-bill',
    linkLabel: 'Create Bill'
  },
  {
    icon: Share2,
    color: '#16a34a',
    bgColor: '#f0fdf4',
    title: 'Share on WhatsApp',
    desc: 'Before saving, click Share WhatsApp to send the bill directly to your tenant\'s number.',
    link: '/create-bill',
    linkLabel: 'Try it'
  },
  {
    icon: Receipt,
    color: '#dc2626',
    bgColor: '#fef2f2',
    title: 'Track payments',
    desc: 'Go to Billing to view all bills. Use the Pay button to record partial or full payments from tenants.',
    link: '/billing',
    linkLabel: 'Go to Billing'
  },
];

export default function Layout({ children }) {
  const { user, signOut, isLocal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoaded, setNotifLoaded] = useState(false);

  /* Ctrl+K / Cmd+K listener */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCmdPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isPlainPage = ['/', '/login', '/signup', '/terms', '/privacy'].includes(location.pathname);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  /* Load notifications (unpaid bills + tenants with arrears) */
  useEffect(() => {
    if (!user || notifLoaded) return;
    const load = async () => {
      try {
        const ownerId = user?.id || 'mock_owner_id';
        const [bills, tenants] = await Promise.all([
          api.getBills(ownerId),
          api.getTenants(ownerId)
        ]);
        const notifs = [];
        const unpaid = (bills || []).filter(b => b.payment_status === 'Unpaid');
        const partial = (bills || []).filter(b => b.payment_status === 'Partially Paid');
        if (unpaid.length > 0) {
          notifs.push({ type: 'warning', title: `${unpaid.length} unpaid bill${unpaid.length > 1 ? 's' : ''}`, desc: 'Tenants have outstanding invoices that need attention.', link: '/billing' });
        }
        if (partial.length > 0) {
          notifs.push({ type: 'info', title: `${partial.length} partially paid bill${partial.length > 1 ? 's' : ''}`, desc: 'Some bills are partially settled — follow up for remaining balance.', link: '/billing' });
        }
        if (notifs.length === 0) {
          notifs.push({ type: 'success', title: 'All caught up!', desc: 'No pending bills or outstanding dues. Great work! 🎉', link: null });
        }
        setNotifications(notifs);
        setNotifLoaded(true);
      } catch (e) { console.error(e); }
    };
    load();
  }, [user, notifLoaded]);

  const unreadCount = notifications.filter(n => n.type !== 'success').length;

  if (isPlainPage) {
    return <div className="min-h-screen bg-[#f8faf9] text-slate-800">{children}</div>;
  }

  const savedProfile = JSON.parse(localStorage.getItem('billroom_user_profile') || '{}');
  const rawName = savedProfile.fullName || user?.user_metadata?.full_name || user?.fullName || user?.email?.split('@')[0] || 'Farhan';
  const displayName = (rawName === 'Google Demo User' || rawName === 'Google') ? 'Farhan Ahmad Tufail' : rawName;
  const avatarLetter = (displayName[0] || 'F').toUpperCase() + (displayName.split(' ')[1]?.[0] || 'A').toUpperCase();

  const breadcrumbMap = {
    '/dashboard': 'Overview',
    '/properties': 'Properties',
    '/tenants': 'Tenants & Leases',
    '/billing': 'Billing & Invoices',
    '/analytics': 'Financial Analytics',
    '/create-bill': 'Create Bill',
    '/smart-calc': 'Create Bill',
    '/quick-calc': 'Quick Calculator'
  };
  const currentBreadcrumb = breadcrumbMap[location.pathname] || 'Overview';

  const notifIcon = (type) => {
    if (type === 'warning') return <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />;
    if (type === 'info') return <Clock size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />;
    return <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f3]">

      {/* ── Sidebar (Desktop Only) ── */}
      <aside className="
        hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80
        z-50 flex-col px-4 py-5 shadow-xs
      ">
        {/* Top Logo */}
        <div className="flex items-center justify-between px-2 pb-5 border-b border-slate-200/50">
          <Link to="/" className="flex items-center">
            <Logo size={32} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Account Switcher Card */}
        <div
          className="mt-4 p-2.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs cursor-pointer hover:border-[#2d5a47]/40 hover:shadow-sm transition-all group"
          onClick={() => setShowProfileModal(true)}
          title="Open profile & settings"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: getAvatarBg(savedProfile.avatarColor) }}
            >
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-800 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{savedProfile.workspaceName || 'Landlord workspace'}</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mr-1 group-hover:text-[#2d5a47] transition-colors" />
        </div>

        {/* Local Mode / Status Banner */}
        {isLocal && (
          <div className="mt-3 px-3 py-1.5 bg-[#edf5f1] border border-[#2d5a47]/20 rounded-xl flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-[#2d5a47] font-bold">Local Demo Mode</span>
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Offline</span>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 space-y-5 overflow-y-auto pr-1">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between px-3 mb-1.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{sec.title}</p>
              </div>
              {sec.items.map((item) => {
                if (item.protected && !user) return null;
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-[#2d5a47] text-white font-extrabold shadow-md shadow-[#2d5a47]/20 scale-[1.01]'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <Icon size={16} className={`flex-shrink-0 transition-colors ${isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-[#2d5a47]'}`} />
                    <span className="flex-1 truncate">{item.label}</span>

                    {item.to === '/create-bill' && !isActive && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black text-[9px] uppercase tracking-wider">
                        ⚡ Quick
                      </span>
                    )}

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sign Out Button */}
        {user && (
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
                <span>Sign out</span>
              </div>
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile Backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 max-w-full overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 py-4 bg-[#f1f5f3]/90 backdrop-blur">
          {/* Logo (Left) */}
          <div className="flex items-center gap-3">
            <Link to="/" className="lg:hidden flex items-center">
              <Logo size={26} showText={true} />
            </Link>
          </div>

          {/* Dynamic Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400 -ml-4">
            <span>Workspace</span>
            <span>&rsaquo;</span>
            <span className="text-slate-700 font-semibold">{currentBreadcrumb}</span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Quick Command Palette Button (Ctrl+K) */}
            <button
              onClick={() => setShowCmdPalette(true)}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-[#2d5a47]/40 hover:text-[#2d5a47] transition-all shadow-sm cursor-pointer group"
              title="Search or jump to... (Ctrl+K)"
            >
              <Search size={14} className="text-slate-400 group-hover:text-[#2d5a47] transition-colors" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Financial Analytics Quick Access Button (Desktop/Tablet) */}
            <Link
              to="/analytics"
              className={`hidden sm:flex p-2 rounded-full border text-xs font-semibold transition-all shadow-sm items-center gap-1.5 cursor-pointer ${
                location.pathname === '/analytics'
                  ? 'bg-[#2d5a47] text-white border-[#2d5a47]'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-[#2d5a47] hover:border-[#2d5a47]/40'
              }`}
              title="Financial Analytics & Reports"
            >
              <BarChart3 size={15} className={location.pathname === '/analytics' ? 'text-white' : 'text-[#2d5a47]'} />
              <span className="hidden md:inline font-bold text-[11px]">Analytics</span>
            </Link>

            {/* Help Centre Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-[#2d5a47]/40 hover:text-[#2d5a47] transition-all shadow-sm cursor-pointer"
            >
              <HelpCircle size={14} className="text-slate-400" />
              <span>Help centre</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-[#2d5a47]/40 transition-all shadow-sm relative cursor-pointer"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && createPortal(
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-[998]" onClick={() => setShowNotifications(false)} />
                  <div
                    className="fixed z-[999] bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden top-16 right-4 sm:right-20 w-[calc(100vw-32px)] sm:w-80 max-w-sm"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-slate-500" />
                        <span className="font-bold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setShowNotifications(false)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Notification Items */}
                    <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-400">Loading…</div>
                      ) : notifications.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => { if (n.link) { navigate(n.link); setShowNotifications(false); } }}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                            n.link ? 'cursor-pointer hover:bg-slate-50 hover:border-slate-200' : ''
                          } ${n.type === 'warning' ? 'bg-amber-50 border-amber-100' : n.type === 'info' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}
                        >
                          {notifIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
                          </div>
                          {n.link && <ArrowRight size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => { navigate('/billing'); setShowNotifications(false); }}
                        className="w-full text-center text-xs font-bold text-[#2d5a47] hover:text-[#234738] transition-colors cursor-pointer"
                      >
                        View all in Billing →
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>

            {/* Avatar */}
            <button
              onClick={() => setShowProfileModal(true)}
              title="Open profile & settings"
              className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#2d5a47]/40 hover:scale-105 transition-all cursor-pointer"
              style={{ backgroundColor: getAvatarBg(savedProfile.avatarColor) }}
            >
              {avatarLetter}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ── Fixed Mobile Bottom Navigation Bar ── */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg safe-area-bottom"
      >
        {[
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/properties', label: 'Properties', icon: Building2 },
          { to: '/create-bill', label: 'New Bill', icon: Plus, isAction: true },
          { to: '/tenants', label: 'Tenants', icon: Users },
          { to: '/billing', label: 'Billing', icon: Receipt },
        ].map(item => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5 group"
                title="Create Bill"
              >
                <div className="w-11 h-11 rounded-full bg-[#2d5a47] text-white flex items-center justify-center shadow-md border-2 border-white group-active:scale-95 transition-transform">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-[#2d5a47] font-bold' : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Profile Modal ── */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {/* ── Command Palette (Ctrl+K) ── */}
      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
      />

      {/* ── Help Centre Modal ── */}
      {showHelp && createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setShowHelp(false); }}
        >
          <div
            className="flex min-h-full items-center justify-center p-4 sm:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowHelp(false); }}
          >
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-br from-[#edf5f1] to-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-xl bg-[#2d5a47] flex items-center justify-center">
                      <BookOpen size={14} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-[#2d5a47] uppercase tracking-widest">Quick Guide</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">How to use MyPropBook</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Follow these steps to set up and generate your first bill.</p>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0 mt-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Steps */}
              <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
                {GUIDE_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                      {/* Step Number + Icon */}
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-black text-slate-400 leading-none">{String(i + 1).padStart(2, '0')}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: step.bgColor }}>
                          <Icon size={16} style={{ color: step.color }} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                      </div>

                      {/* Link */}
                      <button
                        onClick={() => { navigate(step.link); setShowHelp(false); }}
                        className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        style={{ color: step.color, backgroundColor: step.bgColor }}
                      >
                        {step.linkLabel}
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <p className="text-xs text-slate-400">Need more help? Check the Quick Calculator for instant estimates.</p>
                <button
                  onClick={() => { navigate('/quick-calc'); setShowHelp(false); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2d5a47] hover:text-[#1c4032] transition-colors cursor-pointer"
                >
                  <Calculator size={13} /> Quick Calc
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
