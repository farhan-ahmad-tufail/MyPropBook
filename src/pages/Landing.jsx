import React from 'react';
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
  CheckCircle,
  Star,
  Smartphone,
  Globe,
  Code2,
  HeartHandshake,
  MapPin,
  Mail,
  Github,
  Linkedin,
  Twitter,
  ChevronRight,
  Sparkles,
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  {
    icon: Building2,
    accent: '#2d5a47',
    bg: '#edf5f1',
    title: 'Multi-Property Management',
    desc: 'Register unlimited properties. Group rooms by floor, type, and rent rate. Manage everything from one place.',
  },
  {
    icon: Zap,
    accent: '#7c3aed',
    bg: '#f5f3ff',
    title: 'One-Click Smart Billing',
    desc: 'Just enter current meter readings. Previous readings, tenant details, and rates autofill automatically.',
  },
  {
    icon: Receipt,
    accent: '#0891b2',
    bg: '#ecfeff',
    title: 'Instant PDF Receipts',
    desc: 'Generate professional receipts. Download as PDF or share directly to WhatsApp with a single tap.',
  },
  {
    icon: Users,
    accent: '#d97706',
    bg: '#fffbeb',
    title: 'Tenant Lease Tracking',
    desc: 'Track active leases per room, tenant contacts, and who occupies which space with full history.',
  },
  {
    icon: BarChart3,
    accent: '#2563eb',
    bg: '#eff6ff',
    title: 'Revenue Dashboard',
    desc: 'See total expected rent, pending arrears, and occupancy rates at a glance across all properties.',
  },
  {
    icon: Shield,
    accent: '#dc2626',
    bg: '#fef2f2',
    title: 'Works Offline & Online',
    desc: 'No internet? No problem. Runs locally on your device. Connect Supabase for cloud sync and backups.',
  },
];

const steps = [
  { step: '01', icon: Building2, title: 'Register your property', desc: 'Add your building, rooms with rents, and initial meter readings in minutes.' },
  { step: '02', icon: Users, title: 'Add tenants & allocate rooms', desc: 'Register tenants and link them to rooms with lease agreements.' },
  { step: '03', icon: Zap, title: 'Enter current reading', desc: 'Select room, type the meter reading — everything else is calculated for you.' },
  { step: '04', icon: FileText, title: 'Share & collect', desc: 'Download PDF or send directly to tenant on WhatsApp in one tap.' },
];

const stats = [
  { value: '100%', label: 'Free to Use', icon: HeartHandshake },
  { value: 'PWA', label: 'Works Offline', icon: Smartphone },
  { value: '∞', label: 'Properties & Rooms', icon: Building2 },
  { value: '<5 min', label: 'Setup Time', icon: Clock },
];

