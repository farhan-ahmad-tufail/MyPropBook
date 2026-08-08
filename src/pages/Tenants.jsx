import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, UserPlus, Key, Trash2, Edit2, Link2, Check, X, ShieldAlert } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active">
      {/* Header and Toggle Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Tenants & Leases</h1>
          <p className="text-slate-400 mt-1 text-sm">Register tenants and allocate rooms to them.</p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tenants' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} /> Tenants Directory
          </button>
          <button
            onClick={() => setActiveTab('leases')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'leases' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key size={14} /> Active Allocations ({leases.filter(l => l.is_active).length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'tenants' ? (
        <div className="space-y-6">
          {/* Tenant Listing Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registered Tenants</h2>
            <button
              onClick={() => {
                setEditingTenantId(null);
                setTenantName('');
                setTenantPhone('');
                setTenantEmail('');
                setTenantActive(true);
                setShowTenantForm(true);
              }}
              className="btn btn-primary px-4 py-2 text-xs rounded-lg flex items-center gap-1.5"
            >
              <UserPlus size={14} /> Add Tenant
            </button>
          </div>

          {/* Add/Edit Tenant form */}
          {showTenantForm && (
            <div className="card glass-card p-6 border-blue-500/20 max-w-2xl bg-slate-900/40">
              <h3 className="font-bold text-slate-200 mb-5 text-sm">
                {editingTenantId ? 'Edit Tenant Information' : 'Add New Tenant Profile'}
              </h3>
              <form onSubmit={handleTenantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Scott"
                      className="form-input bg-slate-950"
                      value={tenantName}
                      onChange={e => setTenantName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      className="form-input bg-slate-950"
                      value={tenantPhone}
                      onChange={e => setTenantPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. michael@dundermifflin.com"
                    className="form-input bg-slate-950"
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id="tenantActive"
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                    checked={tenantActive}
                    onChange={e => setTenantActive(e.target.checked)}
                  />
                  <label htmlFor="tenantActive" className="text-sm font-semibold text-slate-300">
                    Active Tenant Status
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn btn-primary py-2.5 px-4 rounded-xl flex-1 text-xs">
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTenantForm(false)}
                    className="btn btn-secondary py-2.5 px-4 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tenants Table/List */}
          {tenants.length === 0 ? (
            <div className="card glass-card p-12 text-center text-slate-500 text-sm">
              No tenants registered in the directory. Click "Add Tenant" to register.
            </div>
          ) : (
            <div className="card glass-card overflow-hidden border-slate-800">
              <table className="table w-full text-left">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} className="border-b border-slate-850 hover:bg-slate-900/10 last:border-0">
                      <td className="px-6 py-4 font-semibold text-slate-200">{t.name}</td>
                      <td className="px-6 py-4 text-slate-400">{t.phone || '-'}</td>
                      <td className="px-6 py-4 text-slate-400">{t.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.active 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {t.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditTenant(t)}
                            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded"
                            title="Edit Tenant"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleTenantDelete(t.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded"
                            title="Delete Tenant"
                          >
                            <Trash2 size={13} />
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
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Lease Agreements</h2>
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
              className="btn btn-primary px-4 py-2 text-xs rounded-lg flex items-center gap-1.5"
            >
              <Link2 size={14} /> Allocate Room
            </button>
          </div>

          {/* Allocation/Lease Creation Form */}
          {showLeaseForm && (
            <div className="card glass-card p-6 border-blue-500/20 max-w-2xl bg-slate-900/40">
              <h3 className="font-bold text-slate-200 mb-5 text-sm flex items-center gap-2">
                <Link2 size={16} className="text-blue-400" />
                <span>Allocate Room to Tenant</span>
              </h3>
              <form onSubmit={handleLeaseSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="input-label">Select Tenant</label>
                  <select
                    required
                    className="form-input bg-slate-950"
                    value={selectedTenantId}
                    onChange={e => setSelectedTenantId(e.target.value)}
                  >
                    <option value="">-- Choose Tenant --</option>
                    {tenants.filter(t => t.active).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="input-label">Select Property</label>
                    <select
                      required
                      className="form-input bg-slate-955"
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

                  <div className="form-group">
                    <label className="input-label">Select Room</label>
                    <select
                      required
                      disabled={!selectedPropertyId}
                      className="form-input bg-slate-955"
                      value={selectedRoomId}
                      onChange={e => setSelectedRoomId(e.target.value)}
                    >
                      <option value="">-- Choose Room --</option>
                      {filteredRoomsForProperty.map(r => {
                        // Check if room is already occupied by active leases
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="input-label">Lease Start Date</label>
                    <input
                      type="date"
                      required
                      className="form-input bg-slate-950"
                      value={leaseStartDate}
                      onChange={e => setLeaseStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Lease End Date (Optional)</label>
                    <input
                      type="date"
                      className="form-input bg-slate-955"
                      value={leaseEndDate}
                      onChange={e => setLeaseEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn btn-primary py-2.5 px-4 rounded-xl flex-1 text-xs">
                    Allocate Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaseForm(false)}
                    className="btn btn-secondary py-2.5 px-4 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Leases Table */}
          {leases.filter(l => l.is_active).length === 0 ? (
            <div className="card glass-card p-12 text-center text-slate-500 text-sm">
              No active tenant-to-room allocations exist. Click "Allocate Room" to start.
            </div>
          ) : (
            <div className="card glass-card overflow-hidden border-slate-800">
              <table className="table w-full text-left">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Tenant Name</th>
                    <th className="px-6 py-4">Allocated Property & Room</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leases
                    .filter(l => l.is_active)
                    .map(l => (
                      <tr key={l.id} className="border-b border-slate-850 hover:bg-slate-900/10 last:border-0">
                        <td className="px-6 py-4 font-semibold text-slate-200">{getTenantName(l.tenant_id)}</td>
                        <td className="px-6 py-4 text-slate-300 font-medium">{getRoomName(l.room_id)}</td>
                        <td className="px-6 py-4 text-slate-400">{l.start_date}</td>
                        <td className="px-6 py-4 text-slate-400">{l.end_date || 'Ongoing'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeactivateLease(l.id)}
                            className="btn btn-secondary hover:text-red-400 hover:border-red-500/20 py-1.5 px-3 rounded-lg text-xs"
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
