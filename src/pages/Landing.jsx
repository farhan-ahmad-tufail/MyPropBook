import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Building2,
  Zap,
  Shield,
  BarChart3,
  Receipt,
  Users,
  Check,
  ChevronRight,
  Sparkles,
  Clock,
  FileText,
  TrendingUp,
  Menu,
  X,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Share2
} from 'lucide-react';
import Logo from '../components/Logo';

// 6 Core Features matching instructions
const features = [
  {
    icon: Building2,
    accentClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50/70 border border-indigo-100/50',
    tag: 'Portfolio',
    hoverBorder: 'hover:border-indigo-200/80',
    hoverShadow: 'hover:shadow-lg hover:shadow-indigo-500/5',
    title: 'Multi-property management',
    desc: 'Manage buildings, rooms, tenants and rent from one calm workspace.',
  },
  {
    icon: Zap,
    accentClass: 'text-amber-600',
    bgClass: 'bg-amber-50/70 border border-amber-100/50',
    tag: 'Utility Split',
    hoverBorder: 'hover:border-amber-200/80',
    hoverShadow: 'hover:shadow-lg hover:shadow-amber-500/5',
    title: 'Flexible utility billing',
    desc: 'Use submeter readings or add a direct electricity bill amount.',
  },
  {
    icon: Receipt,
    accentClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50/70 border border-emerald-100/50',
    tag: 'Billing',
    hoverBorder: 'hover:border-emerald-200/80',
    hoverShadow: 'hover:shadow-lg hover:shadow-emerald-500/5',
    title: 'Professional receipts',
    desc: 'Generate clean receipts and share them with tenants through WhatsApp.',
  },
  {
    icon: Users,
    accentClass: 'text-sky-600',
    bgClass: 'bg-sky-50/70 border border-sky-100/50',
    tag: 'Leasing',
    hoverBorder: 'hover:border-sky-200/80',
    hoverShadow: 'hover:shadow-lg hover:shadow-sky-500/5',
    title: 'Tenant & lease tracking',
    desc: 'Keep tenant details, room assignments and lease records organized.',
  },
  {
    icon: BarChart3,
    accentClass: 'text-rose-600',
    bgClass: 'bg-rose-50/70 border border-rose-100/50',
    tag: 'Analytics',
    hoverBorder: 'hover:border-rose-200/80',
    hoverShadow: 'hover:shadow-lg hover:shadow-rose-500/5',
    title: 'Revenue & collections',
    desc: 'See expected rent, collected amounts and pending balances at a glance.',
  },
  {
    icon: Share2,
    accentClass: 'text-fuchsia-600',
    bgClass: 'bg-fuchsia-50/70 border border-fuchsia-100/50',
    tag: 'Roommates',
    hoverBorder: 'hover:border-fuchsia-200/80',
    hoverShadow: 'hover:shadow-lg hover:shadow-fuchsia-500/5',
    title: 'Shared room splitting',
    desc: 'Split rent and utility bills fairly between roommates with individual roommate receipts.',
  },
];

// 4-Step Setup Workflow
const steps = [
  {
    step: '01',
    title: 'Add your property',
    desc: 'Add buildings, rooms and rent details.',
    rotate: 'lg:-rotate-2 hover:rotate-0',
    bg: 'bg-[#edf5f1] border-[#c8ddd4]',
    text: 'text-[#1a3d2f]',
    numberText: 'text-[#2d5a47]/20',
    descText: 'text-[#2d5a47]/70'
  },
  {
    step: '02',
    title: 'Add tenants',
    desc: 'Assign tenants to rooms and keep records current.',
    rotate: 'lg:rotate-2 hover:rotate-0',
    bg: 'bg-[#2d5a47] border-[#396c56]',
    text: 'text-white',
    numberText: 'text-white/15',
    descText: 'text-emerald-100/80'
  },
  {
    step: '03',
    title: 'Create a bill',
    desc: 'Enter a meter reading or add a direct utility amount.',
    rotate: 'lg:-rotate-1 hover:rotate-0',
    bg: 'bg-[#f0f7f4] border-[#d4e8e0]',
    text: 'text-[#1a3d2f]',
    numberText: 'text-[#2d5a47]/20',
    descText: 'text-[#2d5a47]/70'
  },
  {
    step: '04',
    title: 'Share & collect',
    desc: 'Generate a receipt and share it with the tenant.',
    rotate: 'lg:rotate-1 hover:rotate-0',
    bg: 'bg-[#1a3d2f] border-[#254d3b]',
    text: 'text-white',
    numberText: 'text-white/15',
    descText: 'text-emerald-50/80'
  },
];

