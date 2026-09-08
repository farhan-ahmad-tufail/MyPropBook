import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calculator,
  RefreshCw,
  Printer,
  AlertTriangle,
  Zap,
  Home,
  User,
  Layers,
  ArrowRight,
  Calendar,
  Download,
  History,
  Save,
  Share2,
  Trash2,
  X,
  Sparkles,
  ChevronDown,
  Search,
  Check,
  PlusCircle,
  IndianRupee,
  Palette,
  Globe,
  Plus,
  Receipt
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast, useConfirm } from '../components/Toast';

const formatFloor = (val) => {
  if (!val) return '';
  const num = parseInt(val, 10);
  if (isNaN(num)) return val;
  if (num === 0) return 'Ground Floor';
  if (num === 1) return '1st Floor';
  if (num === 2) return '2nd Floor';
  if (num === 3) return '3rd Floor';
  return `${num}th Floor`;
};

/* ─────────────────────────────────────────────────────────────────────────
   Bilingual Invoice Translations (English / Natural Hinglish)
───────────────────────────────────────────────────────────────────────────*/
const translations = {
  en: {
    receiptTitle: "RENT RECEIPT",
    tenant: "TENANT",
    rooms: "ROOMS",
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
    oldPendingBalance: "Previous Balance",
    totalPayable: "TOTAL PAYABLE AMOUNT",
    payByDueDate: "Please pay by due date",
    thankYou: "Thank you for your payment.",
    generatedOn: "Generated electronically on"
  },
  hi: {
    receiptTitle: "किराया रसीद",
    tenant: "किरायेदार",
    rooms: "कमरे",
    total: "टोटल",
    rent: "किराया",
    readings: "रीडिंग",
    units: "यूनिट",
    rate: "दर",
    elec: "बिजली",
    cur: "नया",
    pre: "पिछला",
    totalRent: "कुल किराया",
    totalElectricity: "कुल बिजली बिल",
    otherCharges: "अन्य खर्चे",
    currentMonth: "इस महीने का कुल",
    oldPendingBalance: "पिछला बकाया",
    totalPayable: "कुल किराया देना है",
    payByDueDate: "कृपया समय पर भुगतान करें",
    thankYou: "समय पर भुगतान के लिए धन्यवाद।",
    generatedOn: "इलेक्ट्रॉनिक रूप से तैयार:"
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   Standard Default Room Types
───────────────────────────────────────────────────────────────────────────*/
const DEFAULT_ROOM_TYPES = [
  'Single Room',
  '1 BHK',
  '2 BHK',
  'Shop / Commercial'
];

/* ─────────────────────────────────────────────────────────────────────────
   Reusable Custom SaaS Dropdown Component (with optional + Add New Action)
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
  size = 'md',
  onAddNew,
  addNewLabel = '+ Add Custom Type'
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
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const isSmall = size === 'sm';

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
          {IconComponent && <IconComponent size={12} className="text-slate-400" />}
          <span>{label} {required && <span className="text-rose-500">*</span>}</span>
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v); setQuery(''); }}
        className={`w-full flex items-center gap-2 rounded-2xl border text-xs font-semibold text-left transition-all duration-150 ${
          isSmall ? 'px-3 py-2' : 'px-3.5 py-2.5'
        } ${
          disabled
            ? 'bg-slate-50 border-slate-200/60 text-slate-300 cursor-not-allowed'
            : open
            ? 'bg-white border-[#2d5a47] ring-2 ring-[#2d5a47]/10 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <span className={`flex-1 truncate ${selected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {selected ? selected.label : (value || placeholder)}
        </span>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-150 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-[200] bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-300/40 overflow-hidden"
          style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
        >
          {options.length > 5 && (
            <div className="px-2.5 pt-2 pb-1.5 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2d5a47]"
                />
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto py-1 px-1">
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-all duration-100 text-xs ${
                  opt.value === value
                    ? 'bg-[#edf5f1] text-[#2d5a47] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check size={12} className="text-[#2d5a47] flex-shrink-0" />}
              </button>
            ))}
          </div>

          {onAddNew && (
            <div className="p-1 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => { setOpen(false); onAddNew(); }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2d5a47] hover:bg-emerald-100/60 transition-colors cursor-pointer"
              >
                <PlusCircle size={13} />
                <span>{addNewLabel}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuickCalc() {
  const toast = useToast();
  const confirm = useConfirm();
  const currentDate = new Date();

  // Custom Room Types stored in localStorage
  const [customRoomTypes, setCustomRoomTypes] = useState(() => {
    const saved = localStorage.getItem('quickCalc_customRoomTypes');
    return saved ? JSON.parse(saved) : [];
  });

  const allRoomTypes = [...DEFAULT_ROOM_TYPES, ...customRoomTypes];
  const roomTypeOptions = allRoomTypes.map(t => ({ value: t, label: t }));

  const [formData, setFormData] = useState({
    name: '',
    billMonth: currentDate.toLocaleString('default', { month: 'long' }),
    billYear: currentDate.getFullYear().toString(),
    arrears: '',
    otherCharges: ''
  });

  const defaultRoom = {
    floor: '',
    roomType: DEFAULT_ROOM_TYPES[0],
    rent: '',
    prevReading: '',
    currReading: '',
    ratePerUnit: 17,
    elecMode: 'submeter',
    directAmount: ''
  };
  const [rooms, setRooms] = useState(() => [{ ...defaultRoom, id: Date.now() }]);

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const receiptRef = useRef(null);

  // Prevent up/down arrows from changing number inputs
  const blockNativeNumberScroll = (e) => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // State for History & Profiles
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('billHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [profiles, setProfiles] = useState(() => {
    const savedProfiles = localStorage.getItem('tenantProfiles');
    return savedProfiles ? JSON.parse(savedProfiles) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('emerald');

  const themeOptions = {
    emerald: { name: 'BillRoom Green', bg: '#2d5a47', text: 'white', hex: '#2d5a47' },
    navy:    { name: 'Classic Navy',   bg: '#0f172a', text: 'white', hex: '#0f172a' },
    blue:    { name: 'Royal Blue',     bg: '#1e40af', text: 'white', hex: '#1e40af' },
    maroon:  { name: 'Burgundy',       bg: '#881337', text: 'white', hex: '#881337' },
    purple:  { name: 'Deep Purple',    bg: '#581c87', text: 'white', hex: '#581c87' },
    slate:   { name: 'Minimal Black',  bg: '#09090b', text: 'white', hex: '#09090b' }
  };
  const currentTheme = themeOptions[theme] || themeOptions.emerald;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 6 }, (_, i) => (currentDate.getFullYear() - 1 + i).toString());

  const handleAddCustomRoomType = (roomIndex) => {
    const input = window.prompt("Enter new custom Room Type (e.g. 3 BHK, Studio Apartment, Penthouse, PG Bed):");
    if (input && input.trim()) {
      const newType = input.trim();
      if (!allRoomTypes.includes(newType)) {
        const updated = [...customRoomTypes, newType];
        setCustomRoomTypes(updated);
        localStorage.setItem('quickCalc_customRoomTypes', JSON.stringify(updated));
      }
      const newRooms = [...rooms];
      newRooms[roomIndex].roomType = newType;
      setRooms(newRooms);
      toast(`Added "${newType}" room type!`, 'success');
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');

    const arrears = parseFloat(formData.arrears) || 0;
    const other = parseFloat(formData.otherCharges) || 0;

    let totalRent = 0;
    let totalElec = 0;
    let totalUnits = 0;
    let calculatedRooms = [];

    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      const rRent = parseFloat(r.rent) || 0;
      let elecAmount = 0;
      let units = 0;

      if (r.elecMode === 'submeter') {
        const prev = parseFloat(r.prevReading) || 0;
        const curr = parseFloat(r.currReading) || 0;
        const rate = parseFloat(r.ratePerUnit) || 0;

        if (curr < prev && r.currReading !== '') {
          setError(`Current reading cannot be less than previous reading in Room ${i + 1}.`);
          return;
        }
        units = (r.currReading !== '' && curr >= prev) ? (curr - prev) : 0;
        elecAmount = units * rate;
      } else if (r.elecMode === 'direct') {
        elecAmount = parseFloat(r.directAmount) || 0;
      }

      totalRent += rRent;
      totalElec += elecAmount;
      totalUnits += units;

      calculatedRooms.push({
        ...r,
        units,
        elecAmount
      });
    }

    const total = totalRent + totalElec + arrears + other;

    const newBill = {
      ...formData,
      rooms: calculatedRooms,
      totalRent,
      totalElec,
      totalUnits,
      total,
      generatedAt: new Date().toLocaleString()
    };

    setResult(newBill);

    const updatedHistory = [newBill, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('billHistory', JSON.stringify(updatedHistory));
    toast('Quick Bill Receipt generated!', 'success');
  };

  const handleSaveProfile = () => {
    if (!formData.name) return;
    const newProfile = {
      name: formData.name,
      rooms: rooms.map(r => ({ ...r, id: Date.now() + Math.random() }))
    };

    const updatedProfiles = profiles.filter(p => p.name !== formData.name);
    updatedProfiles.push(newProfile);

    setProfiles(updatedProfiles);
    localStorage.setItem('tenantProfiles', JSON.stringify(updatedProfiles));
    toast('Tenant profile saved!', 'success');
  };

  const handleLoadProfileName = (val) => {
    const profile = profiles.find(p => p.name === val);
    if (profile) {
      setFormData(prev => ({ ...prev, name: profile.name }));
      if (profile.rooms && profile.rooms.length > 0) {
        setRooms(profile.rooms.map(r => ({ ...r, id: Date.now() + Math.random() })));
      }
    } else {
      setFormData(prev => ({ ...prev, name: val }));
    }
  };

  const handleDeleteHistory = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem('billHistory', JSON.stringify(updatedHistory));
    toast('Record deleted from history', 'info');
  };

  const handleShareWhatsapp = async () => {
    if (!result || !receiptRef.current) return;
    try {
      const tDict = translations[language] || translations.en;
      const text = `${tDict.receiptTitle}\n${tDict.waMonth || 'Month'}: ${result.billMonth} ${result.billYear}\n${tDict.waTenant || 'Tenant'}: ${result.name || 'Tenant'}\n${tDict.waTotal || 'Total'}: ₹${result.total.toFixed(2)}`;

      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: currentTheme.bg });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Bill_${result.name}_${result.billMonth}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Rent Receipt', text });
          return;
        }
      }
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: currentTheme.bg,
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
      pdf.save(`Bill_${result.name || 'Tenant'}_${result.billMonth}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      toast('Failed to download PDF. Please try again.', 'error');
    }
  };

  const reset = () => {
    setFormData({
      name: '',
      billMonth: currentDate.toLocaleString('default', { month: 'long' }),
      billYear: currentDate.getFullYear().toString(),
      arrears: '',
      otherCharges: ''
    });
    setRooms([{ ...defaultRoom, id: Date.now() }]);
    setResult(null);
    setError('');
  };

  const formatFloor = (floor) => {
    if (!floor) return '';
    const num = parseInt(floor);
    if (isNaN(num)) return floor;
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + "st Floor";
    if (j === 2 && k !== 12) return num + "nd Floor";
    if (j === 3 && k !== 13) return num + "rd Floor";
    return num + "th Floor";
  };

  return (
    <div className="space-y-6 fade-in-up active max-w-5xl mx-auto pb-12">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Sparkles size={12} className="text-emerald-600" />
            <span>QUICK CALCULATOR / MANUAL BILLING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calculator className="text-[#2d5a47]" size={28} />
            <span>Quick Calculator</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer relative"
        >
          <History size={15} className="text-[#2d5a47]" />
          <span>Recent History</span>
          {history.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#2d5a47] text-white text-[10px] font-black flex items-center justify-center">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ── INPUT FORM CARD ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">

        <form onSubmit={handleCalculate} className="space-y-6">

          {/* STEP 1: BILLING MONTH & TENANT NAME */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2d5a47] text-white font-extrabold text-xs flex items-center justify-center">1</span>
              <h2 className="text-sm font-extrabold text-slate-900">Billing Period & Tenant Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Bill Month */}
              <SaasDropdown
                label="Bill Month"
                value={formData.billMonth}
                onChange={(val) => setFormData(prev => ({ ...prev, billMonth: val }))}
                options={months.map(m => ({ value: m, label: m }))}
                icon={Calendar}
              />

              {/* Year */}
              <SaasDropdown
                label="Billing Year"
                value={formData.billYear}
                onChange={(val) => setFormData(prev => ({ ...prev, billYear: val }))}
                options={years.map(y => ({ value: y, label: y }))}
                icon={Calendar}
              />

              {/* Tenant Name Field with Save Profile Pill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <User size={12} className="text-slate-400" /> Tenant Name
                  </label>
                  {formData.name && (
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Save size={10} /> Save Profile
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    list="tenant-profiles-list"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleLoadProfileName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-[#2d5a47] focus:ring-2 focus:ring-[#2d5a47]/10 transition-all"
                  />
                  <datalist id="tenant-profiles-list">
                    {profiles.map((p, i) => (
                      <option key={i} value={p.name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: ROOM DETAILS LOOP */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2d5a47] text-white font-extrabold text-xs flex items-center justify-center">2</span>
                <h2 className="text-sm font-extrabold text-slate-900">Room Details & Electricity Calculation</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'} added
              </span>
            </div>

            {rooms.map((room, index) => (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-[#edf5f1]/60 border border-[#d8e7e0] space-y-4 relative transition-all"
              >
                {/* Room Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#d8e7e0]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#2d5a47] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                      <Home size={13} /> Room {index + 1}
                    </span>
                  </div>

                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRooms(rooms.filter(r => r.id !== room.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Remove this room"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Floor & Room Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                      <Layers size={11} /> Floor
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1"
                      value={room.floor}
                      onChange={e => {
                        const newRooms = [...rooms];
                        newRooms[index].floor = e.target.value;
                        setRooms(newRooms);
                      }}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-[#2d5a47]"
                    />
                  </div>

                  {/* ROOM TYPE DROPDOWN WITH + ADD CUSTOM TYPE ACTION */}
                  <div>
                    <SaasDropdown
                      label="Room Type"
                      value={room.roomType}
                      onChange={(val) => {
                        const newRooms = [...rooms];
                        newRooms[index].roomType = val;
                        setRooms(newRooms);
                      }}
                      options={roomTypeOptions}
                      icon={Home}
                      size="sm"
                      onAddNew={() => handleAddCustomRoomType(index)}
                      addNewLabel="+ Add Room Type"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                      <IndianRupee size={11} /> Base Rent (₹)
                    </label>
                    <input
                      type="number"
                      required
                      onKeyDown={blockNativeNumberScroll}
                      onWheel={(e) => e.target.blur()}
                      placeholder="5000"
                      value={room.rent}
                      onChange={e => {
                        const newRooms = [...rooms];
                        newRooms[index].rent = e.target.value;
                        setRooms(newRooms);
                      }}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs font-black text-slate-900 bg-white outline-none focus:border-[#2d5a47]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                      Rate (₹/Unit)
                    </label>
                    <input
                      type="number"
                      onKeyDown={blockNativeNumberScroll}
                      onWheel={(e) => e.target.blur()}
                      placeholder="17"
                      value={room.ratePerUnit}
                      onChange={e => {
                        const newRooms = [...rooms];
                        newRooms[index].ratePerUnit = e.target.value;
                        setRooms(newRooms);
                      }}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-[#2d5a47]"
                    />
                  </div>
                </div>

                {/* Electricity Mode Selector */}
                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Zap size={14} className="text-[#2d5a47]" /> Electricity billing mode:
                    </span>
                    <div className="flex flex-wrap bg-white p-0.5 rounded-xl gap-0.5 border border-slate-200/80">
                      {[
                        { id: 'submeter', label: 'Submeter' },
                        { id: 'direct', label: 'Direct Amount' },
                        { id: 'none', label: 'Included' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            const newRooms = [...rooms];
                            newRooms[index].elecMode = mode.id;
                            setRooms(newRooms);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex-1 sm:flex-none text-center ${
                            room.elecMode === mode.id
                              ? 'bg-[#2d5a47] text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {room.elecMode === 'submeter' && (
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
                            Previous Reading
                          </label>
                          <input
                            type="number"
                            required
                            onKeyDown={blockNativeNumberScroll}
                            onWheel={(e) => e.target.blur()}
                            placeholder="0000"
                            value={room.prevReading}
                            onChange={e => {
                              const newRooms = [...rooms];
                              newRooms[index].prevReading = e.target.value;
                              setRooms(newRooms);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 font-mono outline-none focus:border-[#2d5a47]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
                            Current Reading
                          </label>
                          <input
                            type="number"
                            required
                            onKeyDown={blockNativeNumberScroll}
                            onWheel={(e) => e.target.blur()}
                            placeholder="0000"
                            value={room.currReading}
                            onChange={e => {
                              const newRooms = [...rooms];
                              newRooms[index].currReading = e.target.value;
                              setRooms(newRooms);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 font-mono outline-none focus:border-[#2d5a47]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-100">
                        <span className="text-slate-500 text-[11px]">Usage breakdown</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#edf5f1] text-[#2d5a47] font-extrabold text-xs">
                          {((parseFloat(room.currReading) || 0) - (parseFloat(room.prevReading) || 0) > 0)
                            ? `${((parseFloat(room.currReading) || 0) - (parseFloat(room.prevReading) || 0)).toFixed(2)} units × ₹${room.ratePerUnit} = ₹${(((parseFloat(room.currReading) || 0) - (parseFloat(room.prevReading) || 0)) * (parseFloat(room.ratePerUnit) || 0)).toFixed(2)}`
                            : '0 units'}
                        </span>
                      </div>
                    </div>
                  )}

                  {room.elecMode === 'direct' && (
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 block">Direct Electricity Bill Amount (₹)</label>
                      <input
                        type="number"
                        required
                        onKeyDown={blockNativeNumberScroll}
                        onWheel={(e) => e.target.blur()}
                        placeholder="e.g. 450"
                        value={room.directAmount}
                        onChange={e => {
                          const newRooms = [...rooms];
                          newRooms[index].directAmount = e.target.value;
                          setRooms(newRooms);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:border-[#2d5a47]"
                      />
                    </div>
                  )}

                  {room.elecMode === 'none' && (
                    <div className="px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-500 font-medium">
                      🚫 Electricity charge is included in the base rent for this room.
                    </div>
                  )}
                </div>

              </div>
            ))}

            {/* ADD ANOTHER ROOM BUTTON */}
            <button
              type="button"
              onClick={() => setRooms([...rooms, { ...defaultRoom, id: Date.now() }])}
              className="w-full py-3.5 border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 text-[#2d5a47] font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Home size={15} />
              <span>Add Another Room +</span>
            </button>
          </div>

          {/* STEP 3: FINANCIAL OVERRIDES (Previous Balance & Other Charges) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
            {/* Previous Balance Field */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
              <label className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                <IndianRupee size={12} className="text-amber-600" /> Previous Balance (₹)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  onKeyDown={blockNativeNumberScroll}
                  onWheel={(e) => e.target.blur()}
                  placeholder="0"
                  value={formData.arrears}
                  onChange={e => setFormData({ ...formData, arrears: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2d5a47]"
                />
              </div>
            </div>

            {/* Other Charges Field */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <PlusCircle size={12} className="text-slate-400" /> Global Other Charges (₹)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  onKeyDown={blockNativeNumberScroll}
                  onWheel={(e) => e.target.blur()}
                  placeholder="0"
                  value={formData.otherCharges}
                  onChange={e => setFormData({ ...formData, otherCharges: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2d5a47]"
                />
              </div>
            </div>
          </div>

          {/* FORM ACTION BUTTONS */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={reset}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              className="px-7 py-3 rounded-2xl bg-[#2d5a47] text-white font-extrabold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Generate Quick Receipt</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </form>
      </div>

      {/* ── GENERATED RECEIPT PREVIEW ── */}
      {result && (
        <div className="space-y-4 fade-in-up active">

          {/* RECEIPT PREVIEW CONTAINER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5 flex flex-col items-center">

            {/* Receipt Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-xl bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
              {/* Language Switch */}
              <div className="flex items-center gap-1">
                <Globe size={13} className="text-slate-500 ml-1" />
                <div className="flex bg-white p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      language === 'en' ? 'bg-[#2d5a47] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      language === 'hi' ? 'bg-[#2d5a47] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Theme Dots */}
              <div className="flex items-center gap-1.5">
                <Palette size={13} className="text-slate-500" />
                {Object.entries(themeOptions).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      theme === key ? 'ring-2 ring-offset-1 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: t.hex }}
                    title={t.name}
                  >
                    {theme === key && <Check size={10} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* RECEIPT PAPER CONTAINER */}
            <div
              ref={receiptRef}
              className="text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-5 border w-full max-w-xl transition-all duration-200"
              style={{
                background: currentTheme.bg,
                borderColor: 'rgba(255,255,255,0.1)'
              }}
            >
              {/* Background Decorative Rings */}
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

              {/* Header Row */}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block">
                    {translations[language].receiptTitle}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight mt-0.5">
                    {result.billMonth} {result.billYear}
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                  <Receipt size={18} />
                </div>
              </div>

              <div className="h-px bg-white/15 w-full" />

              {/* Tenant Details */}
              <div className="space-y-0.5 relative z-10">
                <span className="text-[10px] font-medium text-emerald-200/80 block">
                  {translations[language].tenant}
                </span>
                <h4 className="text-lg font-extrabold text-white">{result.name || 'Tenant Name'}</h4>
              </div>

              {/* Rooms List Itemization */}
              <div className="space-y-3 relative z-10 text-xs">
                {(result.rooms || [result]).map((room, idx) => (
                  <div key={idx} className="bg-black/20 border border-white/15 rounded-2xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center font-bold text-white">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <Home size={15} className="text-white/80 flex-shrink-0" />
                        <span className="break-words leading-snug">{room.roomType || 'Room'} {room.floor && `(${formatFloor(room.floor)})`}</span>
                      </div>
                      <span className="font-mono text-sm font-bold flex-shrink-0 ml-auto">₹{parseFloat(room.rent || 0).toLocaleString('en-IN')}</span>
                    </div>

                    {room.elecMode === 'submeter' && (
                      <div className="pt-1.5 border-t border-white/10 text-[11px] text-white/80 space-y-1">
                        <div className="flex justify-between text-[10px] text-white/70">
                          <span>{translations[language].pre}: <strong className="text-white">{room.prevReading || 0} units</strong></span>
                          <span>{translations[language].cur}: <strong className="text-white">{room.currReading || 0} units</strong></span>
                        </div>
                        <div className="flex justify-between items-center font-mono text-white pt-0.5">
                          <span>Usage: {parseFloat(room.units || 0).toFixed(1)} units × ₹{room.ratePerUnit}</span>
                          <span className="font-bold">₹{parseFloat(room.elecAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    {room.elecMode === 'direct' && (
                      <div className="pt-1.5 border-t border-white/10 flex justify-between text-xs text-white/80">
                        <span>Electricity (Direct)</span>
                        <span className="font-mono font-bold text-white">₹{parseFloat(room.elecAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Totals */}
              <div className="space-y-2 pt-1 relative z-10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/90 font-medium">{translations[language].totalRent}</span>
                  <span className="font-black tracking-tight font-mono">₹{parseFloat(result.totalRent || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/90 font-medium">{translations[language].totalElectricity}</span>
                  <span className="font-black tracking-tight font-mono">₹{parseFloat(result.totalElec || 0).toLocaleString('en-IN')}</span>
                </div>

                {parseFloat(result.otherCharges || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-100/90 font-medium">{translations[language].otherCharges}</span>
                    <span className="font-black tracking-tight font-mono">₹{parseFloat(result.otherCharges).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {parseFloat(result.arrears || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-100/90 font-medium">{translations[language].oldPendingBalance}</span>
                    <span className="font-black tracking-tight font-mono">₹{parseFloat(result.arrears).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/15 w-full" />

              {/* Amount Due Section */}
              <div className="flex justify-between items-end relative z-10 pt-0.5">
                <div>
                  <span className="text-xs font-semibold text-emerald-200/80 block">{translations[language].totalPayable}</span>
                  <div className="text-3xl font-black tracking-tight text-white mt-0.5 font-mono leading-none">
                    ₹{parseFloat(result.total || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#d1fae5',
                    color: '#2d5a47',
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
                  <span style={{ lineHeight: '1' }}>DUE 10 {result.billMonth.substring(0,3).toUpperCase()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-center items-center text-[10px] text-white/50 pt-3 border-t border-white/10 relative z-10 italic">
                <span>{translations[language].thankYou}</span>
              </div>
            </div>

            {/* Quick Action Toolbar underneath preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
              <button
                onClick={handleShareWhatsapp}
                className="py-2.5 px-3 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                style={{ background: currentTheme.bg }}
              >
                <Share2 size={14} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
            </div>



          </div>

        </div>
      )}



      {/* ── RECENT HISTORY SIDE DRAWER ── */}
      {showHistory && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setShowHistory(false)} />

          {/* Drawer Container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-hidden border-l border-slate-200/80 flex flex-col z-10 animate-slide-in-right">

            {/* Premium Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2d5a47] flex items-center justify-center border border-emerald-100/80 shadow-xs">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    Recent Quick Bills
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {history.length} saved receipt{history.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer"
                aria-label="Close history"
              >
                <X size={16} />
              </button>
            </div>

            {/* History Cards List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-slate-50/30">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 py-16">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200/60">
                    <History size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No bill history found</h3>
                  <p className="text-xs text-slate-400 max-w-[220px] mt-1">
                    Calculated receipts will automatically show up here for instant access.
                  </p>
                </div>
              ) : (
                history.map((item, idx) => {
                  const roomCount = item.rooms?.length || 1;
                  const rentAmt = item.totalRent !== undefined ? item.totalRent : (item.rent || 0);
                  const elecAmt = item.totalElec !== undefined ? item.totalElec : (item.elecAmount || 0);

                  return (
                    <div
                      key={idx}
                      onClick={() => { setResult(item); setShowHistory(false); toast(`Loaded ${item.name || 'receipt'} preview`, 'info'); }}
                      className="group relative bg-white hover:bg-emerald-50/30 border border-slate-200/80 hover:border-[#2d5a47]/30 rounded-2xl p-4.5 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md space-y-3"
                    >
                      {/* Top Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 pr-6">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-[#2d5a47] transition-colors">
                              {item.name || 'Walk-in Tenant'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                              <Calendar size={11} className="text-slate-500" /> {item.billMonth} {item.billYear}
                            </span>
                            <span className="bg-emerald-50 text-[#2d5a47] px-2 py-0.5 rounded-lg border border-emerald-100">
                              {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-slate-900 font-mono tracking-tight group-hover:text-[#2d5a47] transition-colors">
                            ₹{parseFloat(item.total || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Quick Delete Hover Action */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteHistory(idx); }}
                          className="absolute top-3.5 right-3.5 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Breakdown Badge Pills */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                        <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">Rent</span>
                          <span className="font-bold text-slate-800 font-mono">₹{parseFloat(rentAmt).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">Electricity</span>
                          <span className="font-bold text-slate-800 font-mono">₹{parseFloat(elecAmt).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Card Action Hint */}
                      <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-[#2d5a47] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Click to view receipt preview</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Clear All Action */}
            {history.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white shadow-lg">
                <button
                  onClick={async () => {
                    const yes = await confirm({
                      title: 'Clear All Quick Bill History',
                      message: 'Are you sure you want to delete all saved quick bills? This action cannot be undone.',
                      confirmText: 'Delete All',
                      type: 'error'
                    });
                    if (yes) {
                      setHistory([]);
                      localStorage.removeItem('billHistory');
                      toast('History cleared', 'info');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all text-xs font-extrabold cursor-pointer"
                >
                  <Trash2 size={14} /> Clear All History
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
