import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Sliders,
  ChevronDown
} from 'lucide-react';
import Logo from './Logo';
import ProfileModal from './ProfileModal';

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

export default function Layout({ children }) {
  const { user, signOut, isLocal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isPlainPage = ['/', '/login', '/signup'].includes(location.pathname);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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

  return (
    <div className="flex min-h-screen bg-[#f1f5f3]">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-[#f8faf9] border-r border-slate-200/70
        z-50 flex flex-col transition-transform duration-300 ease-in-out px-4 py-5
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
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
          className="mt-4 p-2.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-[#2d5a47]/40 hover:shadow-md transition-all group"
          onClick={() => setShowProfileModal(true)}
          title="Open profile & settings"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: savedProfile.avatarColor || '#2d5a47' }}
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

        {/* Demo Mode Banner */}
        {isLocal && (
          <div className="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
            <ShieldAlert size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-amber-700 font-medium leading-snug">Local demo mode</span>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 space-y-6 overflow-y-auto">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">{sec.title}</p>
              {sec.items.map((item) => {
                if (item.protected && !user) return null;
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? 'bg-[#d8e7e0] text-[#1c4032]'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-[#1c4032]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        {user && (
          <div className="pt-3 border-t border-slate-200/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={16} />
              <span>Sign out</span>
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
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <Logo size={28} showText={false} />
          </div>

          {/* Dynamic Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Workspace</span>
            <span>&rsaquo;</span>
            <span className="text-slate-700 font-semibold">{currentBreadcrumb}</span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <HelpCircle size={14} className="text-slate-400" />
              <span>Help centre</span>
            </button>
            <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-sm relative">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              title="Open profile & settings"
              className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#2d5a47]/40 hover:scale-105 transition-all"
              style={{ backgroundColor: savedProfile.avatarColor || '#2d5a47' }}
            >
              {avatarLetter}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Profile & Workspace Settings Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}