// Target Property Types
const propertyTypes = [
  { label: 'Apartments' },
  { label: 'Rental properties' },
  { label: 'PGs' },
  { label: 'Hostels' },
  { label: 'Residential buildings' },
  { label: 'Small landlords' },
];

export default function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="relative overflow-hidden bg-[#f8faf9] text-slate-800 font-sans selection:bg-[#2d5a47] selection:text-white" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════════
          1. NAVBAR
      ══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size={34} />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#2d5a47] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#2d5a47] transition-colors">How it works</a>
            <a href="#about" className="hover:text-[#2d5a47] transition-colors">About</a>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/quick-calc"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Quick Calculator
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Get started</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-3 space-y-3 border-t border-slate-100 mt-3 text-xs font-semibold">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-2 text-slate-600 hover:text-[#2d5a47]">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-2 text-slate-600 hover:text-[#2d5a47]">How it works</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-2 text-slate-600 hover:text-[#2d5a47]">About</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/quick-calc" className="w-full text-center py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700">Quick Calculator</Link>
              <Link to={user ? "/dashboard" : "/signup"} className="w-full text-center py-2.5 rounded-xl bg-[#2d5a47] font-bold text-white">
                {user ? "Dashboard" : "Get started →"}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          2. HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pt-20 pb-16 text-center max-w-5xl mx-auto">
        
        {/* Ambient Glow Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-emerald-200/50 via-[#2d5a47]/20 to-transparent blur-3xl rounded-full pointer-events-none animate-pulse-glow" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-[#edf5f1] border border-[#c8ddd4] text-[#2d5a47] text-xs font-bold tracking-wide relative z-10 shadow-2xs">
          <Sparkles size={13} fill="currentColor" />
          <span>Property management, made practical</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0f172a] tracking-tight leading-[1.05] relative z-10">
          Modern property records.<br />
          <span className="text-[#2d5a47]">Simple utility billing.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-500 leading-relaxed font-medium relative z-10">
          Manage properties, tenants, rent and utility bills from one calm dashboard — built for landlords and property managers in India.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center relative z-10">
          {user ? (
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>Start for Free</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/quick-calc"
                className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm w-full sm:w-auto text-center"
              >
                Try Calculator
              </Link>
            </>
          )}
        </div>

        {/* Trust / Value Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium relative z-10">
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-[#2d5a47]" /> Free to get started
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-[#2d5a47]" /> Works on your phone
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-[#2d5a47]" /> WhatsApp-friendly receipts
          </div>
        </div>

        {/* ══════════════════════════════════════════
            3. DASHBOARD PRODUCT PREVIEW MOCKUP
        ══════════════════════════════════════════ */}
        <div className="mt-14 max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-visible">

          {/* Floating SaaS Widget 1: Bill Generated Notification */}
          <div className="hidden md:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-xl absolute -top-5 -left-6 z-20 animate-float-slow">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#2d5a47] flex items-center justify-center font-black text-sm">
              ⚡
            </div>
            <div className="text-left text-xs">
              <p className="font-extrabold text-slate-900 leading-tight">Bill Generated</p>
              <p className="text-[10px] text-slate-500 font-mono">Room 101 · ₹78,118</p>
            </div>
          </div>

          {/* Floating SaaS Widget 2: WhatsApp Delivered Notification */}
          <div className="hidden md:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-xl absolute -bottom-5 -right-6 z-20 animate-float-delayed">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Check size={16} strokeWidth={3} />
            </div>
            <div className="text-left text-xs">
              <p className="font-extrabold text-slate-900 leading-tight">Receipt Sent</p>
              <p className="text-[10px] text-emerald-600 font-bold">WhatsApp · Delivered 1s ago</p>
            </div>
          </div>
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Logo size={28} />
              <span className="text-xs font-bold text-slate-400">Overview</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                All changes saved
              </span>
              <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">
                August 2026 ▾
              </div>
              <button className="px-3.5 py-1.5 bg-[#2d5a47] text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm">
                <Plus size={13} /> Create bill
              </button>
            </div>
          </div>

          {/* Greeting */}
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Good morning, Farhan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Here's what's happening across your properties.</p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Properties</span>
              <div className="text-2xl font-black text-slate-900 mt-1">3</div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">↑ 1 this month</span>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rooms / Units</span>
              <div className="text-2xl font-black text-slate-900 mt-1">24</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">21 occupied</span>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tenants</span>
              <div className="text-2xl font-black text-slate-900 mt-1">21</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">3 move-ins soon</span>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Expected rent</span>
              <div className="text-2xl font-black text-slate-900 mt-1">₹1,24,500</div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">↑ 8.4% collected</span>
            </div>
          </div>

          {/* Collections Chart + Needs Attention Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            
            {/* Collections Bar Chart Preview */}
            <div className="lg:col-span-2 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-800">Collections</span>
                <span className="font-bold text-[#2d5a47]">₹1,16,050 received</span>
              </div>
              
              {/* Simulated Bar Chart */}
              <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { month: 'Jan', height: '40%' },
                  { month: 'Feb', height: '65%' },
                  { month: 'Mar', height: '45%' },
                  { month: 'Apr', height: '80%' },
                  { month: 'May', height: '70%' },
                  { month: 'Jun', height: '95%', active: true },
                  { month: 'Jul', height: '60%' }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full rounded-lg transition-all ${
                        bar.active ? 'bg-[#2d5a47]' : 'bg-[#c8ddd4]'
                      }`}
                      style={{ height: bar.height }}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Attention Widget */}
            <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold text-slate-800 block">Needs attention</span>
              
              <div className="space-y-2 text-xs font-medium pt-1">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Pending bills</span>
                  <span className="font-extrabold text-amber-700">₹8,450</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Receipts to share</span>
                  <span className="font-extrabold text-slate-800">4</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Vacant rooms</span>
                  <span className="font-extrabold text-slate-800">3</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════
          4. PROPERTY TYPES SECTION
      ══════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-y border-slate-200/80 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block">
            MADE FOR YOUR KIND OF PROPERTY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One workspace for the way you rent.
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Whether you manage a single building or a growing portfolio, MyPropBook keeps every room and rupee accounted for.
          </p>

          {/* Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {propertyTypes.map(({ label }) => (
              <div
                key={label}
                className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:border-[#2d5a47] hover:text-[#2d5a47] hover:bg-[#edf5f1] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{label}</span>
                <ChevronRight size={13} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. SMART BILLING SECTION (Key Differentiator)
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-[#edf5f1] border border-[#d8e7e0] rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block">
                SMART BILLING, WITHOUT THE GUESSWORK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Electricity billing, your way.
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Split shared room bills fairly, or generate individual receipts instantly — MyPropBook handles every scenario so your process fits the property, not the other way around.
              </p>
              <div className="pt-2">
                <Link
                  to="/quick-calc"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm"
                >
                  <span>Open calculator</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Column Visual Comparison Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 01 — SHARED ROOM SPLIT */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-left">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">01 · Shared Room</span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">Split bills between roommates</h4>
                </div>

                {/* Tenant pills */}
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-[#edf5f1] text-[#2d5a47] px-2.5 py-1 rounded-full">
                    <div className="w-4 h-4 rounded-full bg-[#2d5a47] text-white flex items-center justify-center text-[8px] font-black">A</div>
                    <span className="text-[10px] font-bold">Arjun</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    <div className="w-4 h-4 rounded-full bg-slate-500 text-white flex items-center justify-center text-[8px] font-black">S</div>
                    <span className="text-[10px] font-bold">Sara</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Room rent</span>
                    <span className="font-mono font-bold text-slate-700">₹8,000</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Electricity (split 1/2)</span>
                    <span className="font-mono font-bold text-slate-700">₹425</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Prev. balance</span>
                    <span className="font-mono font-bold text-amber-600">₹500</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="flex justify-between text-slate-900 font-black text-sm">
                    <span>Arjun pays</span>
                    <span className="text-[#2d5a47]">₹8,925</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#edf5f1] rounded-xl px-3 py-2">
                  <CheckCircle2 size={13} className="text-[#2d5a47] shrink-0" />
                  <span className="text-[10px] font-bold text-[#2d5a47]">Individual receipts generated for each roommate</span>
                </div>
              </div>

              {/* Card 02 — INSTANT BILL + SHARE */}
              <div className="bg-[#2d5a47] text-white rounded-2xl p-5 shadow-md space-y-4 text-left">
                <div>
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-wider">02 · Instant Receipt</span>
                  <h4 className="text-sm font-extrabold text-white mt-1 leading-snug">Generate & share in seconds</h4>
                </div>

                {/* Mini receipt preview */}
                <div className="bg-white/10 rounded-xl p-3 space-y-2 text-[11px]">
                  <div className="flex justify-between text-white/80">
                    <span>Tenant</span>
                    <span className="font-bold text-white">Rahul Sharma</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Room</span>
                    <span className="font-mono font-bold text-white">201</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Electricity</span>
                    <span className="font-mono font-bold text-white">₹1,020</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Rent</span>
                    <span className="font-mono font-bold text-white">₹7,000</span>
                  </div>
                  <div className="h-px bg-white/15 my-1" />
                  <div className="flex justify-between text-white font-black text-sm">
                    <span>Total Payable</span>
                    <span className="text-emerald-300">₹8,020</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/20 rounded-xl px-2 py-2 transition-all">
                    <span className="text-[10px] font-bold text-white">📄 PDF</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 bg-emerald-400/20 hover:bg-emerald-400/30 rounded-xl px-2 py-2 transition-all">
                    <span className="text-[10px] font-bold text-emerald-300">📲 WhatsApp</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          6. FEATURES ("The Everyday Essentials")
      ══════════════════════════════════════════ */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="space-y-3 mb-14">
          <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block">
            THE EVERYDAY ESSENTIALS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to run rentals.
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Purpose-built to replace notebooks, spreadsheets and WhatsApp calculations — without adding complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 ${f.hoverBorder} ${f.hoverShadow} space-y-4 group cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${f.bgClass} flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                    <Icon size={20} className={`${f.accentClass}`} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${f.bgClass} ${f.accentClass}`}>
                    {f.tag}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#2d5a47] transition-colors">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. QUICK SETUP / HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-3 mb-14">
            <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block">
              QUICK SETUP
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready in under 5 minutes.
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              No complex setup. Add your property, add tenants, and start billing.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0 px-4 pt-6">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className={`w-full max-w-[260px] h-[220px] rounded-3xl p-6 border shadow-lg ${s.bg} ${s.text} ${s.rotate} transition-all duration-300 hover:rotate-0 hover:-translate-y-3 hover:shadow-2xl relative z-10 hover:z-30 cursor-pointer flex flex-col justify-between ${idx > 0 ? 'lg:-ml-4 ml-0' : 'ml-0'}`}
                style={{
                  transformOrigin: 'center center'
                }}
              >
                {/* Number badge */}
                <div className="flex justify-between items-start">
                  <span className={`text-5xl font-black font-mono leading-none tracking-tighter ${s.numberText}`}>{s.step}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
                
                {/* Copy */}
                <div className="space-y-1.5 text-left">
                  <h4 className="font-extrabold text-white text-base leading-tight">{s.title}</h4>
                  <p className={`text-xs ${s.descText} leading-relaxed`}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. FOUNDER / STORY SECTION ("A Tool With A Reason")
      ══════════════════════════════════════════ */}
      <section id="about" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block">
              A TOOL WITH A REASON
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Built for landlords. Built from a real problem.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              MyPropBook began with a simple problem: rent, utility bills, tenant records, and collections were scattered across notebooks, spreadsheets, and WhatsApp.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              I built MyPropBook to bring these everyday tasks into one reliable workspace — from managing properties and tenants to calculating utility bills and generating shareable receipts.
            </p>

            <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-[#2d5a47] shrink-0" />
                <span>No spreadsheets or manual billing calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-[#2d5a47] shrink-0" />
                <span>Clear bills and receipts tenants can understand</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-[#2d5a47] shrink-0" />
                <span>One place for properties, rooms, tenants &amp; collections</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-[#2d5a47] shrink-0" />
                <span>Shareable PDF and WhatsApp receipts in one tap</span>
              </div>
            </div>
          </div>

          {/* Right Founder Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 text-left relative overflow-hidden">

              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#edf5f1] rounded-full blur-3xl opacity-60 pointer-events-none" />

              {/* Header Row */}
              <div className="flex items-center gap-4 relative">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2d5a47] to-[#1a3d2f] text-white flex items-center justify-center font-black text-lg shadow-md tracking-tight">
                    FA
                  </div>
                  {/* Verified dot */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Farhan Ahmad Tufail</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Founder · Full-Stack Software Engineer · India</p>
                </div>

                {/* Social icon links */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href="https://github.com/farhan-ahmad-tufail" target="_blank" rel="noopener noreferrer" title="GitHub" className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-600"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/farhan-ahmad-tufail-70439621b/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-[#e8f0fe] border border-slate-200 flex items-center justify-center transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#0077b5]"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>

              {/* Quote */}
              <div className="relative pl-3 border-l-2 border-[#2d5a47]/30">
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "I built MyPropBook because managing a property shouldn't mean juggling spreadsheets, notebooks, and WhatsApp every month."
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. FINAL CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-12 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-br from-[#edf5f1] via-[#eff6ff] to-[#e4efe9] border border-[#d8e7e0] rounded-3xl p-10 sm:p-14 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Stop managing your property on paper and WhatsApp.
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Bring tenants, rent, utility bills and receipts into one simple dashboard.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-sm shadow-md transition-all"
            >
              <span>Create free account</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. FOOTER (Clean SaaS - NO "Made with Replit")
      ══════════════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200/80 px-6 lg:px-12 pt-16 pb-8 text-left">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Top Row: Brand + Nav Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-100">

            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-5">
              <Logo size={34} />
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
                The simplest way for Indian landlords to manage properties, tenants, and billing — all in one place.
              </p>
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </div>
            </div>

            {/* Product Links */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Product</span>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">How it works</a></li>
                <li><Link to="/quick-calc" className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">Smart Billing</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">Get started →</Link></li>
              </ul>
            </div>

            {/* Built For */}
            <div className="lg:col-span-3 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Built For</span>
              <ul className="space-y-3">
                {['Rental properties', 'PGs & Hostels', 'Apartments', 'Small landlords'].map(item => (
                  <li key={item} className="text-sm text-slate-600 font-medium">{item}</li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Resources</span>
              <ul className="space-y-3">
                <li><a href="#about" className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">About</a></li>
                <li><Link to="/quick-calc" className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">Quick Calculator</Link></li>
                <li><Link to={user ? '/dashboard' : '/signup'} className="text-sm text-slate-600 font-medium hover:text-[#2d5a47] transition-colors">Dashboard</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-400 font-medium">
              © {year} <span className="font-bold text-slate-600">MyPropBook</span> · Property Management Software
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <span>Made with ♥ in India</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>Built by <span className="font-bold text-slate-600">Farhan Ahmad Tufail</span></span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
