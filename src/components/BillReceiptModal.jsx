import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Share2,
  Receipt,
  Check,
  ChevronDown,
  Home
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from './Toast';

/* ─── Color Themes ─── */
const THEMES = [
  {
    id: 'green', name: 'BillRoom Green', hex: '#2d5a47',
    gradient: 'linear-gradient(150deg, #1a3a2b 0%, #2d5a47 55%, #214035 100%)',
    border: 'rgba(255,255,255,0.10)',
    accent: '#6ee7b7', pill: { bg: '#d1fae5', text: '#065f46' },
    glow: 'rgba(45,90,71,0.5)'
  },
  {
    id: 'navy', name: 'Classic Navy', hex: '#0f172a',
    gradient: 'linear-gradient(150deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
    border: 'rgba(255,255,255,0.08)',
    accent: '#94a3b8', pill: { bg: '#e2e8f0', text: '#0f172a' },
    glow: 'rgba(15,23,42,0.6)'
  },
  {
    id: 'blue', name: 'Royal Blue', hex: '#1e40af',
    gradient: 'linear-gradient(150deg, #1e3a8a 0%, #1e40af 55%, #2563eb 100%)',
    border: 'rgba(255,255,255,0.10)',
    accent: '#93c5fd', pill: { bg: '#dbeafe', text: '#1e3a8a' },
    glow: 'rgba(30,64,175,0.5)'
  },
  {
    id: 'maroon', name: 'Burgundy', hex: '#881337',
    gradient: 'linear-gradient(150deg, #4c0519 0%, #881337 55%, #9f1239 100%)',
    border: 'rgba(255,255,255,0.10)',
    accent: '#fda4af', pill: { bg: '#ffe4e6', text: '#881337' },
    glow: 'rgba(136,19,55,0.5)'
  },
  {
    id: 'purple', name: 'Deep Purple', hex: '#581c87',
    gradient: 'linear-gradient(150deg, #3b0764 0%, #581c87 55%, #6b21a8 100%)',
    border: 'rgba(255,255,255,0.10)',
    accent: '#d8b4fe', pill: { bg: '#f3e8ff', text: '#581c87' },
    glow: 'rgba(88,28,135,0.5)'
  },
  {
    id: 'slate', name: 'Minimal Black', hex: '#18181b',
    gradient: 'linear-gradient(150deg, #000000 0%, #18181b 55%, #27272a 100%)',
    border: 'rgba(255,255,255,0.08)',
    accent: '#a1a1aa', pill: { bg: '#f4f4f5', text: '#18181b' },
    glow: 'rgba(24,24,27,0.6)'
  },
];

/* ─── Labels ─── */
const L = {
  en: {
    tag: 'RENT RECEIPT', billedTo: 'TENANT',
    electricity: 'Total Electricity', totalRent: 'Total Rent', totalElectricity: 'Total Electricity',
    prev: 'Previous', curr: 'Current', usage: 'Usage',
    preLabel: 'Pre:', curLabel: 'Cur:', usageLabel: 'Usage:', units: 'units', room: 'Room',
    rent: 'Monthly Rent', prevBal: 'Previous Balance', other: 'Other Charges',
    amtDue: 'TOTAL PAYABLE AMOUNT', received: 'Amount received', remaining: 'Remaining due',
    itemizedBreakdown: (count) => `ITEMIZED ROOM BREAKDOWN (${count} ROOMS)`,
    due: (m) => `DUE 10 ${(m || '').slice(0, 3).toUpperCase()}`,
    thanks: 'Thank you for your payment.',
    waTitle: 'RENT RECEIPT',
  },
  hi: {
    tag: 'किराया रसीद', billedTo: 'किरायेदार',
    electricity: 'बिजली का कुल बिल', totalRent: 'कुल किराया', totalElectricity: 'बिजली का कुल बिल',
    prev: 'पिछला', curr: 'नया', usage: 'उपयोग',
    preLabel: 'पिछला:', curLabel: 'नया:', usageLabel: 'उपयोग:', units: 'यूनिट', room: 'कमरा',
    rent: 'कमरे का किराया', prevBal: 'पिछला बकाया', other: 'अन्य खर्चे',
    amtDue: 'कुल देय राशि', received: 'मिली हुई राशि', remaining: 'बाकी बकाया',
    itemizedBreakdown: (count) => `कमरे के अनुसार विवरण (${count} कमरे)`,
    due: (m) => `लास्ट डेट 10 ${(m || '').slice(0, 3).toUpperCase()}`,
    thanks: 'समय पर भुगतान के लिए धन्यवाद।',
    waTitle: 'किराया रसीद',
  }
};

