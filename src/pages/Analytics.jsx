import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Download, 
  Calendar,
  Building,
  ShieldAlert,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const ownerId = user?.id || 'mock_owner_id';
        const billsList = await api.getBills(ownerId);
        setBills(billsList);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to fetch financial analytics data.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);

  // Available Years Filter
  const availableYears = Array.from(new Set(bills.map(b => b.bill_year?.toString() || new Date().getFullYear().toString())));
  if (!availableYears.includes(new Date().getFullYear().toString())) {
    availableYears.push(new Date().getFullYear().toString());
  }

  // Filter bills by year
  const yearBills = bills.filter(b => (b.bill_year?.toString() || new Date().getFullYear().toString()) === selectedYear);

  // Financial Summary Aggregations
  const totalBilledYear = yearBills.reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);
  const totalCollectedYear = yearBills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
  const totalPendingYear = totalBilledYear - totalCollectedYear;
  const collectionRate = totalBilledYear > 0 ? ((totalCollectedYear / totalBilledYear) * 100).toFixed(1) : 0;

  const totalUnitsConsumedYear = yearBills.reduce((sum, b) => sum + parseFloat(b.units_consumed || 0), 0);
  const totalElectricityRevenueYear = yearBills.reduce((sum, b) => {
    const units = parseFloat(b.units_consumed || 0);
    const rate = parseFloat(b.rate_per_unit || 0);
    return sum + (units * rate);
  }, 0);

  // Month-by-month breakdown
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthlyData = MONTHS.map(month => {
    const mBills = yearBills.filter(b => b.bill_month === month);
    const billed = mBills.reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);
    const collected = mBills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
    const pending = billed - collected;
    const units = mBills.reduce((sum, b) => sum + parseFloat(b.units_consumed || 0), 0);
    return { month, billed, collected, pending, units, count: mBills.length };
  });

  // Export CSV function for Tax/Accounting
  const handleExportCSV = () => {
    if (yearBills.length === 0) {
      alert('No bill records available for the selected year.');
      return;
    }

    const headers = ['Bill Month', 'Year', 'Room ID', 'Tenant ID', 'Base Rent (₹)', 'Units Consumed', 'Rate/Unit (₹)', 'Electricity (₹)', 'Other Charges (₹)', 'Total Payable (₹)', 'Amount Paid (₹)', 'Pending Balance (₹)', 'Status'];
    
    const rows = yearBills.map(b => {
      const elecAmt = (parseFloat(b.units_consumed || 0) * parseFloat(b.rate_per_unit || 0)).toFixed(2);
      const paid = parseFloat(b.amount_paid || 0);
      const payable = parseFloat(b.total_payable || 0);
      const pending = (payable - paid).toFixed(2);
      
      return [
        b.bill_month,
        b.bill_year,
        b.room_id,
        b.tenant_id,
        b.rent_amount,
        b.units_consumed,
        b.rate_per_unit,
        elecAmt,
        b.other_charges || 0,
        payable,
        paid,
        pending,
        b.payment_status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BillRoom_Financial_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up active">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={28} />
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Track revenue collection, electricity consumption trends & export tax statements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr} className="bg-slate-900 text-slate-200">
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="btn bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-glow"
            title="Download CSV Report for Accounting/Tax"
          >
            <Download size={14} /> Export CSV Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Collected */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue Collected</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={14} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2">₹{totalCollectedYear.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Total received in {selectedYear}</span>
        </div>

        {/* Total Pending */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Arrears</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-red-400 mt-2">₹{totalPendingYear.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Uncollected balance</span>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Collection Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <PieChart size={14} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-blue-400 mt-2">{collectionRate}%</h3>
          <span className="text-[10px] text-slate-500 mt-1">Paid vs total billed</span>
        </div>

        {/* Electricity Consumption */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Electricity Consumed</span>
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Zap size={14} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mt-2">{totalUnitsConsumedYear.toLocaleString()} u</h3>
          <span className="text-[10px] text-slate-500 mt-1">₹{totalElectricityRevenueYear.toLocaleString()} billed</span>
        </div>
      </div>

      {/* Month-over-Month Revenue & Electricity Breakdown */}
      <div className="card glass-card overflow-hidden border-slate-800 space-y-4 p-5">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-emerald-400" />
            <span>Monthly Financial Breakdown ({selectedYear})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full text-left">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Invoices</th>
                <th className="px-4 py-3">Billed (₹)</th>
                <th className="px-4 py-3">Collected (₹)</th>
                <th className="px-4 py-3">Pending (₹)</th>
                <th className="px-4 py-3">Elec Units</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.month} className="border-b border-slate-800/60 hover:bg-slate-900/30 text-xs transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-200">{m.month}</td>
                  <td className="px-4 py-3.5 text-slate-400">{m.count > 0 ? `${m.count} bills` : '-'}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-300">₹{m.billed.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400">₹{m.collected.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-red-400">{m.pending > 0 ? `₹${m.pending.toLocaleString()}` : '₹0'}</td>
                  <td className="px-4 py-3.5 font-mono text-yellow-400">{m.units > 0 ? `${m.units.toFixed(1)} u` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
