import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Receipt, 
  DollarSign, 
  Eye, 
  ShieldAlert, 
  Check, 
  X, 
  Filter, 
  Printer, 
  Download, 
  Share2,
  History,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search,
  Zap,
  ArrowUpRight,
  Gauge,
  Clock,
  CheckCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';
import { formatINR, formatINRShort } from '../utils/formatters';
import BillReceiptModal from '../components/BillReceiptModal';
import ReminderModal from '../components/ReminderModal';
import { MessageSquare, BellRing } from 'lucide-react';

export default function Billing() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Database lists
  const [bills, setBills] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI & Search Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [selectedBill, setSelectedBill] = useState(null);

  // Payment Modal & History state
  const [showPayModal, setShowPayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedReminderBill, setSelectedReminderBill] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [billPayments, setBillPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const receiptRef = useRef(null);

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [billsList, tenantsList, roomsList, leasesList, propsList] = await Promise.all([
        api.getBills(ownerId),
        api.getTenants(ownerId),
        api.getAllRooms(ownerId),
        api.getLeases ? api.getLeases(ownerId) : Promise.resolve([]),
        api.getProperties ? api.getProperties(ownerId) : Promise.resolve([])
      ]);

      setBills(billsList || []);
      setTenants(tenantsList || []);
      setRooms(roomsList || []);
      setLeases(leasesList || []);
      setProperties(propsList || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch billing history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Dropdown list options
  const availableMonths = useMemo(() => {
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const presentMonths = Array.from(new Set(bills.map(b => b.bill_month).filter(Boolean)));
    return allMonths.filter(m => presentMonths.includes(m));
  }, [bills]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(bills.map(b => (b.bill_year || '').toString()).filter(Boolean)));
    return years.sort((a, b) => b - a);
  }, [bills]);

  // Helper resolvers for tenant & room names
  const getTenantName = useCallback((billOrId) => {
    if (!billOrId) return 'Unknown Tenant';
    if (typeof billOrId === 'object') {
      if (billOrId.tenant_name) return billOrId.tenant_name;
      let t = tenants.find(ten => String(ten.id) === String(billOrId.tenant_id));
      if (t) return t.name;
      if (billOrId.room_id) {
        const lease = leases.find(l => String(l.room_id) === String(billOrId.room_id));
        if (lease) {
          t = tenants.find(ten => String(ten.id) === String(lease.tenant_id));
          if (t) return t.name;
        }
      }
      return 'Unknown Tenant';
    }

    const tenantIdStr = String(billOrId);
    let t = tenants.find(ten => String(ten.id) === tenantIdStr);
    if (t) return t.name;

    const bMatch = bills.find(b => String(b.tenant_id) === tenantIdStr && b.tenant_name);
    if (bMatch) return bMatch.tenant_name;

    return 'Unknown Tenant';
  }, [tenants, leases, bills]);

  const getRoomInfo = useCallback((roomId) => {
    const r = rooms.find(room => room.id === roomId);
    if (!r) return { number: '?', propName: '' };
    const p = properties.find(prop => prop.id === r.property_id);
    return { number: r.room_number, propName: p ? p.name : '' };
  }, [rooms, properties]);

  // Filtered bills list
  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const matchStatus = statusFilter === 'All' || b.payment_status === statusFilter;
      const matchMonth = monthFilter === 'All' || b.bill_month === monthFilter;
      const matchYear = yearFilter === 'All' || String(b.bill_year) === String(yearFilter);

      let matchSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const tenantName = getTenantName(b).toLowerCase();
        const roomObj = rooms.find(r => r.id === b.room_id);
        const roomNum = roomObj ? String(roomObj.room_number).toLowerCase() : '';
        matchSearch = tenantName.includes(query) || roomNum.includes(query);
      }

      return matchStatus && matchMonth && matchYear && matchSearch;
    });
  }, [bills, statusFilter, monthFilter, yearFilter, searchQuery, getTenantName, rooms]);

  // Live Aggregate KPI Metrics (Computed 100% dynamically from bills data)
  const kpiStats = useMemo(() => {
    const totalBilled = bills.reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);
    const totalCollected = bills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
    const totalOutstanding = Math.max(0, totalBilled - totalCollected);
    
    const paidCount = bills.filter(b => b.payment_status === 'Paid').length;
    const unpaidCount = bills.filter(b => b.payment_status === 'Unpaid').length;
    const totalInvoices = bills.length;

    const healthRate = totalBilled > 0 ? Math.min(100, Math.round((totalCollected / totalBilled) * 100)) : 0;

    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      paidCount,
      unpaidCount,
      totalInvoices,
      healthRate
    };
  }, [bills]);

  // Payment Actions
  const handleOpenPayModal = async (bill) => {
    setSelectedBill(bill);
    const total = parseFloat(bill.total_payable || 0);
    const paid = parseFloat(bill.amount_paid || 0);
    const remaining = total - paid;
    setPayAmount(remaining > 0 ? remaining.toString() : '0');
    setPayMethod('UPI');
    setBillPayments([]);
    setLoadingPayments(true);
    
    try {
      const list = await api.getPayments(bill.id);
      setBillPayments(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
    
    setShowPayModal(true);
  };

  const handleClosePayModal = () => {
    setShowPayModal(false);
    setSelectedBill(null);
    setBillPayments([]);
  };

  const handleOpenHistoryModal = async (bill) => {
    setSelectedBill(bill);
    setShowHistoryModal(true);
    setShowPayModal(false);

    try {
      setLoadingPayments(true);
      const payments = await api.getBillPayments(bill.id);
      setBillPayments(payments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast('Failed to load payment history', 'error');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleOpenReminderModal = (bill) => {
    setSelectedReminderBill(bill);
    setShowReminderModal(true);
  };

  const handleCloseReminderModal = () => {
    setShowReminderModal(false);
    setSelectedReminderBill(null);
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedBill(null);
    setBillPayments([]);
  };

  const handleOpenViewModal = async (bill) => {
    setSelectedBill(bill);
    try {
      const list = await api.getPayments(bill.id);
      setBillPayments(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseViewModal = () => {
    setSelectedBill(null);
    setBillPayments([]);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !payAmount) return;
    setError('');

    try {
      await api.recordPayment(selectedBill.id, parseFloat(payAmount), payMethod);
      setShowPayModal(false);
      setSelectedBill(null);
      setBillPayments([]);
      await loadBillingData();
      toast('Payment successfully recorded!', 'success');
    } catch (err) {
      console.error(err);
      setError('Failed to record payment');
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedBill || !receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill_${getTenantName(selectedBill)}_${selectedBill.bill_month}.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!selectedBill || !receiptRef.current) return;

    try {
      const tenantName = getTenantName(selectedBill);
      const paid = parseFloat(selectedBill.amount_paid || 0);
      const total = parseFloat(selectedBill.total_payable || 0);
      const due = total - paid;
      const text = `*RENT RECEIPT*\nMonth: ${selectedBill.bill_month} ${selectedBill.bill_year}\nTenant: ${tenantName}\nTotal Payable: ₹${total.toFixed(2)}\nPaid: ₹${paid.toFixed(2)}\nRemaining Balance: ₹${due > 0 ? due.toFixed(2) : '0.00'}`;

      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `Bill_${tenantName}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice Receipt',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active max-w-7xl mx-auto pb-12">
      
      {/* ── HERO HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              BILLING WORKSPACE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Billing &amp; invoices.
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review collections, settle balances, and keep every receipt in one place.
          </p>
        </div>

        <button
          onClick={() => navigate('/create-bill')}
          className="px-5 py-3 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Zap size={14} fill="currentColor" />
          <span>Create smart bill</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── TOP 4 DYNAMIC KPI CARDS (Real Database Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Collections Health */}
        <div className="bg-[#edf5f1] p-5 rounded-3xl border border-[#d8e7e0] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#2d5a47] uppercase tracking-widest">COLLECTIONS HEALTH</span>
            <div className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-sm">
              <Gauge size={15} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{kpiStats.healthRate}%</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-[#2d5a47] h-full rounded-full transition-all duration-500"
                style={{ width: `${kpiStats.healthRate}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 font-medium mt-2">
              {formatINR(kpiStats.totalCollected)} collected overall
            </p>
          </div>
        </div>

        {/* KPI 2: Total Billed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL BILLED</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatINR(kpiStats.totalBilled)}
            </div>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              {kpiStats.totalInvoices} invoice{kpiStats.totalInvoices !== 1 ? 's' : ''} generated
            </span>
          </div>
        </div>

        {/* KPI 3: Outstanding */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">OUTSTANDING</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatINR(kpiStats.totalOutstanding)}
            </div>
            <span className="text-xs text-amber-600 font-semibold block mt-1">
              {kpiStats.unpaidCount} invoice{kpiStats.unpaidCount !== 1 ? 's' : ''} need attention
            </span>
          </div>
        </div>

        {/* KPI 4: Paid Invoices */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PAID INVOICES</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {kpiStats.paidCount} of {kpiStats.totalInvoices}
            </div>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              {formatINR(kpiStats.totalCollected)} settled
            </span>
          </div>
        </div>

      </div>

      {/* ── INVOICE LEDGER TABLE CARD ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        
        {/* Table Header & Controls Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Invoice ledger</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wider">LIVE</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">All billing records and payment history</p>
          </div>

          {/* Controls: Search, Month, Filter */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenant or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl outline-none focus:border-[#2d5a47]"
              />
            </div>

            {/* Month Dropdown Selector */}
            <select
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl outline-none cursor-pointer"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
            >
              <option value="All">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Year Dropdown Selector */}
            {availableYears.length > 0 && (
              <select
                className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl outline-none cursor-pointer"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
              >
                <option value="All">All Years</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Status Tabs Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
          {[
            { id: 'All', label: 'All records' },
            { id: 'Paid', label: 'Paid' },
            { id: 'Partially Paid', label: 'Partially paid' },
            { id: 'Unpaid', label: 'Unpaid', badge: kpiStats.unpaidCount > 0 ? kpiStats.unpaidCount : null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#2d5a47] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Table */}
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No billing records match the selected filter or search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="px-4 py-3.5">TENANT / ROOM</th>
                  <th className="px-4 py-3.5">BILLING MONTH</th>
                  <th className="px-4 py-3.5">PAYABLE AMOUNT</th>
                  <th className="px-4 py-3.5">PAID / REMAINING</th>
                  <th className="px-4 py-3.5">STATUS</th>
                  <th className="px-4 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {filteredBills.map(bill => {
                  const tenantName = getTenantName(bill);
                  const { number: roomNum, propName } = getRoomInfo(bill.room_id);
                  const total = parseFloat(bill.total_payable || 0);
                  const paid = parseFloat(bill.amount_paid || 0);
                  const remaining = total - paid;

                  // Initials badge
                  const initials = tenantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TN';
                  const isPaid = bill.payment_status === 'Paid';
                  const isPartial = bill.payment_status === 'Partially Paid';

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Tenant & Room */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                            isPaid ? 'bg-emerald-50 text-emerald-700' : isPartial ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-xs">{tenantName}</p>
                            <p className="text-[11px] text-slate-400 font-normal">
                              Room {roomNum} {propName ? `· ${propName}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Month */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-700">{bill.bill_month} {bill.bill_year}</p>
                        <p className="text-[10px] text-slate-400">
                          {bill.created_at ? new Date(bill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Bill record'}
                        </p>
                      </td>

                      {/* Payable Amount */}
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        {formatINR(total)}
                      </td>

                      {/* Paid / Remaining */}
                      <td className="py-3.5 px-4">
                        <p className="text-emerald-700 font-bold">Paid: {formatINR(paid)}</p>
                        {remaining > 0 ? (
                          <p className="text-amber-700 font-semibold text-[11px]">Due: {formatINR(remaining)}</p>
                        ) : (
                          <p className="text-slate-400 text-[11px]">Fully paid</p>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isPaid ? 'bg-emerald-50 text-emerald-700' : isPartial ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {bill.payment_status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenViewModal(bill)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Receipt"
                          >
                            <Eye size={15} />
                          </button>
                          
                          <button
                            onClick={() => handleOpenHistoryModal(bill)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Payment History"
                          >
                            <History size={15} />
                          </button>

                          {remaining > 0 && (
                            <button
                              onClick={() => handleOpenReminderModal(bill)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Send WhatsApp Reminder (English/Hindi)"
                            >
                              <MessageSquare size={15} />
                            </button>
                          )}

                          {bill.payment_status !== 'Paid' && (
                            <button
                              onClick={() => handleOpenPayModal(bill)}
                              className="px-3 py-1 rounded-xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all cursor-pointer shadow-sm"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── MODALS ── */}

      {/* 1. Bill View Receipt Modal — Premium themed receipt */}
      <BillReceiptModal
        isOpen={!!(selectedBill && !showPayModal && !showHistoryModal)}
        onClose={handleCloseViewModal}
        bill={selectedBill}
        room={selectedBill ? rooms.find(r => r.id === selectedBill.room_id) : null}
        tenant={selectedBill ? (() => {
          // Try direct tenant match first
          let t = tenants.find(ten => String(ten.id) === String(selectedBill.tenant_id));
          if (!t && selectedBill.room_id) {
            const lease = leases.find(l => String(l.room_id) === String(selectedBill.room_id));
            if (lease) t = tenants.find(ten => String(ten.id) === String(lease.tenant_id));
          }
          // Fallback: return object with name from bill
          return t || { name: selectedBill.tenant_name || getTenantName(selectedBill), phone: '' };
        })() : null}
        property={selectedBill ? properties.find(p => {
          const r = rooms.find(r => r.id === selectedBill.room_id);
          return r && p.id === r.property_id;
        }) : null}
      />

      {/* WhatsApp Payment Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={handleCloseReminderModal}
        bill={selectedReminderBill}
        tenant={selectedReminderBill ? (() => {
          let t = tenants.find(ten => String(ten.id) === String(selectedReminderBill.tenant_id));
          if (!t && selectedReminderBill.room_id) {
            const lease = leases.find(l => String(l.room_id) === String(selectedReminderBill.room_id));
            if (lease) t = tenants.find(ten => String(ten.id) === String(lease.tenant_id));
          }
          return t || { name: selectedReminderBill.tenant_name || getTenantName(selectedReminderBill), phone: '' };
        })() : null}
        room={selectedReminderBill ? rooms.find(r => r.id === selectedReminderBill.room_id) : null}
        property={selectedReminderBill ? properties.find(p => {
          const r = rooms.find(r => r.id === selectedReminderBill.room_id);
          return r && p.id === r.property_id;
        }) : null}
      />

      {/* 2. Record Payment Modal */}
      {showPayModal && selectedBill && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl relative my-auto">
            <button 
              onClick={handleClosePayModal} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 z-10 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <CreditCard size={18} className="text-[#2d5a47]" />
                  <span>Record Payment</span>
                </h3>
                <p className="text-xs text-slate-500">Receive payment for {getTenantName(selectedBill)}'s invoice.</p>
              </div>

              {/* Outstanding Balance Breakdown Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>Total Payable:</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedBill.total_payable)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Already Paid:</span>
                  <span>{formatINR(selectedBill.amount_paid || 0)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-amber-700 text-sm">
                  <span>Remaining Due:</span>
                  <span>{formatINR(Math.max(0, parseFloat(selectedBill.total_payable) - parseFloat(selectedBill.amount_paid || 0)))}</span>
                </div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">PAYMENT AMOUNT (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#2d5a47]"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">PAYMENT METHOD</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47] cursor-pointer"
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                  >
                    <option value="UPI">UPI / Net Banking</option>
                    <option value="Cash">Cash Payment</option>
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm cursor-pointer">
                    Record Payment
                  </button>
                  <button 
                    type="button" 
                    onClick={handleClosePayModal} 
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Payment History Modal */}
      {showHistoryModal && selectedBill && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl relative my-auto">
            <button 
              onClick={handleCloseHistoryModal} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 z-10 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <History size={18} className="text-amber-600" />
                  <span>Payment History</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {getTenantName(selectedBill)} • Room {getRoomInfo(selectedBill.room_id).number} ({selectedBill.bill_month} {selectedBill.bill_year})
                </p>
              </div>

              {/* Financial Breakdown Card */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 border border-slate-200/80 rounded-2xl text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">TOTAL BILL</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatINR(selectedBill.total_payable)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">PAID SO FAR</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatINR(selectedBill.amount_paid || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">REMAINING</p>
                  <p className="text-sm font-extrabold text-amber-700 mt-0.5">
                    {formatINR(Math.max(0, parseFloat(selectedBill.total_payable) - parseFloat(selectedBill.amount_paid || 0)))}
                  </p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TRANSACTION RECORDS</h4>
                
                {loadingPayments ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading transactions...</div>
                ) : billPayments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                    No payment transactions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {billPayments.map((p, idx) => (
                      <div key={p.id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{p.payment_date}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-medium">Method: {p.payment_method}</span>
                        </div>
                        <span className="font-extrabold text-[#2d5a47] text-sm">
                          +{formatINR(p.amount_paid)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-2 pt-2">
                {selectedBill.payment_status !== 'Paid' && (
                  <button
                    onClick={() => {
                      setShowHistoryModal(false);
                      handleOpenPayModal(selectedBill);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Add Payment
                  </button>
                )}
                <button
                  onClick={handleCloseHistoryModal}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
