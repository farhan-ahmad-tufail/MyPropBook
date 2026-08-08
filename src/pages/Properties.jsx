import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
  Calculator, 
  Tag,
  CheckCircle2,
  AlertCircle,
  Archive,
  ChevronRight,
  Layers,
  X,
  PlayCircle,
  ListChecks,
  Receipt,
  Bolt,
  CheckCheck,
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

  // Bulk Billing State
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'bulkbill'
  const [bulkMonth, setBulkMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  });
  const [bulkYear, setBulkYear] = useState(() => new Date().getFullYear().toString());
  const [bulkReadings, setBulkReadings] = useState({}); // { [roomId]: { currentReading, otherCharges } }
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResults, setBulkResults] = useState([]); // generated bill results
  const [viewingReceipt, setViewingReceipt] = useState(null); // { bill, room, tenant }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || null;

  // Fetching data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [propsList, tenantsList, leasesList, roomsList] = await Promise.all([
        api.getProperties(ownerId),
        api.getTenants(ownerId),
        api.getLeases(ownerId),
        api.getAllRooms(ownerId)
      ]);

      setProperties(propsList);
      setTenants(tenantsList);
      setLeases(leasesList);
      setAllRooms(roomsList || []);
      
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

  // Map room to tenant & active lease
  const getRoomTenant = (roomId) => {
    const activeLease = leases.find(l => l.room_id === roomId && l.is_active);
    if (!activeLease) return null;
    return tenants.find(t => t.id === activeLease.tenant_id) || null;
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

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Properties & Rooms</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your properties, rooms, rent, and billing settings.</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingPropId(null);
            setPropName('');
            setPropAddress('');
            setShowPropModal(true);
          }} 
          className="btn btn-primary shadow-glow px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold cursor-pointer"
        >
          <Plus size={18} /> + New Property
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
            <Building size={16} className="text-blue-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Properties</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {properties.length}
            </span>
          </div>

          {/* Lightweight Property Search */}
          {properties.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search properties..."
                value={propertySearchQuery}
                onChange={(e) => setPropertySearchQuery(e.target.value)}
                className="form-input bg-slate-900 border-slate-800 pl-9 py-1.5 text-xs rounded-xl"
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
                  className={`card glass-card p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 relative group ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-600/10 ring-1 ring-blue-500/40 shadow-lg' 
                      : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        <Building size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-100 truncate">{p.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={11} className="text-slate-500" />
                          <span>{p.address || 'No location set'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => startEditProperty(p, e)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handlePropDelete(p.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      {roomCount} Rooms • <strong className="text-emerald-400 font-semibold">{occCount} Occupied</strong>
                    </span>

                    <span className="font-bold text-slate-200 font-mono">
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
        <div className="space-y-6 pt-4 border-t border-slate-800/80">
          
          {/* Selected Property Header Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Rooms in {selectedProperty.name}
                </h2>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                  {selectedProperty.address || 'Active Property'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedPropertyStats.totalRooms} rooms · {selectedPropertyStats.occupied} occupied · {selectedPropertyStats.vacant} vacant
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Expected Rent</span>
                <span className="text-sm font-extrabold text-emerald-400">{formatINR(selectedPropertyStats.expectedRent)}</span>
              </div>

              <button 
                onClick={() => {
                  setEditingRoom(null);
                  setShowRoomDrawer(true);
                }}
                className="btn btn-primary shadow-glow px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Plus size={16} /> + Add Room
              </button>
            </div>
          </div>

          {/* ── TAB SWITCHER: Rooms List / Bulk Billing ── */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rooms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Home size={13} /> Rooms List
            </button>
            <button
              onClick={() => setActiveTab('bulkbill')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bulkbill'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bolt size={13} /> Bulk Billing
              {occupiedRoomsForBulk.length > 0 && (
                <span className="bg-violet-500/30 text-violet-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {occupiedRoomsForBulk.length}
                </span>
              )}
            </button>
          </div>

          {/* ── BULK BILLING PANEL ── */}
          {activeTab === 'bulkbill' && (
            <div className="space-y-5">

              {/* Intro Banner */}
              <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                  <Bolt size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-violet-300 text-sm">Bulk Billing Run — {selectedProperty.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate monthly rent &amp; utility bills for all <strong className="text-violet-300">{occupiedRoomsForBulk.length} occupied rooms</strong> in one click. Enter meter readings for submeter rooms, then hit Generate.
                  </p>
                </div>
              </div>

              {/* Month & Year Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                  <Receipt size={13} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bill Month</span>
                  <select
                    value={bulkMonth}
                    onChange={e => setBulkMonth(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {MONTHS.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                  <Receipt size={13} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Year</span>
                  <select
                    value={bulkYear}
                    onChange={e => setBulkYear(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                  </select>
                </div>
              </div>

              {occupiedRoomsForBulk.length === 0 ? (
                <div className="card glass-card p-10 text-center text-slate-500 text-sm">
                  <Home size={36} className="mx-auto mb-3 text-slate-700" />
                  <p className="font-semibold text-slate-300">No occupied rooms</p>
                  <p className="text-xs mt-1">Add tenants and mark rooms as occupied to use bulk billing.</p>
                </div>
              ) : (
                <>
                  {/* Bulk Billing Table */}
                  <div className="card glass-card overflow-hidden border-slate-800">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="table w-full text-left">
                        <thead>
                          <tr className="bg-slate-950/40 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <th className="px-4 py-3.5">Room</th>
                            <th className="px-4 py-3.5">Tenant</th>
                            <th className="px-4 py-3.5">Base Rent</th>
                            <th className="px-4 py-3.5">Previous Reading</th>
                            <th className="px-4 py-3.5">Current Reading (Input)</th>
                            <th className="px-4 py-3.5">Electricity Charges</th>
                            <th className="px-4 py-3.5">Other Charges</th>
                            <th className="px-4 py-3.5 text-right">Total Payable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {occupiedRoomsForBulk.map(room => {
                            const tenant = getRoomTenant(room.id);
                            const readings = bulkReadings[room.id] || {};
                            const prevReading = parseFloat(room.current_meter_reading || 0);
                            const rawCurr = readings.currentReading;
                            const currReading = (rawCurr !== '' && rawCurr !== null && rawCurr !== undefined && !isNaN(rawCurr))
                              ? parseFloat(rawCurr)
                              : prevReading;
                            const units = Math.max(0, currReading - prevReading);
                            const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);
                            const rent = parseFloat(room.base_rent || 0);
                            const other = parseFloat(readings.otherCharges || 0);

                            let elec = 0;
                            let elecLabel = '';
                            if (room.elec_mode === 'submeter') { elec = units * rate; elecLabel = `${units.toFixed(1)} units × ₹${rate}/unit`; }
                            else if (room.elec_mode === 'direct') { elec = parseFloat(room.direct_elec_amount || 0); elecLabel = 'Direct Amount'; }
                            else if (room.elec_mode === 'fixed') { elec = parseFloat(room.fixed_elec_amount || 0); elecLabel = 'Fixed Charge'; }
                            else elecLabel = 'None';

                            const total = rent + elec + other;

                            return (
                              <tr key={room.id} className="border-b border-slate-800/60 hover:bg-slate-900/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-bold text-sm text-slate-200">Room {room.room_number}</div>
                                  <div className="text-[10px] text-slate-500">{room.room_type || 'Room'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-xs font-semibold text-slate-300">{tenant?.name || <span className="italic text-slate-600">No Tenant</span>}</div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-sm text-slate-200">{formatINR(rent)}</td>
                                <td className="px-4 py-3">
                                  {room.elec_mode === 'submeter' ? (
                                    <div className="text-xs font-mono font-bold text-blue-400">{prevReading} <span className="text-[10px] text-slate-500 font-normal">units</span></div>
                                  ) : (
                                    <span className="text-xs text-slate-500">N/A</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {room.elec_mode === 'submeter' ? (
                                    <input
                                      type="number"
                                      min={prevReading}
                                      placeholder={`Enter ≥ ${prevReading}`}
                                      value={readings.currentReading}
                                      onChange={e => handleBulkReadingChange(room.id, 'currentReading', e.target.value)}
                                      className="form-input bg-slate-950 border-slate-700 py-1.5 px-2 text-xs rounded-lg w-32 focus:border-violet-500 font-mono"
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-500">N/A ({room.elec_mode || 'direct'})</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-xs font-semibold text-slate-300">{elecLabel}</div>
                                  <div className="text-xs font-bold text-blue-400 mt-0.5">{formatINR(elec)}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="₹0"
                                    value={readings.otherCharges}
                                    onChange={e => handleBulkReadingChange(room.id, 'otherCharges', e.target.value)}
                                    className="form-input bg-slate-950 border-slate-700 py-1.5 px-2 text-xs rounded-lg w-24"
                                  />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-extrabold text-sm text-emerald-400">{formatINR(total)}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-800">
                      {occupiedRoomsForBulk.map(room => {
                        const tenant = getRoomTenant(room.id);
                        const readings = bulkReadings[room.id] || {};
                        const prevReading = parseFloat(room.current_meter_reading || 0);
                        const currReading = parseFloat(readings.currentReading || prevReading);
                        const units = Math.max(0, currReading - prevReading);
                        const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);
                        const rent = parseFloat(room.base_rent || 0);
                        const other = parseFloat(readings.otherCharges || 0);
                        let elec = 0;
                        if (room.elec_mode === 'submeter') elec = units * rate;
                        else if (room.elec_mode === 'direct') elec = parseFloat(room.direct_elec_amount || 0);
                        else if (room.elec_mode === 'fixed') elec = parseFloat(room.fixed_elec_amount || 0);
                        const total = rent + elec + other;

                        return (
                          <div key={room.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-slate-200">{room.room_number}</div>
                                <div className="text-xs text-slate-400">{tenant?.name || 'No Tenant'}</div>
                              </div>
                              <span className="font-extrabold text-emerald-400">{formatINR(total)}</span>
                            </div>
                            {room.elec_mode === 'submeter' && (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Reading</label>
                                  <input
                                    type="number"
                                    min={prevReading}
                                    placeholder={`Prev: ${prevReading}`}
                                    value={readings.currentReading}
                                    onChange={e => handleBulkReadingChange(room.id, 'currentReading', e.target.value)}
                                    className="form-input bg-slate-950 border-slate-700 py-1.5 px-2 text-xs rounded-lg w-full mt-1"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Other Charges</label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="₹0"
                                    value={readings.otherCharges}
                                    onChange={e => handleBulkReadingChange(room.id, 'otherCharges', e.target.value)}
                                    className="form-input bg-slate-950 border-slate-700 py-1.5 px-2 text-xs rounded-lg w-full mt-1"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleBulkGenerate}
                      disabled={bulkRunning}
                      className="btn flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 text-sm font-bold shadow-glow transition-all"
                    >
                      {bulkRunning ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating Bills...</>
                      ) : (
                        <><PlayCircle size={16} /> Generate {occupiedRoomsForBulk.length} Bills for {bulkMonth} {bulkYear}</>
                      )}
                    </button>
                  </div>

                  {/* Results Section */}
                  {bulkResults.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCheck size={16} className="text-emerald-400" />
                        <h3 className="text-sm font-bold text-slate-200">Billing Run Results — {bulkMonth} {bulkYear}</h3>
                        <span className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {bulkResults.filter(r => r.success).length}/{bulkResults.length} Generated
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {bulkResults.map((item, idx) => {
                          const itemRoom = item.room || {};
                          const tenant = getRoomTenant(itemRoom.id);
                          const isSuccess = item.success;

                          return (
                            <div
                              key={itemRoom.id || idx}
                              className={`rounded-xl border p-4 text-xs space-y-2 ${
                                isSuccess
                                  ? 'bg-emerald-600/5 border-emerald-500/20'
                                  : 'bg-red-600/5 border-red-500/20'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-200">Room {itemRoom.room_number || 'Room'}</span>
                                {isSuccess ? (
                                  <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle2 size={12} /> Generated</span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-400 font-semibold"><AlertCircle size={12} /> Failed</span>
                                )}
                              </div>
                              
                              <div className="text-slate-400 font-medium">{tenant?.name || 'No Tenant'}</div>
                              
                              {isSuccess ? (
                                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                                  <div className="font-extrabold text-emerald-400 text-sm">{(() => {
                                    const raw = item.totalPayable ?? item.createdBill?.total_payable ?? 0;
                                    const val = parseFloat(raw);
                                    if (!isNaN(val) && val > 0) return formatINR(val);
                                    // Fallback: compute from line items
                                    const b = item.createdBill || {};
                                    const r = parseFloat(b.rent_amount || 0);
                                    const e = parseFloat(b.units_consumed || 0) * parseFloat(b.rate_per_unit || 0);
                                    const o = parseFloat(b.other_charges || 0) || 0;
                                    return formatINR(r + e + o);
                                  })()}</div>
                                  <button
                                    onClick={() => setViewingReceipt({
                                      bill: item.createdBill,
                                      room: itemRoom,
                                      tenant: tenant
                                    })}
                                    className="btn bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                                  >
                                    <Receipt size={12} /> View &amp; WhatsApp
                                  </button>
                                </div>
                              ) : (
                                <div className="text-red-400">{item.error}</div>
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
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 border border-slate-800 rounded-xl">
                  {['All', 'Occupied', 'Vacant', 'Maintenance'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRoomStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        roomStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Room Search */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Room No. or Tenant..."
                    value={roomSearchQuery}
                    onChange={(e) => setRoomSearchQuery(e.target.value)}
                    className="form-input bg-slate-900 border-slate-800 pl-9 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* ROOMS LIST - DESKTOP TABLE & MOBILE CARDS */}
              {filteredRooms.length === 0 ? (
                <div className="card glass-card p-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
                  <Home size={44} className="text-slate-700 mb-3" />
                  <p className="font-semibold text-slate-300">No rooms found</p>
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
                    className="btn btn-primary text-xs px-4 py-2 mt-4 rounded-xl font-semibold shadow-glow"
                  >
                    + Add Room
                  </button>
                </div>
              ) : (
                <>
                  {/* DESKTOP ROOMS TABLE */}
                  <div className="hidden md:block card glass-card border-slate-800">
                    <div className="overflow-visible">
                      <table className="table w-full text-left">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4">Room</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">Monthly Rent</th>
                            <th className="px-6 py-4">Electricity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRooms.map(room => {
                            const tenant = getRoomTenant(room.id);
                            const isOccupied = room.status === 'Occupied' || !!tenant;
                            const elecMode = room.elec_mode || (room.has_submeter !== false ? 'submeter' : 'direct');

                            return (
                              <tr key={room.id} className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                                      {room.room_number}
                                    </div>
                                    <span className="font-bold text-slate-200">Room {room.room_number}</span>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-slate-300 text-xs font-medium">
                                  {room.room_type || 'Single Room'}
                                </td>

                                <td className="px-6 py-4 text-xs font-medium">
                                  {tenant ? (
                                    <span className="text-slate-200 font-semibold">{tenant.name}</span>
                                  ) : (
                                    <span className="text-slate-500 italic">— Vacant —</span>
                                  )}
                                </td>

                                <td className="px-6 py-4 font-bold text-slate-100 font-mono">
                                  {formatINR(room.base_rent)}
                                </td>

                                <td className="px-6 py-4 text-xs">
                                  {elecMode === 'submeter' && (
                                    <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-medium">
                                      ⚡ Submeter
                                    </span>
                                  )}
                                  {elecMode === 'direct' && (
                                    <span className="inline-flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-medium">
                                      📄 Direct Bill
                                    </span>
                                  )}
                                  {elecMode === 'fixed' && (
                                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                                      🏷️ Fixed
                                    </span>
                                  )}
                                  {elecMode === 'shared' && (
                                    <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-medium">
                                      🤝 Shared
                                    </span>
                                  )}
                                  {elecMode === 'none' && (
                                    <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                                      🚫 None
                                    </span>
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    isOccupied 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : room.status === 'Maintenance' 
                                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {isOccupied ? 'Occupied' : room.status || 'Vacant'}
                                  </span>
                                </td>

                                <td className="px-6 py-4 text-right relative">
                                  <div className="inline-block text-left" onClick={e => e.stopPropagation()}>
                                    <button
                                      onClick={() => setActiveMenuRoomId(activeMenuRoomId === room.id ? null : room.id)}
                                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                      title="Actions"
                                    >
                                      <MoreVertical size={16} />
                                    </button>

                                    {/* Contextual Action Menu Dropdown */}
                                    {activeMenuRoomId === room.id && (
                                      <div className="absolute right-0 bottom-full mb-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 text-xs text-slate-200 animate-fade-in">
                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            setInspectRoom(room);
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                                        >
                                          <Eye size={13} className="text-blue-400" /> View Room Details
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            setEditingRoom(room);
                                            setShowRoomDrawer(true);
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                                        >
                                          <Edit2 size={13} className="text-slate-400" /> Edit Room Config
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            navigate('/tenants');
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                                        >
                                          <User size={13} className="text-emerald-400" /> {tenant ? 'View Tenant' : 'Add Tenant'}
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveMenuRoomId(null);
                                            navigate(`/smart-calc?roomId=${room.id}`);
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                                        >
                                          <Calculator size={13} className="text-amber-400" /> Generate Bill
                                        </button>

                                        <div className="border-t border-slate-800 my-1" />

                                        <button
                                          onClick={(e) => {
                                            setActiveMenuRoomId(null);
                                            handleRoomDelete(room, e);
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                                        >
                                          <Archive size={13} /> Archive Room
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
                      const tenant = getRoomTenant(room.id);
                      const isOccupied = room.status === 'Occupied' || !!tenant;
                      const elecMode = room.elec_mode || (room.has_submeter !== false ? 'submeter' : 'direct');

                      return (
                        <div key={room.id} className="card glass-card p-4 space-y-3 border-slate-800 relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                                {room.room_number}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-100 text-sm">Room {room.room_number}</h3>
                                <p className="text-xs text-slate-400">{room.room_type || 'Single Room'} • Floor {room.floor || 'G'}</p>
                              </div>
                            </div>

                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isOccupied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {isOccupied ? 'Occupied' : room.status || 'Vacant'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-850">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">Tenant</span>
                              <p className="font-medium text-slate-200 truncate">{tenant ? tenant.name : '— Vacant —'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">Monthly Rent</span>
                              <p className="font-bold text-slate-100 font-mono">{formatINR(room.base_rent)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                            <span className="text-slate-400">
                              Elec: <strong className="text-blue-400 font-semibold">{elecMode}</strong>
                            </span>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setInspectRoom(room)}
                                className="btn btn-secondary px-2.5 py-1 text-xs"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRoom(room);
                                  setShowRoomDrawer(true);
                                }}
                                className="btn btn-secondary px-2.5 py-1 text-xs"
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

      {/* ── NEW / EDIT PROPERTY MODAL ── */}
      {showPropModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <h3 className="font-bold text-base text-slate-100">
                {editingPropId ? 'Edit Property Details' : 'Add New Property'}
              </h3>
              <button onClick={() => setShowPropModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePropSubmit} className="p-6 space-y-4">
              <div>
                <label className="input-label">Property / Building Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Heights or Supernova"
                  className="form-input bg-slate-950 border-slate-800"
                  value={propName}
                  onChange={e => setPropName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label">Address / Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62, Noida"
                  className="form-input bg-slate-950 border-slate-800"
                  value={propAddress}
                  onChange={e => setPropAddress(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="submit" className="btn btn-primary flex-1 justify-center py-2.5 text-xs font-bold shadow-glow">
                  Save Property
                </button>
                <button type="button" onClick={() => setShowPropModal(false)} className="btn btn-secondary px-4 py-2.5 text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
