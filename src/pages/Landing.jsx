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
  PlayCircle
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Multi-Property Management',
    desc: 'Register unlimited properties. Group rooms by floor, type, and rent rate. Manage everything from one place.',
  },
  {
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    title: 'One-Click Smart Billing',
    desc: 'Just enter current meter readings. Previous readings, tenant details, and rates autofill automatically.',
  },
  {
    icon: Receipt,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    title: 'Instant PDF Receipts',
    desc: 'Generate professional receipts in English or Hindi. Download as PDF or share directly to WhatsApp.',
  },
  {
    icon: Users,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    title: 'Tenant Lease Tracking',
    desc: 'Track active leases per room, tenant contacts, and who occupies which space with full history.',
  },
  {
    icon: BarChart3,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    title: 'Revenue Dashboard',
    desc: 'See total expected rent, pending arrears, and occupancy rates at a glance across all properties.',
  },
  {
    icon: Shield,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    title: 'Works Offline & Online',
    desc: 'No internet? No problem. Runs locally on your device. Connect Supabase for cloud sync and backups.',
  },
];

const steps = [
  { step: '01', title: 'Register your property', desc: 'Add your building, rooms with rents, and initial meter readings.' },
  { step: '02', title: 'Add tenants & allocate rooms', desc: 'Register tenants and link them to rooms with lease agreements.' },
  { step: '03', title: 'Enter current reading', desc: 'Select room, type the meter reading — everything else is calculated.' },
  { step: '04', title: 'Share & collect', desc: 'Download PDF or send directly to tenant on WhatsApp in one tap.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">

      {/* ── Ambient Glow Orbs ── */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span>RentCalc</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/quick-calc" className="hidden sm:inline-flex btn btn-secondary text-sm py-2 px-4">
            Quick Calculator
          </Link>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary shadow-glow py-2 px-5">
              Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary shadow-glow py-2 px-5">
              Get Started <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        {/* Version badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
          <Star size={11} fill="currentColor" />
          <span>Professional Property Management System</span>
        </div>

        <h1 className="max-w-4xl text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] text-white">
          Manage Rent &amp; Utility{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Billing Like a Pro
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
          The all-in-one property operations tool for landlords. Automate electricity submeter calculations, track tenants, and generate instant shareable receipts.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary shadow-glow text-base py-3.5 px-8 rounded-xl w-full sm:w-auto">
              Open Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary shadow-glow text-base py-3.5 px-8 rounded-xl w-full sm:w-auto">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/quick-calc" className="btn btn-secondary text-base py-3.5 px-8 rounded-xl w-full sm:w-auto">
                <PlayCircle size={18} /> Try Manual Calculator
              </Link>
            </>
          )}
        </div>

        {/* Social Proof */}
        <div className="mt-12 flex items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-400" /> No credit card required
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-400" /> Works offline instantly
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-400" /> Installable PWA
          </div>
        </div>
      </section>

      {/* ── Feature Cards Grid ── */}
      <section className="relative z-10 px-6 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-white">Everything you need to manage rentals</h2>
          <p className="mt-3 text-slate-400 text-base">Purpose-built features to replace spreadsheets and paperwork.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`bg-slate-900 border ${f.border} rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group`}
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-slate-100 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 px-6 py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white">Ready in under 5 minutes</h2>
            <p className="mt-3 text-slate-400 text-base">No complex setup. Just register, configure, and bill.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col gap-4">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-0.5rem)] w-full h-px bg-gradient-to-r from-slate-700 to-transparent" />
                )}
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-blue-600/30 font-mono leading-none">{s.step}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/15 border border-blue-500/20 rounded-3xl p-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Replace your spreadsheets today
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto">
            Join property owners who automated their billing. Free forever with local storage, or connect Supabase for cloud backup.
          </p>

          {user ? (
            <Link to="/dashboard" className="btn btn-primary shadow-glow text-base py-3.5 px-10 rounded-xl inline-flex">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary shadow-glow text-base py-3.5 px-10 rounded-xl inline-flex">
              Create Free Account <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 px-6 py-8 text-center text-xs text-slate-600">
        © 2026 RentCalc. Built with React + Supabase · PWA Installable
      </footer>
    </div>
  );
}
