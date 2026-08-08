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
  Home,
  Zap,
  ShieldAlert,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', protected: true },
  { to: '/properties', icon: Building2, label: 'Properties & Rooms', protected: true },
  { to: '/tenants', icon: Users, label: 'Tenants & Leases', protected: true },
  { to: '/smart-calc', icon: Zap, label: 'Smart Calculator', protected: true },
  { to: '/billing', icon: Receipt, label: 'Billing Records', protected: true },
  { to: '/analytics', icon: BarChart3, label: 'Financial Analytics', protected: true },
  { to: '/quick-calc', icon: Calculator, label: 'Quick Calculator', protected: false },
];

export default function Layout({ children }) {
  const { user, signOut, isLocal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPlainPage = ['/', '/login'].includes(location.pathname);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (isPlainPage) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  const displayName = user?.user_metadata?.full_name || user?.fullName || user?.email || 'Property Owner';
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-950">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-[#060d1a] border-r border-slate-800/60
        z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/60">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg text-white tracking-tight">
            <img src="/logo.png" alt="BillRoom Logo" className="h-8 w-auto object-contain" />
            <span>BillRoom</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo Mode Banner */}
        {isLocal && (
          <div className="mx-4 mt-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
            <ShieldAlert size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-400/90 leading-snug">Local demo mode (no cloud)</span>
          </div>
        )}

        {/* User Profile Card */}
        {user && (
          <div className="mx-4 mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-slate-200 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto mt-2">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Menu</p>
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        {user && (
          <div className="px-3 py-4 border-t border-slate-800/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Backdrop (mobile) ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-slate-950/90 backdrop-blur border-b border-slate-800/60">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <img src="/logo.png" alt="BillRoom Logo" className="h-7 w-auto object-contain" />
            BillRoom
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 lg:p-8 pt-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