export default function BillReceiptModal({ isOpen, onClose, bill, room, tenant, property }) {
  const toast = useToast();
  const receiptRef = useRef(null);
  const [lang, setLang] = useState('en');
  const [themeId, setThemeId] = useState('green');

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  const t = THEMES.find(x => x.id === themeId) || THEMES[0];
  const lbl = L[lang];
  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN');

  /* Numbers */
  const units      = parseFloat(bill.units_consumed || 0);
  const rate       = parseFloat(bill.rate_per_unit  || 0);
  const rent       = parseFloat(bill.rent_amount    || 0);
  const other      = parseFloat(bill.other_charges  || 0);
  const arrears    = parseFloat(bill.arrears        || 0);
  const rawTotal   = parseFloat(bill.total_payable  || 0);

  let elec = 0;
  if (bill.electricity_amount !== undefined && bill.electricity_amount !== null && !isNaN(bill.electricity_amount)) {
    elec = parseFloat(bill.electricity_amount);
  } else if (bill.elec_amount !== undefined && bill.elec_amount !== null && !isNaN(bill.elec_amount)) {
    elec = parseFloat(bill.elec_amount);
  } else if (units > 0 && rate > 0) {
    elec = units * rate;
  } else if (!isNaN(rawTotal) && rawTotal > 0) {
    elec = Math.max(0, rawTotal - rent - arrears - other);
  }

  const computed   = rent + elec + other + arrears;
  const total      = (isNaN(rawTotal) || rawTotal === 0) ? computed : rawTotal;
  const paid       = parseFloat(bill.amount_paid || 0);
  const due        = Math.max(0, total - paid);
  const month      = bill.bill_month || '';
  const year       = bill.bill_year  || '';

  /* Actions */
  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      toast('Generating PDF…', 'info');
      const c = await html2canvas(receiptRef.current, { scale: 2.5, useCORS: true, backgroundColor: null, logging: false });
      const img = c.toDataURL('image/png');
      const pw = 210, ph = (c.height * pw) / c.width;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pw, Math.max(ph, 120)] });
      pdf.addImage(img, 'PNG', 0, 0, pw, ph);
      pdf.save(`Bill_${room?.room_number || 'Room'}_${month}_${year}.pdf`);
      toast('PDF downloaded!', 'success');
    } catch (e) { console.error(e); toast('Failed to generate PDF', 'error'); }
  };

  const shareNote = bill.split_count > 1 ? ` (1/${bill.split_count} share)` : '';
  const elecText = elec > 0 ? ` | Electricity: ₹${elec.toFixed(2)}${shareNote}` : '';

  const shareWhatsApp = () => {
    const phone = tenant?.phone ? tenant.phone.replace(/[^0-9]/g, '') : '';
    const msg = `*${lbl.waTitle}*\nMonth: ${month} ${year}\nTenant: ${tenant?.name || 'Tenant'} • Room: ${room?.room_number || ''}\nRent: ₹${rent.toFixed(2)}${elecText}` +
      (other > 0 ? `\nOther: ₹${other.toFixed(2)}` : '') +
      (arrears > 0 ? `\nPrev Balance: ₹${arrears.toFixed(2)}` : '') +
      `\n*Total: ₹${total.toFixed(2)}*` +
      (paid > 0 ? `\nPaid: ₹${paid.toFixed(2)} | Due: ₹${due.toFixed(2)}` : '');
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
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
      <div className="relative w-full max-w-[400px] mx-auto my-auto flex flex-col gap-2">

        {/* ── Floating Top Bar ── */}
        <div className="flex items-center gap-2">

          {/* Language Pill */}
          <div
            className="flex items-center p-1 gap-0.5 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {['en', 'hi'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                style={lang === l
                  ? { background: 'rgba(255,255,255,0.95)', color: '#0f172a' }
                  : { color: 'rgba(255,255,255,0.55)' }
                }
              >{l === 'en' ? 'English' : 'हिंदी'}</button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Theme Dots */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {THEMES.map(th => (
              <button
                key={th.id}
                onClick={() => setThemeId(th.id)}
                title={th.name}
                className="w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: th.hex,
                  transform: themeId === th.id ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: themeId === th.id ? `0 0 0 2px rgba(255,255,255,0.9), 0 0 8px ${th.hex}` : 'none',
                  opacity: themeId === th.id ? 1 : 0.65
                }}
              >
                {themeId === th.id && <Check size={9} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Invoice Card ── */}
        <div
          ref={receiptRef}
          className="text-white rounded-3xl overflow-hidden relative"
          style={{
            background: t.gradient,
            border: `1px solid ${t.border}`,
            boxShadow: `0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px ${t.border}, 0 0 80px -20px ${t.glow}`
          }}
        >
          {/* Decorative radial glow rings */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -130, right: -130, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="p-6 space-y-5 relative z-10">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] block" style={{ color: t.accent }}>
                  {lbl.tag}
                </span>
                <h3 className="text-[1.6rem] font-black tracking-tight mt-0.5 leading-none text-white">
                  {month} {year}
                </h3>
              </div>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <Receipt size={18} className="text-white" />
              </div>
            </div>

            {/* Hairline */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.10)' }} />

            {/* Billed To */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold block" style={{ color: t.accent }}>{lbl.billedTo}</span>
              <h4 className="text-xl font-extrabold text-white leading-tight">{tenant?.name || 'Tenant'}</h4>
              {(property?.name || room?.room_number) && (
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {[property?.name, room?.room_number ? `Room ${room.room_number}` : ''].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {/* Line Items */}
            <div className="space-y-3 relative z-10 text-xs">
              {Array.isArray(bill.room_items) && bill.room_items.length > 0 ? (
                <div className="space-y-2.5">
                  {bill.room_items.map((item, idx) => {
                    const itemElec = parseFloat(item.elec_amount || item.electricity_amount || 0);
                    const itemRent = parseFloat(item.rent_amount || 0);
                    const itemOther = parseFloat(item.other_charges || 0);
                    const rUnits = parseFloat(item.units_consumed || 0);
                    const rRate = parseFloat(item.rate_per_unit || 17);
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl p-3.5 space-y-2 backdrop-blur-xs text-xs"
                        style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        {/* Header with Home Icon */}
                        <div className="flex justify-between items-center font-extrabold text-white">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <Home size={15} className="text-white/80 flex-shrink-0" />
                            <span className="break-words leading-snug">{item.room_type ? `${item.room_type} (Room ${item.room_number})` : `Room ${item.room_number}`}</span>
                          </div>
                          <span className="font-mono text-sm font-bold flex-shrink-0 ml-auto">₹{fmt(itemRent)}</span>
                        </div>

                        {/* Electricity Details */}
                        {itemElec > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-white/10 text-[11px] text-white/90">
                            <div className="flex justify-between items-center">
                              <span>{lbl.preLabel} <strong className="text-white font-bold">{item.previous_reading || 0} {lbl.units}</strong></span>
                              <span>{lbl.curLabel} <strong className="text-white font-bold">{item.current_reading || 0} {lbl.units}</strong></span>
                            </div>
                            <div className="flex justify-between items-center pt-0.5 font-mono">
                              <span>{lbl.usageLabel} <strong className="text-white font-bold">{rUnits} {lbl.units} × ₹{rRate}</strong></span>
                              <span className="font-bold text-white text-xs">₹{fmt(itemElec)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Summary Totals */}
                  <div className="space-y-2 pt-2 border-t border-white/15 text-xs">
                    <div className="flex justify-between items-center text-white/90">
                      <span className="font-medium">{lbl.totalRent}</span>
                      <span className="font-mono font-bold text-white">₹{fmt(bill.room_items.reduce((s, i) => s + parseFloat(i.rent_amount || 0), 0))}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/90">
                      <span className="font-medium">{lbl.totalElectricity}</span>
                      <span className="font-mono font-bold text-white">₹{fmt(bill.room_items.reduce((s, i) => s + parseFloat(i.elec_amount || i.electricity_amount || 0), 0))}</span>
                    </div>
                    {arrears > 0 && (
                      <div className="flex justify-between items-center text-white/90">
                        <span className="font-medium">{lbl.prevBal}</span>
                        <span className="font-mono font-bold text-white">₹{fmt(arrears)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="rounded-2xl p-3.5 space-y-2 backdrop-blur-xs text-xs"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex justify-between items-center font-extrabold text-white">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <Home size={15} className="text-white/80 flex-shrink-0" />
                        <span className="break-words leading-snug">{room?.room_type ? `${room.room_type} (Room ${room.room_number})` : `Room ${room?.room_number || '00'}`}</span>
                      </div>
                      <span className="font-mono text-sm font-bold flex-shrink-0 ml-auto">₹{fmt(rent)}</span>
                    </div>

                    {elec > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-white/10 text-[11px] text-white/90">
                        {units > 0 ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span>{lbl.preLabel} <strong className="text-white font-bold">{bill.previous_reading || 0} {lbl.units}</strong></span>
                              <span>{lbl.curLabel} <strong className="text-white font-bold">{bill.current_reading ?? bill.previous_reading ?? 0} {lbl.units}</strong></span>
                            </div>
                            <div className="flex justify-between items-center pt-0.5 font-mono">
                              <span>
                                {lbl.usageLabel} <strong className="text-white font-bold">{units.toFixed(1)} {lbl.units} × ₹{rate}{bill.split_count > 1 ? ` (1/${bill.split_count} ${lang === 'hi' ? 'हिस्सा' : 'share'})` : ''}</strong>
                              </span>
                              <span className="font-bold text-white text-xs">₹{fmt(elec)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span>{lbl.electricity}{bill.split_count > 1 ? ` (1/${bill.split_count} ${lang === 'hi' ? 'हिस्सा' : 'share'})` : ''}</span>
                            <span className="font-mono font-bold text-white text-xs">₹{fmt(elec)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Totals */}
                  <div className="space-y-2 pt-2 border-t border-white/15 text-xs">
                    <div className="flex justify-between items-center text-white/90">
                      <span className="font-medium">{lbl.totalRent}</span>
                      <span className="font-mono font-bold text-white">₹{fmt(rent)}</span>
                    </div>
                    {elec > 0 && (
                      <div className="flex justify-between items-center text-white/90">
                        <span className="font-medium">{lbl.totalElectricity}</span>
                        <span className="font-mono font-bold text-white">₹{fmt(elec)}</span>
                      </div>
                    )}
                    {other > 0 && (
                      <div className="flex justify-between items-center text-white/90">
                        <span className="font-medium">{lbl.other}</span>
                        <span className="font-mono font-bold text-white">₹{fmt(other)}</span>
                      </div>
                    )}
                    {arrears > 0 && (
                      <div className="flex justify-between items-center text-white/90">
                        <span className="font-medium">{lbl.prevBal}</span>
                        <span className="font-mono font-bold text-white">₹{fmt(arrears)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Hairline */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.10)' }} />

            {/* Amount Due */}
            <div className="flex justify-between items-end pt-0.5">
              <div>
                <span className="text-[11px] font-semibold block mb-0.5" style={{ color: t.accent }}>{lbl.amtDue}</span>
                <div className="text-[2rem] font-black tracking-tight text-white leading-none font-mono">
                  ₹{fmt(total)}
                </div>
              </div>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: t.pill.bg,
                  color: t.pill.text,
                  padding: '5px 13px',
                  borderRadius: '9999px',
                  fontSize: '9px',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  lineHeight: '1',
                  flexShrink: 0,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                }}
              >
                {lbl.due(month)}
              </div>
            </div>

            {/* Payment Status — only when partially/fully paid */}
            {paid > 0 && (
              <div
                className="rounded-2xl px-4 py-3 space-y-2"
                style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'rgba(255,255,255,0.60)' }}>{lbl.received}</span>
                  <span style={{ color: '#6ee7b7' }} className="font-bold font-mono">₹{fmt(paid)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span style={{ color: 'rgba(255,255,255,0.60)' }}>{lbl.remaining}</span>
                  <span style={{ color: due > 0 ? '#fcd34d' : '#6ee7b7' }} className="font-mono">₹{fmt(due)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center" style={{ paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.35)' }}>{lbl.thanks}</span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-2.5 mt-1">
          <button
            onClick={downloadPDF}
            className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#1e293b', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.92)'}
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: t.hex, border: `1px solid ${t.border}`, boxShadow: `0 4px 16px ${t.glow}` }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Share2 size={15} />
            <span>Share WhatsApp</span>
          </button>
        </div>

        {/* Subtle ESC hint */}
        <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Click outside or press <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)' }}>ESC</span> to close
        </p>
      </div>
    </div>
    </div>,
    document.body
  );
}
