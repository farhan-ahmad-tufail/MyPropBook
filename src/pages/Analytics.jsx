import React, { useState, useEffect, useMemo } from 'react';
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
  PieChart as PieIcon,
  LineChart as LineIcon
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { formatINR, formatINRShort } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie
} from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const toast = useToast();
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
        setBills(Array.isArray(billsList) ? billsList : []);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to fetch financial analytics data.');
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);

  // Available Years Filter
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(bills.map(b => b.bill_year?.toString() || new Date().getFullYear().toString())));
    if (!years.includes(new Date().getFullYear().toString())) {
      years.push(new Date().getFullYear().toString());
    }
    return years.sort((a, b) => b - a);
  }, [bills]);

  // Filter bills by year
  const yearBills = useMemo(() => {
    return bills.filter(b => (b.bill_year?.toString() || new Date().getFullYear().toString()) === selectedYear);
  }, [bills, selectedYear]);

  // Financial Summary Aggregations
  const totalBilledYear = useMemo(() => yearBills.reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0), [yearBills]);
  const totalCollectedYear = useMemo(() => yearBills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0), [yearBills]);
  const totalPendingYear = totalBilledYear - totalCollectedYear;
  const collectionRate = totalBilledYear > 0 ? ((totalCollectedYear / totalBilledYear) * 100).toFixed(1) : 0;

  const totalBaseRentYear = useMemo(() => yearBills.reduce((sum, b) => sum + parseFloat(b.rent_amount || 0), 0), [yearBills]);
  const totalElectricityRevenueYear = useMemo(() => yearBills.reduce((sum, b) => {
    const units = parseFloat(b.units_consumed || 0);
    const rate = parseFloat(b.rate_per_unit || 0);
    const rent = parseFloat(b.rent_amount || 0);
    const other = parseFloat(b.other_charges || 0);
    const arrears = parseFloat(b.arrears || 0);
    const total = parseFloat(b.total_payable || 0);

    let elecAmt = 0;
    if (b.electricity_amount !== undefined && b.electricity_amount !== null && !isNaN(b.electricity_amount)) {
      elecAmt = parseFloat(b.electricity_amount);
    } else if (b.elec_amount !== undefined && b.elec_amount !== null && !isNaN(b.elec_amount)) {
      elecAmt = parseFloat(b.elec_amount);
    } else if (units > 0 && rate > 0) {
      elecAmt = units * rate;
    } else if (total > 0) {
      elecAmt = Math.max(0, total - rent - other - arrears);
    }
    return sum + elecAmt;
  }, 0), [yearBills]);
  const totalOtherChargesYear = useMemo(() => yearBills.reduce((sum, b) => sum + parseFloat(b.other_charges || 0), 0), [yearBills]);

  const totalUnitsConsumedYear = useMemo(() => yearBills.reduce((sum, b) => sum + parseFloat(b.units_consumed || 0), 0), [yearBills]);

  // Month-by-month breakdown
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = useMemo(() => {
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return MONTHS.map((month, idx) => {
      const mBills = yearBills.filter(b => b.bill_month === fullMonths[idx]);
      const billed = mBills.reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);
      const collected = mBills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
      const pending = billed - collected;
      const units = mBills.reduce((sum, b) => sum + parseFloat(b.units_consumed || 0), 0);
      return { 
        month, 
        billed, 
        collected, 
        pending, 
        units, 
        count: mBills.length,
        fullMonth: fullMonths[idx] 
      };
    });
  }, [yearBills]);

  // Pie chart data for cost breakdown
  const pieData = useMemo(() => [
    { name: 'Base Rent', value: totalBaseRentYear, color: '#2563eb' },
    { name: 'Electricity Utility', value: totalElectricityRevenueYear, color: '#f59e0b' },
    { name: 'Other Charges', value: totalOtherChargesYear, color: '#a855f7' }
  ].filter(d => d.value > 0), [totalBaseRentYear, totalElectricityRevenueYear, totalOtherChargesYear]);

  // Export CSV function for Tax/Accounting
  const handleExportCSV = () => {
    if (yearBills.length === 0) {
      toast('No bill records available for the selected year.', 'warning');
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

  const formatChartCurrency = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 fade-in-up active max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-[#2d5a47] shrink-0" size={28} />
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">Track revenue collection, electricity consumption trends & export tax statements.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-2xl shadow-sm">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr} className="bg-white text-slate-800">
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
            title="Download CSV Report for Accounting/Tax"
          >
            <Download size={15} /> Export CSV Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Financial Cards (2x2 Grid on Mobile, 4 Cols on Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Collected */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">REVENUE COLLECTED</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3 sm:mt-5">
            <h3 className="text-xl sm:text-3xl font-black text-[#2d5a47]">{formatINR(totalCollectedYear)}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 sm:mt-1">Total received in {selectedYear}</p>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PENDING ARREARS</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 sm:mt-5">
            <h3 className={`text-xl sm:text-3xl font-black ${totalPendingYear > 0 ? 'text-red-500' : 'text-slate-800'}`}>
              {formatINR(totalPendingYear)}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 sm:mt-1">Uncollected balance</p>
          </div>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">COLLECTION RATE</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="mt-3 sm:mt-5">
            <h3 className="text-xl sm:text-3xl font-black text-blue-600">{collectionRate}%</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 sm:mt-1">Paid vs total billed</p>
          </div>
        </div>

        {/* Electricity Consumption */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ELECTRICITY CONSUMED</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3 sm:mt-5">
            <h3 className="text-xl sm:text-3xl font-black text-amber-600">{totalUnitsConsumedYear.toLocaleString()} Units</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 sm:mt-1">{formatINR(totalElectricityRevenueYear)} billed</p>
          </div>
        </div>

      </div>

      {/* ── CHARTS SECTION ── */}
      {yearBills.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Month-Over-Month Revenue Trend (Area Chart) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-[#2d5a47]" /> Revenue Flow &amp; Collections
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Billed invoices vs payments received month-by-month</p>
            </div>
            
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d5a47" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2d5a47" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} tickFormatter={formatChartCurrency} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    formatter={(value) => [formatINR(value), null]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  <Area type="monotone" name="Total Billed" dataKey="billed" stroke="#475569" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" />
                  <Area type="monotone" name="Collected" dataKey="collected" stroke="#2d5a47" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Revenue Distribution (Production SaaS Multi-Segment Progress Bar Breakdown) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 size={16} className="text-purple-600" /> Revenue Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Yield share of base rent vs utilities</p>
            </div>

            {/* Total Metric Header */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Billed ({selectedYear})</span>
              <span className="text-2xl font-black text-slate-900 leading-tight">{formatINR(totalBilledYear)}</span>
            </div>

            {/* Multi-Segment Horizontal Stacked Bar */}
            {totalBilledYear > 0 ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  {pieData.map((d, idx) => {
                    const pct = totalBilledYear > 0 ? (d.value / totalBilledYear) * 100 : 0;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={idx}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: d.color }}
                        title={`${d.name}: ${formatINR(d.value)} (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs italic">
                No revenue distribution data.
              </div>
            )}

            {/* SaaS Legend Item Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {pieData.map((d, idx) => {
                const pct = totalBilledYear > 0 ? ((d.value / totalBilledYear) * 100).toFixed(0) : 0;
                return (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600 font-semibold">{d.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">{formatINR(d.value)} <span className="text-slate-400 font-medium">({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Utility consumption trends (Line Chart) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <LineIcon size={16} className="text-amber-500" /> Utility Consumption Cycle
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Electricity submeter consumption (units) trends over the seasons</p>
            </div>
            
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [`${parseFloat(value).toFixed(1)} Units`, 'Electricity consumed']}
                  />
                  <Line type="monotone" name="Electricity Consumed" dataKey="units" stroke="#d97706" strokeWidth={3} dot={{ r: 4, stroke: '#d97706', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 text-xs">
          No chart data available for selection. Make sure bills are calculated and saved in the system first.
        </div>
      )}

      {/* ── Month-over-Month Revenue & Electricity Breakdown Table ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4 p-4 sm:p-6 overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <ArrowUpRight size={15} className="text-[#2d5a47]" />
            <span>MONTHLY FINANCIAL LEDGER ({selectedYear})</span>
          </h2>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="px-3 sm:px-5 py-3 sm:py-4">MONTH</th>
                <th className="px-3 sm:px-5 py-3 sm:py-4">INVOICES</th>
                <th className="px-3 sm:px-5 py-3 sm:py-4">BILLED (₹)</th>
                <th className="px-3 sm:px-5 py-3 sm:py-4">COLLECTED (₹)</th>
                <th className="px-3 sm:px-5 py-3 sm:py-4">PENDING (₹)</th>
                <th className="px-3 sm:px-5 py-3 sm:py-4">ELEC UNITS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {monthlyData.map(m => (
                <tr key={m.month} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 sm:px-5 py-3.5 font-bold text-slate-800">{m.fullMonth}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-slate-400">{m.count > 0 ? `${m.count} bills` : '-'}</td>
                  <td className="px-3 sm:px-5 py-3.5 font-semibold text-slate-700">₹{m.billed.toLocaleString()}</td>
                  <td className="px-3 sm:px-5 py-3.5 font-bold text-[#2d5a47]">₹{m.collected.toLocaleString()}</td>
                  <td className="px-3 sm:px-5 py-3.5 font-bold text-red-500">{m.pending > 0 ? `₹${m.pending.toLocaleString()}` : '₹0'}</td>
                  <td className="px-3 sm:px-5 py-3.5 font-mono text-amber-600">{m.units > 0 ? `${m.units.toFixed(1)} units` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
