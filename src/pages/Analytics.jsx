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
import { formatINR } from '../utils/formatters';
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
    return sum + (units * rate);
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
    { name: 'Base Rent', value: totalBaseRentYear, color: '#3b82f6' },
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
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={28} />
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Track revenue collection, electricity consumption trends & export tax statements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
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
            className="btn bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-glow"
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

      {/* ── Financial Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Revenue Collected</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400">{formatINR(totalCollectedYear)}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Total received in {selectedYear}</p>
          </div>
        </div>

        {/* Total Pending */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pending Arrears</span>
            <div className="w-8 h-8 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-red-400">{formatINR(totalPendingYear)}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Uncollected balance</p>
          </div>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Collection Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <PieIcon size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-blue-400">{collectionRate}%</h3>
            <p className="text-[10px] text-slate-400 mt-1">Paid vs total billed</p>
          </div>
        </div>

        {/* Electricity Consumption */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Electricity Consumed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Zap size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400">{totalUnitsConsumedYear.toLocaleString()} Units</h3>
            <p className="text-[10px] text-slate-400 mt-1">{formatINR(totalElectricityRevenueYear)} billed</p>
          </div>
        </div>
      </div>

      {/* ── CHARTS SECTION ── */}
      {yearBills.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Month-Over-Month Revenue Trend (Area Chart) */}
          <div className="lg:col-span-2 card glass-card p-5 border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" /> Revenue Flow & Collections
              </h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Billed invoices vs payments received month-by-month</p>
            </div>
            
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} tickFormatter={formatChartCurrency} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    formatter={(value) => [formatINR(value), null]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Area type="monotone" name="Total Billed" dataKey="billed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" />
                  <Area type="monotone" name="Collected" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Revenue Distribution (Donut Pie Chart) */}
          <div className="card glass-card p-5 border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <PieIcon size={16} className="text-purple-400" /> Revenue Distribution
              </h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Yield share of base rent vs utilities</p>
            </div>

            {pieData.length > 0 ? (
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      formatter={(value) => [formatINR(value), null]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Billed</span>
                  <span className="text-sm font-extrabold text-slate-200">{formatINRShort(totalBilledYear)}</span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs italic">
                No revenue distribution data.
              </div>
            )}

            {/* Custom Legend */}
            <div className="space-y-1.5 pt-2 border-t border-slate-850">
              {pieData.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-400">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-200">{formatINR(d.value)} ({((d.value / totalBilledYear) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Utility consumption trends (Line Chart) */}
          <div className="lg:col-span-3 card glass-card p-5 border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <LineIcon size={16} className="text-amber-400" /> Utility Consumption Cycle
              </h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Electricity submeter consumption (units) trends over the seasons</p>
            </div>
            
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    formatter={(value) => [`${parseFloat(value).toFixed(1)} Units`, 'Electricity consumed']}
                  />
                  <Line type="monotone" name="Electricity Consumed" dataKey="units" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, stroke: '#d97706', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="card glass-card p-12 text-center text-slate-500 border-slate-850">
          No chart data available for selection. Make sure bills are calculated and saved in the system first.
        </div>
      )}

      {/* ── Month-over-Month Revenue & Electricity Breakdown Table ── */}
      <div className="card glass-card overflow-hidden border-slate-800 space-y-4 p-5 bg-slate-900/20">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <ArrowUpRight size={15} className="text-emerald-400" />
            <span>Monthly Financial Ledger ({selectedYear})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full text-left">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Month</th>
                <th className="px-5 py-4">Invoices</th>
                <th className="px-5 py-4">Billed (₹)</th>
                <th className="px-5 py-4">Collected (₹)</th>
                <th className="px-5 py-4">Pending (₹)</th>
                <th className="px-5 py-4">Elec Units</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.month} className="border-b border-slate-850 hover:bg-slate-900/30 text-xs transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-200">{m.fullMonth}</td>
                  <td className="px-5 py-3.5 text-slate-400">{m.count > 0 ? `${m.count} bills` : '-'}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-350">₹{m.billed.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-400">₹{m.collected.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-bold text-red-400">{m.pending > 0 ? `₹${m.pending.toLocaleString()}` : '₹0'}</td>
                  <td className="px-5 py-3.5 font-mono text-amber-500">{m.units > 0 ? `${m.units.toFixed(1)} units` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
