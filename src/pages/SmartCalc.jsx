import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSearchParams } from 'react-router-dom';
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
  Save, 
  Share2, 
  CheckCircle,
  Building
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';

const translations = {
  en: {
    receiptTitle: "RENT & UTILITY BILL",
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
    oldPendingBalance: "Old Pending Balance",
    totalPayable: "TOTAL PAYABLE AMOUNT",
    payByDueDate: "Please pay by due date",
    thankYou: "Thank you for your timely payment.",
    generatedOn: "Generated electronically on"
  },
  hi: {
    receiptTitle: "किराया एवं बिजली बिल",
    tenant: "किरायेदार",
    rooms: "कमरे",
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

export default function SmartCalc() {
  const { user } = useAuth();
  const toast = useToast();
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

  // Dropdown Selection States
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Selected Room Details (Autofilled)
  const [activeTenant, setActiveTenant] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [calculatedArrears, setCalculatedArrears] = useState(0);

  // Form Fields
  const currentDate = new Date();
  const [billMonth, setBillMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [billYear, setBillYear] = useState(currentDate.getFullYear());
  const [currentReading, setCurrentReading] = useState('');
  const [otherCharges, setOtherCharges] = useState('');

  // Electricity billing mode: 'submeter' | 'direct' | 'none'
  const [elecMode, setElecMode] = useState('submeter');
  const [directElecAmount, setDirectElecAmount] = useState('');

  // Result & UI State
  const [result, setResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('default');
  const receiptRef = useRef(null);

  const themeOptions = {
    default: { primary: '#2563eb', bg: '#064e3b', text: '#ffffff', border: '#e2e8f0', hex: '#2563eb', label: 'Dark Blue', icon: '#2563eb' },
    dark: { primary: '#0f172a', bg: '#0f172a', text: '#ffffff', border: '#cbd5e1', hex: '#0f172a', label: 'Black', icon: '#0f172a' },
    indigo: { primary: '#4f46e5', bg: '#312e81', text: '#ffffff', border: '#c7d2fe', hex: '#4f46e5', label: 'Indigo', icon: '#4f46e5' },
    emerald: { primary: '#059669', bg: '#064e3b', text: '#ffffff', border: '#a7f3d0', hex: '#059669', label: 'Emerald', icon: '#059669' }
  };
  const currentTheme = themeOptions[theme] || themeOptions.default;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 1 + i);

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

      // Handle route param roomId redirects
      if (urlRoomId && roomsList.length > 0) {
        const targetRoom = roomsList.find(r => r.id === urlRoomId);
        if (targetRoom) {
          setSelectedPropertyId(targetRoom.property_id);
          setSelectedRoomId(targetRoom.id);
        }
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
      setResult(null);
      setIsSaved(false);
      return;
    }

    const roomObj = rooms.find(r => r.id === selectedRoomId);
    setActiveRoom(roomObj);

    // Find active lease for this room
    const activeLease = leases.find(l => l.room_id === selectedRoomId && l.is_active);
    if (activeLease) {
      const tenantObj = tenants.find(t => t.id === activeLease.tenant_id);
      setActiveTenant(tenantObj);

      // Automatically calculate arrears (remaining balance of Unpaid/Partially Paid bills)
      const roomArrears = bills
        .filter(b => b.room_id === selectedRoomId && b.tenant_id === tenantObj.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
        .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
      setCalculatedArrears(roomArrears);
    } else {
      setActiveTenant(null);
      setCalculatedArrears(0);
    }
    
    // Clear previous input results
    setCurrentReading('');
    setOtherCharges('');
    setDirectElecAmount('');
    setElecMode('submeter');
    setResult(null);
    setIsSaved(false);
  }, [selectedRoomId, rooms, leases, tenants, bills]);

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');
    setIsSaved(false);

    if (!activeRoom || !activeTenant) {
      setError('Please select a room that has an active tenant allocation');
      return;
    }

    const rentAmount = parseFloat(activeRoom.base_rent) || 0;
    const other = parseFloat(otherCharges) || 0;
    let elecAmount = 0;
    let prevReading = 0;
    let currReading = 0;
    let units = 0;
    let rate = 0;

    if (elecMode === 'submeter') {
      prevReading = parseFloat(activeRoom.current_meter_reading) || 0;
      currReading = parseFloat(currentReading);
      rate = parseFloat(activeRoom.rate_per_unit) || 17;

      if (isNaN(currReading)) {
        setError('Please input a valid current meter reading');
        return;
      }
      if (currReading < prevReading) {
        setError(`Current meter reading cannot be less than the previous reading (${prevReading} units).`);
        return;
      }
      units = currReading - prevReading;
      elecAmount = units * rate;
    } else if (elecMode === 'direct') {
      const directAmt = parseFloat(directElecAmount);
      if (isNaN(directAmt) || directAmt < 0) {
        setError('Please enter a valid electricity bill amount');
        return;
      }
      elecAmount = directAmt;
    }
    // elecMode === 'none' → elecAmount stays 0

    const total = elecAmount + rentAmount + calculatedArrears + other;

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
      units_consumed: units,
      rate_per_unit: rate,
      elec_amount: elecAmount,
      rent_amount: rentAmount,
      arrears: calculatedArrears,
      other_charges: other,
      total_payable: total,
      payment_status: 'Unpaid'
    };

    setResult(calculatedBill);
  };

  const handleSaveBill = async () => {
    if (!result) return;
    setError('');
    
    try {
      await api.createBill(result);
      setIsSaved(true);
      
      // Reload calculations data to update previous reading values and totals in cache
      await loadAllData();
      
      toast('Bill successfully saved to the database history!', 'success');
    } catch (err) {
      console.error('Error saving bill:', err);
      setError('Failed to save bill to database.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!result || !receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
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
      pdf.save(`Bill_${result.tenant_name}_${result.bill_month}.pdf`);
    } catch (err) {
      console.error("PDF Fail", err);
    }
  };

  const handleShareWhatsapp = async () => {
    if (!result || !receiptRef.current) return;

    try {
      const text = `*RENT RECEIPT*\nMonth: ${result.bill_month} ${result.bill_year}\nTenant: ${result.tenant_name}\nTotal: ₹${result.total_payable.toFixed(2)}`;

      // Web share api for mobile, otherwise standard WhatsApp redirect link
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `Bill_${result.tenant_name}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Rent Utility Bill',
          text: text
        });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatFloor = (floor) => {
    if (!floor) return '';
    const num = parseInt(floor);
    if (isNaN(num)) return floor;
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return num + "st Floor";
    if (j === 2 && k !== 12) return num + "nd Floor";
    if (j === 3 && k !== 13) return num + "rd Floor";
    return num + "th Floor";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Smart Bill Calculator</h1>
        <p className="text-slate-400 mt-1 text-sm">Select a property and room to dynamically compute tenant bills.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Selector Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Input Details Panel */}
        <div className="lg:col-span-6 card glass-card overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Calculator size={18} className="text-blue-500" />
              <span>Enter Readings</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4">
              
              {/* Properties dropdown selector */}
              <div className="form-group">
                <label className="input-label">Property Location</label>
                <select
                  required
                  className="form-input bg-slate-900 border-slate-800"
                  value={selectedPropertyId}
                  onChange={e => {
                    setSelectedPropertyId(e.target.value);
                    setSelectedRoomId('');
                  }}
                >
                  <option value="">-- Choose Property --</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Room selector */}
              <div className="form-group">
                <label className="input-label">Select Room Number</label>
                <select
                  required
                  disabled={!selectedPropertyId}
                  className="form-input bg-slate-900 border-slate-800"
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                >
                  <option value="">-- Choose Room --</option>
                  {rooms
                    .filter(r => r.property_id === selectedPropertyId)
                    .map(r => {
                      const hasLease = leases.some(l => l.room_id === r.id && l.is_active);
                      return (
                        <option key={r.id} value={r.id} disabled={!hasLease}>
                          Room {r.room_number} {!hasLease ? '(Vacant)' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Dynamic Autofilled Card */}
              {activeRoom && activeTenant && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} className="text-blue-400" />
                      Active Tenant
                    </span>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Home size={13} className="text-blue-400" />
                      Room Details
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-slate-200">{activeTenant.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activeTenant.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-200">Room {activeRoom.room_number}</p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{formatFloor(activeRoom.floor)} • {activeRoom.room_type}</p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Base Rent</span>
                      <p className="font-bold text-slate-300 mt-0.5">₹{activeRoom.base_rent}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Previous Meter</span>
                      <p className="font-bold text-blue-400 mt-0.5 font-mono">{activeRoom.current_meter_reading} u</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Pending Balance</span>
                      <p className={`font-bold mt-0.5 ${calculatedArrears > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        ₹{calculatedArrears}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Electricity Billing Mode Toggle */}
              <div className="form-group">
                <label className="input-label flex items-center gap-1.5"><Zap size={13} className="text-yellow-400" /> Electricity Billing Mode</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {[
                    { id: 'submeter', icon: '⚡', label: 'Submeter' },
                    { id: 'direct',   icon: '📄', label: 'Direct Amount' },
                    { id: 'none',     icon: '🚫', label: 'Not Included' },
                  ].map(({ id, icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      disabled={!selectedRoomId}
                      onClick={() => setElecMode(id)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                        elecMode === id
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Electricity Input — conditional on mode */}
              {elecMode === 'submeter' && (
                <div className="form-group">
                  <label className="input-label">Current Meter Reading</label>
                  <input
                    type="number"
                    required
                    disabled={!selectedRoomId}
                    placeholder="e.g. 500"
                    className="form-input bg-slate-950 font-mono"
                    value={currentReading}
                    onChange={e => setCurrentReading(e.target.value)}
                  />
                  {activeRoom && (
                    <p className="text-xs text-slate-500 mt-1">Previous reading: <span className="font-mono text-blue-400">{activeRoom.current_meter_reading} units</span></p>
                  )}
                </div>
              )}

              {elecMode === 'direct' && (
                <div className="form-group">
                  <label className="input-label">Electricity Bill Amount (₹)</label>
                  <input
                    type="number"
                    required
                    disabled={!selectedRoomId}
                    placeholder="e.g. 450"
                    className="form-input bg-slate-950"
                    value={directElecAmount}
                    onChange={e => setDirectElecAmount(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter the amount from your electricity provider's bill directly.</p>
                </div>
              )}

              {elecMode === 'none' && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-lg">🚫</span>
                  <span className="text-xs text-slate-400">No electricity charge — already included in the monthly rent.</span>
                </div>
              )}

              {/* Other Charges */}
              <div className="form-group">
                <label className="input-label">Other charges / Fees (₹)</label>
                <input
                  type="number"
                  disabled={!selectedRoomId}
                  placeholder="e.g. 100"
                  className="form-input bg-slate-950"
                  value={otherCharges}
                  onChange={e => setOtherCharges(e.target.value)}
                />
              </div>

              {/* Month Selector dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="input-label">Billing Month</label>
                  <select
                    className="form-input bg-slate-950"
                    value={billMonth}
                    onChange={e => setBillMonth(e.target.value)}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Billing Year</label>
                  <select
                    className="form-input bg-slate-950"
                    value={billYear}
                    onChange={e => setBillYear(e.target.value)}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={!selectedRoomId}
                  className="w-full btn btn-primary py-3 rounded-xl justify-center text-base shadow-glow flex items-center gap-2"
                >
                  Generate Monthly Bill
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Pane: Live Receipt Preview */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="card glass-card overflow-hidden">
                {/* Actions row */}
                <div className="card-header w-full">
                  <h2 className="text-sm font-bold text-slate-200">Receipt Generated</h2>
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded">
                      <Printer size={14} />
                    </button>
                    <button onClick={handleDownloadPDF} className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded">
                      <Download size={14} />
                    </button>
                    <button onClick={handleShareWhatsapp} className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Print Paper Receipt Visual */}
                <div className="p-6 bg-slate-900/10 flex flex-col items-center bg-pattern">
                  {/* Settings Row: Language & Theme */}
                  <div className="mb-5 flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                    <div className="flex bg-slate-800/80 p-1 rounded-xl flex-1 border border-slate-700/50">
                      <button
                        type="button"
                        className={`flex-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        onClick={() => setLanguage('en')}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        className={`flex-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${language === 'hi' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        onClick={() => setLanguage('hi')}
                      >
                        हिंदी
                      </button>
                    </div>
                    <div className="flex bg-slate-800/80 p-1 rounded-xl flex-1 justify-around items-center px-3 border border-slate-700/50">
                      {Object.entries(themeOptions).map(([key, t]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTheme(key)}
                          className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${theme === key ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
                          style={{ backgroundColor: t.hex }}
                          title={`Theme: ${t.label}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div ref={receiptRef} className="receipt-paper w-full max-w-lg" style={{ padding: '30px' }}>
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold uppercase tracking-wider text-slate-800">{translations[language].receiptTitle}</div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">{result.bill_month} {result.bill_year}</div>
                      <div style={{ borderBottom: '2px solid #cbd5e1', margin: '15px auto', width: '100%' }}></div>
                    </div>

                    {/* Tenant details row */}
                    <div className="flex justify-between items-start gap-4 mb-6 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{translations[language].tenant}</div>
                        <div className="text-xl font-bold text-slate-900 leading-tight">{result.tenant_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ROOM</div>
                        <div className="text-base font-bold text-slate-800">Room {result.room_number}</div>
                        <span className="text-[10px] text-slate-500 capitalize">{formatFloor(result.floor)}</span>
                      </div>
                    </div>

                    {/* Room details box matching QuickCalc */}
                    <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div className="flex justify-between items-center py-2 px-4 bg-slate-50 border-b border-slate-200">
                        <div className="font-bold text-slate-800 flex items-center gap-2 text-xs">
                          <Home size={14} color={currentTheme.icon} /> Room {result.room_number} <span className="text-[10px] text-slate-500 font-normal capitalize">({formatFloor(result.floor)})</span>
                        </div>
                      </div>
                      <div className="p-4 pt-3">
                        {result.elec_mode === 'submeter' ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', fontSize: '0.85rem', width: '100%' }}>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].readings}</div>
                              <div className="text-xs text-slate-600 mb-0.5">{translations[language].cur}: <span className="font-mono font-bold text-slate-800">{result.current_reading}</span></div>
                              <div className="text-xs text-slate-600">{translations[language].pre}: <span className="font-mono font-bold text-slate-800">{result.previous_reading}</span></div>
                            </div>
                            <div className="sm:text-center">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].units}</div>
                              <div className="font-mono font-bold text-slate-800 mt-2">{parseFloat(result.units_consumed || 0).toFixed(2)}</div>
                            </div>
                            <div className="sm:text-center">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].rate}</div>
                              <div className="font-mono text-slate-600 text-xs mt-2">₹{result.rate_per_unit}</div>
                            </div>
                            <div className="sm:text-center">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].elec}</div>
                              <div className="font-mono font-bold text-slate-800 mt-2">₹{parseFloat(result.elec_amount || 0).toFixed(2)}</div>
                            </div>
                            <div className="sm:text-right">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].rent}</div>
                              <div className="font-mono font-bold text-slate-800 mt-2 text-sm">₹{parseFloat(result.rent_amount || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        ) : result.elec_mode === 'direct' ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', fontSize: '0.85rem', width: '100%' }}>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">ELECTRICITY</div>
                              <div className="text-xs text-slate-500 italic">Direct bill amount</div>
                              <div className="font-mono font-bold text-slate-800 mt-1">₹{parseFloat(result.elec_amount || 0).toFixed(2)}</div>
                            </div>
                            <div className="sm:text-right">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].rent}</div>
                              <div className="font-mono font-bold text-slate-800 mt-2 text-sm">₹{parseFloat(result.rent_amount || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', fontSize: '0.85rem', width: '100%' }}>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">ELECTRICITY</div>
                              <div className="text-xs text-slate-400 italic">Included in rent</div>
                            </div>
                            <div className="sm:text-right">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translations[language].rent}</div>
                              <div className="font-mono font-bold text-slate-800 mt-2 text-sm">₹{parseFloat(result.rent_amount || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main Summary Box */}
                    <div className="space-y-2.5 mb-6 bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium text-sm">{translations[language].totalRent}</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">₹{parseFloat(result.rent_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium text-sm">{translations[language].totalElectricity}</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">₹{parseFloat(result.elec_amount || 0).toFixed(2)}</span>
                      </div>
                      {result.other_charges > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-medium text-sm">{translations[language].otherCharges}</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">₹{parseFloat(result.other_charges || 0).toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ borderBottom: '2px dashed #cbd5e1', margin: '12px 0' }}></div>

                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-slate-900">{translations[language].currentMonth}</span>
                        <span className="text-base font-bold text-slate-900">
                          ₹{(parseFloat(result.rent_amount || 0) + parseFloat(result.elec_amount || 0) + parseFloat(result.other_charges || 0)).toFixed(2)}
                        </span>
                      </div>

                      {result.arrears > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-medium text-base">{translations[language].oldPendingBalance}</span>
                          <span className="font-mono font-bold text-slate-800 text-base">₹{parseFloat(result.arrears).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Grand Total Green/Theme Banner */}
                    <div style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', itemsCenter: 'center', gap: '0.75rem', marginTop: '1rem', transition: 'background-color 0.3s' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{translations[language].totalPayable}</span>
                        <span style={{ fontSize: '0.70rem', color: '#cbd5e1', marginTop: '2px' }}>{translations[language].payByDueDate}</span>
                      </div>
                      <div style={{ fontSize: '1.85rem', fontWeight: 'bold', letterSpacing: '-0.03em', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                        ₹{result.total_payable.toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 text-center text-slate-400 text-xs">
                      <p>{translations[language].thankYou}</p>
                      <p className="mt-1">{translations[language].generatedOn} {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save/Submit Button to write to Database */}
              <div className="card glass-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">
                    {isSaved ? 'Invoice Saved Successfully' : 'Finalize & Record Monthly Invoice'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isSaved ? 'Bill has been recorded in your databases.' : 'Click to save bill data, update room meter levels, and commit statistics.'}
                  </p>
                </div>
                <button
                  onClick={handleSaveBill}
                  disabled={isSaved}
                  className={`btn w-full sm:w-auto py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 ${
                    isSaved ? 'bg-emerald-600 text-white cursor-default' : 'btn-primary shadow-glow'
                  }`}
                >
                  {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                  <span>{isSaved ? 'Recorded' : 'Save Invoice'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <Building size={48} className="text-slate-700 mb-4" />
              <h3 className="font-semibold text-slate-400">Invoice Visualizer</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">Provide current meter readings and generate an invoice preview. The PDF download and WhatsApp options will load here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
