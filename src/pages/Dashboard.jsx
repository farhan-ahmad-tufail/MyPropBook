import React, { useState, useEffect } from 'react';
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
  Download,
  CheckCircle2,
  HelpCircle,
  X,
  UserPlus,
  Link as LinkIcon,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);

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

  const totalProperties = properties.length;
  const totalRooms = rooms.length;
  const activeTenants = tenants.filter(t => t.active).length;

  const activeLeaseRoomIds = leases.filter(l => l.is_active).map(l => l.room_id);
  const expectedMonthlyRevenue = rooms
    .filter(r => activeLeaseRoomIds.includes(r.id))
    .reduce((sum, r) => sum + parseFloat(r.base_rent || 0), 0);

  const pendingArrears = bills
    .filter(b => b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid')
    .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up active">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time overview of your rental portfolio.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowGuideModal(true)}
            className="btn btn-secondary rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            title="View complete step-by-step user guide"
          >
            <HelpCircle size={16} className="text-blue-400" /> User Guide
          </button>
          <Link to="/smart-calc" className="btn btn-primary shadow-glow rounded-xl px-4 py-2.5 text-sm flex items-center justify-center gap-2 flex-1 sm:flex-none">
            <Receipt size={16} /> New Monthly Bill
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid — 2 cols mobile, 5 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Properties */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Properties</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Building size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{totalProperties}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Registered</span>
        </div>

        {/* Total Rooms */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Total Rooms</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Home size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{totalRooms}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Rentals</span>
        </div>

        {/* Active Tenants */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Tenants</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Users size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{activeTenants}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Active</span>
        </div>

        {/* Expected Revenue */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={14} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-emerald-400 mt-2">₹{expectedMonthlyRevenue.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Per month</span>
        </div>

        {/* Pending Arrears */}
        <div className="card glass-card p-4 flex flex-col justify-between min-h-[90px] col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Pending Balance</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={14} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-red-400 mt-2">₹{pendingArrears.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 mt-1">Awaiting payments</span>
        </div>
      </div>

      {/* Properties Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Building size={18} className="text-blue-500" />
          <span>Properties Breakdown</span>
        </h2>

        {properties.length === 0 ? (
          <div className="card glass-card p-10 text-center text-slate-400 flex flex-col items-center">
            <Building size={40} className="text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No properties registered</h3>
            <p className="text-sm text-slate-500 mt-1">Go to Properties to add your first building.</p>
            <Link to="/properties" className="btn btn-secondary mt-5 rounded-xl text-sm">
              Add Property
            </Link>
          </div>
        ) : (
          properties.map(property => {
            const propertyRooms = rooms.filter(r => r.property_id === property.id);
            return (
              <div key={property.id} className="card glass-card overflow-hidden border-slate-800">
                {/* Property Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-100 truncate">{property.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{property.address || 'No address'}</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full font-medium flex-shrink-0">
                    {propertyRooms.length} Rooms
                  </span>
                </div>

                {propertyRooms.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No rooms registered in this property.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {propertyRooms.map(room => {
                      const { status, tenant } = getRoomOccupancy(room.id);
                      const balance = getRoomPendingBalance(room.id);
                      const isOccupied = status === 'Occupied';

                      return (
                        <div key={room.id} className="p-4 hover:bg-slate-900/20 transition-colors">
                          {/* Room top row */}
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {room.room_number}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-200 text-sm">Room {room.room_number}</p>
                                <p className="text-xs text-slate-500">{room.room_type} • Floor {room.floor || 'G'}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                isOccupied
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-slate-800 text-slate-500'
                              }`}>
                                {status}
                              </span>
                              {isOccupied ? (
                                <Link
                                  to={`/smart-calc?roomId=${room.id}`}
                                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                  <Zap size={11} /> Bill
                                </Link>
                              ) : (
                                <Link
                                  to="/tenants"
                                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 font-medium"
                                >
                                  Assign <ArrowRight size={10} />
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Room bottom details row */}
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                            <span className="text-slate-400">Rent: <span className="text-slate-200 font-semibold">₹{parseFloat(room.base_rent).toLocaleString()}</span></span>
                            {tenant && (
                              <span className="text-slate-400">Tenant: <span className="text-slate-200 font-medium">{tenant.name}</span></span>
                            )}
                            {balance > 0 && (
                              <span className="text-red-400 font-semibold">Due: ₹{balance.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User Guide Popout Banner */}
      <div className="pt-2">
        <div className="card glass-card p-4 border-blue-500/20 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-xs sm:text-sm">Need help setting up or generating bills?</h3>
              <p className="text-slate-400 text-[11px] sm:text-xs">Follow our 5-step quick guide for properties, rooms, tenants & billing.</p>
            </div>
          </div>
          <button
            onClick={() => setShowGuideModal(true)}
            className="btn btn-secondary text-xs py-2 px-3.5 rounded-xl text-blue-400 hover:text-white flex items-center gap-1.5 w-full sm:w-auto justify-center flex-shrink-0"
          >
            <span>Open Interactive Manual</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Popout Interactive User Manual Modal */}
      {showGuideModal && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
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
                    <LinkIcon size={15} />
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
                    <CreditCard size={15} />
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-medium">Share invoice on WhatsApp and record full or partial payments</p>
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
    </div>
  );
}
