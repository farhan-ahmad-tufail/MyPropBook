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
  FileText
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

  const occupancyRate = useMemo(() => {
    if (totalRooms === 0) return 0;
    return Math.round((activeLeaseRoomIds.length / totalRooms) * 100);
  }, [totalRooms, activeLeaseRoomIds]);

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

  // Filtered properties for breakdown
  const filteredProperties = useMemo(() => {
    if (!propertySearch.trim()) return properties;
    return properties.filter(p => 
      p.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
      (p.address && p.address.toLowerCase().includes(propertySearch.toLowerCase()))
    );
  }, [properties, propertySearch]);

  const displayName = user?.user_metadata?.full_name || user?.fullName || user?.email?.split('@')[0] || 'Property Owner';
  const currentDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active">
      
      {/* ── HERO GREETING HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 border border-slate-800/80 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Sparkles size={11} /> Landlord Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-400 mt-1 text-sm flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-500" />
            <span>{currentDate}</span>
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowGuideModal(true)}
            className="btn btn-secondary rounded-xl px-4 py-2.5 text-xs font-bold flex-1 md:flex-none flex items-center justify-center gap-1.5"
          >
            <BookOpen size={14} className="text-blue-400" /> User Manual
          </button>
          <Link 
            to="/smart-calc" 
            className="btn btn-primary shadow-glow rounded-xl px-5 py-2.5 text-xs font-extrabold flex-1 md:flex-none flex items-center justify-center gap-2"
          >
            <Zap size={14} /> + Quick Bill
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── SAAS METRICS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Properties KPI */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800 hover:border-slate-700/80 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Properties</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Building size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100">{totalProperties}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Active Buildings
            </p>
          </div>
        </div>

        {/* Total Rooms KPI */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800 hover:border-slate-700/80 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Rooms</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Home size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100">{totalRooms}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> {occupancyRate}% Occupied
            </p>
          </div>
        </div>

        {/* Active Tenants KPI */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800 hover:border-slate-700/80 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Tenants</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100">{activeTenants}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Leases
            </p>
          </div>
        </div>

        {/* Monthly Revenue KPI */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800 hover:border-slate-700/80 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Monthly Rent</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400">{formatINR(expectedMonthlyRevenue)}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Expected income
            </p>
          </div>
        </div>

        {/* Pending Balance KPI */}
        <div className="card glass-card p-5 flex flex-col justify-between border-slate-800 hover:border-slate-700/80 transition-all duration-300 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pending Balance</span>
            <div className="w-8 h-8 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-red-400">{formatINR(pendingArrears)}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Awaiting payments
            </p>
          </div>
        </div>

      </div>

      {/* ── QUICK ACTION CENTRE ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Register Property', desc: 'Add new building/PG', path: '/properties', icon: <Plus size={16} />, color: 'blue' },
            { label: 'Configure Room', desc: 'Define rent & meter', path: '/properties', icon: <Home size={15} />, color: 'purple' },
            { label: 'Add Tenant', desc: 'Create active lease', path: '/tenants', icon: <UserPlus size={15} />, color: 'emerald' },
            { label: 'View Invoices', desc: 'Track history & dues', path: '/billing', icon: <FileText size={15} />, color: 'amber' }
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="card glass-card p-4 hover:bg-slate-900/40 hover:border-slate-700 text-left transition-all group flex items-start justify-between cursor-pointer border-slate-800"
            >
              <div>
                <p className="font-bold text-xs text-slate-200 group-hover:text-blue-400 transition-colors">{action.label}</p>
                <p className="text-[10px] text-slate-500 mt-1">{action.desc}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950 text-slate-400 group-hover:text-blue-400 transition-colors border border-slate-800/60">
                {action.icon}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── PROPERTIES BREAKDOWN ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Building size={15} className="text-blue-400" />
            <span>Properties Breakdown</span>
          </h2>

          {/* Inline search filter */}
          {properties.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter properties..."
                value={propertySearch}
                onChange={e => setPropertySearch(e.target.value)}
                className="form-input bg-slate-900 border-slate-800 pl-9 py-1.5 text-xs rounded-xl"
              />
            </div>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="card glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center border-slate-800">
            <Building size={40} className="text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No properties registered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">Add your first property to start monitoring occupancy and expected revenue.</p>
            <Link to="/properties" className="btn btn-primary text-xs px-4 py-2 mt-4 rounded-xl shadow-glow">
              + Add Property
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map(property => {
              const propertyRooms = rooms.filter(r => r.property_id === property.id);
              const roomCount = propertyRooms.length;
              
              // Compute occupancy stats
              const occupiedRooms = propertyRooms.filter(r => {
                return r.status === 'Occupied' || leases.some(l => l.room_id === r.id && l.is_active);
              });
              const occupiedCount = occupiedRooms.length;
              const propOccupancyRate = roomCount === 0 ? 0 : Math.round((occupiedCount / roomCount) * 100);

              // Compute monthly total expected rent
              const propertyRevenue = propertyRooms.reduce((sum, r) => sum + parseFloat(r.base_rent || 0), 0);

              return (
                <div key={property.id} className="card glass-card overflow-hidden border-slate-800/80 bg-slate-900/20">
                  
                  {/* Property Header */}
                  <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                        {property.name}
                        {property.address && (
                          <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            {property.address}
                          </span>
                        )}
                      </h3>
                      
                      {/* Occupancy Progress Bar */}
                      <div className="flex items-center gap-2.5 mt-2">
                        <div className="w-32 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              propOccupancyRate > 75 ? 'bg-emerald-500' : propOccupancyRate > 35 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${propOccupancyRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{propOccupancyRate}% Occupied ({occupiedCount}/{roomCount} rooms)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Expected Rent</span>
                        <span className="font-bold text-slate-200 font-mono">{formatINR(propertyRevenue)}</span>
                      </div>
                      <Link 
                        to="/properties" 
                        className="p-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors flex items-center justify-center"
                        title="Manage Property"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Rooms List */}
                  {propertyRooms.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic">
                      No rooms added yet. Go to Properties & Rooms to add configurations.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-850/60">
                      {propertyRooms.map(room => {
                        const { status, tenant } = getRoomOccupancy(room.id);
                        const balance = getRoomPendingBalance(room.id);
                        const isOccupied = status === 'Occupied' || !!tenant;

                        return (
                          <div key={room.id} className="p-4 hover:bg-slate-900/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20 flex-shrink-0 font-mono">
                                {room.room_number}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-200">Room {room.room_number}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{room.room_type || 'Standard'} • Floor {room.floor || 'G'}</p>
                              </div>
                            </div>

                            {/* Center Status, Tenant Details — fixed 3-column grid for alignment */}
                            <div className="grid grid-cols-3 gap-4 text-xs w-full sm:w-auto" style={{ minWidth: '300px' }}>
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Tenant</span>
                                <span className="font-semibold text-slate-200 truncate block max-w-[120px]">
                                  {tenant ? tenant.name : <span className="text-slate-600 italic">— Vacant —</span>}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Monthly Rent</span>
                                <span className="font-bold text-slate-200 font-mono">{formatINR(room.base_rent)}</span>
                              </div>

                              <div className="min-w-0">
                                <span className={`text-[9px] font-bold uppercase tracking-widest block ${balance > 0 ? 'text-red-500/70' : 'text-slate-500'}`}>Arrears</span>
                                {balance > 0 ? (
                                  <span className="font-bold text-red-400 font-mono">{formatINR(balance)}</span>
                                ) : (
                                  <span className="font-medium text-slate-600">—</span>
                                )}
                              </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              {balance > 0 && tenant && (
                                <button
                                  onClick={() => {
                                    const text = `*RENT & UTILITY PAYMENT REMINDER*\nDear ${tenant.name},\nThis is a gentle reminder regarding your pending balance of *${formatINR(balance)}* for Room ${room.room_number} (${property.name}).\n\nPlease clear the due payment at your earliest convenience. Thank you!`;
                                    const phone = tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '';
                                    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                                  title="Send 1-Click WhatsApp Reminder to Tenant"
                                >
                                  <Share2 size={11} />
                                  <span>Remind</span>
                                </button>
                              )}

                              {isOccupied ? (
                                <Link
                                  to={`/smart-calc?roomId=${room.id}`}
                                  className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <Zap size={11} /> Bill
                                </Link>
                              ) : (
                                <Link
                                  to="/tenants"
                                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all"
                                >
                                  Assign <ArrowRight size={10} />
                                </Link>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── USER GUIDE POPUP manual ── */}
      <div className="card glass-card p-5 border-blue-500/20 bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/25 text-blue-400 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Need help setting up leases or calculation modes?</h3>
            <p className="text-slate-400 text-xs mt-0.5">Explore our simple 5-step quick-start manual wizard.</p>
          </div>
        </div>
        <button
          onClick={() => setShowGuideModal(true)}
          className="btn btn-secondary text-xs py-2 px-4 rounded-xl text-blue-400 hover:text-white flex items-center gap-1.5 w-full sm:w-auto justify-center flex-shrink-0"
        >
          <span>Open interactive Manual</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Popout Interactive User Manual Modal */}
      {showGuideModal && createPortal(
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="card glass-card w-full max-w-2xl border-slate-800 bg-slate-900 shadow-2xl relative my-auto overflow-hidden">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">BillRoom Quick Start & User Guide</h3>
                  <p className="text-slate-400 text-xs">Step-by-step instructions to manage your property portfolio.</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Steps Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              
              {/* Step 1: Add Property */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
                    Add Property Location
                  </span>
                  <Building size={16} className="text-blue-400" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Create your building or apartment complex</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to <strong className="text-slate-200">Properties & Rooms</strong> and click <strong className="text-blue-400">+ New Property</strong> to add your building name and address.
                </p>
              </div>

              {/* Step 2: Add Room */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">2</span>
                    Register Rooms & Submeter Mode
                  </span>
                  <Home size={16} className="text-purple-400" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Set room rent & electricity billing method</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select your property and click <strong className="text-purple-400">+ Add Room</strong>. Enter floor, base rent, and choose between <strong className="text-slate-200">⚡ Submeter Reading</strong> (units + rate) or <strong className="text-slate-200">📄 Direct Bill / Skip</strong>.
                </p>
              </div>

              {/* Step 3: Add Tenant & Allocate Room */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">3</span>
                    Add Tenant & Allocate Room
                  </span>
                  <div className="flex gap-1 text-amber-400">
                    <UserPlus size={15} />
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-medium">Register tenant details & link them to a room</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to <strong className="text-slate-200">Tenants & Leases</strong>, click <strong className="text-amber-400">+ Register Tenant</strong>, then switch to the <strong className="text-slate-200">Room Allocations (Leases)</strong> tab to assign the tenant to their designated room.
                </p>
              </div>

              {/* Step 4: Generate Bill */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px]">4</span>
                    Calculate Monthly Bill
                  </span>
                  <Zap size={16} className="text-yellow-400" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Generate itemized rent & utility bill</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Open <strong className="text-slate-200">Smart Calculator</strong>, pick the room, enter current meter reading (previous reading autofills automatically), and click <strong className="text-blue-400">Calculate & Save Bill</strong>.
                </p>
              </div>

              {/* Step 5: Share & Collect Payment */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">5</span>
                    Share WhatsApp / PDF & Track Payments
                  </span>
                  <div className="flex gap-1 text-emerald-400">
                    <Share2 size={15} />
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-medium">Share invoice on WhatsApp and record payments</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong className="text-emerald-400">Share WhatsApp</strong> or <strong className="text-blue-400">Download PDF</strong>. When payment is received, click <strong className="text-slate-200">Pay</strong> in Billing Records — any remaining balance will automatically track as arrears.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-primary rounded-xl px-5 py-2 text-xs"
              >
                Got It, Close Manual
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
              // Refresh dashboard data
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
