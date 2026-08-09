import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, UserPlus, Key, Trash2, Edit2, Link2, Check, X, ShieldAlert, Building, Home, Calendar, AlertCircle } from 'lucide-react';
import { useConfirm } from '../components/Toast';

export default function Tenants() {
  const { user } = useAuth();
  const confirm = useConfirm();
  
  // Data lists
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab State: 'tenants' or 'leases'
  const [activeTab, setActiveTab] = useState('tenants');

  // Form State - Tenant
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantActive, setTenantActive] = useState(true);
  const [editingTenantId, setEditingTenantId] = useState(null);

  // Form State - Lease (Allocation)
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaseEndDate, setLeaseEndDate] = useState('');

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [tenantsList, propsList, roomsList, leasesList] = await Promise.all([
        api.getTenants(ownerId),
        api.getProperties(ownerId),
        api.getAllRooms(ownerId),
        api.getLeases(ownerId)
      ]);

      setTenants(tenantsList);
      setProperties(propsList);
      setRooms(roomsList);
      setLeases(leasesList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tenant and lease details');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Tenant Submit (Create/Update)
  const handleTenantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ownerId = user?.id || 'mock_owner_id';

    try {
      const data = {
        name: tenantName,
        phone: tenantPhone,
        email: tenantEmail,
        active: tenantActive
      };

      if (editingTenantId) {
        await api.updateTenant(editingTenantId, data);
      } else {
        await api.createTenant(ownerId, data);
      }

      setTenantName('');
      setTenantPhone('');
      setTenantEmail('');
      setTenantActive(true);
      setShowTenantForm(false);
      setEditingTenantId(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to save tenant');
    }
  };

  const startEditTenant = (t) => {
    setEditingTenantId(t.id);
    setTenantName(t.name);
    setTenantPhone(t.phone || '');
    setTenantEmail(t.email || '');
    setTenantActive(t.active);
    setShowTenantForm(true);
  };

  const handleTenantDelete = async (id) => {
    const yes = await confirm({ title: 'Delete Tenant', message: 'Are you sure you want to delete this tenant? All lease contracts for this tenant will also be removed.', confirmText: 'Delete', type: 'error' });
    if (!yes) return;
    try {
      await api.deleteTenant(id);
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete tenant');
    }
  };

  // Lease Submit (Allocation)
  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenantId || !selectedRoomId) {
      setError('Please select a tenant and a room');
      return;
    }
    setError('');

    try {
      await api.createLease(selectedTenantId, selectedRoomId, {
        start_date: leaseStartDate,
        end_date: leaseEndDate || null
      });

      setSelectedTenantId('');
      setSelectedPropertyId('');
      setSelectedRoomId('');
      setLeaseStartDate(new Date().toISOString().split('T')[0]);
      setLeaseEndDate('');
      setShowLeaseForm(false);
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to allocate lease');
    }
  };

  const handleDeactivateLease = async (leaseId) => {
    const yes = await confirm({ title: 'Terminate Lease', message: 'Are you sure you want to terminate this lease? The room will become vacant.', confirmText: 'Terminate', type: 'warning' });
    if (!yes) return;
    try {
      await api.deactivateLease(leaseId);
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to terminate lease');
    }
  };

  // Helper getters
  const getRoomName = (roomId) => {
    const r = rooms.find(room => room.id === roomId);
    if (!r) return 'Unknown Room';
    const p = properties.find(prop => prop.id === r.property_id);
    return `${p ? p.name : 'Unknown Property'} - Room ${r.room_number}`;
  };

  const getTenantName = (tenantId) => {
    const t = tenants.find(ten => ten.id === tenantId);
    return t ? t.name : 'Unknown Tenant';
  };

  // Filter rooms belonging to the selected property in the allocation dropdown
  const filteredRoomsForProperty = rooms.filter(r => r.property_id === selectedPropertyId);
  const activeLeasesCount = leases.filter(l => l.is_active).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER & TOGGLE TABS ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Tenants &amp; Leases</h1>
          <p className="text-slate-500 mt-1 text-sm">Register tenants and allocate rooms to them.</p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-slate-200/60 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tenants' 
                ? 'bg-[#2d5a47] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} /> Tenants Directory
          </button>
          <button
            onClick={() => setActiveTab('leases')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'leases' 
                ? 'bg-[#2d5a47] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key size={14} /> Active Allocations ({activeLeasesCount})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── MAIN TAB CONTENT ── */}
      {activeTab === 'tenants' ? (
        <div className="space-y-6">
          {/* Tenant Listing Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">REGISTERED TENANTS</h2>
            <button
              onClick={() => {
                setEditingTenantId(null);
                setTenantName('');
                setTenantPhone('');
                setTenantEmail('');
                setTenantActive(true);
                setShowTenantForm(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus size={15} /> Add Tenant
            </button>
          </div>

          {/* Add/Edit Tenant form */}
          {showTenantForm && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm max-w-2xl space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {editingTenantId ? 'Edit Tenant Information' : 'Add New Tenant Profile'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter tenant personal and contact details</p>
              </div>

              <form onSubmit={handleTenantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">FULL NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Scott"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                      value={tenantName}
                      onChange={e => setTenantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">PHONE NUMBER</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                      value={tenantPhone}
                      onChange={e => setTenantPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    placeholder="e.g. michael@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="tenantActive"
                    className="w-4 h-4 rounded border-slate-300 text-[#2d5a47] focus:ring-[#2d5a47] cursor-pointer"
                    checked={tenantActive}
                    onChange={e => setTenantActive(e.target.checked)}
                  />
                  <label htmlFor="tenantActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Active Tenant Status
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm cursor-pointer">
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTenantForm(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tenants Table/List */}
          {tenants.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-500 text-xs">
              No tenants registered in the directory. Click "Add Tenant" to register.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="px-6 py-4">NAME</th>
                    <th className="px-6 py-4">PHONE</th>
                    <th className="px-6 py-4">EMAIL</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{t.name}</td>
                      <td className="px-6 py-4 text-slate-500">{t.phone || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">{t.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.active 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => startEditTenant(t)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Tenant"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleTenantDelete(t.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Tenant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Tab: Allocations (Leases)
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">LEASE AGREEMENTS</h2>
            <button
              onClick={() => {
                setError('');
                setSelectedTenantId('');
                setSelectedPropertyId('');
                setSelectedRoomId('');
                setLeaseStartDate(new Date().toISOString().split('T')[0]);
                setLeaseEndDate('');
                setShowLeaseForm(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Link2 size={15} /> Allocate Room
            </button>
          </div>

          {/* Allocation/Lease Creation Form (Redesigned in Sage Mint Theme) */}
          {showLeaseForm && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm max-w-2xl space-y-6">
              
              {/* Form Banner Header */}
              <div className="p-4 rounded-2xl bg-[#edf5f1] border border-[#d8e7e0] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d5a47] text-white flex items-center justify-center font-bold">
                  <Link2 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Allocate Room to Tenant</h3>
                  <p className="text-xs text-slate-500">Connect a registered tenant with an available room in your portfolio.</p>
                </div>
              </div>

              <form onSubmit={handleLeaseSubmit} className="space-y-4">
                
                {/* SELECT TENANT */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">SELECT TENANT</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47] cursor-pointer"
                    value={selectedTenantId}
                    onChange={e => setSelectedTenantId(e.target.value)}
                  >
                    <option value="">-- Choose Tenant --</option>
                    {tenants.filter(t => t.active).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* SELECT PROPERTY & ROOM ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">SELECT PROPERTY</label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47] cursor-pointer"
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

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">SELECT ROOM</label>
                    <select
                      required
                      disabled={!selectedPropertyId}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47] cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                      value={selectedRoomId}
                      onChange={e => setSelectedRoomId(e.target.value)}
                    >
                      <option value="">-- Choose Room --</option>
                      {filteredRoomsForProperty.map(r => {
                        const isOccupied = leases.some(l => l.room_id === r.id && l.is_active);
                        return (
                          <option 
                            key={r.id} 
                            value={r.id}
                            disabled={isOccupied}
                          >
                            Room {r.room_number} {isOccupied ? '(Occupied)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* LEASE DATES ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">LEASE START DATE</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                      value={leaseStartDate}
                      onChange={e => setLeaseStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">LEASE END DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                      value={leaseEndDate}
                      onChange={e => setLeaseEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm cursor-pointer">
                    Allocate Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaseForm(false)}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Leases Table */}
          {leases.filter(l => l.is_active).length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-500 text-xs">
              No active tenant-to-room allocations exist. Click "Allocate Room" to start.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="px-6 py-4">TENANT NAME</th>
                    <th className="px-6 py-4">ALLOCATED PROPERTY &amp; ROOM</th>
                    <th className="px-6 py-4">START DATE</th>
                    <th className="px-6 py-4">END DATE</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {leases
                    .filter(l => l.is_active)
                    .map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{getTenantName(l.tenant_id)}</td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">{getRoomName(l.room_id)}</td>
                        <td className="px-6 py-4 text-slate-500">{l.start_date}</td>
                        <td className="px-6 py-4 text-slate-500">{l.end_date || 'Ongoing'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeactivateLease(l.id)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors cursor-pointer"
                            title="End Lease Agreement"
                          >
                            Terminate Lease
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
