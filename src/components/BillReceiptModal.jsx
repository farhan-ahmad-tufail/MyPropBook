import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  Building, 
  Home, 
  CheckCircle,
  Zap,
  Calendar
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from './Toast';

const translations = {
  en: {
    receiptTitle: "RENT & UTILITY BILL",
    tenant: "TENANT",
    rooms: "ROOM",
    total: "Total",
    rent: "RENT",
    readings: "READINGS",
    units: "UNITS",
    rate: "RATE",
    elec: "ELEC",
    cur: "Cur",
    pre: "Pre",
    totalRent: "Total Rent",
    totalElectricity: "Total Electricity",
    otherCharges: "Other Charges",
    currentMonth: "CURRENT MONTH",
    oldPendingBalance: "Old Pending Balance",
    totalPayable: "TOTAL PAYABLE AMOUNT",
    payByDueDate: "Please pay by due date",
    thankYou: "Thank you for your timely payment.",
    generatedOn: "Generated electronically on"
  },
  hi: {
    receiptTitle: "किराया एवं बिजली बिल",
    tenant: "किरायेदार",
    rooms: "कमरा",
    total: "टोटल",
    rent: "किराया",
    readings: "रीडिंग",
    units: "यूनिट",
    rate: "दर",
    elec: "बिजली",
    cur: "वर्तमान",
    pre: "पिछला",
    totalRent: "टोटल किराया",
    totalElectricity: "टोटल बिजली बिल",
    otherCharges: "अन्य शुल्क",
    currentMonth: "इस महीने का टोटल",
    oldPendingBalance: "पिछला बकाया",
    totalPayable: "टोटल किराया देना है",
    payByDueDate: "कृपया नियत तिथि तक भुगतान करें",
    thankYou: "समय पर भुगतान के लिए धन्यवाद।",
    generatedOn: "इलेक्ट्रॉनिक रूप से तैयार:"
  }
};

const themeOptions = {
  emerald: { label: 'Emerald', hex: '#059669', bg: '#059669', text: '#ffffff', icon: '#059669' },
  blue:    { label: 'Royal Blue', hex: '#2563eb', bg: '#2563eb', text: '#ffffff', icon: '#2563eb' },
  purple:  { label: 'Deep Purple', hex: '#7c3aed', bg: '#7c3aed', text: '#ffffff', icon: '#7c3aed' },
  dark:    { label: 'Slate Dark', hex: '#1e293b', bg: '#1e293b', text: '#ffffff', icon: '#334155' },
};

