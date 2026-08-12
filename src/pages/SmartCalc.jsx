import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Download,
  Share2,
  AlertTriangle,
  Building,
  User,
  Home,
  IndianRupee,
  Receipt,
  ChevronDown,
  Search,
  Check,
  X,
  PlusCircle,
  Calendar,
  Palette,
  Globe
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';

/* ─────────────────────────────────────────────────────────────────────────
   Curated Professional Invoice Color Themes
───────────────────────────────────────────────────────────────────────────*/
const INVOICE_THEMES = [
  { id: 'green', name: 'BillRoom Green', bg: '#2d5a47', border: '#234738', textAccent: 'text-emerald-200', pillBg: 'bg-emerald-100', pillText: 'text-[#2d5a47]', gradient: 'linear-gradient(135deg, #1a3a2b, #2d5a47)' },
  { id: 'navy', name: 'Classic Navy', bg: '#0f172a', border: '#1e293b', textAccent: 'text-slate-300', pillBg: 'bg-slate-200', pillText: 'text-slate-900', gradient: 'linear-gradient(135deg, #020617, #0f172a)' },
  { id: 'blue', name: 'Royal Blue', bg: '#1e40af', border: '#1d4ed8', textAccent: 'text-blue-200', pillBg: 'bg-blue-100', pillText: 'text-blue-900', gradient: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
  { id: 'maroon', name: 'Burgundy', bg: '#881337', border: '#9f1239', textAccent: 'text-rose-200', pillBg: 'bg-rose-100', pillText: 'text-rose-900', gradient: 'linear-gradient(135deg, #4c0519, #881337)' },
  { id: 'purple', name: 'Deep Purple', bg: '#581c87', border: '#6b21a8', textAccent: 'text-purple-200', pillBg: 'bg-purple-100', pillText: 'text-purple-900', gradient: 'linear-gradient(135deg, #3b0764, #581c87)' },
  { id: 'slate', name: 'Minimal Black', bg: '#09090b', border: '#27272a', textAccent: 'text-zinc-300', pillBg: 'bg-zinc-200', pillText: 'text-zinc-900', gradient: 'linear-gradient(135deg, #000000, #18181b)' }
];

/* ─────────────────────────────────────────────────────────────────────────
   Bilingual Invoice Translations (English / Hindi)
───────────────────────────────────────────────────────────────────────────*/
const BILL_TRANSLATIONS = {
  en: {
    previewLabel: "INVOICE PREVIEW",
    monthBill: (m) => `${m} bill`,
    billedTo: "Billed to",
    electricity: "Electricity",
    previous: "Previous",
    current: "Current",
    usage: "Usage",
    monthlyRent: "Monthly rent",
    previousBalance: "Previous Balance",
    otherCharges: "Other charges",
    amountDue: "Amount due",
    dueBadge: (m) => `DUE 10 ${m.substring(0, 3).toUpperCase()}`,
    thankYou: "Thank you for your payment.",
    waTitle: "RENT RECEIPT",
    waMonth: "Month",
    waTenant: "Tenant",
    waTotal: "Total"
  },
  hi: {
    previewLabel: "किराया रसीद",
    monthBill: (m) => `${m} का बिल`,
    billedTo: "किरायेदार",
    electricity: "बिजली का बिल",
    previous: "पिछला रीडिंग",
    current: "नया रीडिंग",
    usage: "उपयोग",
    monthlyRent: "कमरे का किराया",
    previousBalance: "पिछला बकाया",
    otherCharges: "अन्य खर्चे",
    amountDue: "कुल किराया देना है",
    dueBadge: (m) => `लास्ट डेट: 10 ${m.substring(0, 3).toUpperCase()}`,
    thankYou: "समय पर भुगतान के लिए धन्यवाद।",
    waTitle: "किराया रसीद",
    waMonth: "महीना",
    waTenant: "किरायेदार",
    waTotal: "कुल राशि"
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   Reusable Custom SaaS Dropdown Component
───────────────────────────────────────────────────────────────────────────*/
function SaasDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choose…',
  required = false,
  disabled = false,
  icon: IconComponent,
  subtext
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()) || (o.sublabel && o.sublabel.toLowerCase().includes(query.toLowerCase())))
    : options;

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v); setQuery(''); }}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold text-left transition-all duration-150 ${disabled
            ? 'bg-slate-50 border-slate-200/60 text-slate-300 cursor-not-allowed'
            : open
              ? 'bg-white border-[#2d5a47] ring-2 ring-[#2d5a47]/10 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }`}
      >
        {IconComponent && (
          <span className={`flex-shrink-0 ${selected ? 'text-[#2d5a47]' : 'text-slate-400'}`}>
            <IconComponent size={15} />
          </span>
        )}

        <span className={`flex-1 truncate ${selected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>

        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && !disabled && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {subtext && (
        <p className="text-[11px] text-slate-400 mt-1 px-1 truncate">
          {subtext}
        </p>
      )}

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-[200] bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-300/40 overflow-hidden"
          style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
        >
          {options.length > 4 && (
            <div className="px-3 pt-2.5 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2d5a47]"
                />
              </div>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto py-1 px-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">No options available</div>
            ) : filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false); } }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-100 text-xs ${opt.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : opt.value === value
                      ? 'bg-[#edf5f1] text-[#2d5a47] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-semibold'
                  }`}
              >
                {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.sublabel && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${opt.disabled ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-500 font-medium'
                    }`}>
                    {opt.sublabel}
                  </span>
                )}
                {opt.value === value && !opt.disabled && (
                  <Check size={13} className="text-[#2d5a47] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SmartCalc() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Route URL Parameter support
  const urlRoomId = searchParams.get('roomId');

  // Loading lists
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Language State ('en' | 'hi')
  const [billLanguage, setBillLanguage] = useState('en');
  const t = BILL_TRANSLATIONS[billLanguage] || BILL_TRANSLATIONS.en;

  // Selected Theme State
  const [selectedThemeId, setSelectedThemeId] = useState('green');
  const activeTheme = INVOICE_THEMES.find(t => t.id === selectedThemeId) || INVOICE_THEMES[0];

  // Dropdown Selection States
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Selected Room Details (Autofilled)
  const [activeTenant, setActiveTenant] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [calculatedArrears, setCalculatedArrears] = useState(0);
  const [customArrears, setCustomArrears] = useState('');

  // Form Fields
  const currentDate = new Date();
  const [billMonth, setBillMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [billYear, setBillYear] = useState(currentDate.getFullYear().toString());
  const [currentReading, setCurrentReading] = useState('');
  const [otherCharges, setOtherCharges] = useState('');

  // Electricity billing mode: 'submeter' | 'direct' | 'none'
  const [elecMode, setElecMode] = useState('submeter');
  const [directElecAmount, setDirectElecAmount] = useState('');

  // Result & UI State
  const [result, setResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const receiptRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 1 + i).toString());

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [propsList, roomsList, tenantsList, leasesList, billsList] = await Promise.all([
        api.getProperties(ownerId),
        api.getAllRooms(ownerId),
        api.getTenants(ownerId),
        api.getLeases(ownerId),
        api.getBills(ownerId)
      ]);

      setProperties(propsList);
      setRooms(roomsList);
      setTenants(tenantsList);
      setLeases(leasesList);
      setBills(billsList);

      if (urlRoomId && roomsList.length > 0) {
        const targetRoom = roomsList.find(r => r.id === urlRoomId);
        if (targetRoom) {
          setSelectedPropertyId(targetRoom.property_id);
          setSelectedRoomId(targetRoom.id);
        }
      } else if (propsList.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(propsList[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data for calculations');
    } finally {
      setLoading(false);
    }
  }, [user, urlRoomId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Triggered when selected room changes (Autofill execution)
  useEffect(() => {
    if (!selectedRoomId) {
      setActiveRoom(null);
      setActiveTenant(null);
      setCalculatedArrears(0);
      setCustomArrears('');
      setResult(null);
      setIsSaved(false);
      return;
    }

    const roomObj = rooms.find(r => r.id === selectedRoomId);
    setActiveRoom(roomObj);

    const activeLease = leases.find(l => l.room_id === selectedRoomId && l.is_active);
    if (activeLease) {
      const tenantObj = tenants.find(t => t.id === activeLease.tenant_id);
      setActiveTenant(tenantObj);

      const roomArrears = bills
        .filter(b => b.room_id === selectedRoomId && b.tenant_id === tenantObj.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
        .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
      setCalculatedArrears(roomArrears);
      setCustomArrears(roomArrears.toString());
    } else {
      setActiveTenant(null);
      setCalculatedArrears(0);
      setCustomArrears('');
    }
  }, [selectedRoomId, rooms, leases, tenants, bills]);

  // Real-time calculation computation
  const activeProperty = properties.find(p => p.id === selectedPropertyId);
  const prevReading = parseFloat(activeRoom?.current_meter_reading) || 0;
  const currReading = parseFloat(currentReading) || 0;
  const rate = parseFloat(activeRoom?.rate_per_unit) || 10;
  const unitsConsumed = (currentReading !== '' && currReading >= prevReading) ? (currReading - prevReading) : 0;

  let calculatedElecAmount = 0;
  if (elecMode === 'submeter') {
    calculatedElecAmount = unitsConsumed * rate;
  } else if (elecMode === 'direct') {
    calculatedElecAmount = parseFloat(directElecAmount) || 0;
  }

  const baseRentAmount = parseFloat(activeRoom?.base_rent) || 0;
  const arrearsAmount = customArrears !== '' ? (parseFloat(customArrears) || 0) : calculatedArrears;
  const otherChargesAmount = parseFloat(otherCharges) || 0;
  const grandTotalAmount = baseRentAmount + calculatedElecAmount + arrearsAmount + otherChargesAmount;

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsSaved(false);

    if (!activeRoom || !activeTenant) {
      setError('Please select a room with an active tenant');
      return;
    }

    if (elecMode === 'submeter') {
      if (currentReading === '' || isNaN(currReading)) {
        setError('Please input a valid current meter reading');
        return;
      }
      if (currReading < prevReading) {
        setError(`Current meter reading cannot be less than previous reading (${prevReading} units).`);
        return;
      }
    } else if (elecMode === 'direct' && (directElecAmount === '' || isNaN(parseFloat(directElecAmount)))) {
      setError('Please enter a valid electricity bill amount');
      return;
    }

    const calculatedBill = {
      room_id: activeRoom.id,
      tenant_id: activeTenant.id,
      tenant_name: activeTenant.name,
      room_number: activeRoom.room_number,
      floor: activeRoom.floor,
      room_type: activeRoom.room_type,
      bill_month: billMonth,
      bill_year: billYear,
      elec_mode: elecMode,
      previous_reading: prevReading,
      current_reading: currReading,
      units_consumed: unitsConsumed,
      rate_per_unit: rate,
      elec_amount: calculatedElecAmount,
      rent_amount: baseRentAmount,
      arrears: arrearsAmount,
      other_charges: otherChargesAmount,
      total_payable: grandTotalAmount,
      payment_status: 'Unpaid'
    };

    setResult(calculatedBill);

    try {
      setIsSaving(true);
      await api.createBill(calculatedBill);
      setIsSaved(true);
      if (elecMode === 'submeter') {
        setActiveRoom(prev => prev ? { ...prev, current_meter_reading: currReading } : prev);
        setRooms(prevRooms => prevRooms.map(r => r.id === activeRoom.id ? { ...r, current_meter_reading: currReading } : r));
        setCurrentReading('');
      }
      toast('Bill saved to Billing Records!', 'success');
    } catch (err) {
      console.error('Error saving bill:', err);
      toast('Bill generated, but failed to save to database history.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: activeTheme.bg,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${activeTenant?.name || 'Tenant'}_${billMonth}_${billYear}.pdf`);
    } catch (err) {
      console.error("PDF Fail", err);
    }
  };

  const handleShareWhatsapp = async () => {
    try {
      const tenantName = activeTenant?.name || 'Tenant';
      const text = `${t.waTitle}\n${t.waMonth}: ${billMonth} ${billYear}\n${t.waTenant}: ${tenantName}\n${t.waTotal}: ₹${grandTotalAmount.toFixed(2)}`;

      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: activeTheme.bg });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Bill_${tenantName}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: t.waTitle, text });
          return;
        }
      }
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Build Options for Custom SaaS Dropdowns
  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: p.address || undefined,
    icon: <Building size={14} className="text-[#2d5a47]" />
  }));

  const roomOptions = rooms
    .filter(r => r.property_id === selectedPropertyId)
    .map(r => {
      const activeLease = leases.find(l => l.room_id === r.id && l.is_active);
      const tenant = activeLease ? tenants.find(t => t.id === activeLease.tenant_id) : null;
      return {
        value: r.id,
        label: `Room ${r.room_number}`,
        sublabel: tenant ? tenant.name : 'Vacant',
        disabled: !activeLease,
        icon: <Home size={14} className={activeLease ? 'text-emerald-600' : 'text-slate-300'} />
      };
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in-up active max-w-7xl mx-auto pb-8">

      {/* ── COMPACT HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Sparkles size={12} className="text-emerald-600" />
            <span>CREATE BILL DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Bill
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compact Month & Year Selectors */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
            <Calendar size={14} className="text-[#2d5a47]" />
            <select
              value={billMonth}
              onChange={e => setBillMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer pr-1"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-slate-300">•</span>
            <select
              value={billYear}
              onChange={e => setBillYear(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ⚡ Bulk Billing Recommendation Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold">
            ⚡
          </div>
          <div>
            <p className="font-extrabold text-slate-800">Billing multiple rooms this month?</p>
            <p className="text-[#4b5563] text-[11px]">Save time by entering all meter readings together in Bulk Billing mode.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/properties?tab=bulk')}
          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow-2xs"
        >
          <span>Open Bulk Billing Matrix</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* ── MAIN 2-COLUMN COMPACT LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Compact Input Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-5">

            <form onSubmit={handleCalculate} className="space-y-4">

              {/* CUSTOM DROPDOWNS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Property Selector */}
                <SaasDropdown
                  label="Property"
                  required
                  placeholder="Choose Property…"
                  value={selectedPropertyId}
                  onChange={(v) => {
                    setSelectedPropertyId(v);
                    setSelectedRoomId('');
                  }}
                  options={propertyOptions}
                  icon={Building}
                  subtext={activeProperty?.address || 'Select property location'}
                />

                {/* Room & Tenant Selector */}
                <SaasDropdown
                  label="Room / Tenant"
                  required
                  placeholder={selectedPropertyId ? 'Choose Room / Tenant…' : 'Select property first'}
                  value={selectedRoomId}
                  onChange={(v) => {
                    setSelectedRoomId(v);
                    setCurrentReading('');
                    setOtherCharges('');
                    setDirectElecAmount('');
                    setElecMode('submeter');
                    setResult(null);
                    setIsSaved(false);
                  }}
                  options={roomOptions}
                  disabled={!selectedPropertyId}
                  icon={Home}
                  subtext={`Billing period · 01–31 ${billMonth} ${billYear}`}
                />
              </div>

              {/* ELECTRICITY MODE TOGGLE & COMPACT METER INPUT */}
              <div className="p-4 rounded-2xl bg-[#edf5f1] border border-[#d8e7e0] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Zap size={14} className="text-[#2d5a47]" /> Electricity billing mode:
                  </span>
                  <div className="flex bg-white/80 p-0.5 rounded-xl gap-0.5 border border-slate-200/60">
                    {[
                      { id: 'submeter', label: 'Submeter' },
                      { id: 'direct', label: 'Direct Amount' },
                      { id: 'none', label: 'Included' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setElecMode(mode.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${elecMode === mode.id
                            ? 'bg-[#2d5a47] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {elecMode === 'submeter' && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">Enter current meter reading</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-extrabold text-[11px]">
                        Prev: {prevReading} units
                      </span>
                    </div>

                    <div className="relative bg-white rounded-xl border border-slate-200/80 px-3 py-1.5 focus-within:border-[#2d5a47] focus-within:ring-1 focus-within:ring-[#2d5a47] transition-all">
                      <input
                        type="number"
                        required
                        disabled={!selectedRoomId}
                        placeholder={`e.g. ≥ ${prevReading || 0}`}
                        className="w-full text-2xl font-black text-slate-900 bg-transparent outline-none font-mono tracking-tight placeholder:text-slate-300"
                        value={currentReading}
                        onChange={e => setCurrentReading(e.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        units
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold pt-0.5">
                      <span className="text-slate-500 text-[11px]">Usage breakdown</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[#2d5a47] font-black text-xs">
                          {unitsConsumed} units
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">× ₹{rate}/unit</span>
                      </div>
                    </div>
                  </div>
                )}

                {elecMode === 'direct' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">Direct Electricity Amount (₹)</label>
                    <div className="relative bg-white rounded-xl border border-slate-200/80 px-3 py-1.5">
                      <input
                        type="number"
                        required
                        disabled={!selectedRoomId}
                        placeholder="e.g. 1007"
                        className="w-full text-xl font-black text-slate-900 bg-transparent outline-none font-mono"
                        value={directElecAmount}
                        onChange={e => setDirectElecAmount(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* COMPACT INPUT FIELDS FOR ARREARS & OTHER CHARGES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Previous Balance Field */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                      <IndianRupee size={12} className="text-amber-600" /> Previous Balance
                    </label>
                    {calculatedArrears > 0 && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        Auto-calculated
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      disabled={!selectedRoomId}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2d5a47]"
                      value={customArrears}
                      onChange={e => setCustomArrears(e.target.value)}
                    />
                  </div>
                </div>

                {/* Other Charges Field */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <PlusCircle size={12} className="text-slate-400" /> Other Charges
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      disabled={!selectedRoomId}
                      placeholder="e.g. Maintenance, Water"
                      className="w-full pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2d5a47]"
                      value={otherCharges}
                      onChange={e => setOtherCharges(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS & HOW IT WORKS */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle size={13} />
                  <span>How is this calculated?</span>
                </button>

                <button
                  type="submit"
                  disabled={!selectedRoomId || isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{isSaving ? 'Saving...' : 'Save Bill Record'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {showHowItWorks && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Calculation breakdown:</p>
                  <p>• <strong>Electricity:</strong> (Current Reading - Previous Reading) × Unit Rate</p>
                  <p>• <strong>Total Payable:</strong> Monthly Rent + Electricity + Arrears + Other Charges</p>
                </div>
              )}

            </form>
          </div>

          {/* RIGHT COLUMN: Professional Themed Invoice Card */}
          <div className="lg:col-span-5 space-y-3 sticky top-4">

            {/* CURATED COLOR THEMES & LANGUAGE SELECTOR BAR */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2">

              {/* Language Selector Toggle */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Globe size={13} className="text-slate-700" /> Lang:
                </span>
                <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setBillLanguage('en')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${billLanguage === 'en'
                        ? 'bg-[#2d5a47] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillLanguage('hi')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${billLanguage === 'hi'
                        ? 'bg-[#2d5a47] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    हिंदी (HI)
                  </button>
                </div>
              </div>

              {/* Theme Palette */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hidden sm:inline-block mr-1">
                  Theme:
                </span>
                {INVOICE_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    title={theme.name}
                    className={`w-5 h-5 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer ${selectedThemeId === theme.id ? 'ring-2 ring-offset-1 ring-slate-800 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    style={{ background: theme.bg }}
                  >
                    {selectedThemeId === theme.id && (
                      <Check size={10} className="text-white" />
                    )}
                  </button>
                ))}
              </div>

            </div>

            {/* INVOICE CARD PREVIEW (Uses selected professional theme & language) */}
            <div
              ref={receiptRef}
              className="text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4 border transition-colors duration-200"
              style={{
                background: activeTheme.gradient,
                borderColor: activeTheme.border
              }}
            >
              {/* Background Decorative Rings */}
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

              {/* Top header row */}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest block ${activeTheme.textAccent}`}>
                    {t.previewLabel}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight mt-0.5">{t.monthBill(billMonth)}</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                  <Receipt size={18} />
                </div>
              </div>

              <div className="h-px bg-white/15 w-full" />

              {/* Billed To Section */}
              <div className="space-y-0.5 relative z-10">
                <span className={`text-[10px] font-medium block ${activeTheme.textAccent}`}>{t.billedTo}</span>
                <h4 className="text-lg font-extrabold text-white">{activeTenant?.name || (billLanguage === 'hi' ? 'कमरा चुनें' : 'Select a room')}</h4>
                <p className="text-xs text-white/70">
                  {activeProperty?.name || 'Property'} · {billLanguage === 'hi' ? 'कमरा' : 'Room'} {activeRoom?.room_number || '00'}
                </p>
              </div>

              {/* Itemized charges list with TRANSPARENT METER READING BREAKDOWN */}
              <div className="space-y-3 pt-1 relative z-10 text-xs">

                {/* Electricity Row + Breakdown */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white/95">{t.electricity}</span>
                    <span className="font-black tracking-tight text-sm">₹{calculatedElecAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Submeter transparent calculation box (Previous, Current, Usage) */}
                  {elecMode === 'submeter' && (
                    <div className="bg-black/20 border border-white/15 rounded-xl p-2.5 space-y-1 text-[11px] text-white/90">
                      <div className="flex justify-between text-[10px] text-white/70 font-medium">
                        <span>{t.previous}: <strong className="text-white">{prevReading} units</strong></span>
                        <span>{t.current}: <strong className="text-white">{currReading} units</strong></span>
                      </div>
                      <div className="pt-0.5 border-t border-white/10 flex justify-between items-center font-mono">
                        <span>{t.usage}: {unitsConsumed} units × ₹{rate}/unit</span>
                        <span className="font-bold text-white">₹{calculatedElecAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Rent */}
                <div className="flex justify-between items-center">
                  <span className="text-white/90 font-medium">{t.monthlyRent}</span>
                  <span className="font-black tracking-tight">₹{baseRentAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Previous Balance */}
                {arrearsAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 font-medium">{t.previousBalance}</span>
                    <span className="font-black tracking-tight">₹{arrearsAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Other Charges */}
                {otherChargesAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 font-medium">{t.otherCharges}</span>
                    <span className="font-black tracking-tight">₹{otherChargesAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/15 w-full" />

              {/* Amount Due Section */}
              <div className="flex justify-between items-end relative z-10 pt-0.5">
                <div>
                  <span className={`text-xs font-semibold block ${activeTheme.textAccent}`}>{t.amountDue}</span>
                  <div className="text-3xl font-black tracking-tight text-white mt-0.5">
                    ₹{grandTotalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full font-extrabold text-[10px] tracking-wider uppercase shadow-sm ${activeTheme.pillBg} ${activeTheme.pillText}`}>
                  {t.dueBadge(billMonth)}
                </span>
              </div>

              {/* Footer */}
              <div className="flex justify-center items-center text-[10px] text-white/50 pt-3 border-t border-white/10 relative z-10 italic">
                <span>{t.thankYou}</span>
              </div>

            </div>

            {/* Quick Action Toolbar underneath preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handleShareWhatsapp}
                  className="flex-1 py-2.5 px-3 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  style={{ background: activeTheme.bg }}
                >
                  <Share2 size={14} />
                  <span>Share WhatsApp</span>
                </button>
              </div>

              <p className="text-[11px] text-center font-medium text-slate-500 bg-slate-100/70 py-1.5 px-2.5 rounded-xl border border-slate-200/60">
                💡 <strong>Tip:</strong> Share or download receipt now before clicking <em>Save Bill Record</em>. (Saved bills can also be shared anytime from <strong>Billing</strong> page).
              </p>
            </div>

          </div>

        </div>
    </div>
  );
}
