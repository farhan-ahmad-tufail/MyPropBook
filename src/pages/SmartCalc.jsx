import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  User,
  Home,
  IndianRupee,
  Receipt,
  FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';

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
  const [customArrears, setCustomArrears] = useState('');

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
  const [isSaving, setIsSaving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const receiptRef = useRef(null);

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

    // Save bill to database
    try {
      setIsSaving(true);
      await api.createBill(calculatedBill);
      setIsSaved(true);
      if (elecMode === 'submeter') {
        setActiveRoom(prev => prev ? { ...prev, current_meter_reading: currReading } : prev);
        setRooms(prevRooms => prevRooms.map(r => r.id === activeRoom.id ? { ...r, current_meter_reading: currReading } : r));
      }
      toast('Bill generated & saved to Billing Records!', 'success');
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
        backgroundColor: '#2d5a47',
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
      const text = `*RENT & UTILITY INVOICE*\nMonth: ${billMonth} ${billYear}\nTenant: ${tenantName}\nAmount Due: ₹${grandTotalAmount.toLocaleString('en-IN')}\nDue Date: 5th ${billMonth.substring(0,3)}`;

      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#2d5a47' });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Bill_${tenantName}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Rent Utility Bill', text });
          return;
        }
      }
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up active max-w-7xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Sparkles size={13} className="text-emerald-600" />
          <span>BILLING DESK / {billMonth.toUpperCase()} {billYear}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Make the month add up.
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-xl">
          Choose a room, enter its latest meter reading, and BillRoom will prepare a clear bill in seconds.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form Card (Sage Light Modern Theme) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          
          {/* Header Step Indicator */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">01 / 03</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Select a room</h2>
            </div>
            {/* Step Progress Pills */}
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-2 rounded-full bg-[#2d5a47]" />
              <span className="w-8 h-2 rounded-full bg-slate-200" />
              <span className="w-8 h-2 rounded-full bg-slate-200" />
            </div>
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            
            {/* DROPDOWNS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Property Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  PROPERTY
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a47] focus:ring-1 focus:ring-[#2d5a47] transition-all cursor-pointer"
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
                <p className="text-[11px] text-slate-400 mt-1.5 px-1 truncate">
                  {activeProperty?.address || 'Select property location'}
                </p>
              </div>

              {/* Room & Tenant Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  ROOM / TENANT
                </label>
                <select
                  required
                  disabled={!selectedPropertyId}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a47] focus:ring-1 focus:ring-[#2d5a47] transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                  value={selectedRoomId}
                  onChange={e => {
                    setSelectedRoomId(e.target.value);
                    setCurrentReading('');
                    setOtherCharges('');
                    setDirectElecAmount('');
                    setElecMode('submeter');
                    setResult(null);
                    setIsSaved(false);
                  }}
                >
                  <option value="">-- Choose Room --</option>
                  {rooms
                    .filter(r => r.property_id === selectedPropertyId)
                    .map(r => {
                      const activeLease = leases.find(l => l.room_id === r.id && l.is_active);
                      const tenant = activeLease ? tenants.find(t => t.id === activeLease.tenant_id) : null;
                      return (
                        <option key={r.id} value={r.id} disabled={!activeLease}>
                          Room {r.room_number} {tenant ? `· ${tenant.name}` : '(Vacant)'}
                        </option>
                      );
                    })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5 px-1">
                  Billing period · 01–31 {billMonth} {billYear}
                </p>
              </div>

            </div>

            {/* ELECTRICITY MODE TOGGLE */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-700">Electricity billing mode:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                {[
                  { id: 'submeter', label: 'Submeter' },
                  { id: 'direct', label: 'Direct Amount' },
                  { id: 'none', label: 'Included in Rent' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setElecMode(mode.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      elecMode === mode.id
                        ? 'bg-[#2d5a47] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* METER READING INPUT BOX (Identical to reference screenshot) */}
            {elecMode === 'submeter' && (
              <div className="p-5 rounded-3xl bg-[#edf5f1] border border-[#d8e7e0] space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2d5a47]/10 text-[#2d5a47] flex items-center justify-center">
                      <Zap size={13} />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">Meter reading</span>
                      <p className="text-[11px] text-slate-500">Enter the current reading from the room.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 font-bold text-xs">
                    Previous · {prevReading} units
                  </span>
                </div>

                {/* Big input field */}
                <div className="relative bg-white rounded-2xl border border-slate-200/80 p-2 focus-within:border-[#2d5a47] focus-within:ring-1 focus-within:ring-[#2d5a47] transition-all">
                  <input
                    type="number"
                    required
                    disabled={!selectedRoomId}
                    placeholder="e.g. 1482"
                    className="w-full text-3xl font-black text-slate-900 bg-transparent px-3 py-2 outline-none font-mono tracking-tight"
                    value={currentReading}
                    onChange={e => setCurrentReading(e.target.value)}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    units
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold pt-1">
                  <span className="text-slate-500">Calculated usage</span>
                  <div className="flex items-center gap-1">
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[#2d5a47] font-black text-xs">
                      {unitsConsumed} units
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">× ₹{rate}</span>
                  </div>
                </div>
              </div>
            )}

            {elecMode === 'direct' && (
              <div className="p-5 rounded-3xl bg-[#edf5f1] border border-[#d8e7e0] space-y-3">
                <label className="text-xs font-extrabold text-slate-900 block">Direct Electricity Amount (₹)</label>
                <div className="relative bg-white rounded-2xl border border-slate-200/80 p-2">
                  <input
                    type="number"
                    required
                    disabled={!selectedRoomId}
                    placeholder="e.g. 1007"
                    className="w-full text-2xl font-black text-slate-900 bg-transparent px-3 py-1 outline-none font-mono"
                    value={directElecAmount}
                    onChange={e => setDirectElecAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 3 STAT SUMMARY CARDS AT BOTTOM OF FORM */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* Stat 1: Electricity */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2d5a47] flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ELECTRICITY</span>
                  <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    ₹{calculatedElecAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Stat 2: Arrears */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <IndianRupee size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ARREARS</span>
                  <input
                    type="number"
                    disabled={!selectedRoomId}
                    className="w-full text-base sm:text-lg font-black text-slate-900 bg-transparent outline-none border-b border-dashed border-slate-200 focus:border-[#2d5a47]"
                    value={customArrears}
                    onChange={e => setCustomArrears(e.target.value)}
                  />
                </div>
              </div>

              {/* Stat 3: Monthly Rent */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Building size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">MONTHLY RENT</span>
                  <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    ₹{baseRentAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

            </div>

            {/* MONTH & YEAR CONTROLS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">BILLING MONTH</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  value={billMonth}
                  onChange={e => setBillMonth(e.target.value)}
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">BILLING YEAR</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  value={billYear}
                  onChange={e => setBillYear(e.target.value)}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* BOTTOM ACTIONS ROW */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle size={14} />
                <span>How is this calculated?</span>
              </button>

              <button
                type="submit"
                disabled={!selectedRoomId || isSaving}
                className="px-6 py-3 rounded-2xl bg-[#2d5a47] text-white font-bold text-sm hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>{isSaving ? 'Saving...' : 'Save bill'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {showHowItWorks && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-900">Calculation breakdown:</p>
                <p>• <strong>Electricity:</strong> (Current Reading - Previous Reading) × Unit Rate</p>
                <p>• <strong>Total Payable:</strong> Monthly Rent + Electricity + Arrears + Other Charges</p>
              </div>
            )}

          </form>
        </div>

        {/* RIGHT COLUMN: Dark Green Invoice Preview Card (Exact target design) */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          
          <div 
            ref={receiptRef}
            className="bg-[#2d5a47] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden space-y-6 border border-[#234738]"
          >
            {/* Background Decorative Rings */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

            {/* Top header row */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block">INVOICE PREVIEW</span>
                <h3 className="text-3xl font-black tracking-tight mt-1">{billMonth} bill</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                <Receipt size={20} />
              </div>
            </div>

            <div className="h-px bg-white/15 w-full" />

            {/* Billed To Section */}
            <div className="space-y-1 relative z-10">
              <span className="text-[11px] font-medium text-emerald-200/80 block">Billed to</span>
              <h4 className="text-xl font-extrabold text-white">{activeTenant?.name || 'Select a room'}</h4>
              <p className="text-xs text-emerald-100/70">
                {activeProperty?.name || 'Property'} · Room {activeRoom?.room_number || '00'}
              </p>
            </div>

            {/* Itemized charges list */}
            <div className="space-y-3.5 pt-2 relative z-10 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-emerald-100/90 font-medium">Electricity · {unitsConsumed} units</span>
                <span className="font-black tracking-tight">₹{calculatedElecAmount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-emerald-100/90 font-medium">Monthly rent</span>
                <span className="font-black tracking-tight">₹{baseRentAmount.toLocaleString('en-IN')}</span>
              </div>

              {arrearsAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/90 font-medium">Previous balance</span>
                  <span className="font-black tracking-tight">₹{arrearsAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {otherChargesAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/90 font-medium">Other charges</span>
                  <span className="font-black tracking-tight">₹{otherChargesAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/15 w-full" />

            {/* Amount Due Section */}
            <div className="flex justify-between items-end relative z-10 pt-1">
              <div>
                <span className="text-xs font-semibold text-emerald-200/80 block">Amount due</span>
                <div className="text-4xl font-black tracking-tight text-white mt-1">
                  ₹{grandTotalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#2d5a47] font-extrabold text-[11px] tracking-wider uppercase shadow-sm">
                DUE 05 {billMonth.substring(0,3).toUpperCase()}
              </span>
            </div>

            {/* Footer subtext */}
            <div className="flex justify-between items-center text-[10px] text-emerald-200/60 pt-4 border-t border-white/10 relative z-10 font-mono">
              <span>Bill no. BR-{billYear}-0826</span>
              <span>{isSaved ? 'Saved to DB ✓' : 'Live preview'}</span>
            </div>

          </div>

          {/* Quick Action Toolbar underneath preview */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleShareWhatsapp}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Share2 size={15} />
              <span>Share WhatsApp</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
