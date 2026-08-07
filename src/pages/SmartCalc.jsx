import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  // Result & UI State
  const [result, setResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('darkBlue');
  const receiptRef = useRef(null);

  const themeOptions = {
    darkBlue: { bg: '#0f172a', text: 'white', icon: '#3b82f6', hex: '#0f172a' },
    black: { bg: '#171717', text: 'white', icon: '#404040', hex: '#171717' },
    indigo: { bg: '#4338ca', text: 'white', icon: '#6366f1', hex: '#4338ca' },
    emerald: { bg: '#065f46', text: 'white', icon: '#10b981', hex: '#065f46' }
  };
  const currentTheme = themeOptions[theme] || themeOptions.darkBlue;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 1 + i);

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
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
  };

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

      // Automatically calculate arrears (sum of total_payable of Unpaid/Partially Paid bills)
      const roomArrears = bills
        .filter(b => b.room_id === selectedRoomId && b.tenant_id === tenantObj.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
        .reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);
      setCalculatedArrears(roomArrears);
    } else {
      setActiveTenant(null);
      setCalculatedArrears(0);
    }
    
    // Clear previous input results
    setCurrentReading('');
    setOtherCharges('');
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

    const prevReading = parseFloat(activeRoom.current_meter_reading) || 0;
    const currReading = parseFloat(currentReading);
    const rate = parseFloat(activeRoom.rate_per_unit) || 17;
    const other = parseFloat(otherCharges) || 0;

    if (isNaN(currReading)) {
      setError('Please input a valid current meter reading');
      return;
    }

    if (currReading < prevReading) {
      setError(`Current meter reading cannot be less than the previous reading (${prevReading} units).`);
      return;
    }

    const units = currReading - prevReading;
    const elecAmount = units * rate;
    const rentAmount = parseFloat(activeRoom.base_rent) || 0;
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
      previous_reading: prevReading,
      current_reading: currReading,
      units_consumed: units,
      rate_per_unit: rate,
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
      
      alert('Bill successfully saved to the database history!');
    } catch (err) {
      console.error(err);
      setError('Failed to save bill record');
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
      const text = `*RENT RECEIPT*\nMonth: ${result.bill_month} ${result.bill_year}\nRoom: ${result.room_number} (${result.floor || 'G'} floor)\nTenant: ${result.tenant_name}\nRent: ₹${result.rent_amount}\nElectricity: ${result.units_consumed.toFixed(2)} units (Pre: ${result.previous_reading} -> Cur: ${result.current_reading}) @ ₹${result.rate_per_unit}/u = ₹${(result.units_consumed * result.rate_per_unit).toFixed(2)}\nArrears: ₹${result.arrears}\nOther Charges: ₹${result.other_charges}\n*Total Payable: ₹${result.total_payable.toFixed(2)}*\n\nPlease make your payment as soon as possible. Thank you!`;

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
        <h1 className="text-3xl font-extrabold text-slate-100">Smart Bill Calculator</h1>
        <p className="text-slate-400 mt-1">Select a property and room to dynamically compute tenant bills.</p>
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

              {/* Reading Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="input-label">Current Meter Reading</label>
                  <input
                    type="number"
                    required
                    disabled={!selectedRoomId}
                    placeholder="e.g. 500"
                    className="form-input bg-slate-950"
                    value={currentReading}
                    onChange={e => setCurrentReading(e.target.value)}
                  />
                </div>

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
                <div className="p-6 bg-slate-900/10 flex justify-center bg-pattern">
                  <div ref={receiptRef} className="receipt-paper w-full max-w-lg" style={{ padding: '30px' }}>
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold uppercase tracking-wider text-slate-800">{translations[language].receiptTitle}</div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">{result.bill_month} {result.bill_year}</div>
                      <div style={{ borderBottom: '2px solid #cbd5e1', margin: '15px auto', width: '100%' }}></div>
                    </div>

                    <div className="flex justify-between items-start gap-4 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{translations[language].tenant}</div>
                        <div className="text-lg font-bold text-slate-900 leading-tight">{result.tenant_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ROOM</div>
                        <div className="text-base font-bold text-slate-800">Room {result.room_number}</div>
                        <span className="text-[10px] text-slate-500 capitalize">{formatFloor(result.floor)}</span>
                      </div>
                    </div>

                    {/* Rent details breakdown */}
                    <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div className="p-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          <span>Details</span>
                          <span>Value / Units</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Base Monthly Rent:</span>
                            <span className="font-semibold text-slate-800">₹{result.rent_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Electricity Readings:</span>
                            <span className="font-semibold text-slate-800">{result.current_reading} - {result.previous_reading}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Units Consumed:</span>
                            <span className="font-semibold text-slate-800">{result.units_consumed.toFixed(2)} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utility Rate Per Unit:</span>
                            <span className="font-semibold text-slate-800">₹{result.rate_per_unit}/unit</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Electricity Charges:</span>
                            <span className="font-bold text-slate-950">₹{(result.units_consumed * result.rate_per_unit).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Totals box */}
                    <div className="space-y-2 mb-6 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold">{translations[language].totalRent}</span>
                        <span className="font-semibold text-slate-800">₹{result.rent_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold">{translations[language].totalElectricity}</span>
                        <span className="font-semibold text-slate-800">₹{(result.units_consumed * result.rate_per_unit).toFixed(2)}</span>
                      </div>
                      {result.other_charges > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-semibold">{translations[language].otherCharges}</span>
                          <span className="font-semibold text-slate-800">₹{result.other_charges.toFixed(2)}</span>
                        </div>
                      )}
                      {result.arrears > 0 && (
                        <div className="flex justify-between items-center text-xs text-red-500">
                          <span className="font-semibold">{translations[language].oldPendingBalance}</span>
                          <span className="font-bold">₹{result.arrears.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }}></div>
                      
                      <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                        <span>{translations[language].totalPayable}</span>
                        <span className="text-base text-blue-600">₹{result.total_payable.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 font-medium">
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
