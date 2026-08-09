import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building, 
  Users, 
  Home, 
  AlertTriangle,
  Receipt,
  ArrowRight,
  TrendingUp,
  CircleAlert,
  Zap,
  BookOpen,
  Share2,
  X,
  UserPlus,
  Plus,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  IndianRupee,
  Mail,
  Gauge,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import OnboardingModal from '../components/OnboardingModal';
import { formatINR } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(searchParams.get('newuser') === 'true');
  const [propertySearch, setPropertySearch] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
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
      } catch (err) {
        console.error('Error loading dashboard data', err);
        setError('Failed to load dashboard statistics. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Statistics Computations
  const totalProperties = properties.length;
  const totalRooms = rooms.length;
  const activeTenants = tenants.filter(t => t.active).length;

  const activeLeaseRoomIds = useMemo(() => 
    leases.filter(l => l.is_active).map(l => l.room_id), 
    [leases]
  );

  const expectedMonthlyRevenue = useMemo(() => 
    rooms
      .filter(r => activeLeaseRoomIds.includes(r.id))
      .reduce((sum, r) => sum + parseFloat(r.base_rent || 0), 0),
    [rooms, activeLeaseRoomIds]
  );

  const pendingArrears = useMemo(() => 
    bills
      .filter(b => b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid')
      .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0),
    [bills]
  );

  const totalCollected = useMemo(() => 
    bills
      .filter(b => b.payment_status === 'Paid' || b.payment_status === 'Partially Paid')
      .reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0),
    [bills]
  );

  const collectionHealthPct = useMemo(() => {
    const totalTarget = expectedMonthlyRevenue;
    if (!totalTarget) return 0;
    const collected = totalCollected || Math.max(0, expectedMonthlyRevenue - pendingArrears);
    return Math.min(100, Math.round((collected / totalTarget) * 100));
  }, [expectedMonthlyRevenue, totalCollected, pendingArrears]);

  const tenantsWithArrears = useMemo(() => {
    const roomIdsWithArrears = bills
      .filter(b => b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid')
      .map(b => b.room_id);
    const uniqueRoomIds = [...new Set(roomIdsWithArrears)];
    const tenantIds = uniqueRoomIds.map(rid => {
      const lease = leases.find(l => l.room_id === rid && l.is_active);
      return lease?.tenant_id;
    }).filter(Boolean);
    return [...new Set(tenantIds)].length;
  }, [bills, leases]);

  const getRoomOccupancy = (roomId) => {
    const activeLease = leases.find(l => l.room_id === roomId && l.is_active);
    if (!activeLease) return { status: 'Vacant', tenant: null };
    const tenant = tenants.find(t => t.id === activeLease.tenant_id);
    return { status: 'Occupied', tenant };
  };

  const getRoomPendingBalance = (roomId) => {
    return bills
      .filter(b => b.room_id === roomId && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
      .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
  };

  // Recent bills for activity feed (last 3, sorted by date)
  const recentBills = useMemo(() => {
    return [...bills]
      .sort((a, b) => new Date(b.created_at || b.bill_date || 0) - new Date(a.created_at || a.bill_date || 0))
      .slice(0, 3)
      .map(b => {
        const room = rooms.find(r => r.id === b.room_id);
        const prop = properties.find(p => p.id === room?.property_id);
        const lease = leases.find(l => l.room_id === b.room_id && l.is_active);
        const tenant = tenants.find(t => t.id === (b.tenant_id || lease?.tenant_id));
        return { ...b, room, prop, tenant };
      });
  }, [bills, rooms, properties, leases, tenants]);

  // Room billing status: latest bill per room for the billing table
  const roomBillingRows = useMemo(() => {
    return rooms.slice(0, 5).map(room => {
      const prop = properties.find(p => p.id === room.property_id);
      const activeLease = leases.find(l => l.room_id === room.id && l.is_active);
      const tenant = activeLease ? tenants.find(t => t.id === activeLease.tenant_id) : null;
      const latestBill = bills
        .filter(b => b.room_id === room.id)
        .sort((a, b) => new Date(b.created_at || b.bill_date || 0) - new Date(a.created_at || a.bill_date || 0))[0];
      const status = latestBill?.payment_status || (tenant ? 'No bill yet' : 'Vacant');
      return { room, prop, tenant, latestBill, status };
    });
  }, [rooms, properties, bills, leases, tenants]);


  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-9 h-9 rounded-full border-3 border-emerald-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up active">
      
      {/* ── HERO GREETING HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {currentDate}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Good morning, {displayName}.
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what needs your attention across the portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/smart-calc')}
            className="px-5 py-3 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Zap size={14} fill="currentColor" />
            <span>Create smart bill</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <CircleAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── TOP KPI CARDS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Properties */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center">
              <Building size={18} />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PROPERTIES</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalProperties}</div>
            <span className="text-xs text-slate-400 font-medium block mt-1">All active</span>
          </div>
        </div>

        {/* KPI 2: Occupied Rooms */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OCCUPIED ROOMS</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {activeLeaseRoomIds.length} <span className="text-xl text-slate-400 font-normal">/ {totalRooms}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium block mt-1">{totalRooms > 0 ? `${Math.round((activeLeaseRoomIds.length / totalRooms) * 100)}% occupancy rate` : 'No rooms yet'}</span>
          </div>
        </div>

        {/* KPI 3: Expected Rent */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base">
              ₹
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EXPECTED RENT</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {formatINR(expectedMonthlyRevenue)}
            </div>
            <span className="text-xs text-slate-400 font-medium block mt-1">{new Date().toLocaleString('en-IN', { month: 'long' })} cycle</span>
          </div>
        </div>

        {/* KPI 4: Pending Arrears */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mail size={18} />
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-5 right-5" />
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENDING ARREARS</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {formatINR(pendingArrears)}
            </div>
            {tenantsWithArrears > 0 ? (
              <span className="text-xs text-amber-600 font-semibold block mt-1">{tenantsWithArrears} tenant{tenantsWithArrears > 1 ? 's' : ''} with dues</span>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold block mt-1">All clear ✓</span>
            )}
          </div>
        </div>

      </div>

      {/* ── REVENUE OVERVIEW & COLLECTIONS HEALTH SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Overview Chart Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Revenue overview</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wider">LIVE</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Collected vs expected across your portfolio</p>
            </div>
            
            <select className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer">
              <option>This month</option>
              <option>Last month</option>
              <option>Year 2026</option>
            </select>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">{formatINR(totalCollected)}</span>
              {totalCollected > 0 && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={12} /> collected
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-2 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2d5a47]" /> Collected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-200" /> Expected
              </span>
            </div>

            {/* Curved SVG Chart representation */}
            <div className="w-full h-44 bg-[#f8faf9] rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden border border-slate-100">
              <svg className="w-full h-32 text-[#2d5a47]" viewBox="0 0 500 120" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2d5a47" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2d5a47" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,90 Q50,70 100,75 T200,60 T300,70 T400,50 T500,30 L500,120 L0,120 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,90 Q50,70 100,75 T200,60 T300,70 T400,50 T500,30"
                  stroke="#2d5a47"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-2 px-2">
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collections Health Widget */}
        <div className="bg-[#edf5f1] p-6 rounded-3xl border border-[#d2e5dc] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-[#2d5a47] uppercase tracking-widest">COLLECTIONS HEALTH</span>
              <div className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-sm">
                <Gauge size={16} />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-4xl font-black text-slate-900">{collectionHealthPct}%</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">of {new Date().toLocaleString('en-IN', { month: 'long' })} rent collected</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden mt-6">
              <div 
                className="bg-[#2d5a47] h-full rounded-full transition-all duration-500"
                style={{ width: `${collectionHealthPct}%` }}
              />
            </div>

            <div className="space-y-3 mt-6 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-600">
                <span>Collected</span>
                <span className="text-slate-900 font-bold">{formatINR(totalCollected)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Still to collect</span>
                <span className="text-amber-700 font-bold">{formatINR(pendingArrears)}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/billing')}
            className="w-full py-3 mt-6 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Review outstanding</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

      </div>

      {/* ── PORTFOLIO SNAPSHOT SECTION ── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Portfolio snapshot</h3>
            <p className="text-xs text-slate-400 mt-0.5">Room occupancy and billing status across properties</p>
          </div>
          <Link to="/properties" className="text-xs font-bold text-[#2d5a47] hover:underline flex items-center gap-1">
            View all properties &rsaquo;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {properties.slice(0, 3).map((prop, i) => {
            const propRooms = rooms.filter(r => r.property_id === prop.id);
            const occupied = propRooms.filter(r => leases.some(l => l.room_id === r.id && l.is_active)).length;
            const rev = propRooms.reduce((sum, r) => sum + parseFloat(r.base_rent || 0), 0);

            return (
              <div key={prop.id || i} className="bg-[#f8faf9] p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center font-bold">
                    <Building size={16} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </div>

                <div className="mt-4">
                  <h4 className="font-extrabold text-slate-900 text-sm">{prop.name}</h4>
                  <p className="text-[11px] text-slate-400">{prop.address || '—'}</p>
                </div>

                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">OCCUPIED</span>
                    <span className="font-bold text-slate-800">{occupied} / {propRooms.length} rooms</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">EXPECTED</span>
                    <span className="font-bold text-slate-800">{formatINR(rev)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ROOM BILLING STATUS & RECENT ACTIVITY GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Room Billing Status Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Room billing status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest bill per room</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3">ROOM / TENANT</th>
                  <th className="pb-3">PROPERTY</th>
                  <th className="pb-3">MONTHLY RENT</th>
                  <th className="pb-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {roomBillingRows.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-xs">No rooms yet. Add rooms to see billing status.</td></tr>
                ) : roomBillingRows.map(({ room, prop, tenant, latestBill, status }) => {
                  const isPaid = status === 'Paid';
                  const isPartial = status === 'Partially Paid';
                  const isUnpaid = status === 'Unpaid';
                  const isVacant = status === 'Vacant';
                  const isNoBill = status === 'No bill yet';
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isPaid ? 'bg-emerald-500' : isPartial ? 'bg-amber-400' : isUnpaid ? 'bg-red-400' : 'bg-slate-300'
                          }`} />
                          <div>
                            <p className="font-bold text-slate-800">Room {room.room_number}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{tenant?.name || (isVacant ? 'Vacant' : '—')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500">{prop?.name || '—'}</td>
                      <td className="py-3.5 font-bold text-slate-800">{formatINR(room.base_rent)}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isPaid ? 'bg-emerald-50 text-emerald-700' :
                          isPartial ? 'bg-amber-50 text-amber-700' :
                          isUnpaid ? 'bg-red-50 text-red-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {isVacant ? 'Vacant' : isNoBill ? 'No bill' : status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Recent activity</h3>
                <p className="text-xs text-slate-400 mt-0.5">A quiet pulse of your workspace</p>
              </div>
              <Link to="/billing" className="text-xs font-bold text-[#2d5a47] hover:underline">See all</Link>
            </div>

            <div className="space-y-4">
              {recentBills.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Receipt size={28} className="mx-auto mb-2 opacity-40" />
                  No bills generated yet.
                </div>
              ) : recentBills.map((b, idx) => {
                const isPaid = b.payment_status === 'Paid';
                const isUnpaid = b.payment_status === 'Unpaid';
                const billDate = b.created_at || b.bill_date;
                const dateStr = billDate ? new Date(billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                const bgColor = isPaid ? 'bg-emerald-50 text-emerald-700' : isUnpaid ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600';
                return (
                  <div key={b.id || idx} className="flex items-start gap-3 text-xs">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${bgColor}`}>
                      <Receipt size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {b.tenant?.name || 'Tenant'} — Room {b.room?.room_number || '?'}
                      </p>
                      <p className="text-[11px] text-slate-400">{b.prop?.name || '—'} • {dateStr}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-slate-800 block">{formatINR(b.total_payable)}</span>
                      <span className={`text-[10px] font-semibold ${isPaid ? 'text-emerald-600' : isUnpaid ? 'text-red-500' : 'text-amber-600'}`}>
                        {b.payment_status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => navigate('/billing')}
            className="w-full py-3 mt-6 bg-[#f1f5f3] hover:bg-slate-200/60 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open billing records</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* Popout Interactive User Manual Modal */}
      {showGuideModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-3xl shadow-2xl relative my-auto overflow-hidden">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">BillRoom Quick Start & User Guide</h3>
                  <p className="text-slate-400 text-xs">Step-by-step instructions to manage your property portfolio.</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Steps Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-xs font-bold text-[#2d5a47] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center text-[10px]">1</span>
                  Add Property Location
                </span>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Go to <strong>Properties</strong> and click <strong>+ New Property</strong> to add your building name and address.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-xs font-bold text-[#2d5a47] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center text-[10px]">2</span>
                  Register Rooms & Submeter Mode
                </span>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Select your property and click <strong>+ Add Room</strong>. Enter floor, base rent, and choose submeter reading or direct bill.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-xs font-bold text-[#2d5a47] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center text-[10px]">3</span>
                  Add Tenant & Allocate Room
                </span>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Go to <strong>Tenants</strong>, register tenant details, then assign them to their designated room lease.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-primary rounded-xl px-5 py-2 text-xs"
              >
                Close User Guide
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Onboarding Wizard Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
        onComplete={async (data) => {
          try {
            const ownerId = user?.id || 'mock_owner_id';
            if (data.propertyName) {
              const newProp = await api.createProperty(ownerId, {
                name: data.propertyName,
                address: data.propertyAddress || ''
              });
              if (newProp && data.roomNumber) {
                await api.createRoom(newProp.id, {
                  room_number: data.roomNumber,
                  base_rent: parseFloat(data.baseRent || 8500),
                  elec_mode: data.utilityMode || 'submeter'
                });
              }
              const [propsList, roomsList] = await Promise.all([
                api.getProperties(ownerId),
                api.getAllRooms(ownerId)
              ]);
              setProperties(propsList);
              setRooms(roomsList);
            }
          } catch (e) {
            console.error('Error during onboarding setup', e);
          }
        }}
      />
    </div>
  );
}