export default function BillReceiptModal({ isOpen, onClose, bill, room, tenant, property }) {
  const toast = useToast();
  const receiptRef = useRef(null);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('emerald');

  if (!isOpen || !bill) return null;

  const currentTheme = themeOptions[theme] || themeOptions.emerald;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      toast('Generating PDF...', 'info');
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill_${room?.room_number || 'Room'}_${bill.bill_month}_${bill.bill_year}.pdf`);
      toast('PDF Downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to generate PDF', 'error');
    }
  };

  const handleShareWhatsapp = () => {
    const tenantPhone = tenant?.phone ? tenant.phone.replace(/[^0-9]/g, '') : '';
    const tenantName = tenant?.name || 'Tenant';
    const roomNo = room?.room_number || bill.room_id || '';
    const rawTotal = parseFloat(bill.total_payable || 0);
    const whatsappRent = parseFloat(bill.rent_amount || 0);
    const whatsappElec = (parseFloat(bill.units_consumed || 0) * parseFloat(bill.rate_per_unit || 0));
    const whatsappOther = parseFloat(bill.other_charges || 0) || 0;
    const whatsappArrears = parseFloat(bill.arrears || 0);
    const computedWhatsappTotal = whatsappRent + whatsappElec + whatsappOther + whatsappArrears;
    const total = ((isNaN(rawTotal) || rawTotal === 0) ? computedWhatsappTotal : rawTotal).toLocaleString('en-IN');
    const month = bill.bill_month;
    const year = bill.bill_year;

    const message = `*RENT RECEIPT*\n` +
      `Month: ${month} ${year}\n` +
      `Tenant: ${tenantName}\n` +
      `Total: ₹${total}`;

    const encoded = encodeURIComponent(message);
    const url = tenantPhone 
      ? `https://wa.me/${tenantPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
  };

  const units = parseFloat(bill.units_consumed || 0);
  const rate = parseFloat(bill.rate_per_unit || 0);
  const elecAmount = units * rate;
  const rentAmount = parseFloat(bill.rent_amount || 0);
  const otherCharges = parseFloat(bill.other_charges || 0) || 0;
  const arrears = parseFloat(bill.arrears || 0);
  // Compute from line items as fallback if bill.total_payable is NaN or 0
  const computedTotal = rentAmount + elecAmount + otherCharges + arrears;
  const rawTotal = parseFloat(bill.total_payable || 0);
  const totalPayable = (isNaN(rawTotal) || rawTotal === 0) ? computedTotal : rawTotal;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Building size={18} className="text-violet-400 flex-shrink-0" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate">
              Bill Receipt — Room {room?.room_number || ''} ({bill.bill_month} {bill.bill_year})
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer size={15} />
            </button>
            <button
              onClick={handleDownloadPDF}
              title="Download PDF"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download size={15} />
            </button>
            <button
              onClick={handleShareWhatsapp}
              title="Share on WhatsApp"
              className="p-1.5 sm:p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Share2 size={15} /> <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950/50 flex-1 flex flex-col items-center custom-scrollbar">
          
          {/* Customization Options Bar */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2.5 w-full max-w-lg">
            <div className="flex bg-slate-900 p-1 rounded-xl flex-1 border border-slate-800">
              <button
                type="button"
                className={`flex-1 px-3 py-1 rounded-lg font-semibold text-xs transition-all ${language === 'en' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                type="button"
                className={`flex-1 px-3 py-1 rounded-lg font-semibold text-xs transition-all ${language === 'hi' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setLanguage('hi')}
              >
                हिंदी
              </button>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl flex-1 justify-around items-center px-3 border border-slate-800">
              {Object.entries(themeOptions).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform hover:scale-110 ${theme === key ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : ''}`}
                  style={{ backgroundColor: t.hex }}
                  title={`Theme: ${t.label}`}
                />
              ))}
            </div>
          </div>

          {/* Printable Receipt Paper Container */}
          <div
            ref={receiptRef}
            className="receipt-paper w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-xl p-5 sm:p-7 border border-slate-200"
          >
            {/* Header / Title */}
            <div className="text-center mb-6">
              <div className="text-2xl font-bold uppercase tracking-wider text-slate-800">
                {translations[language].receiptTitle}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                {property?.name ? `${property.name} • ` : ''}{bill.bill_month} {bill.bill_year}
              </div>
              <div style={{ borderBottom: '2px solid #cbd5e1', margin: '15px auto', width: '100%' }}></div>
            </div>

            {/* Tenant details row */}
            <div className="flex justify-between items-start gap-4 mb-6 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {translations[language].tenant}
                </div>
                <div className="text-xl font-bold text-slate-900 leading-tight">
                  {tenant?.name || 'Tenant'}
                </div>
                {tenant?.phone && <span className="text-xs text-slate-500">{tenant.phone}</span>}
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  ROOM
                </div>
                <div className="text-base font-bold text-slate-800">
                  Room {room?.room_number || bill.room_id}
                </div>
                <span className="text-[10px] text-slate-500 capitalize">{room?.room_type || 'Single Room'}</span>
              </div>
            </div>

            {/* Electricity Breakdown Box */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className="flex justify-between items-center py-2 px-4 bg-slate-50 border-b border-slate-200">
                <div className="font-bold text-slate-800 flex items-center gap-2 text-xs">
                  <Home size={14} color={currentTheme.icon} /> Room {room?.room_number || ''} Breakdown
                </div>
              </div>
              <div className="p-4 pt-3">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', fontSize: '0.85rem', width: '100%' }}>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].readings}</div>
                    <div className="text-xs text-slate-600 mb-0.5">{translations[language].cur}: <span className="font-mono font-bold text-slate-800">{bill.current_reading ?? bill.previous_reading}</span></div>
                    <div className="text-xs text-slate-600">{translations[language].pre}: <span className="font-mono font-bold text-slate-800">{bill.previous_reading || 0}</span></div>
                  </div>
                  <div className="sm:text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].units}</div>
                    <div className="font-mono font-bold text-slate-800 mt-2">{units.toFixed(1)}</div>
                  </div>
                  <div className="sm:text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].rate}</div>
                    <div className="font-mono text-slate-600 text-xs mt-2">₹{rate}</div>
                  </div>
                  <div className="sm:text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].elec}</div>
                    <div className="font-mono font-bold text-slate-800 mt-2">₹{elecAmount.toFixed(2)}</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].rent}</div>
                    <div className="font-mono font-bold text-slate-800 mt-2 text-sm">₹{rentAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Summary Box */}
            <div className="space-y-2.5 mb-6 bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium text-sm">{translations[language].totalRent}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">₹{rentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium text-sm">{translations[language].totalElectricity}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">₹{elecAmount.toFixed(2)}</span>
              </div>
              {otherCharges > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium text-sm">{translations[language].otherCharges}</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">₹{otherCharges.toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderBottom: '2px dashed #cbd5e1', margin: '12px 0' }}></div>

              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">{translations[language].currentMonth}</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{(rentAmount + elecAmount + otherCharges).toFixed(2)}
                </span>
              </div>

              {arrears > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium text-base">{translations[language].oldPendingBalance}</span>
                  <span className="font-mono font-bold text-slate-800 text-base">₹{arrears.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Grand Total Banner */}
            <div style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', transition: 'background-color 0.3s' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{translations[language].totalPayable}</span>
                <span style={{ fontSize: '0.70rem', color: '#cbd5e1', marginTop: '2px' }}>{translations[language].payByDueDate}</span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 'bold', letterSpacing: '-0.03em', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                ₹{totalPayable.toFixed(2)}
              </div>
            </div>

            <div className="mt-8 pt-4 text-center text-slate-400 text-xs">
              <p>{translations[language].thankYou}</p>
              <p className="mt-1">{translations[language].generatedOn} {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleShareWhatsapp}
            className="btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
          >
            <Share2 size={14} /> Send WhatsApp Bill
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs px-4 py-2 rounded-xl font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
