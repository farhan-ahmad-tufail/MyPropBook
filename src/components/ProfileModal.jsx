import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { 
  X, 
  User, 
  Phone, 
  Building2, 
  CreditCard, 
  Check, 
  Sparkles,
  ShieldCheck,
  Palette,
  BarChart3,
  Calculator,
  LogOut,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const avatarColors = [
  { id: 'sage', bg: 'bg-[#2d5a47]', label: 'Sage Green' },
  { id: 'navy', bg: 'bg-[#0f172a]', label: 'Deep Navy' },
  { id: 'blue', bg: 'bg-blue-600', label: 'Classic Blue' },
  { id: 'purple', bg: 'bg-purple-600', label: 'Royal Purple' },
  { id: 'emerald', bg: 'bg-[#059669]', label: 'Emerald' },
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, signOut, isLocal, resetDemo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarColor, setAvatarColor] = useState('sage');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const sp = JSON.parse(localStorage.getItem('mypropbook_user_profile') || '{}');
      const defaultName = sp.fullName || user?.user_metadata?.full_name || user?.fullName || (isLocal ? 'Demo' : 'Landlord Owner');
      setFullName(defaultName);
      setPhone(sp.phone || user?.user_metadata?.phone || '');
      setAvatarColor(sp.avatarColor || user?.user_metadata?.avatar_color || 'sage');
    }
  }, [user, isLocal]);

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'LO';

  const selectedColorObj = avatarColors.find(c => c.id === avatarColor) || avatarColors[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        fullName,
        phone,
        avatarColor
      });
      toast('Profile & Workspace settings updated!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      toast('Failed to update profile settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl relative my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block mb-0.5">
              ACCOUNT &amp; WORKSPACE
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg">Profile Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card Preview Header */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className={`w-12 h-12 rounded-2xl ${selectedColorObj.bg} text-white flex items-center justify-center font-black text-base shadow-sm`}>
              {initials}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{fullName || (isLocal ? 'Demo' : 'Landlord Owner')}</h4>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-bold">
                <ShieldCheck size={12} />
                <span>{isLocal ? 'Demo Workspace' : 'Verified Landlord'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                FULL NAME
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                PHONE / WHATSAPP NUMBER
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Avatar Theme Color */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                AVATAR THEME COLOR
              </label>
              <div className="flex items-center gap-2">
                {avatarColors.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAvatarColor(c.id)}
                    className={`w-8 h-8 rounded-xl ${c.bg} text-white flex items-center justify-center transition-all cursor-pointer ${
                      avatarColor === c.id ? 'ring-2 ring-offset-2 ring-[#2d5a47] scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {avatarColor === c.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Local Mode: Discreet Reset Sample Data */}
            {isLocal && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore original sample data? This will reset all sample rooms, tenants, and bills back to their initial state.')) {
                      resetDemo();
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-[#2d5a47] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#edf5f1] cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Restore sample portfolio data</span>
                </button>
              </div>
            )}

            {/* ── Mobile-Only "More" Navigation & Logout ── */}
            <div className="block lg:hidden mt-6 space-y-1 pt-6 border-t border-slate-100">
              <div className="px-1 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  MANAGE & UTILITIES
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => { onClose(); navigate('/analytics'); }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50/60 border border-purple-200/80 hover:border-purple-300 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3 text-slate-900">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <BarChart3 size={16} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900">Financial analytics</span>
                      <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full uppercase tracking-wider">Reports</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Revenue, arrears & tax CSV exports</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-purple-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => { onClose(); navigate('/quick-calc'); }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Calculator size={15} />
                  </div>
                  <span className="font-bold text-xs">Quick Calculator</span>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
              </button>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-rose-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 text-rose-600">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                      <LogOut size={15} />
                    </div>
                    <span className="font-bold text-xs">Sign out</span>
                  </div>
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>,
    document.body
  );
}
