import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useLocation } from 'react-router-dom';
import {
  Users, UserPlus, Key, Trash2, Edit2, Link2, Check, X, ShieldAlert,
  Building, Home, Calendar, AlertCircle, ChevronDown, Search, User,
  MapPin, Shield, Plus, Minus, RotateCcw, IndianRupee, FileText
} from 'lucide-react';
import { useConfirm, useToast } from '../components/Toast';
import { formatINR } from '../utils/formatters';

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
        <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v); setQuery(''); }}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[13px] font-medium text-left transition-all duration-150 ${disabled
          ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
          : open
            ? 'bg-white border-[#2d5a47] shadow-sm ring-2 ring-[#2d5a47]/10'
            : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
      >
        {/* Leading icon */}
        {IconComponent && (
          <span className={`flex-shrink-0 ${selected ? 'text-[#2d5a47]' : 'text-slate-400'}`}>
            <IconComponent size={15} />
          </span>
        )}

        {/* Selection or placeholder */}
        <span className={`flex-1 truncate ${selected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100 text-xs ${opt.disabled
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
        <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Calendar
          size={14}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${focused ? 'text-[#2d5a47]' : 'text-slate-400'
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
          className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-[13px] font-medium text-slate-900 bg-white outline-none transition-all duration-150 cursor-pointer ${focused
            ? 'border-[#2d5a47] ring-2 ring-[#2d5a47]/10'
            : 'border-slate-200 hover:border-slate-300'
            }`}
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

  // Tab State: 'tenants' | 'leases' | 'deposits'
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

  // Security Deposits
  const [deposits, setDeposits] = useState([]);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depTenantId, setDepTenantId] = useState('');
  const [depPropertyId, setDepPropertyId] = useState('');
  const [depRoomId, setDepRoomId] = useState('');
  const [depAmount, setDepAmount] = useState('');
  const [depDate, setDepDate] = useState(new Date().toISOString().split('T')[0]);
  const [depNotes, setDepNotes] = useState('');

  // Deduction & Return modals
  const [deductionModal, setDeductionModal] = useState(null); // deposit id
  const [dedReason, setDedReason] = useState('');
  const [dedAmount, setDedAmount] = useState('');
  const [returnModal, setReturnModal] = useState(null); // deposit id
  const [returnAmount, setReturnAmount] = useState('');
  const toast = useToast();

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [tenantsList, propsList, roomsList, leasesList, depositsList] = await Promise.all([
        api.getTenants(ownerId).catch(err => { console.error('Error fetching tenants:', err); return []; }),
        api.getProperties(ownerId).catch(err => { console.error('Error fetching properties:', err); return []; }),
        api.getAllRooms(ownerId).catch(err => { console.error('Error fetching rooms:', err); return []; }),
        api.getLeases(ownerId).catch(err => { console.error('Error fetching leases:', err); return []; }),
        api.getDeposits(ownerId).catch(err => { console.error('Error fetching deposits:', err); return []; })
      ]);

      setTenants(tenantsList || []);
      setProperties(propsList || []);
      setRooms(roomsList || []);
      setLeases(leasesList || []);
      setDeposits(depositsList || []);
    } catch (err) {
      console.error('loadAllData exception:', err);
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
  const heldDepositsCount = deposits.filter(d => d.status === 'held' || d.status === 'deducted').length;

  // Deposit helper computations
  const totalHeld = deposits.filter(d => d.status === 'held' || d.status === 'deducted').reduce((s, d) => s + parseFloat(d.amount || 0), 0);
  const totalDeductions = deposits.reduce((s, d) => s + (d.deductions || []).reduce((ss, dd) => ss + parseFloat(dd.amount || 0), 0), 0);
  const totalReturned = deposits.filter(d => d.status === 'returned').reduce((s, d) => s + parseFloat(d.return_amount || 0), 0);

  // Deposit rooms filter
  const depRoomsForProperty = rooms.filter(r => r.property_id === depPropertyId);

  // Deposit Handlers
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ownerId = user?.id || 'mock_owner_id';
    try {
      await api.createDeposit(ownerId, {
        tenant_id: depTenantId,
        room_id: depRoomId || null,
        property_id: depPropertyId || null,
        amount: parseFloat(depAmount),
        collected_date: depDate,
        notes: depNotes
      });
      setShowDepositForm(false);
      setDepTenantId(''); setDepPropertyId(''); setDepRoomId('');
      setDepAmount(''); setDepDate(new Date().toISOString().split('T')[0]); setDepNotes('');
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to record security deposit');
    }
  };

  const handleAddDeduction = async () => {
    if (!deductionModal || !dedAmount || !dedReason) return;
    try {
      const dep = deposits.find(d => d.id === deductionModal);
      if (!dep) return;
      const updatedDeductions = [...(dep.deductions || []), {
        id: 'ded_' + Date.now(),
        reason: dedReason,
        amount: parseFloat(dedAmount),
        date: new Date().toISOString().split('T')[0]
      }];
      await api.updateDeposit(dep.id, { deductions: updatedDeductions, status: 'deducted' });
      setDeductionModal(null); setDedReason(''); setDedAmount('');
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to add deduction');
    }
  };

  const handleProcessReturn = async () => {
    if (!returnModal) return;
    try {
      const dep = deposits.find(d => d.id === returnModal);
      if (!dep) return;
      const totalDed = (dep.deductions || []).reduce((s, dd) => s + parseFloat(dd.amount || 0), 0);
      const refund = returnAmount ? parseFloat(returnAmount) : (parseFloat(dep.amount) - totalDed);
      await api.updateDeposit(dep.id, {
        status: 'returned',
        return_amount: refund,
        return_date: new Date().toISOString().split('T')[0]
      });
      setReturnModal(null); setReturnAmount('');
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to process deposit return');
    }
  };

  const handleForfeitDeposit = async (depId) => {
    const yes = await confirm({
      title: 'Forfeit Deposit',
      message: 'This will mark the entire deposit as forfeited (non-refundable). Continue?',
      confirmText: 'Forfeit',
      type: 'warning'
    });
    if (!yes) return;
    try {
      await api.updateDeposit(depId, { status: 'forfeited', return_amount: 0, return_date: new Date().toISOString().split('T')[0] });
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to forfeit deposit');
    }
  };

  const handleDeleteDeposit = async (depId) => {
    const yes = await confirm({
      title: 'Delete Deposit Record',
      message: 'Permanently delete this security deposit record?',
      confirmText: 'Delete',
      type: 'warning'
    });
    if (!yes) return;
    try {
      await api.deleteDeposit(depId);
      await loadAllData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete deposit');
    }
  };

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
    const activeLeases = leases.filter(l => l.room_id === r.id && l.is_active);
    const tenantCount = activeLeases.length;

    let sublabel;
    if (tenantCount > 1) {
      sublabel = `👥 ${tenantCount} Tenants (Shared)`;
    } else if (tenantCount === 1) {
      const firstTenant = tenants.find(t => t.id === activeLeases[0].tenant_id);
      sublabel = `1 Tenant (${firstTenant?.name || 'Occupied'})`;
    } else {
      sublabel = r.room_type || 'Vacant';
    }

    return {
      value: r.id,
      label: `Room ${r.room_number}`,
      sublabel,
      disabled: false,
      icon: <Home size={13} className={tenantCount > 1 ? 'text-amber-500' : tenantCount === 1 ? 'text-blue-500' : 'text-emerald-500'} />
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
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'tenants'
              ? 'bg-[#2d5a47] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Users size={14} /> Tenants
          </button>
          <button
            onClick={() => setActiveTab('leases')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'leases'
              ? 'bg-[#2d5a47] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Key size={14} /> Allocations ({activeLeasesCount})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'deposits'
              ? 'bg-[#2d5a47] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Shield size={14} /> Deposits ({heldDepositsCount})
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
            <div className="bg-transparent lg:bg-white rounded-3xl lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
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
                            className={`transition-all duration-700 ${isHighlighted && !highlightFading
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
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.active
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

              {/* Mobile Card View */}
              <div className="lg:hidden flex flex-col gap-3 mt-4">
                {tenants
                  .filter(t => !tenantSearch.trim() || t.name?.toLowerCase().includes(tenantSearch.trim().toLowerCase()))
                  .map(t => {
                    const isHighlighted = !!highlightName && t.name?.toLowerCase() === highlightName;
                    const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TN';
                    return (
                      <div 
                        key={t.id} 
                        className={`bg-white border rounded-3xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all duration-700 ${
                          isHighlighted && !highlightFading 
                            ? 'border-[#2d5a47]/40 ring-1 ring-inset ring-[#2d5a47]/40' 
                            : 'border-slate-100'
                        }`}
                      >
                        {/* Top row: Identity & Status */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-800 text-sm truncate flex items-center gap-2">
                                {isHighlighted && !highlightFading && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d5a47] animate-pulse flex-shrink-0" />
                                )}
                                {t.name}
                              </p>
                              <p className="text-xs text-slate-400 font-medium truncate">{t.phone || 'No phone'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] flex-shrink-0 ${
                            t.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {t.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {/* Middle row: Email (if exists) */}
                        {t.email && (
                          <div className="bg-slate-50/80 p-2.5 rounded-xl">
                            <p className="text-xs text-slate-500 truncate">{t.email}</p>
                          </div>
                        )}
                        
                        {/* Bottom row: Actions */}
                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => startEditTenant(t)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleTenantDelete(t.id)}
                            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
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
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden max-w-xl">

              {/* Clean SaaS header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center">
                    <Link2 size={15} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">Allocate Room to Tenant</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Assign an available room to a registered tenant</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLeaseForm(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              <form onSubmit={handleLeaseSubmit} className="p-5 space-y-4">

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                {/* Shared room info note */}
                {(() => {
                  const selRoom = selectedRoomId ? filteredRoomsForProperty.find(r => r.id === selectedRoomId) : null;
                  if (!selRoom) return null;
                  const existingLeases = leases.filter(l => l.room_id === selectedRoomId && l.is_active);
                  const existingTenantNames = existingLeases
                    .map(l => tenants.find(t => t.id === l.tenant_id)?.name)
                    .filter(Boolean);
                  if (existingTenantNames.length === 0) return null;

                  return (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                      <span className="text-sm mt-0.5">👥</span>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-900 text-[12px]">
                          Adding Co-Tenant to Room {selRoom.room_number}
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Current occupants: <span className="font-semibold">{existingTenantNames.join(', ')}</span>. Utility bills will be split automatically.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* LEASE DATES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <SaasDateInput
                    label="Lease Start Date"
                    required
                    value={leaseStartDate}
                    onChange={setLeaseStartDate}
                  />
                  <SaasDateInput
                    label={<>Lease End Date <span className="text-slate-400 font-normal text-[10px]">(optional)</span></>}
                    value={leaseEndDate}
                    onChange={setLeaseEndDate}
                  />
                </div>

                {/* Helper */}
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <AlertCircle size={12} className="text-slate-400 flex-shrink-0" />
                  <span>Leave end date blank for open-ended or monthly leases.</span>
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-semibold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Link2 size={14} /> Allocate Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaseForm(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-all cursor-pointer"
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
              <div className="bg-transparent lg:bg-white rounded-3xl lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
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

                {/* Mobile Card View */}
                <div className="lg:hidden flex flex-col gap-3 mt-4">
                  {leases
                    .filter(l => l.is_active)
                    .map(l => {
                      const tenantName = getTenantName(l.tenant_id);
                      const roomName = getRoomName(l.room_id);
                      return (
                        <div key={l.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">{tenantName}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{roomName}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700">
                              Active
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl mt-1">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Start Date</span>
                              <p className="text-xs font-semibold text-slate-700">{l.start_date}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">End Date</span>
                              <p className="text-xs font-semibold text-slate-700">{l.end_date || 'Ongoing'}</p>
                            </div>
                          </div>

                          <div className="flex justify-end mt-1">
                            <button
                              onClick={() => handleDeactivateLease(l.id)}
                              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all cursor-pointer shadow-sm w-full sm:w-auto text-center"
                            >
                              Terminate Lease
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
          )}
        </div>
      )}

      {/* ── DEPOSITS TAB ── */}
      {activeTab === 'deposits' && (
        <div className="space-y-6">

          {/* Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Shield size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL HELD</p>
                  <p className="text-xl font-black text-slate-900">{formatINR(totalHeld)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Minus size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL DEDUCTIONS</p>
                  <p className="text-xl font-black text-amber-700">{formatINR(totalDeductions)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <RotateCcw size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL RETURNED</p>
                  <p className="text-xl font-black text-blue-700">{formatINR(totalReturned)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Header + Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">SECURITY DEPOSIT RECORDS</h2>
            <button
              onClick={() => {
                setShowDepositForm(true);
                setDepTenantId(''); setDepPropertyId(''); setDepRoomId('');
                setDepAmount(''); setDepDate(new Date().toISOString().split('T')[0]); setDepNotes('');
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus size={15} /> Record Deposit
            </button>
          </div>

          {/* Add Deposit Form */}
          {showDepositForm && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm max-w-2xl space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Record Security Deposit</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track deposit collected from tenant at move-in</p>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SaasDropdown
                    label="Tenant"
                    required
                    value={depTenantId}
                    onChange={setDepTenantId}
                    options={tenantOptions}
                    placeholder="Select tenant…"
                    icon={User}
                  />
                  <SaasDropdown
                    label="Property"
                    value={depPropertyId}
                    onChange={v => { setDepPropertyId(v); setDepRoomId(''); }}
                    options={propertyOptions}
                    placeholder="Select property…"
                    icon={Building}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {depPropertyId && (
                    <SaasDropdown
                      label="Room"
                      value={depRoomId}
                      onChange={setDepRoomId}
                      options={depRoomsForProperty.map(r => ({ value: r.id, label: `Room ${r.room_number}`, icon: <Home size={13} className="text-emerald-500" /> }))}
                      placeholder="Select room…"
                      icon={Home}
                    />
                  )}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">DEPOSIT AMOUNT *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        placeholder="e.g. 50000"
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                        value={depAmount}
                        onChange={e => setDepAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <SaasDateInput
                    label="Date Collected"
                    required
                    value={depDate}
                    onChange={setDepDate}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">NOTES</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 months advance, via bank transfer"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                    value={depNotes}
                    onChange={e => setDepNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm cursor-pointer">
                    Save Deposit Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDepositForm(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Deposit Cards */}
          {deposits.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-500 text-xs">
              No security deposits recorded yet. Click "Record Deposit" to start tracking.
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map(dep => {
                const tenant = tenants.find(t => t.id === dep.tenant_id);
                const room = rooms.find(r => r.id === dep.room_id);
                const property = properties.find(p => p.id === dep.property_id);
                const deds = dep.deductions || [];
                const totalDed = deds.reduce((s, d) => s + parseFloat(d.amount || 0), 0);
                const netBalance = parseFloat(dep.amount) - totalDed;

                const statusConfig = {
                  held: { label: 'Held', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
                  deducted: { label: 'Deductions Applied', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
                  returned: { label: 'Returned', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
                  forfeited: { label: 'Forfeited', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
                };
                const sc = statusConfig[dep.status] || statusConfig.held;
                const isActive = dep.status === 'held' || dep.status === 'deducted';

                return (
                  <div key={dep.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${isActive ? 'border-slate-200/80' : 'border-slate-100 opacity-80'
                    }`}>
                    {/* Card Header */}
                    <div className="p-5 pb-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center font-bold text-sm">
                            {tenant?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{tenant?.name || 'Unknown Tenant'}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {property?.name || ''}{room ? ` • Room ${room.room_number}` : ''}
                              {dep.collected_date ? ` • Collected ${dep.collected_date}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                          {isActive && (
                            <button
                              onClick={() => handleDeleteDeposit(dep.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Financial Summary Row */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deposit</p>
                          <p className="font-black text-slate-900 text-sm">{formatINR(dep.amount)}</p>
                        </div>
                        {totalDed > 0 && (
                          <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Deducted</p>
                            <p className="font-black text-amber-800 text-sm">-{formatINR(totalDed)}</p>
                          </div>
                        )}
                        {dep.status === 'returned' ? (
                          <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Returned</p>
                            <p className="font-black text-blue-800 text-sm">{formatINR(dep.return_amount || 0)}</p>
                          </div>
                        ) : dep.status === 'forfeited' ? (
                          <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                            <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Forfeited</p>
                            <p className="font-black text-red-800 text-sm">{formatINR(dep.amount)}</p>
                          </div>
                        ) : (
                          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Balance</p>
                            <p className="font-black text-emerald-800 text-sm">{formatINR(netBalance)}</p>
                          </div>
                        )}
                        {dep.notes && (
                          <div className="text-[11px] text-slate-400 font-medium italic flex items-center gap-1">
                            <FileText size={11} /> {dep.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deductions List */}
                    {deds.length > 0 && (
                      <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">DEDUCTION HISTORY</p>
                        <div className="space-y-1.5">
                          {deds.map((d, i) => (
                            <div key={d.id || i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="font-semibold text-slate-700">{d.reason}</span>
                                <span className="text-slate-400">{d.date}</span>
                              </div>
                              <span className="font-bold text-amber-700">-{formatINR(d.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return Info */}
                    {dep.status === 'returned' && dep.return_date && (
                      <div className="border-t border-blue-100 px-5 py-3 bg-blue-50/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-700">Refund processed on {dep.return_date}</span>
                          <span className="font-bold text-blue-800">{formatINR(dep.return_amount || 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {isActive && (
                      <div className="border-t border-slate-100 px-5 py-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => { setDeductionModal(dep.id); setDedReason(''); setDedAmount(''); }}
                          className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Minus size={12} /> Add Deduction
                        </button>
                        <button
                          onClick={() => {
                            const totalD = (dep.deductions || []).reduce((s, dd) => s + parseFloat(dd.amount || 0), 0);
                            setReturnModal(dep.id);
                            setReturnAmount(String(parseFloat(dep.amount) - totalD));
                          }}
                          className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw size={12} /> Process Return
                        </button>
                        <button
                          onClick={() => handleForfeitDeposit(dep.id)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <X size={12} /> Forfeit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── DEDUCTION MODAL ── */}
      {deductionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-base">Add Deduction</h3>
              <button onClick={() => setDeductionModal(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">REASON *</label>
              <input
                type="text"
                required
                placeholder="e.g. Wall damage repair, cleaning charges"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                value={dedReason}
                onChange={e => setDedReason(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">AMOUNT *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                  value={dedAmount}
                  onChange={e => setDedAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddDeduction}
                disabled={!dedReason || !dedAmount}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Deduction
              </button>
              <button
                onClick={() => setDeductionModal(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RETURN MODAL ── */}
      {returnModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-base">Process Deposit Return</h3>
              <button onClick={() => setReturnModal(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            {(() => {
              const dep = deposits.find(d => d.id === returnModal);
              if (!dep) return null;
              const totalD = (dep.deductions || []).reduce((s, dd) => s + parseFloat(dd.amount || 0), 0);
              const suggestedReturn = parseFloat(dep.amount) - totalD;
              return (
                <>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Original Deposit</span><span className="font-bold text-slate-900">{formatINR(dep.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-amber-600">Total Deductions</span><span className="font-bold text-amber-700">-{formatINR(totalD)}</span></div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between"><span className="font-bold text-slate-700">Suggested Refund</span><span className="font-black text-emerald-700">{formatINR(suggestedReturn)}</span></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">REFUND AMOUNT</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={String(suggestedReturn)}
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2d5a47]"
                        value={returnAmount}
                        onChange={e => setReturnAmount(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">You can adjust the refund amount if needed</p>
                  </div>
                </>
              );
            })()}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleProcessReturn}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                Confirm Return
              </button>
              <button
                onClick={() => setReturnModal(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
