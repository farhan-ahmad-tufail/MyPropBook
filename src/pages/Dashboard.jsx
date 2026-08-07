import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building, 
  Users, 
  Home, 
  DollarSign, 
  AlertTriangle,
  Receipt,
  ArrowRight,
  TrendingUp,
  CircleAlert
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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const ownerId = user?.id || 'mock_owner_id';

        // Load all data parallel
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

  // Calculations
  const totalProperties = properties.length;
  const totalRooms = rooms.length;
  const activeTenants = tenants.filter(t => t.active).length;

  // Expected monthly revenue = sum of base_rent for rooms that have an active lease
  const activeLeaseRoomIds = leases.filter(l => l.is_active).map(l => l.room_id);
  const expectedMonthlyRevenue = rooms
    .filter(r => activeLeaseRoomIds.includes(r.id))
    .reduce((sum, r) => sum + parseFloat(r.base_rent || 0), 0);

  // Total pending arrears = sum of total_payable of bills with 'Unpaid' or 'Partially Paid' status
  const pendingArrears = bills
    .filter(b => b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid')
    .reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);

  // Helper: Get lease/tenant details for a room
  const getRoomOccupancy = (roomId) => {
    const activeLease = leases.find(l => l.room_id === roomId && l.is_active);
    if (!activeLease) return { status: 'Vacant', tenant: null };
    
    const tenant = tenants.find(t => t.id === activeLease.tenant_id);
    return { status: 'Occupied', tenant };
  };

  // Helper: Get total unpaid bills balance for a room
  const getRoomPendingBalance = (roomId) => {
    return bills
      .filter(b => b.room_id === roomId && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
      .reduce((sum, b) => sum + parseFloat(b.total_payable || 0), 0);
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
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Operations Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time overview of your rental business portfolio.</p>
        </div>
        <Link to="/smart-calc" className="btn btn-primary shadow-glow rounded-xl px-5 py-2.5">
          <Receipt size={18} /> New Monthly Bill
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="card glass-card p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Properties</span>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">{totalProperties}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building size={18} />
            </div>
          </div>
          <span className="text-xs text-slate-500">Registered locations</span>
        </div>

        {/* Metric 2 */}
        <div className="card glass-card p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rooms</span>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">{totalRooms}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Home size={18} />
            </div>
          </div>
          <span className="text-xs text-slate-500">Available rentals</span>
        </div>

        {/* Metric 3 */}
        <div className="card glass-card p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tenants</span>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">{activeTenants}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <span className="text-xs text-slate-500">Occupied leases</span>
        </div>

        {/* Metric 4 */}
        <div className="card glass-card p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected Revenue</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">₹{expectedMonthlyRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-xs text-slate-500">Rent per month</span>
        </div>

        {/* Metric 5 */}
        <div className="card glass-card p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Balance</span>
              <h3 className="text-2xl font-bold text-red-400 mt-1">₹{pendingArrears.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <span className="text-xs text-slate-500">Awaiting payments</span>
        </div>
      </div>

      {/* Property Wise Details Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Building size={20} className="text-blue-500" />
          <span>Properties Breakdown</span>
        </h2>

        {properties.length === 0 ? (
          <div className="card glass-card p-12 text-center text-slate-400 flex flex-col items-center">
            <Building size={48} className="text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-300">No properties registered</h3>
            <p className="text-sm text-slate-500 mt-1">Go to Properties to add your first building location.</p>
            <Link to="/properties" className="btn btn-secondary mt-6 rounded-xl">
              Add Property
            </Link>
          </div>
        ) : (
          properties.map(property => {
            const propertyRooms = rooms.filter(r => r.property_id === property.id);
            return (
              <div key={property.id} className="card glass-card overflow-hidden border-slate-800">
                <div className="p-5 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{property.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{property.address || 'No address specified'}</p>
                  </div>
                  <div className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full font-medium">
                    {propertyRooms.length} Rooms
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {propertyRooms.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No rooms registered in this property.
                    </div>
                  ) : (
                    <table className="table w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                          <th className="px-6 py-3.5">Room Number</th>
                          <th className="px-6 py-3.5">Floor</th>
                          <th className="px-6 py-3.5">Type</th>
                          <th className="px-6 py-3.5">Rent</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Tenant Name</th>
                          <th className="px-6 py-3.5">Pending Arrears</th>
                          <th className="px-6 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {propertyRooms.map(room => {
                          const { status, tenant } = getRoomOccupancy(room.id);
                          const balance = getRoomPendingBalance(room.id);
                          
                          return (
                            <tr key={room.id} className="hover:bg-slate-900/20 transition-colors border-b border-slate-800/60 last:border-0">
                              <td className="px-6 py-4 font-semibold text-slate-200">{room.room_number}</td>
                              <td className="px-6 py-4 text-slate-400">{room.floor || 'G'}</td>
                              <td className="px-6 py-4 text-slate-400">{room.room_type}</td>
                              <td className="px-6 py-4 text-slate-200">₹{parseFloat(room.base_rent).toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  status === 'Occupied' 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-300">
                                {tenant ? tenant.name : <span className="text-slate-600">-</span>}
                              </td>
                              <td className="px-6 py-4">
                                {balance > 0 ? (
                                  <span className="font-semibold text-red-400">₹{balance.toLocaleString()}</span>
                                ) : (
                                  <span className="text-slate-500">₹0</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {status === 'Occupied' ? (
                                  <Link 
                                    to={`/smart-calc?roomId=${room.id}`}
                                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                                  >
                                    <span>Bill</span>
                                    <ArrowRight size={12} />
                                  </Link>
                                ) : (
                                  <Link 
                                    to="/tenants"
                                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 font-medium"
                                  >
                                    <span>Rent</span>
                                    <ArrowRight size={12} />
                                  </Link>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
