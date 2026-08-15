import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Building,
  Home,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  ShieldAlert,
  Zap,
  Search,
  Filter,
  MoreVertical,
  Eye,
  User,
  UserPlus,
  Calculator,
  Tag,
  CheckCircle2,
  AlertCircle,
  Archive,
  ChevronRight,
  ChevronDown,
  Layers,
  X,
  PlayCircle,
  ListChecks,
  Receipt,
  Bolt,
  CheckCheck,
  Check,
  Calendar,
  Share2
} from 'lucide-react';
import { useConfirm, useToast } from '../components/Toast';
import { formatINR, formatINRShort } from '../utils/formatters';
import RoomDrawer from '../components/RoomDrawer';
import CreateRoomTypeModal from '../components/CreateRoomTypeModal';
import RoomDetailsModal from '../components/RoomDetailsModal';
import BillReceiptModal from '../components/BillReceiptModal';

export default function Properties() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const navigate = useNavigate();

  // Data State
  const [properties, setProperties] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [bills, setBills] = useState([]);
  const [customRoomTypes, setCustomRoomTypes] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active rooms for selected property
  const rooms = useMemo(() => {
    if (!selectedPropertyId) return [];
    return allRooms.filter(r => r.property_id === selectedPropertyId);
  }, [allRooms, selectedPropertyId]);

  // Search & Filter state
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('All');

  // Property Modal / Form State
  const [showPropModal, setShowPropModal] = useState(false);
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [editingPropId, setEditingPropId] = useState(null);

  // Room Drawer & Modals State
  const [showRoomDrawer, setShowRoomDrawer] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [inspectRoom, setInspectRoom] = useState(null);
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [activeMenuRoomId, setActiveMenuRoomId] = useState(null);

  const [searchParams] = useSearchParams();

  // Bulk Billing State
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') === 'bulk' ? 'bulkbill' : 'rooms';
  }); // 'rooms' | 'bulkbill'

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'bulk') {
      setActiveTab('bulkbill');
    }
  }, [searchParams]);
  const [bulkMonth, setBulkMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  });
  const [bulkYear, setBulkYear] = useState(() => new Date().getFullYear().toString());
  const [bulkReadings, setBulkReadings] = useState({}); // { [roomId]: { currentReading, otherCharges } }
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResults, setBulkResults] = useState([]); // generated bill results
  const [viewingReceipt, setViewingReceipt] = useState(null); // { bill, room, tenant }

  // Custom dropdown state for Month/Year selectors
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const monthDropdownRef = React.useRef(null);
  const yearDropdownRef = React.useRef(null);

  // Bulk Electricity Utility Split State
  const [showBulkSplitModal, setShowBulkSplitModal] = useState(false);
  const [bulkSplitAmount, setBulkSplitAmount] = useState('');
  const [bulkSplitTarget, setBulkSplitTarget] = useState('all'); // 'all' | 'shared_only'

  // Close dropdowns & action menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
        setMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
        setYearDropdownOpen(false);
      }
      if (!e.target.closest('.room-action-menu')) {
        setActiveMenuRoomId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPropModal(false);
        setActiveMenuRoomId(null);
        setMonthDropdownOpen(false);
        setYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || null;

  // Fetching data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [propsList, tenantsList, leasesList, roomsList, billsList] = await Promise.all([
        api.getProperties(ownerId).catch(() => []),
        api.getTenants(ownerId).catch(() => []),
        api.getLeases(ownerId).catch(() => []),
        api.getAllRooms(ownerId).catch(() => []),
        api.getBills(ownerId).catch(() => [])
      ]);

      setProperties(propsList);
      setTenants(tenantsList);
      setLeases(leasesList);
      setAllRooms(roomsList || []);
      setBills(billsList || []);

      setSelectedPropertyId(prevId => {
        if (!prevId && propsList.length > 0) return propsList[0].id;
        if (prevId && !propsList.some(p => p.id === prevId)) return propsList.length > 0 ? propsList[0].id : null;
        return prevId;
      });
    } catch (err) {
      console.error('Error fetching properties data', err);
      setError('Failed to load properties. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadPropertyRooms = useCallback(async (propId) => {
    if (!propId) {
      setCustomRoomTypes([]);
      return;
    }
    try {
      const typesList = await (api.getRoomTypes ? api.getRoomTypes(propId) : Promise.resolve([]));
      setCustomRoomTypes(typesList || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch room types for selected property');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedPropertyId) {
      loadPropertyRooms(selectedPropertyId);
    }
  }, [selectedPropertyId, loadPropertyRooms]);

  // Click outside listener for room three-dot contextual action menu
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuRoomId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filtered properties based on search query
  const filteredProperties = useMemo(() => {
    if (!propertySearchQuery.trim()) return properties;
    const q = propertySearchQuery.toLowerCase();
    return properties.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.address && p.address.toLowerCase().includes(q))
    );
  }, [properties, propertySearchQuery]);

  // Map room to its first active tenant (kept for backward compat)
  const getRoomTenant = (roomId) => {
    const activeLease = leases.find(l => l.room_id === roomId && l.is_active);
    if (!activeLease) return null;
    return tenants.find(t => t.id === activeLease.tenant_id) || null;
  };

  // Map room to ALL active tenants (for shared/PG rooms)
  const getRoomTenants = (roomId) => {
    return leases
      .filter(l => l.room_id === roomId && l.is_active)
      .map(l => tenants.find(t => t.id === l.tenant_id))
      .filter(Boolean);
  };

  // Property calculation stats
  const selectedPropertyStats = useMemo(() => {
    if (!selectedProperty) return { totalRooms: 0, occupied: 0, vacant: 0, expectedRent: 0 };

    const totalRooms = rooms.length;
    let occupied = 0;
    let expectedRent = 0;

    rooms.forEach(r => {
      const isRoomOccupied = r.status === 'Occupied' || leases.some(l => l.room_id === r.id && l.is_active);
      if (isRoomOccupied) occupied++;
      expectedRent += parseFloat(r.base_rent || 0);
    });

    const vacant = Math.max(0, totalRooms - occupied);

    return { totalRooms, occupied, vacant, expectedRent };
  }, [selectedProperty, rooms, leases]);

  // Filtered rooms based on status & search
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const tenant = getRoomTenant(r.id);
      const isOccupied = r.status === 'Occupied' || !!tenant;

      // Status filter check
      if (roomStatusFilter === 'Occupied' && !isOccupied) return false;
      if (roomStatusFilter === 'Vacant' && isOccupied) return false;
      if (roomStatusFilter === 'Maintenance' && r.status !== 'Maintenance') return false;

      // Search query check
      if (roomSearchQuery.trim()) {
        const q = roomSearchQuery.toLowerCase();
        const roomNumMatch = r.room_number.toLowerCase().includes(q);
        const tenantMatch = tenant && tenant.name.toLowerCase().includes(q);
        const typeMatch = r.room_type && r.room_type.toLowerCase().includes(q);
        return roomNumMatch || tenantMatch || typeMatch;
      }

      return true;
    });
  }, [rooms, roomStatusFilter, roomSearchQuery, leases, tenants]);

  // Property CRUD Handlers
  const handlePropSubmit = async (e) => {
    e.preventDefault();
    const ownerId = user?.id || 'mock_owner_id';
    setError('');

    try {
      if (editingPropId) {
        await api.updateProperty(editingPropId, { name: propName, address: propAddress });
        toast('Property updated successfully', 'success');
      } else {
        const created = await api.createProperty(ownerId, { name: propName, address: propAddress });
        if (created?.id) {
          setSelectedPropertyId(created.id);
        }
        toast('Property created successfully', 'success');
      }
      setPropName('');
      setPropAddress('');
      setShowPropModal(false);
      setEditingPropId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save property');
    }
  };

  const startEditProperty = (p, e) => {
    e.stopPropagation();
    setEditingPropId(p.id);
    setPropName(p.name);
    setPropAddress(p.address || '');
    setShowPropModal(true);
  };

  const handlePropDelete = async (id, e) => {
    e.stopPropagation();
    const yes = await confirm({
      title: 'Delete Property',
      message: 'Are you sure you want to delete this property? All associated rooms will also be deleted.',
      confirmText: 'Delete Property',
      type: 'error'
    });
    if (!yes) return;

    try {
      await api.deleteProperty(id);
      if (selectedPropertyId === id) {
        setSelectedPropertyId(null);
      }
      await loadData();
      toast('Property deleted', 'info');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete property');
    }
  };

  // Room CRUD Handlers
  const handleRoomSubmit = async (roomData) => {
    if (!selectedPropertyId) return;
    setError('');

    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, roomData);
        toast(`Room ${roomData.room_number} updated successfully`, 'success');
      } else {
        await api.createRoom(selectedPropertyId, roomData);
        toast(`Room ${roomData.room_number} added successfully`, 'success');
      }

      setShowRoomDrawer(false);
      setEditingRoom(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save room details');
    }
  };

  const handleRoomDelete = async (room, e) => {
    if (e) e.stopPropagation();
    const yes = await confirm({
      title: 'Archive Room',
      message: `Are you sure you want to archive Room ${room.room_number}? This room will be removed from active lists.`,
      confirmText: 'Archive Room',
      type: 'error'
    });
    if (!yes) return;

    try {
      await api.deleteRoom(room.id);
      await loadData();
      toast(`Room ${room.room_number} archived`, 'info');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to archive room');
    }
  };

  const handleCreateCustomRoomType = async (typeData) => {
    if (!selectedPropertyId) return;
    try {
      const created = await api.createRoomType(selectedPropertyId, typeData);
      setCustomRoomTypes(prev => [...prev, created]);
      toast(`Custom Room Type "${typeData.name}" created`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to create custom room type', 'error');
    }
  };

  // Occupied rooms for bulk billing (only for selected property)
  const occupiedRoomsForBulk = useMemo(() => {
    return rooms.filter(r => {
      const isOccupied = r.status === 'Occupied' || leases.some(l => l.room_id === r.id && l.is_active);
      return isOccupied;
    });
  }, [rooms, leases]);

  // Initialize bulk readings when rooms or tab changes
  useEffect(() => {
    if (activeTab === 'bulkbill') {
      setBulkReadings(prev => {
        const initial = { ...prev };
        occupiedRoomsForBulk.forEach(r => {
          if (!initial[r.id]) {
            initial[r.id] = {
              currentReading: '',
              otherCharges: ''
            };
          }
        });
        return initial;
      });
      // Do not clear bulkResults here, so they persist across data load reloads.
    }
  }, [activeTab, selectedPropertyId]);

  const handleBulkReadingChange = (roomId, field, value) => {
    setBulkReadings(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], [field]: value }
    }));
  };

  const handleTenantReadingChange = (roomId, tenantId, field, value) => {
    const key = `${roomId}__${tenantId}`;
    setBulkReadings(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value }
    }));
  };

  const totalBillsCount = useMemo(() => {
    return occupiedRoomsForBulk.reduce((acc, r) => {
      const rTenants = getRoomTenants(r.id);
      return acc + Math.max(1, rTenants.length);
    }, 0);
  }, [occupiedRoomsForBulk, leases, tenants]);

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleBulkGenerate = async () => {
    if (!selectedPropertyId) return;
    setBulkRunning(true);
    setBulkResults([]);
    try {
      const ownerId = user?.id || 'mock_owner_id';
      const results = await import('../services/billing').then(m => m.generateBulkBills(selectedPropertyId, occupiedRoomsForBulk, bulkReadings, bulkMonth, bulkYear, ownerId));
      setBulkResults(results);
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        toast(`✅ ${successCount} bills generated successfully for ${bulkMonth} ${bulkYear}`, 'success');
        await loadData();
        // Reset input fields so the table reflects the new state (prev reading updated)
        const resetReadings = {};
        occupiedRoomsForBulk.forEach(r => {
          resetReadings[r.id] = { currentReading: '', otherCharges: '' };
        });
        setBulkReadings(resetReadings);
      }
      if (results.some(r => !r.success)) {
        toast(`⚠️ Some bills failed to generate. Check the results below.`, 'warning');
      }
    } catch (err) {
      console.error(err);
      toast('Bulk billing failed.', 'error');
    } finally {
      setBulkRunning(false);
    }
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active">

      {/* ── TOP HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Properties &amp; Rooms</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your properties, rooms, rent, and billing settings.</p>
        </div>

        <button
          onClick={() => {
            setEditingPropId(null);
            setPropName('');
            setPropAddress('');
            setShowPropModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={16} /> + New Property
        </button>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── PROPERTIES SELECTOR SECTION ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-[#2d5a47]" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">YOUR PROPERTIES</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {properties.length}
            </span>
          </div>

          {/* Lightweight Property Search */}
          {properties.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={propertySearchQuery}
                onChange={(e) => setPropertySearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl outline-none focus:border-[#2d5a47]"
              />
            </div>
          )}
        </div>

        {/* Properties List Grid */}
        {filteredProperties.length === 0 ? (
          <div className="card glass-card p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
            <Building size={40} className="text-slate-700 mb-3" />
            <p className="font-semibold text-slate-300">No properties found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {propertySearchQuery ? 'No property matches your search criteria.' : 'Add your first property to start managing rooms, tenants, and bills.'}
            </p>
            {!propertySearchQuery && (
              <button
                onClick={() => {
                  setEditingPropId(null);
                  setPropName('');
                  setPropAddress('');
                  setShowPropModal(true);
                }}
                className="btn btn-primary text-xs px-4 py-2 mt-4 rounded-xl"
              >
                + Add Property
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.map(p => {
              const isSelected = selectedPropertyId === p.id;

              // Calculate property statistics
              const propRooms = allRooms.filter(r => r.property_id === p.id);
              const roomCount = propRooms.length;
              let occCount = 0;
              let propExpectedRent = 0;

              propRooms.forEach(r => {
                const isOccupied = r.status === 'Occupied' || leases.some(l => l.room_id === r.id && l.is_active);
                if (isOccupied) occCount++;
                propExpectedRent += parseFloat(r.base_rent || 0);
              });

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPropertyId(p.id)}
                  className={`bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-200 relative group ${isSelected
                      ? 'border-[#2d5a47] ring-2 ring-[#2d5a47]/20 bg-[#edf5f1]/40 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-[#2d5a47] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                        }`}>
                        <Building size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-slate-900 truncate">{p.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{p.address || 'No location set'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => startEditProperty(p, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handlePropDelete(p.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      {roomCount} Rooms • <strong className="text-emerald-700 font-bold">{occCount} Occupied</strong>
                    </span>

                    <span className="font-extrabold text-slate-900">
                      {formatINR(propExpectedRent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SELECTED PROPERTY ROOMS SECTION ── */}
      {selectedProperty ? (
        <div className="space-y-6 pt-4 border-t border-slate-200/60">

          {/* Selected Property Header Banner */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Rooms in {selectedProperty.name}
                </h2>
                <span className="text-xs font-bold text-emerald-800 bg-[#edf5f1] px-2.5 py-1 rounded-full border border-[#d8e7e0]">
                  {selectedProperty.address || 'Active Property'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedPropertyStats.totalRooms} rooms · {selectedPropertyStats.occupied} occupied · {selectedPropertyStats.vacant} vacant
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">EXPECTED RENT</span>
                <span className="text-sm font-extrabold text-[#2d5a47]">{formatINR(selectedPropertyStats.expectedRent)}</span>
              </div>

              <button
                onClick={() => {
                  setEditingRoom(null);
                  setShowRoomDrawer(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus size={16} /> + Add Room
              </button>
            </div>
          </div>

          {/* ── TAB SWITCHER: Rooms List / Bulk Billing ── */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'rooms'
                  ? 'bg-[#2d5a47] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Home size={13} /> Rooms List
            </button>
            <button
              onClick={() => setActiveTab('bulkbill')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${activeTab === 'bulkbill'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 bg-amber-50 border border-amber-200/80 hover:bg-amber-100'
                }`}
            >
              <Zap size={14} className={activeTab === 'bulkbill' ? 'text-white' : 'text-amber-600'} />
              <span>⚡ Bulk Billing</span>
              {occupiedRoomsForBulk.length > 0 && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === 'bulkbill' ? 'bg-white/20 text-white' : 'bg-amber-600 text-white'
                  }`}>
                  {occupiedRoomsForBulk.length}
                </span>
              )}
            </button>
          </div>

          {/* ── BULK BILLING PANEL ── */}
          {activeTab === 'bulkbill' && (
            <div className="space-y-5">
              {/* Intro Banner */}
              <div className="bg-[#edf5f1] border border-[#2d5a47]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#2d5a47] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bolt size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#2d5a47] uppercase tracking-wider bg-[#2d5a47]/10 px-2 py-0.5 rounded-md">Smart Bulk Run</span>
                    <span className="text-xs text-slate-500 font-medium">• {selectedProperty.name}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">Generate Bills for All Occupied Rooms</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Generate rent &amp; utility bills for <strong className="text-slate-900">{occupiedRoomsForBulk.length} occupied rooms</strong> in one click. Previous unpaid balances are automatically fetched.
                  </p>
                </div>
              </div>

              {/* Month & Year Selector — Custom SaaS Popovers */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Month Dropdown */}
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={() => { setMonthDropdownOpen(v => !v); setYearDropdownOpen(false); }}
                    className={`flex items-center gap-2 bg-white border shadow-sm rounded-xl px-3.5 py-2.5 cursor-pointer transition-all duration-200 hover:shadow-md ${monthDropdownOpen ? 'border-[#2d5a47] ring-2 ring-[#2d5a47]/10' : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                  >
                    <Calendar size={14} className="text-[#2d5a47]" />
                    <span className="text-[11px] font-medium text-slate-500">Month</span>
                    <span className="text-xs font-bold text-slate-900">{bulkMonth}</span>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${monthDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {monthDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-200/50 py-1.5 w-48 animate-in fade-in slide-in-from-top-1 duration-150" style={{ animation: 'fadeSlideDown 0.15s ease-out' }}>
                      <div className="max-h-64 overflow-y-auto px-1">
                        {MONTHS.map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => { setBulkMonth(m); setMonthDropdownOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-100 ${bulkMonth === m
                                ? 'bg-[#2d5a47]/8 text-[#2d5a47] font-bold'
                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                          >
                            <span>{m}</span>
                            {bulkMonth === m && <Check size={14} className="text-[#2d5a47]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative" ref={yearDropdownRef}>
                  <button
                    type="button"
                    onClick={() => { setYearDropdownOpen(v => !v); setMonthDropdownOpen(false); }}
                    className={`flex items-center gap-2 bg-white border shadow-sm rounded-xl px-3.5 py-2.5 cursor-pointer transition-all duration-200 hover:shadow-md ${yearDropdownOpen ? 'border-[#2d5a47] ring-2 ring-[#2d5a47]/10' : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                  >
                    <Calendar size={14} className="text-[#2d5a47]" />
                    <span className="text-[11px] font-medium text-slate-500">Year</span>
                    <span className="text-xs font-bold text-slate-900">{bulkYear}</span>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {yearDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-200/50 py-1.5 w-36 animate-in fade-in slide-in-from-top-1 duration-150" style={{ animation: 'fadeSlideDown 0.15s ease-out' }}>
                      <div className="px-1">
                        {[2023, 2024, 2025, 2026, 2027].map(y => (
                          <button
                            key={y}
                            type="button"
                            onClick={() => { setBulkYear(y.toString()); setYearDropdownOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-100 ${bulkYear === y.toString()
                                ? 'bg-[#2d5a47]/8 text-[#2d5a47] font-bold'
                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                          >
                            <span>{y}</span>
                            {bulkYear === y.toString() && <Check size={14} className="text-[#2d5a47]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Split Main Electricity Utility Tool Button */}
                <button
                  type="button"
                  onClick={() => setShowBulkSplitModal(v => !v)}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#2d5a47] border border-emerald-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ml-auto"
                  title="Split main building electricity bill equally across rooms"
                >
                  <span>🤝 Split Main Electricity Bill</span>
                </button>
              </div>

              {/* Expandable Bulk Electricity Splitter Panel */}
              {showBulkSplitModal && occupiedRoomsForBulk.length > 0 && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>🤝 Building Electricity Bill Splitter</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Enter the total electricity bill from your power board. It will be divided and filled into the matrix automatically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBulkSplitModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Total Electricity Bill (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 6000"
                          value={bulkSplitAmount}
                          onChange={e => setBulkSplitAmount(e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-[#2d5a47]"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Apply To
                      </label>
                      <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => setBulkSplitTarget('all')}
                          className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${bulkSplitTarget === 'all'
                              ? 'bg-[#2d5a47] text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          All Occupied ({occupiedRoomsForBulk.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkSplitTarget('shared_only')}
                          className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${bulkSplitTarget === 'shared_only'
                              ? 'bg-[#2d5a47] text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          Shared/Direct Only
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const amt = parseFloat(bulkSplitAmount);
                          if (isNaN(amt) || amt <= 0) {
                            toast('Please enter a valid total electricity amount', 'error');
                            return;
                          }
                          const targetList = bulkSplitTarget === 'all'
                            ? occupiedRoomsForBulk
                            : occupiedRoomsForBulk.filter(r => r.elec_mode === 'shared' || r.elec_mode === 'direct');

                          if (targetList.length === 0) {
                            toast('No eligible rooms found', 'warning');
                            return;
                          }

                          const share = Math.round(amt / targetList.length);
                          setBulkReadings(prev => {
                            const updated = { ...prev };
                            targetList.forEach(r => {
                              updated[r.id] = {
                                ...(updated[r.id] || {}),
                                directElec: share.toString()
                              };
                            });
                            return updated;
                          });
                          toast(`Applied ₹${share.toLocaleString('en-IN')}/room across ${targetList.length} rooms!`, 'success');
                          setShowBulkSplitModal(false);
                          setBulkSplitAmount('');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer text-center"
                      >
                        Apply to Matrix →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {occupiedRoomsForBulk.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 text-sm shadow-sm">
                  <Home size={36} className="mx-auto mb-3 text-slate-400" />
                  <p className="font-semibold text-slate-800">No occupied rooms</p>
                  <p className="text-xs text-slate-500 mt-1">Add tenants and mark rooms as occupied to use bulk billing.</p>
                </div>
              ) : (
                <>
                  {/* Bulk Billing Table */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="w-[12%] px-3 py-3">Room</th>
                            <th className="w-[12%] px-3 py-3">Tenant</th>
                            <th className="w-[10%] px-3 py-3">Rent</th>
                            <th className="w-[11%] px-3 py-3">Prev. Read</th>
                            <th className="w-[12%] px-3 py-3">Curr. Read</th>
                            <th className="w-[12%] px-3 py-3">Elec.</th>
                            <th className="w-[11%] px-3 py-3">Prev. Bal</th>
                            <th className="w-[10%] px-3 py-3">Other</th>
                            <th className="w-[12%] px-3 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {occupiedRoomsForBulk.map(room => {
                            const roomTenants = getRoomTenants(room.id);
                            const tenantCount = Math.max(1, roomTenants.length);
                            const isShared = roomTenants.length > 1;
                            const isSubmeter = room.elec_mode === 'submeter' || (!room.elec_mode && room.has_submeter !== false) || isShared;
                            const readings = bulkReadings[room.id] || {};
                            const prevReading = parseFloat(room.current_meter_reading || 0);
                            const rawCurr = readings.currentReading;
                            const currReading = (rawCurr !== '' && rawCurr !== null && rawCurr !== undefined && !isNaN(rawCurr))
                              ? parseFloat(rawCurr)
                              : prevReading;
                            const units = Math.max(0, currReading - prevReading);
                            const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);
                            const rent = parseFloat(room.base_rent || 0);

                            let totalRoomElec = 0;
                            let elecLabel = '';
                            if (isSubmeter) {
                              totalRoomElec = units * rate;
                              elecLabel = `${units.toFixed(0)}u × ₹${rate}`;
                            } else {
                              const customDirect = readings.directElec;
                              if (customDirect !== undefined && customDirect !== '' && !isNaN(customDirect)) {
                                totalRoomElec = parseFloat(customDirect);
                              } else if (room.elec_mode === 'direct') {
                                totalRoomElec = parseFloat(room.direct_elec_amount || 0);
                              } else if (room.elec_mode === 'fixed') {
                                totalRoomElec = parseFloat(room.fixed_elec_amount || 0);
                              }
                              elecLabel = room.elec_mode === 'direct' ? 'Direct' : room.elec_mode === 'fixed' ? 'Fixed' : 'Custom';
                            }


                            const tenantElecShare = isShared ? Math.round(totalRoomElec / tenantCount) : totalRoomElec;

                            if (!isShared) {
                              // Standard Single Tenant Row
                              const singleTenant = roomTenants[0] || null;
                              const autoArrears = singleTenant ? bills
                                .filter(b => b.room_id === room.id && b.tenant_id === singleTenant.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
                                .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0) : 0;
                              const arrears = readings.arrears !== undefined && readings.arrears !== '' ? parseFloat(readings.arrears || 0) : autoArrears;
                              const other = parseFloat(readings.otherCharges || 0);
                              const total = rent + totalRoomElec + arrears + other;

                              return (
                                <tr key={room.id} className="hover:bg-slate-50/70 transition-colors text-xs">
                                  <td className="px-3 py-3">
                                    <div className="font-bold text-slate-900 truncate">Rm {room.room_number}</div>
                                    <div className="text-[10px] text-slate-400 font-medium truncate">{room.room_type || 'Room'}</div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="font-semibold text-slate-800 truncate">{singleTenant?.name || <span className="italic text-slate-400">None</span>}</div>
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-slate-800">{formatINR(rent)}</td>
                                  <td className="px-3 py-3">
                                    {isSubmeter ? (
                                      <div className="font-mono font-bold text-slate-700">{prevReading} <span className="text-[9px] text-slate-400 font-normal">u</span></div>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-3">
                                    {isSubmeter ? (
                                      <input
                                        type="number"
                                        min={prevReading}
                                        placeholder={`≥ ${prevReading}`}
                                        value={readings.currentReading}
                                        onChange={e => handleBulkReadingChange(room.id, 'currentReading', e.target.value)}
                                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 w-full focus:outline-none focus:border-[#2d5a47] focus:bg-white focus:ring-1 focus:ring-[#2d5a47]/20 transition-all font-mono"
                                      />
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-3">
                                    {isSubmeter ? (
                                      <>
                                        <div className="font-bold text-[#2d5a47]">{formatINR(totalRoomElec)}</div>
                                        <div className="text-[9px] text-slate-400 font-medium truncate">{elecLabel}</div>
                                      </>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder={formatINR(room.direct_elec_amount || room.fixed_elec_amount || 0)}
                                          value={readings.directElec !== undefined ? readings.directElec : (room.direct_elec_amount || room.fixed_elec_amount || '')}
                                          onChange={e => handleBulkReadingChange(room.id, 'directElec', e.target.value)}
                                          className="px-2 py-1 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs font-bold text-[#2d5a47] placeholder:text-slate-400 w-full focus:outline-none focus:border-[#2d5a47] focus:bg-white focus:ring-1 focus:ring-[#2d5a47]/20 transition-all"
                                        />
                                        <div className="text-[9px] text-slate-400 font-medium truncate">{elecLabel}</div>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-3">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder={formatINR(autoArrears)}
                                      value={readings.arrears !== undefined ? readings.arrears : (autoArrears > 0 ? autoArrears : '')}
                                      onChange={e => handleBulkReadingChange(room.id, 'arrears', e.target.value)}
                                      className={`px-2 py-1 border rounded-lg text-xs font-semibold w-full focus:outline-none focus:ring-1 transition-all ${arrears > 0 ? 'bg-amber-50/80 border-amber-300 text-amber-900 focus:border-amber-500 focus:ring-amber-500/20' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#2d5a47] focus:bg-white focus:ring-[#2d5a47]/20'
                                        }`}
                                    />
                                  </td>
                                  <td className="px-3 py-3">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="₹0"
                                      value={readings.otherCharges}
                                      onChange={e => handleBulkReadingChange(room.id, 'otherCharges', e.target.value)}
                                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 w-full focus:outline-none focus:border-[#2d5a47] focus:bg-white focus:ring-1 focus:ring-[#2d5a47]/20 transition-all"
                                    />
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    <span className="font-black text-xs text-[#2d5a47]">{formatINR(total)}</span>
                                  </td>
                                </tr>
                              );
                            }

                            // Multi-Tenant Shared Room Header + Sub-rows
                            return (
                              <React.Fragment key={room.id}>
                                {/* Master Room Meter Row */}
                                <tr className="bg-amber-50/40 border-t border-amber-200/60 text-xs">
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-slate-900">Rm {room.room_number}</span>
                                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[9px] font-black uppercase">Shared ({roomTenants.length})</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5 font-bold text-amber-900 text-[11px]">
                                    {roomTenants.length} Roommates
                                  </td>
                                  <td className="px-3 py-2.5 font-bold text-slate-700">
                                    {formatINR(rent)} <span className="text-[9px] text-slate-400 font-normal">/ea</span>
                                  </td>
                                  <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                                    {prevReading} <span className="text-[9px] text-slate-400 font-normal">u</span>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="number"
                                      min={prevReading}
                                      placeholder={`≥ ${prevReading}`}
                                      value={readings.currentReading}
                                      onChange={e => handleBulkReadingChange(room.id, 'currentReading', e.target.value)}
                                      className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400 w-full focus:outline-none focus:border-[#2d5a47] focus:ring-1 focus:ring-[#2d5a47]/20 font-mono shadow-2xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2.5" colSpan={4}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                                        <span>⚡ Total: {formatINR(totalRoomElec)} ({units}u @ ₹{rate})</span>
                                        <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded text-[10px]">
                                          → {formatINR(tenantElecShare)}/roommate
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-amber-700 italic hidden lg:inline">
                                        Split 1/{roomTenants.length} per tenant below ↴
                                      </span>
                                    </div>
                                  </td>
                                </tr>

                                {/* Sub-row for each roommate */}
                                {roomTenants.map((t, tIdx) => {
                                  const tKey = `${room.id}__${t.id}`;
                                  const tReadings = bulkReadings[tKey] || {};
                                  const autoArrears = bills
                                    .filter(b => b.room_id === room.id && b.tenant_id === t.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
                                    .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);

                                  const tArrears = tReadings.arrears !== undefined && tReadings.arrears !== ''
                                    ? parseFloat(tReadings.arrears || 0)
                                    : autoArrears;
                                  const tOther = parseFloat(tReadings.otherCharges || 0);
                                  const tTotal = rent + tenantElecShare + tArrears + tOther;

                                  return (
                                    <tr key={t.id} className="bg-white hover:bg-slate-50/70 transition-colors text-xs">
                                      <td className="px-3 py-2 pl-6">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                          <span className="font-mono text-[11px]">↳</span>
                                          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black flex items-center justify-center flex-shrink-0">
                                            {tIdx + 1}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className="font-extrabold text-slate-900">{t.name}</span>
                                      </td>
                                      <td className="px-3 py-2 font-semibold text-slate-700">{formatINR(rent)}</td>
                                      <td className="px-3 py-2 text-slate-300 text-[10px]">—</td>
                                      <td className="px-3 py-2 text-slate-400 text-[10px] italic">Shared meter</td>
                                      <td className="px-3 py-2">
                                        <span className="font-bold text-[#2d5a47]">{formatINR(tenantElecShare)}</span>
                                        <span className="text-[9px] text-slate-400 ml-1">(1/{roomTenants.length})</span>
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder={formatINR(autoArrears)}
                                          value={tReadings.arrears !== undefined ? tReadings.arrears : (autoArrears > 0 ? autoArrears : '')}
                                          onChange={e => handleTenantReadingChange(room.id, t.id, 'arrears', e.target.value)}
                                          className={`px-2 py-1 border rounded-lg text-xs font-semibold w-full focus:outline-none focus:ring-1 transition-all ${tArrears > 0 ? 'bg-amber-50/80 border-amber-300 text-amber-900 focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#2d5a47] focus:bg-white'
                                            }`}
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="₹0"
                                          value={tReadings.otherCharges || ''}
                                          onChange={e => handleTenantReadingChange(room.id, t.id, 'otherCharges', e.target.value)}
                                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 w-full focus:outline-none focus:border-[#2d5a47] focus:bg-white focus:ring-1 focus:ring-[#2d5a47]/20 transition-all"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <span className="font-black text-xs text-[#2d5a47]">{formatINR(tTotal)}</span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {occupiedRoomsForBulk.map(room => {
                        const roomTenants = getRoomTenants(room.id);
                        const isShared = roomTenants.length > 1;
                        const tenantCount = Math.max(1, roomTenants.length);
                        const isSubmeter = room.elec_mode === 'submeter' || (!room.elec_mode && room.has_submeter !== false) || isShared;
                        const readings = bulkReadings[room.id] || {};
                        const prevReading = parseFloat(room.current_meter_reading || 0);
                        const currReading = parseFloat(readings.currentReading || prevReading);
                        const units = Math.max(0, currReading - prevReading);
                        const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);
                        const rent = parseFloat(room.base_rent || 0);

                        let totalRoomElec = 0;
                        if (isSubmeter) {
                          totalRoomElec = units * rate;
                        } else {
                          const customDirect = readings.directElec;
                          if (customDirect !== undefined && customDirect !== '' && !isNaN(customDirect)) {
                            totalRoomElec = parseFloat(customDirect);
                          } else if (room.elec_mode === 'direct') {
                            totalRoomElec = parseFloat(room.direct_elec_amount || 0);
                          } else if (room.elec_mode === 'fixed') {
                            totalRoomElec = parseFloat(room.fixed_elec_amount || 0);
                          }
                        }

                        const tenantElecShare = isShared ? Math.round(totalRoomElec / tenantCount) : totalRoomElec;

                        return (
                          <div key={room.id} className="p-4 space-y-3 bg-white">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>Room {room.room_number}</span>
                                  {isShared && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      Shared ({roomTenants.length})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {isShared ? `${roomTenants.map(t => t.name).join(', ')}` : (roomTenants[0]?.name || 'No Tenant')}
                                </div>
                              </div>
                              <span className="font-extrabold text-sm text-[#2d5a47]">
                                Rent: {formatINR(rent)}
                              </span>
                            </div>

                            {/* Meter reading input */}
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block">
                                {isSubmeter ? `Meter Reading (Prev: ${prevReading}u)` : 'Direct Elec (₹)'}
                              </label>
                              {isSubmeter ? (
                                <input
                                  type="number"
                                  min={prevReading}
                                  placeholder={`Prev: ${prevReading}`}
                                  value={readings.currentReading}
                                  onChange={e => handleBulkReadingChange(room.id, 'currentReading', e.target.value)}
                                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 w-full mt-0.5"
                                />
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={formatINR(room.direct_elec_amount || room.fixed_elec_amount || 0)}
                                  value={readings.directElec !== undefined ? readings.directElec : (room.direct_elec_amount || room.fixed_elec_amount || '')}
                                  onChange={e => handleBulkReadingChange(room.id, 'directElec', e.target.value)}
                                  className="px-2.5 py-1.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs font-bold text-[#2d5a47] w-full mt-0.5"
                                />
                              )}
                              {totalRoomElec > 0 && (
                                <div className="text-[11px] text-[#2d5a47] font-bold mt-1">
                                  Total Elec: {formatINR(totalRoomElec)} {isShared ? `→ ${formatINR(tenantElecShare)}/roommate` : ''}
                                </div>
                              )}
                            </div>

                            {/* Roommate details */}
                            {isShared && (
                              <div className="space-y-2 pt-2 border-t border-slate-100">
                                {roomTenants.map((t, tIdx) => {
                                  const tKey = `${room.id}__${t.id}`;
                                  const tReadings = bulkReadings[tKey] || {};
                                  const autoArrears = bills
                                    .filter(b => b.room_id === room.id && b.tenant_id === t.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
                                    .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
                                  const tArrears = tReadings.arrears !== undefined && tReadings.arrears !== '' ? parseFloat(tReadings.arrears || 0) : autoArrears;
                                  const tOther = parseFloat(tReadings.otherCharges || 0);
                                  const tTotal = rent + tenantElecShare + tArrears + tOther;

                                  return (
                                    <div key={t.id} className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                                      <div className="flex justify-between items-center font-extrabold text-slate-900">
                                        <span>{tIdx + 1}. {t.name}</span>
                                        <span className="text-[#2d5a47] font-black">{formatINR(tTotal)}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div>
                                          <span className="text-slate-400 text-[10px] block">Prev Bal</span>
                                          <input
                                            type="number"
                                            placeholder={formatINR(autoArrears)}
                                            value={tReadings.arrears !== undefined ? tReadings.arrears : (autoArrears > 0 ? autoArrears : '')}
                                            onChange={e => handleTenantReadingChange(room.id, t.id, 'arrears', e.target.value)}
                                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-slate-400 text-[10px] block">Other Charges</span>
                                          <input
                                            type="number"
                                            placeholder="₹0"
                                            value={tReadings.otherCharges || ''}
                                            onChange={e => handleTenantReadingChange(room.id, t.id, 'otherCharges', e.target.value)}
                                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                          />
                                        </div>
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
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleBulkGenerate}
                      disabled={bulkRunning}
                      className="btn flex items-center gap-2 bg-[#2d5a47] hover:bg-[#234738] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      {bulkRunning ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating Bills...</>
                      ) : (
                        <><PlayCircle size={16} /> Generate {totalBillsCount} Bills for {bulkMonth} {bulkYear}</>
                      )}
                    </button>
                  </div>

                  {/* Results Section */}
                  {bulkResults.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <CheckCheck size={16} className="text-[#2d5a47]" />
                        <h3 className="text-sm font-bold text-slate-900">Billing Run Results — {bulkMonth} {bulkYear}</h3>
                        <span className="bg-[#edf5f1] text-[#2d5a47] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2d5a47]/20">
                          {bulkResults.filter(r => r.success).length}/{bulkResults.length} Generated
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {bulkResults.map((item, idx) => {
                          const itemRoom = item.room || {};
                          const tenant = item.tenant || getRoomTenant(itemRoom.id);
                          const isSuccess = item.success;

                          return (
                            <div
                              key={item.billId || idx}
                              className={`rounded-2xl border p-4 text-xs space-y-2.5 shadow-sm transition-all ${isSuccess
                                  ? 'bg-white border-slate-200/80'
                                  : 'bg-red-50/50 border-red-200'
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-sm">Room {itemRoom.room_number || 'Room'}</span>
                                {isSuccess ? (
                                  <span className="flex items-center gap-1 text-[#2d5a47] bg-[#edf5f1] px-2 py-0.5 rounded-full text-[10px] font-bold"><CheckCircle2 size={12} /> Generated</span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold"><AlertCircle size={12} /> Failed</span>
                                )}
                              </div>

                              <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                <User size={13} className="text-[#2d5a47]" />
                                <span>{tenant?.name || 'Tenant'}</span>
                              </div>

                              {isSuccess ? (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                  <div className="font-black text-[#2d5a47] text-base">{(() => {
                                    const raw = item.totalPayable ?? item.createdBill?.total_payable ?? 0;
                                    const val = parseFloat(raw);
                                    if (!isNaN(val) && val > 0) return formatINR(val);
                                    const b = item.createdBill || {};
                                    const r = parseFloat(b.rent_amount || 0);
                                    const e = parseFloat(b.elec_amount || b.electricity_amount || 0);
                                    const o = parseFloat(b.other_charges || 0) || 0;
                                    return formatINR(r + e + o);
                                  })()}</div>
                                  <button
                                    onClick={() => setViewingReceipt({
                                      bill: item.createdBill,
                                      room: itemRoom,
                                      tenant: tenant
                                    })}
                                    className="px-3 py-1.5 bg-[#edf5f1] hover:bg-[#2d5a47] text-[#2d5a47] hover:text-white border border-[#2d5a47]/20 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                  >
                                    <Receipt size={13} /> View &amp; WhatsApp
                                  </button>
                                </div>
                              ) : (
                                <div className="text-red-600 font-medium">{item.error}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ROOMS LIST TAB ── */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Rooms Filter & Search Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl">
                  {['All', 'Occupied', 'Vacant', 'Maintenance'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRoomStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${roomStatusFilter === st
                          ? 'bg-[#2d5a47] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Room Search */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Room No. or Tenant..."
                    value={roomSearchQuery}
                    onChange={(e) => setRoomSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-2xl outline-none focus:border-[#2d5a47]"
                  />
                </div>
              </div>

              {/* ROOMS LIST - DESKTOP TABLE & MOBILE CARDS */}
              {filteredRooms.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
                  <Home size={44} className="text-slate-400 mb-3" />
                  <p className="font-bold text-slate-800">No rooms found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {roomSearchQuery || roomStatusFilter !== 'All'
                      ? 'No room matches your filter or search query.'
                      : 'Add your first room to start managing tenants, rent, and electricity billing.'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setShowRoomDrawer(true);
                    }}
                    className="px-4 py-2 mt-4 rounded-xl bg-[#2d5a47] text-white text-xs font-bold hover:bg-[#234738]"
                  >
                    + Add Room
                  </button>
                </div>
              ) : (
                <>
                  {/* DESKTOP ROOMS TABLE */}
                  <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-visible">
                    <div className="overflow-visible">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 rounded-t-3xl">
                            <th className="px-6 py-4 rounded-tl-3xl">ROOM</th>
                            <th className="px-6 py-4">TYPE</th>
                            <th className="px-6 py-4">TENANT</th>
                            <th className="px-6 py-4">MONTHLY RENT</th>
                            <th className="px-6 py-4">ELECTRICITY</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4 text-right rounded-tr-3xl">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-xs">
                          {filteredRooms.map((room, roomIdx) => {
                            const roomTenants = getRoomTenants(room.id);
                            const tenant = roomTenants[0] || null; // keep for compat
                            const isOccupied = room.status === 'Occupied' || roomTenants.length > 0;
                            const elecMode = room.elec_mode || (room.has_submeter !== false ? 'submeter' : 'direct');
                            const isNearBottom = roomIdx >= filteredRooms.length - 2 || filteredRooms.length <= 3;

                            return (
                              <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center font-bold text-xs">
                                      {room.room_number}
                                    </div>
                                    <span className="font-bold text-slate-800">Room {room.room_number}</span>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-slate-500 font-medium">
                                  {room.room_type || 'Single Room'}
                                </td>

                                <td className="px-6 py-4">
                                  {roomTenants.length === 0 ? (
                                    <span className="text-slate-400 italic">— Vacant —</span>
                                  ) : roomTenants.length === 1 ? (
                                    <span className="text-slate-800 font-bold">{roomTenants[0].name}</span>
                                  ) : (
                                    <div className="flex flex-col gap-1">
                                      {roomTenants.map((t, i) => (
                                        <span key={t.id} className="inline-flex items-center gap-1">
                                          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-extrabold flex-shrink-0">{i + 1}</span>
                                          <span className="text-slate-800 font-bold">{t.name}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>

                                <td className="px-6 py-4 font-bold text-slate-900">
                                  {formatINR(room.base_rent)}
                                </td>

                                <td className="px-6 py-4">
                                  {elecMode === 'submeter' && (
                                    <span className="inline-flex items-center gap-1 text-[#2d5a47] bg-[#edf5f1] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                      ⚡ Submeter
                                    </span>
                                  )}
                                  {elecMode === 'direct' && (
                                    <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                      📄 Direct Bill
                                    </span>
                                  )}
                                  {elecMode === 'fixed' && (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                      🏷️ Fixed
                                    </span>
                                  )}
                                  {elecMode === 'shared' && (
                                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                      👥 Shared
                                    </span>
                                  )}
                                  {elecMode === 'none' && (
                                    <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                      🚫 None
                                    </span>
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roomTenants.length > 1
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                                      : isOccupied
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : room.status === 'Maintenance'
                                          ? 'bg-purple-50 text-purple-700'
                                          : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {roomTenants.length > 1 ? `Shared (${roomTenants.length})` : isOccupied ? 'Occupied' : room.status || 'Vacant'}
                                  </span>
                                </td>

                                <td className="px-6 py-4 text-right relative">
                                  <div className="inline-block text-left room-action-menu" onClick={e => e.stopPropagation()}>
                                    <button
                                      onClick={() => setActiveMenuRoomId(activeMenuRoomId === room.id ? null : room.id)}
                                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${activeMenuRoomId === room.id
                                          ? 'bg-[#2d5a47] text-white shadow-sm ring-2 ring-[#2d5a47]/20'
                                          : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                      title="Room Actions"
                                    >
                                      <MoreVertical size={16} />
                                    </button>

                                    {/* Contextual Action Menu Dropdown — Light SaaS Style */}
                                    {activeMenuRoomId === room.id && (
                                      <div className={`absolute right-0 ${isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} w-52 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-300/40 z-[99] py-1.5 text-xs text-slate-700 animate-in fade-in duration-150`} style={{ animation: 'fadeSlideDown 0.15s ease-out' }}>
                                        {/* View Specs */}
                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            setInspectRoom(room);
                                          }}
                                          className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-semibold text-slate-700 transition-colors"
                                        >
                                          <Eye size={14} className="text-slate-400" />
                                          <span>View room details</span>
                                        </button>

                                        {/* Edit Details */}
                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            setEditingRoom(room);
                                            setShowRoomDrawer(true);
                                          }}
                                          className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-semibold text-slate-700 transition-colors"
                                        >
                                          <Edit2 size={14} className="text-slate-400" />
                                          <span>Edit room details</span>
                                        </button>

                                        {/* Add Tenant / Allocate Room */}
                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            navigate(`/tenants?action=add&roomId=${room.id}`);
                                          }}
                                          className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 text-[#2d5a47] flex items-center gap-2.5 font-semibold transition-colors text-xs"
                                        >
                                          <UserPlus size={14} className="text-[#2d5a47]" />
                                          <span>{isOccupied ? 'Add roommate / co-tenant' : 'Allocate tenant'}</span>
                                        </button>

                                        {isOccupied && (
                                          <button
                                            onClick={() => {
                                              setActiveMenuRoomId(null);
                                              const t = roomTenants[0];
                                              navigate(t?.name
                                                ? `/tenants?highlight=${encodeURIComponent(t.name)}`
                                                : '/tenants'
                                              );
                                            }}
                                            className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-semibold text-slate-700 transition-colors text-xs"
                                          >
                                            <User size={14} className="text-emerald-600" />
                                            <span>View {roomTenants.length > 1 ? `all ${roomTenants.length} tenants` : 'tenant info'}</span>
                                          </button>
                                        )}

                                        {/* Generate Bill */}
                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            navigate(`/create-bill?roomId=${room.id}`);
                                          }}
                                          className="w-full px-3.5 py-2.5 text-left hover:bg-amber-50 text-amber-900 flex items-center gap-2.5 font-semibold transition-colors"
                                        >
                                          <Calculator size={14} className="text-amber-600" />
                                          <span>Generate smart bill</span>
                                        </button>

                                        <div className="border-t border-slate-100 my-1" />

                                        {/* Archive Room */}
                                        <button
                                          onClick={(e) => {
                                            setActiveMenuRoomId(null);
                                            handleRoomDelete(room, e);
                                          }}
                                          className="w-full px-3.5 py-2.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 font-semibold transition-colors"
                                        >
                                          <Archive size={14} className="text-rose-500" />
                                          <span>Archive room</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE ROOMS CARDS */}
                  <div className="md:hidden space-y-3">
                    {filteredRooms.map(room => {
                      const roomTenants = getRoomTenants(room.id);
                      const tenant = roomTenants[0] || null;
                      const isOccupied = room.status === 'Occupied' || roomTenants.length > 0;
                      const elecMode = room.elec_mode || (room.has_submeter !== false ? 'submeter' : 'direct');

                      return (
                        <div key={room.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center font-bold text-sm">
                                {room.room_number}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 text-sm">Room {room.room_number}</h3>
                                <p className="text-xs text-slate-400">{room.room_type || 'Single Room'} • Floor {room.floor || 'G'}</p>
                              </div>
                            </div>

                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isOccupied ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                              {roomTenants.length > 1 ? `Shared (${roomTenants.length})` : isOccupied ? 'Occupied' : room.status || 'Vacant'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tenant{roomTenants.length > 1 ? 's' : ''}</span>
                              {roomTenants.length === 0 ? (
                                <p className="font-semibold text-slate-400 italic">— Vacant —</p>
                              ) : roomTenants.length === 1 ? (
                                <p className="font-semibold text-slate-800 truncate">{roomTenants[0].name}</p>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  {roomTenants.map((t, i) => (
                                    <span key={t.id} className="inline-flex items-center gap-1">
                                      <span className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[8px] font-extrabold">{i + 1}</span>
                                      <span className="font-semibold text-slate-800">{t.name}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Rent</span>
                              <p className="font-black text-slate-900">{formatINR(room.base_rent)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 font-medium">
                              Elec: <strong className="text-[#2d5a47] font-semibold">{elecMode}</strong>
                            </span>

                            <div className="flex gap-2">
                              {!isOccupied && (
                                <button
                                  onClick={() => navigate(`/tenants?action=add&roomId=${room.id}`)}
                                  className="px-2.5 py-1 text-xs bg-[#2d5a47] text-white font-bold rounded-xl hover:bg-[#234738] transition-all flex items-center gap-1 shadow-sm"
                                >
                                  <UserPlus size={12} /> Add tenant
                                </button>
                              )}
                              <button
                                onClick={() => setInspectRoom(room)}
                                className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRoom(room);
                                  setShowRoomDrawer(true);
                                }}
                                className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      ) : (
        <div className="card glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
          <Building size={48} className="text-slate-700 mb-4 animate-pulse" />
          <h3 className="font-semibold text-slate-400 text-base">No Property Selected</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm">Select an existing property above, or click "+ New Property" to start managing your rooms.</p>
        </div>
      )}

      {/* ── NEW / EDIT PROPERTY MODAL (PREMIUM SAAS STYLE) ── */}
      {showPropModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'fadeIn 0.18s ease-out' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPropModal(false); }}
        >
          <div
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            style={{ animation: 'slideUpModal 0.22s cubic-bezier(0.34,1.56,0.64,1)', maxHeight: '96vh' }}
          >
            {/* Premium Gradient Header */}
            <div
              className="relative px-6 pt-7 pb-6 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a3a2b 0%, #2d5a47 55%, #3a7a5c 100%)' }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a8ffce, transparent 70%)', transform: 'translate(40%, -40%)' }} />
              <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7fffd4, transparent 70%)', transform: 'translate(-30%, 40%)' }} />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Animated icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.25)' }}
                  >
                    <Building size={26} className="text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/80 mb-0.5">
                      {editingPropId ? 'Update Property' : 'New Property'}
                    </div>
                    <h2 className="text-lg font-extrabold text-white leading-tight">
                      {editingPropId ? 'Edit Property Details' : 'Add New Property'}
                    </h2>
                    <p className="text-xs text-emerald-200/70 mt-0.5 font-medium">
                      Configure building name &amp; location
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPropModal(false)}
                  className="flex-shrink-0 p-2 rounded-xl transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Feature chips */}
              {!editingPropId && (
                <div className="relative flex flex-wrap gap-2 mt-5">
                  {[
                    { icon: '🏠', label: 'Manage rooms' },
                    { icon: '👤', label: 'Track tenants' },
                    { icon: '⚡', label: 'Smart billing' },
                  ].map(chip => (
                    <span
                      key={chip.label}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                      {chip.icon} {chip.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Form Body */}
            <form onSubmit={handlePropSubmit} className="p-6 space-y-5">
              {/* Property Name */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">
                  Property / Building Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heights, Sunrise Apartments…"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d5a47] focus:bg-white transition-all"
                    style={{ boxShadow: 'none' }}
                    onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(45,90,71,0.12)'; e.target.style.borderColor = '#2d5a47'; }}
                    onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = ''; }}
                    value={propName}
                    onChange={e => setPropName(e.target.value)}
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">This will appear as the property title across your dashboard.</p>
              </div>

              {/* Address */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">
                  Address / Location <span className="text-slate-400 font-medium normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Sector 62, Noida, UP"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d5a47] focus:bg-white transition-all"
                    style={{ boxShadow: 'none' }}
                    onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(45,90,71,0.12)'; e.target.style.borderColor = '#2d5a47'; }}
                    onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = ''; }}
                    value={propAddress}
                    onChange={e => setPropAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowPropModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #2d5a47, #3a7a5c)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #234738, #2d5a47)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #2d5a47, #3a7a5c)'}
                >
                  <Building size={15} />
                  {editingPropId ? 'Save Changes' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUpModal {
              from { opacity: 0; transform: translateY(32px) scale(0.97) }
              to   { opacity: 1; transform: translateY(0)    scale(1)    }
            }
          `}</style>
        </div>,
        document.body
      )}

      {/* ── ROOM DRAWER (SIDE DRAWER / MOBILE SHEET) ── */}
      {showRoomDrawer && createPortal(
        <RoomDrawer
          isOpen={showRoomDrawer}
          onClose={() => {
            setShowRoomDrawer(false);
            setEditingRoom(null);
          }}
          onSubmit={handleRoomSubmit}
          editingRoom={editingRoom}
          customRoomTypes={customRoomTypes}
          onOpenCreateTypeModal={() => setShowCreateTypeModal(true)}
        />,
        document.body
      )}

      {/* ── CREATE CUSTOM ROOM TYPE MODAL ── */}
      {showCreateTypeModal && createPortal(
        <CreateRoomTypeModal
          isOpen={showCreateTypeModal}
          onClose={() => setShowCreateTypeModal(false)}
          onCreate={handleCreateCustomRoomType}
        />,
        document.body
      )}

      {/* ── ROOM DETAILS INSPECTION MODAL ── */}
      {inspectRoom && createPortal(
        <RoomDetailsModal
          isOpen={!!inspectRoom}
          onClose={() => setInspectRoom(null)}
          room={inspectRoom}
          tenant={inspectRoom ? getRoomTenant(inspectRoom.id) : null}
          tenants={inspectRoom ? getRoomTenants(inspectRoom.id) : []}
          onEdit={(roomToEdit) => {
            setEditingRoom(roomToEdit);
            setShowRoomDrawer(true);
          }}
        />,
        document.body
      )}

      {/* ── BILL RECEIPT MODAL ── */}
      {viewingReceipt && createPortal(
        <BillReceiptModal
          isOpen={!!viewingReceipt}
          onClose={() => setViewingReceipt(null)}
          bill={viewingReceipt.bill}
          room={viewingReceipt.room}
          tenant={viewingReceipt.tenant}
          property={selectedProperty}
        />,
        document.body
      )}

    </div>
  );
}
