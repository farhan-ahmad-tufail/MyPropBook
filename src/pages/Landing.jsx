import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Building2,
  Building,
  Home,
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
  Share2,
  Wallet,
  UserCircle,
  Settings,
  LogOut,
  MessageSquare,
  Inbox
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
    icon: Building2,
    gradient: 'from-emerald-50 to-transparent'
  },
  { 
    step: '02', 
    title: 'Add tenants', 
    desc: 'Assign tenants to rooms and keep records current.', 
    icon: Users,
    gradient: 'from-[#f0f7f4] to-transparent'
  },
  { 
    step: '03', 
    title: 'Create a bill', 
    desc: 'Enter a meter reading or add a direct utility amount.', 
    icon: FileText,
    gradient: 'from-emerald-50/80 to-transparent'
  },
  { 
    step: '04', 
    title: 'Share & collect', 
    desc: 'Generate a receipt and share it with the tenant.', 
    icon: Share2,
    gradient: 'from-[#edf5f1] to-transparent'
  },
];

// Target Property Types
const propertyTypes = [
  { 
    label: 'Apartments',
    desc: 'Keep units, leases and collections together.',
    icon: Building2
  },
  { 
    label: 'Rental properties',
    desc: 'Run every property from one calm workspace.',
    icon: Home
  },
  { 
    label: 'PGs',
    desc: 'Split shared rooms without the spreadsheet.',
    icon: Users
  },
  { 
    label: 'Hostels',
    desc: 'Bills and receipts ready for every room.',
    icon: Inbox
  },
  { 
    label: 'Residential buildings',
    desc: 'Make monthly operations predictable.',
    icon: Building
  },
  { 
    label: 'Small landlords',
    desc: 'Less chasing. Better records.',
    icon: FileText
  },
];

// Custom hook for reusable scroll animations (triggers once and stays visible)
function useScrollReveal(threshold = 0.2, margin = '0px') {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin: margin }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold, margin]);

  return [ref, isVisible];
}