export default function Landing() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <div className="relative overflow-hidden bg-[#f8faf9] text-slate-800" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>

      {/* ── Subtle Background Mesh ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,90,71,0.06) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)'
        }} />
      </div>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav className="relative z-30 sticky top-0 flex items-center justify-between px-6 lg:px-10 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={34} />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
          <a href="#features" className="hover:text-[#2d5a47] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#2d5a47] transition-colors">How it works</a>
          <a href="#about" className="hover:text-[#2d5a47] transition-colors">About</a>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/quick-calc"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Quick Calculator
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all shadow-sm"
            >
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all shadow-sm"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-[#edf5f1] border border-[#c8ddd4] text-[#2d5a47] text-xs font-bold tracking-wide">
          <Sparkles size={13} fill="currentColor" />
          <span>Property Management + Smart Billing Platform</span>
        </div>

        <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900">
          Manage Every Property.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #2d5a47 0%, #3d7a62 50%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Bill Every Room.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed">
          Manage apartments, PGs, hostels, and rental properties from one dashboard.
          Automate electricity submeter billing, track tenants, collect payments, and
          generate professional receipts in seconds.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Open Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start for Free <ArrowRight size={16} />
              </Link>
              <Link
                to="/quick-calc"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-700 font-bold text-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Try Calculator
              </Link>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#2d5a47]" />
            No credit card required
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#2d5a47]" />
            Works offline instantly
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#2d5a47]" />
            Installable PWA
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#2d5a47]" />
            100% Free
          </div>
        </div>
      </section>

      {/* ── Property Types Strip ── */}
      <section className="relative z-10 border-y border-slate-200/80 bg-white py-5 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Perfect for</span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { emoji: '🏢', label: 'Apartments' },
              { emoji: '🏠', label: 'Rental Buildings' },
              { emoji: '🛏', label: 'PGs' },
              { emoji: '🎓', label: 'Hostels' },
              { emoji: '🏘', label: 'Societies' },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:border-[#2d5a47]/40 hover:text-[#2d5a47] hover:bg-[#edf5f1] transition-all">
                <span>{emoji}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-6 bg-[#2d5a47]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-sm text-white/60 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════ */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full bg-[#edf5f1] border border-[#c8ddd4] text-[#2d5a47] text-xs font-bold tracking-wide">
            <Sparkles size={12} fill="currentColor" />
            <span>Built-in Features</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900">Everything you need to manage rentals</h2>
          <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">Purpose-built features to replace spreadsheets and paperwork — designed for Indian landlords.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: f.bg, color: f.accent }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 px-6 py-24 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full bg-[#edf5f1] border border-[#c8ddd4] text-[#2d5a47] text-xs font-bold tracking-wide">
              <Clock size={12} />
              <span>Quick Setup</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900">Ready in under 5 minutes</h2>
            <p className="mt-3 text-slate-500 text-base">No complex setup. Just register, configure, and bill.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(100%-0rem)] w-full h-px border-t-2 border-dashed border-slate-200 z-0" />
                  )}
                  <div className="relative z-10 bg-[#f8faf9] border border-slate-100 rounded-3xl p-6 hover:shadow-sm hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-black text-slate-200 font-mono">{s.step}</span>
                      <div className="w-9 h-9 rounded-xl bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════ */}
      <section id="about" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* About Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-[#edf5f1] border border-[#c8ddd4] text-[#2d5a47] text-xs font-bold tracking-wide">
              <HeartHandshake size={12} />
              <span>Our Story</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mb-5">
              Built for landlords <br/>
              <span style={{
                background: 'linear-gradient(135deg, #2d5a47, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>by a developer who understands the problem.</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4 text-sm">
              BillRoom was born from a real frustration — landlords in India spending hours every month juggling notebooks, Excel sheets, and WhatsApp messages to calculate rent, utility bills, and track tenants.
            </p>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm">
              We built a simple, powerful tool that replaces all of that chaos. BillRoom is designed to be instant to set up, easy to use on any device, and works even without internet — because not everyone has reliable connectivity.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                'No spreadsheets, no WhatsApp calculations',
                'Works on any device — phone, tablet, desktop',
                'Fully offline-capable with cloud sync option',
                'Share receipts to WhatsApp in one tap',
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center shrink-0">
                    <CheckCircle size={12} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Founder Card */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              {/* Decorative green corner */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-[#edf5f1] -z-0" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-[#edf5f1] text-[#2d5a47] text-[10px] font-black uppercase tracking-widest">
                  <Star size={10} fill="currentColor" />
                  Founder & Developer
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#2d5a47] text-white flex items-center justify-center font-black text-xl shadow-lg">
                    FA
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Farhan Ahmad Tufail</h3>
                    <p className="text-sm text-slate-500 font-medium">Founder & Full-Stack Developer</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span className="text-[11px] text-slate-400">India</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  "I built BillRoom to solve a problem I saw firsthand — the hours wasted by landlords every month on manual rent calculations, utility billing, and chasing payments. BillRoom is my answer to that."
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">React</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">Supabase</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">PWA</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">Property Tech</span>
                </div>
              </div>
            </div>

            {/* Vision card */}
            <div className="bg-[#2d5a47] rounded-3xl p-6 text-white">
              <div className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Our Mission</div>
              <p className="text-sm font-medium text-white/80 leading-relaxed">
                To make property management accessible to every landlord in India — from single-room rentals to large apartment complexes — with tools that are simple, fast, and free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-16 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{
            background: 'linear-gradient(135deg, #edf5f1 0%, #eff6ff 50%, #f5f3ff 100%)',
            border: '1px solid #d8e7e0'
          }}>
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#2d5a47]/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
                Upgrade from Notebooks to BillRoom
              </h2>
              <p className="text-slate-500 text-base mb-8 max-w-xl mx-auto leading-relaxed">
                Stop managing tenant records, rent collections, and utility bills in notebooks, spreadsheets, and WhatsApp chats. BillRoom brings everything together in one secure dashboard.
              </p>

              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Create Free Account <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative z-10 bg-slate-900 text-white px-6 lg:px-10 pt-16 pb-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Footer Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <Logo size={36} />
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                A smart property &amp; billing management platform for Indian landlords. Manage tenants, automate electricity billing, collect payments, and stay organized — all in one place.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={12} />
                Made with ❤️ in India
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} />Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} />How It Works</a></li>
                <li><Link to="/quick-calc" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} />Quick Calculator</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} />Dashboard</Link></li>
                <li><Link to="/smart-calc" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} />Smart Billing</Link></li>
              </ul>
            </div>

            {/* About Column */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Built By</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2d5a47] text-white flex items-center justify-center font-black text-sm shrink-0">
                    FA
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Farhan Ahmad Tufail</p>
                    <p className="text-xs text-slate-500">Founder & Developer</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Full-stack developer passionate about building practical tools that solve real problems for everyday users.
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-slate-500 shrink-0" />
                  <span>BillRoom — Property Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 size={13} className="text-slate-500 shrink-0" />
                  <span>React · Supabase · PWA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
            <p className="text-xs text-slate-600">
              © {year} BillRoom. Designed & built by{' '}
              <span className="text-[#4a9978] font-bold">Farhan Ahmad Tufail</span>.
              All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Smartphone size={12} className="text-[#4a9978]" />
                PWA Installable
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#4a9978]" />
                Offline Capable
              </span>
              <span className="flex items-center gap-1.5">
                <Globe size={12} className="text-[#4a9978]" />
                Free Forever
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
