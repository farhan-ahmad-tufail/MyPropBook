import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Globe, Phone, MessageSquare, AlertCircle, Check, BellRing } from 'lucide-react';
import { useToast } from './Toast';

export default function ReminderModal({ isOpen, onClose, bill, tenant, room, property }) {
  const toast = useToast();
  const [lang, setLang] = useState('hi');
  const [customPhone, setCustomPhone] = useState('');

  useEffect(() => {
    if (tenant?.phone) {
      setCustomPhone(tenant.phone);
    } else {
      setCustomPhone('');
    }
  }, [tenant, bill]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  const total = parseFloat(bill.total_payable || 0);
  const paid = parseFloat(bill.amount_paid || 0);
  const due = Math.max(0, total - paid);
  const tenantName = tenant?.name || bill?.tenant_name || 'Tenant';
  const roomNum = room?.room_number || '';
  const monthYear = `${bill.bill_month || ''} ${bill.bill_year || ''}`.trim();

  // English & Hindi reminder templates
  const messages = {
    en: `Dear ${tenantName},\n\nThis is a gentle payment reminder regarding your rent for ${monthYear}${roomNum ? ` (Room ${roomNum})` : ''}.\n\nTotal Bill: ₹${total.toLocaleString('en-IN')}\nAmount Paid: ₹${paid.toLocaleString('en-IN')}\n*Remaining Due Amount: ₹${due.toLocaleString('en-IN')}*\n\nKindly complete the remaining payment at your earliest convenience. Thank you!`,
    hi: `नमस्ते ${tenantName} जी,\n\nयह आपके ${monthYear}${roomNum ? ` (कमरा ${roomNum})` : ''} के किराये का भुगतान याद दिलाने के लिए संदेश है।\n\nकुल बिल: ₹${total.toLocaleString('en-IN')}\nजमा राशि: ₹${paid.toLocaleString('en-IN')}\n*बाकी बकाया राशि: ₹${due.toLocaleString('en-IN')}*\n\nकृपया बाकी बकाया राशि का जल्द से जल्द भुगतान करने की कृपा करें। धन्यवाद!`
  };

  const currentMsg = messages[lang];

  const handleSendWhatsApp = () => {
    const cleanPhone = customPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(currentMsg)}`;
    
    window.open(url, '_blank');
    toast('Opening WhatsApp...', 'success');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex min-h-full items-center justify-center p-4 sm:p-6"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden relative animate-fade-in my-auto">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-br from-emerald-50/70 to-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <BellRing size={14} />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                  Payment Reminder
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Send WhatsApp Reminder
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Send due balance alert to {tenantName}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0 mt-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">

            {/* Language Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-700" />
                <span>Select Language</span>
              </label>
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    lang === 'hi'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>हिंदी (Hindi)</span>
                  {lang === 'hi' && <Check size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    lang === 'en'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>English</span>
                  {lang === 'en' && <Check size={12} />}
                </button>
              </div>
            </div>

            {/* Tenant WhatsApp Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone size={14} className="text-slate-500" />
                <span>WhatsApp Phone Number</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono"
                />
              </div>
              {!tenant?.phone && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  No phone saved for this tenant. Enter phone number above.
                </p>
              )}
            </div>

            {/* Message Preview Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-slate-500" />
                  <span>Message Preview</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Auto-formatted
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 font-sans whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {currentMsg}
              </div>
            </div>

            {/* Summary Due Pill */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-600">Pending Balance:</span>
              <span className="text-sm font-black text-amber-700 font-mono">₹{due.toLocaleString('en-IN')}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-2 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send size={15} />
                <span>Send via WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