export default function Landing() {
  const { user, isLocal, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);
  
  const [mockupRef, isMockupVisible] = useScrollReveal(0.05);
  const [typesRef, isTypesVisible] = useScrollReveal(0.2);
  const [billingRef, isBillingVisible] = useScrollReveal(0.2);
  const [featuresRef, isFeaturesVisible] = useScrollReveal(0.15);
  const [stepsRef, isStepsVisible] = useScrollReveal(0.2);
  const year = new Date().getFullYear();

  const handleDemoClick = async () => {
    setDemoLoading(true);
    try {
      if (isLocal) {
        localStorage.setItem('mock_token', 'demo_token');
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      } else {
        await signIn('demo@billroom.app', 'DemoPass123!');
        navigate('/dashboard');
      }
    } catch (err) {
      try {
        await signUp('demo@billroom.app', 'DemoPass123!', 'Demo Landlord');
        navigate('/dashboard');
      } catch (e) {
        navigate('/dashboard');
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#f8faf9] text-slate-800 font-sans selection:bg-[#2d5a47] selection:text-white">

      {/* ── Global Dot-Grid Background Texture (Neutral gray, ~3.5% opacity, static) ── */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035]" 
        aria-hidden="true" 
      />

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
            <a href="#who-its-for" className="hover:text-[#2d5a47] transition-colors">Who it's for</a>
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
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Get started</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
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
            <a href="#who-its-for" onClick={() => setMobileMenuOpen(false)} className="block px-2 text-slate-600 hover:text-[#2d5a47]">Who it's for</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/quick-calc" className="w-full text-center py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700">Quick Calculator</Link>
              {user ? (
                <Link to="/dashboard" className="w-full text-center py-2.5 rounded-xl bg-[#2d5a47] font-bold text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="w-full text-center py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700">
                    Log in
                  </Link>
                  <Link to="/signup" className="w-full text-center py-2.5 rounded-xl bg-[#2d5a47] font-bold text-white">
                    Create Free Account →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          2. HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative z-10 px-4 sm:px-6 pt-20 sm:pt-24 pb-16 text-center max-w-5xl mx-auto">
        
        {/* Soft light vignette behind hero headline */}
        <div 
          className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[720px] max-w-[95vw] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0.65)_45%,transparent_75%)] blur-2xl z-0" 
          aria-hidden="true"
        />

        {/* Animated Hero Header */}
        <div className="relative z-10 animate-fade-in-up">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05] relative z-10">
            Stop tracking rent on WhatsApp and messy spreadsheets.
          </h1>

          {/* Supporting Copy */}
          <p className="mt-5 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-500 leading-relaxed font-medium relative z-10">
            Manage properties, tenants, rent, utility bills, and receipts from one simple workspace.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center relative z-10">
          {user ? (
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-200 shadow-md flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-200 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>Create Free Account</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={handleDemoClick}
                disabled={demoLoading}
                className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-sm w-full sm:w-auto text-center cursor-pointer"
              >
                {demoLoading ? 'Starting...' : 'View Demo'}
              </button>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════
            3. DASHBOARD PRODUCT PREVIEW MOCKUP
        ══════════════════════════════════════════ */}
        <div 
          ref={mockupRef}
          className={`mt-8 sm:mt-10 max-w-5xl mx-auto transition-all duration-700 ease-out transform-gpu ${
            isMockupVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Browser Chrome Container */}
          <div 
            className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden text-left relative pointer-events-none select-none"
            style={{
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06)'
            }}
          >
            {/* Browser Top Bar */}
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-4">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80 inline-block" />
              </div>

              {/* URL Address Bar Mockup */}
              <div className="flex-1 max-w-xs mx-auto bg-white border border-slate-200/70 rounded-lg px-3 py-1 text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5 shadow-2xs">
                <svg className="w-3 h-3 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-slate-600 font-mono text-[10.5px]">app.mypropbook.in</span>
                <span className="text-slate-400 font-mono text-[10.5px]">/overview</span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Product View</span>
              </div>
            </div>

            {/* Inner Dashboard View */}
            <div className="p-5 sm:p-7 space-y-6 bg-white">
          
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
        </div>
      </div>
    </section>

      {/* ══════════════════════════════════════════
          4. WHO IT'S FOR (Property Types)
      ══════════════════════════════════════════ */}
      <section id="who-its-for" className="py-20 px-4 sm:px-6 bg-[#f8faf9] border-y border-slate-200/80 text-left overflow-hidden">
        <div 
          ref={typesRef}
          className={`max-w-6xl mx-auto transition-all duration-1000 ease-out transform-gpu ${
            isTypesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Section Header — no eyebrow label, authentic copy */}
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              Whether you manage 4 rooms or 40.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Built specifically for PG owners, residential building managers, and independent landlords across India.
            </p>
          </div>

          {/* Asymmetric Grid */}
          <div className="space-y-4">
            {/* Top Row: Hero Card (2 cols) + Apartments Card (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              
              {/* Hero Card: PGs & Hostels (Spans 2 cols) */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Users size={24} className="text-[#2d5a47]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2d5a47] bg-[#edf5f1] px-2.5 py-1 rounded-full border border-[#c8ddd4]/60">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                    PGs & Student Hostels
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mb-6">
                    Split shared room electricity bills fairly per head, generate individual WhatsApp receipts for each roommate, and manage bed vacancies without spreadsheet chaos.
                  </p>
                </div>

                {/* Real Mini UI Mockup: Roommate Split */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">Room 204</span>
                      <span className="text-[11px] text-slate-500">• 3-Sharing Room</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Electricity ₹1,275 Split ÷ 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Aarav Sharma', rent: '₹7,500', elec: '₹425', total: '₹7,925', status: 'Paid ✓' },
                      { name: 'Rohan Gupta', rent: '₹7,500', elec: '₹425', total: '₹7,925', status: 'Receipt Sent' },
                      { name: 'Sameer Khan', rent: '₹7,500', elec: '₹425', total: '₹7,925', status: 'Receipt Sent' },
                    ].map(r => (
                      <div key={r.name} className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs shadow-2xs">
                        <div className="font-bold text-slate-800 truncate mb-1">{r.name}</div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                          <span>Share</span>
                          <span className="font-mono font-bold text-slate-700">{r.total}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-700 pt-0.5">{r.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Apartments & Flats */}
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <Building2 size={22} className="text-slate-700 mb-4" />
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                    Apartments & Flats
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                    Track long-term tenants, lease terms, security deposits, and submeter meter readings with automatic rate calculations.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Current Submeter Reading</span>
                    <span className="font-mono font-bold text-slate-800">1,420 units</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Units Consumed</span>
                    <span className="font-mono font-bold text-[#2d5a47]">185 units</span>
                  </div>
                  <div className="h-px bg-slate-200/80" />
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total Electricity Due</span>
                    <span className="font-mono">₹1,480</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: 3 Compact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card 3: Independent Floors & Houses */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                <Home size={20} className="text-slate-600 mb-3.5" />
                <h4 className="font-bold text-[15px] text-slate-900 mb-1.5">Independent Floors & Houses</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Manage multi-floor rentals and family tenants with clear rent records and direct WhatsApp receipt sharing.
                </p>
              </div>

              {/* Card 4: Residential Buildings */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                <Building size={20} className="text-slate-600 mb-3.5" />
                <h4 className="font-bold text-[15px] text-slate-900 mb-1.5">Residential Buildings</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Keep track of multiple units, upcoming vacancies, and rent collection health across entire buildings.
                </p>
              </div>

              {/* Card 5: Small & Independent Landlords */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                <FileText size={20} className="text-slate-600 mb-3.5" />
                <h4 className="font-bold text-[15px] text-slate-900 mb-1.5">Independent Landlords</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No complex enterprise software. Just a clean workspace to ensure every rupee and bill is accounted for.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. SMART BILLING SECTION (Key Differentiator)
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-6xl mx-auto overflow-hidden">
        <div 
          ref={billingRef}
          className={`bg-[#edf5f1] border border-[#d8e7e0] rounded-3xl p-8 sm:p-12 lg:p-16 transition-all duration-1000 ease-out transform-gpu ${
            isBillingVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
          }`}
        >
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
          6. FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
        {/* Section heading — no eyebrow */}
        <div
          ref={featuresRef}
          className={`mb-12 text-left transition-all duration-1000 ease-out transform-gpu ${
            isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            What it actually does
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
            Rent tracking, utility splitting, receipts, and tenant records — handled from one place. No spreadsheets.
          </p>
        </div>

        {/* Row 1: Hero (2 cols) + Receipts (1 col) — use items-stretch so receipts fills height */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-4">

          {/* ── FEATURED CARD: Flexible utility billing — spans 2 cols ── */}
          <div className="sm:col-span-2 bg-[#2d5a47] text-white rounded-2xl p-7 sm:p-8 hover:shadow-xl transition-all duration-300 cursor-default group relative overflow-hidden">
            {/* Subtle texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
            <div className="relative z-10">
              {/* Custom bill-split SVG illustration */}
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="24" height="32" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                  <line x1="9" y1="16" x2="23" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="9" y1="21" x2="23" y2="21" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="9" y1="26" x2="18" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="9" y1="31" x2="23" y2="31" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="38" cy="22" r="8" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                  <line x1="38" y1="22" x2="38" y2="14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="38" y1="22" x2="44" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="38" y1="22" x2="32" y2="26" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-white mb-3 leading-snug">
                Flexible utility billing
              </h3>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                Enter the main electricity meter reading, or type in the total bill — MyPropBook calculates each room's share automatically. Works for shared rooms too, splitting the bill per head.
              </p>
              {/* Mini illustrative rows */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { label: 'Room 101', val: '₹840', pct: '34%' },
                  { label: 'Room 102', val: '₹610', pct: '25%' },
                  { label: 'Room 103', val: '₹1,000', pct: '41%' },
                ].map(r => (
                  <div key={r.label} className="bg-white/10 rounded-xl px-3 py-2.5">
                    <div className="text-[10px] text-white/50 mb-0.5">{r.label}</div>
                    <div className="font-black text-white text-sm font-mono">{r.val}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">{r.pct} of bill</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Card 2: Professional receipts — fills height of hero with mini receipt ── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-default group flex flex-col">
            <Receipt size={22} className="text-slate-700 mb-4 group-hover:text-slate-900 transition-colors" />
            <h3 className="font-bold text-[15px] text-slate-900 mb-2 leading-snug">Professional receipts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              One tap generates a clean PDF receipt. Share directly to WhatsApp — no printing, no screenshots.
            </p>
            {/* Mini receipt mockup — fills the dead space deliberately */}
            <div className="mt-auto pt-5">
              <div className="border border-slate-100 rounded-xl p-3 space-y-1.5 bg-slate-50">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Tenant</span><span className="font-semibold text-slate-700">Rahul Sharma</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Room</span><span className="font-mono text-slate-700">201</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Rent</span><span className="font-mono text-slate-700">₹7,000</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Electricity</span><span className="font-mono text-slate-700">₹850</span>
                </div>
                <div className="h-px bg-slate-200 my-0.5" />
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-700">Total</span><span className="text-slate-900">₹7,850</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: 4 equal cards in a 2×2 grid — no orphans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">

          {/* ── Card 3: Multi-property ── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-default group">
            <Building2 size={20} className="text-slate-500 mb-4" strokeWidth={1.5} />
            <h3 className="font-bold text-[14px] text-slate-900 mb-1.5 leading-snug">Multi-property</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage several buildings under one login. Switch between properties in seconds.
            </p>
          </div>

          {/* ── Card 4: Tenant & lease records ── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-default group">
            <Users size={20} className="text-slate-500 mb-4" strokeWidth={1.5} />
            <h3 className="font-bold text-[14px] text-slate-900 mb-1.5 leading-snug">Tenant & lease records</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Contacts, room assignments, and move-in dates — not scattered across chats.
            </p>
          </div>

          {/* ── Card 5: Collections overview ── */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 cursor-default">
            <TrendingUp size={18} className="text-slate-400 mb-4" strokeWidth={1.5} />
            <h3 className="font-bold text-[14px] text-slate-800 mb-1.5 leading-snug">Collections overview</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              See what's collected, what's pending, and who's overdue — at a glance.
            </p>
          </div>

          {/* ── Card 6: Shared room splitting ── */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 cursor-default">
            <Share2 size={18} className="text-slate-400 mb-4" strokeWidth={1.5} />
            <h3 className="font-bold text-[14px] text-slate-800 mb-1.5 leading-snug">Shared room splitting</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multiple tenants in one room? Each gets their own receipt with their individual share.
            </p>
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════
          7. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Heading — no eyebrow, plain and direct */}
          <div className="mb-14 sm:mb-18">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Four things to do once. After that, billing each month takes a few minutes.
            </p>
          </div>

          {/* Steps — desktop: plain numbered list, no connector line, no fake active state */}
          <div className="hidden md:grid grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex flex-col">
                {/* Uniform circle — no filled/outlined distinction */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-5 border border-slate-300 text-slate-500 bg-white">
                  {idx + 1}
                </div>
                <h4 className="font-bold text-[15px] text-slate-900 mb-2 leading-snug">{s.title}</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile - simple vertical list */}
          <div className="md:hidden space-y-6">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border border-slate-300 text-slate-500 bg-white mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-slate-900 mb-1 leading-snug">{s.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{s.desc}</p>
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
      <footer className="bg-[#0b1a14] px-6 lg:px-12 pt-16 pb-8 text-left">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Top Row: Brand + Nav Columns */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-white/10">

            {/* Brand Column — full width on mobile */}
            <div className="col-span-2 lg:col-span-5 space-y-5">
              <Logo size={34} dark />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                The simplest way for Indian landlords to manage properties, tenants, and billing — all in one place.
              </p>

              {/* Social + Contact links */}
              <div className="flex items-center gap-2 pt-1">
                <a href="https://github.com/farhan-ahmad-tufail" target="_blank" rel="noopener noreferrer" title="GitHub"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/farhan-ahmad-tufail-70439621b/" target="_blank" rel="noopener noreferrer" title="LinkedIn"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#0077b5]/20 border border-white/10 flex items-center justify-center transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#0077b5]"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="mailto:mypropbook1@gmail.com" title="Email us"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
              </div>

              {/* Contact email text */}
              <a href="mailto:mypropbook1@gmail.com" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                mypropbook1@gmail.com
              </a>
            </div>

            {/* Product Links */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Product</span>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">How it works</a></li>
                <li><Link to="/quick-calc" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">Smart Billing</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">Get started →</Link></li>
              </ul>
            </div>

            {/* Built For */}
            <div className="col-span-1 lg:col-span-3 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Built For</span>
              <ul className="space-y-3">
                {['Rental properties', 'PGs & Hostels', 'Apartments', 'Residential buildings', 'Small landlords'].map(item => (
                  <li key={item} className="text-sm text-slate-400 font-medium">{item}</li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Resources</span>
              <ul className="space-y-3">
                <li><a href="#about" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">About</a></li>
                <li><Link to="/quick-calc" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">Quick Calculator</Link></li>
                <li><Link to={user ? '/dashboard' : '/signup'} className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <p>
              © {year} <span className="font-bold text-slate-300">MyPropBook</span> · Property Management Software
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-1.5">
                <span>🇮🇳</span>
                <span>Made in India</span>
              </span>
              <span className="hidden sm:block w-px h-3 bg-white/10" />
              <span>Built by <span className="font-bold text-slate-300">Farhan Ahmad Tufail</span></span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
