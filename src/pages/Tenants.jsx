import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useLocation } from 'react-router-dom';
import {
  Users, UserPlus, Key, Trash2, Edit2, Link2, Check, X, ShieldAlert,
  Building, Home, Calendar, AlertCircle, ChevronDown, Search, User,
  MapPin
} from 'lucide-react';
import { useConfirm } from '../components/Toast';

/* ─────────────────────────────────────────────────────────────────────────
   Custom SaaS Dropdown — reusable, searchable, animated
───────────────────────────────────────────────────────────────────────────*/
function SaasDropdown({
  label,
  value,
  onChange,
  options,        // [{ value, label, sublabel?, disabled?, icon? }]
  placeholder = 'Choose…',
  required = false,
  disabled = false,
  icon: IconComponent,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v); setQuery(''); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold text-left transition-all duration-200 ${
          disabled
            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            : open
            ? 'bg-white border-[#2d5a47] shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
        style={open ? { boxShadow: '0 0 0 3px rgba(45,90,71,0.1)' } : {}}
      >
        {/* Leading icon */}
        {IconComponent && (
          <span className={`flex-shrink-0 ${selected ? 'text-[#2d5a47]' : 'text-slate-300'}`}>
            <IconComponent size={16} />
          </span>
        )}

        {/* Selection or placeholder */}
        <span className={`flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>

        {/* Clear + chevron */}
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && !disabled && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-[200] bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-300/30 overflow-hidden"
          style={{ animation: 'dropdownFadeIn 0.15s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Search bar (show if >4 options) */}
          {options.length > 4 && (
            <div className="px-3 pt-3 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2d5a47] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1.5 px-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">No results</div>
            ) : filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false); } }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100 text-xs ${
                  opt.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : opt.value === value
                    ? 'bg-[#edf5f1] text-[#2d5a47] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{opt.sublabel}</span>
                )}
                {opt.value === value && !opt.disabled && (
                  <Check size={13} className="text-[#2d5a47] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Custom SaaS Date Input
───────────────────────────────────────────────────────────────────────────*/
function SaasDateInput({ label, value, onChange, required = false, placeholder = 'YYYY-MM-DD' }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  return (
    <div>
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Calendar
          size={15}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            focused ? 'text-[#2d5a47]' : 'text-slate-400'
          }`}
        />
        <input
          ref={inputRef}
          type="date"
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-semibold text-slate-900 bg-white outline-none transition-all duration-200 cursor-pointer ${
            focused
              ? 'border-[#2d5a47]'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          style={focused ? { boxShadow: '0 0 0 3px rgba(45,90,71,0.1)' } : {}}
        />
        {/* Click overlay to open native picker */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => inputRef.current?.showPicker?.()}
          style={{ pointerEvents: value ? 'none' : 'auto' }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Main Tenants Page
───────────────────────────────────────────────────────────────────────────*/
export default function Tenants() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const location = useLocation();

  // Highlight tenant from URL param (?highlight=Name)
  const highlightName = React.useMemo(() => {
    const p = new URLSearchParams(location.search);
    return (p.get('highlight') || '').trim().toLowerCase();
  }, [location.search]);

  const [tenantSearch, setTenantSearch] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('highlight') || '';
  });
  const [highlightFading, setHighlightFading] = useState(false);
  const highlightRowRef = useRef(null);

  useEffect(() => {
    if (!highlightName) return;
    setTenantSearch(decodeURIComponent(highlightName));
    setHighlightFading(false);
    const t1 = setTimeout(() => setHighlightFading(true), 2500);
    const t2 = setTimeout(() => setHighlightFading(false), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [highlightName]);

  useEffect(() => {
    if (highlightRowRef.current && highlightName) {
      setTimeout(() => highlightRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightName]);

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
    const yes = await confirm({
      title: 'Delete Tenant',
      message: 'Are you sure you want to delete this tenant? All lease contracts for this tenant will also be removed.',
      confirmText: 'Delete',
      type: 'error'
    });
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
    const yes = await confirm({
      title: 'Terminate Lease',
      message: 'Are you sure you want to terminate this lease? The room will become vacant.',
      confirmText: 'Terminate',
      type: 'warning'
    });
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

  // Build dropdown option arrays
  const tenantOptions = tenants
    .filter(t => t.active)
    .map(t => ({
      value: t.id,
      label: t.name,
      sublabel: t.phone || undefined,
      icon: <User size={13} className="text-slate-400" />
    }));

  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: p.address || undefined,
    icon: <Building size={13} className="text-[#2d5a47]" />
  }));

  const roomOptions = filteredRoomsForProperty.map(r => {
    const isOccupied = leases.some(l => l.room_id === r.id && l.is_active);
    return {
      value: r.id,
      label: `Room ${r.room_number}`,
      sublabel: isOccupied ? 'Occupied' : r.room_type || undefined,
      disabled: isOccupied,
      icon: <Home size={13} className={isOccupied ? 'text-slate-300' : 'text-emerald-500'} />
    };
  });

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

          {/* Tenant Search Bar */}
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tenant by name…"
              value={tenantSearch}
              onChange={e => setTenantSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs font-semibold text-slate-800 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:border-[#2d5a47] transition-colors"
            />
            {tenantSearch && (
              <button
                type="button"
                onClick={() => setTenantSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

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
                  {tenants
                    .filter(t => !tenantSearch.trim() || t.name?.toLowerCase().includes(tenantSearch.trim().toLowerCase()))
                    .map(t => {
                      const isHighlighted = !!highlightName && t.name?.toLowerCase() === highlightName;
                      return (
                        <tr
                          key={t.id}
                          ref={isHighlighted ? highlightRowRef : null}
                          className={`transition-all duration-700 ${
                            isHighlighted && !highlightFading
                              ? 'bg-emerald-50/80 ring-2 ring-inset ring-[#2d5a47]/40'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="px-6 py-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              {isHighlighted && !highlightFading && (
                                <span className="inline-flex w-2 h-2 rounded-full bg-[#2d5a47] animate-pulse flex-shrink-0" />
                              )}
                              {t.name}
                            </div>
                          </td>
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
                      );
                    })
                  }
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

          {/* ── Allocation Form ── */}
          {showLeaseForm && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden max-w-2xl">

              {/* Premium gradient form header */}
              <div
                className="relative px-6 pt-6 pb-5 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1a3a2b 0%, #2d5a47 60%, #3a7a5c 100%)' }}
              >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #a8ffce, transparent 70%)', transform: 'translate(40%, -40%)' }} />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #7fffd4, transparent 70%)', transform: 'translate(-30%, 40%)' }} />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)' }}
                    >
                      <Link2 size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/80 mb-0.5">
                        New Allocation
                      </div>
                      <h3 className="font-extrabold text-white text-base leading-tight">Allocate Room to Tenant</h3>
                      <p className="text-xs text-emerald-200/70 mt-0.5">Connect a registered tenant with an available room.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLeaseForm(false)}
                    className="flex-shrink-0 p-2 rounded-xl cursor-pointer transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <form onSubmit={handleLeaseSubmit} className="p-6 space-y-5">

                {/* SELECT TENANT */}
                <SaasDropdown
                  label="Select Tenant"
                  required
                  placeholder="Choose a tenant…"
                  value={selectedTenantId}
                  onChange={setSelectedTenantId}
                  options={tenantOptions}
                  icon={User}
                />

                {/* SELECT PROPERTY & ROOM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SaasDropdown
                    label="Select Property"
                    required
                    placeholder="Choose property…"
                    value={selectedPropertyId}
                    onChange={(v) => {
                      setSelectedPropertyId(v);
                      setSelectedRoomId('');
                    }}
                    options={propertyOptions}
                    icon={Building}
                  />

                  <SaasDropdown
                    label="Select Room"
                    required
                    placeholder={selectedPropertyId ? 'Choose a room…' : 'Select property first'}
                    value={selectedRoomId}
                    onChange={setSelectedRoomId}
                    options={roomOptions}
                    disabled={!selectedPropertyId}
                    icon={Home}
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-slate-100" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lease Duration</span>
                  <div className="flex-1 border-t border-slate-100" />
                </div>

                {/* LEASE DATES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SaasDateInput
                    label="Lease Start Date"
                    required
                    value={leaseStartDate}
                    onChange={setLeaseStartDate}
                  />
                  <SaasDateInput
                    label={<>Lease End Date <span className="text-slate-400 font-medium normal-case">(optional)</span></>}
                    value={leaseEndDate}
                    onChange={setLeaseEndDate}
                  />
                </div>

                {/* Helper */}
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Leave end date blank for open-ended / month-to-month leases.
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-2xl text-white font-bold text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #2d5a47, #3a7a5c)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #234738, #2d5a47)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #2d5a47, #3a7a5c)'}
                  >
                    <Link2 size={15} /> Allocate Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaseForm(false)}
                    className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
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
