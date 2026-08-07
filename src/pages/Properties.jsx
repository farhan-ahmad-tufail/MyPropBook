import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Building, Home, Plus, Trash2, Edit2, MapPin, Check, X, ShieldAlert } from 'lucide-react';

export default function Properties() {
  const { user } = useAuth();
  
  // Data State
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State - Property
  const [showPropForm, setShowPropForm] = useState(false);
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [editingPropId, setEditingPropId] = useState(null);

  // Form State - Room
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomFloor, setRoomFloor] = useState('');
  const [roomType, setRoomType] = useState('Medium');
  const [roomRent, setRoomRent] = useState('');
  const [roomReading, setRoomReading] = useState('0');
  const [roomRate, setRoomRate] = useState('17');
  const [editingRoomId, setEditingRoomId] = useState(null);

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const ownerId = user?.id || 'mock_owner_id';
      const list = await api.getProperties(ownerId);
      setProperties(list);
      
      if (list.length > 0) {
        // Automatically select the first property if none selected
        if (!selectedProperty) {
          setSelectedProperty(list[0]);
          loadRooms(list[0].id);
        } else {
          // Keep selection up-to-date
          const updatedSelected = list.find(p => p.id === selectedProperty.id) || list[0];
          setSelectedProperty(updatedSelected);
          loadRooms(updatedSelected.id);
        }
      } else {
        setSelectedProperty(null);
        setRooms([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async (propId) => {
    try {
      const list = await api.getRooms(propId);
      setRooms(list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch rooms');
    }
  };

  const handleSelectProperty = (prop) => {
    setSelectedProperty(prop);
    loadRooms(prop.id);
    setShowRoomForm(false);
    setEditingRoomId(null);
  };

  // Property Form CRUD handlers
  const handlePropSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ownerId = user?.id || 'mock_owner_id';

    try {
      if (editingPropId) {
        await api.updateProperty(editingPropId, { name: propName, address: propAddress });
      } else {
        const newProp = await api.createProperty(ownerId, { name: propName, address: propAddress });
        setSelectedProperty(newProp);
      }
      setPropName('');
      setPropAddress('');
      setShowPropForm(false);
      setEditingPropId(null);
      await loadProperties();
    } catch (err) {
      setError('Failed to save property');
    }
  };

  const startEditProperty = (prop) => {
    setEditingPropId(prop.id);
    setPropName(prop.name);
    setPropAddress(prop.address || '');
    setShowPropForm(true);
  };

  const handlePropDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property? This will delete all rooms inside it.')) return;
    try {
      await api.deleteProperty(id);
      if (selectedProperty?.id === id) {
        setSelectedProperty(null);
      }
      await loadProperties();
    } catch (err) {
      setError('Failed to delete property');
    }
  };

  // Room Form CRUD handlers
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setError('');

    try {
      const roomData = {
        room_number: roomNumber,
        floor: roomFloor,
        room_type: roomType,
        base_rent: parseFloat(roomRent),
        current_meter_reading: parseFloat(roomReading || 0),
        rate_per_unit: parseFloat(roomRate || 17)
      };

      if (editingRoomId) {
        await api.updateRoom(editingRoomId, roomData);
      } else {
        await api.createRoom(selectedProperty.id, roomData);
      }

      setRoomNumber('');
      setRoomFloor('');
      setRoomType('Medium');
      setRoomRent('');
      setRoomReading('0');
      setRoomRate('17');
      setShowRoomForm(false);
      setEditingRoomId(null);
      await loadRooms(selectedProperty.id);
    } catch (err) {
      setError('Failed to save room');
    }
  };

  const startEditRoom = (room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.room_number);
    setRoomFloor(room.floor || '');
    setRoomType(room.room_type || 'Medium');
    setRoomRent(room.base_rent.toString());
    setRoomReading(room.current_meter_reading.toString());
    setRoomRate(room.rate_per_unit.toString());
    setShowRoomForm(true);
  };

  const handleRoomDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.deleteRoom(id);
      await loadRooms(selectedProperty.id);
    } catch (err) {
      setError(err.message || 'Failed to delete room');
    }
  };

  return (
    <div className="space-y-8 fade-in-up active">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Properties & Rooms</h1>
          <p className="text-slate-400 mt-1">Configure your locations and room metrics.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPropId(null);
            setPropName('');
            setPropAddress('');
            setShowPropForm(true);
          }} 
          className="btn btn-primary shadow-glow px-5 py-2.5 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} /> New Property
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Two Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: Properties List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Properties</h2>
          
          {/* Property Form */}
          {showPropForm && (
            <div className="card glass-card border-blue-500/30 p-5 bg-slate-900/50">
              <h3 className="font-semibold text-slate-200 mb-4 text-sm">
                {editingPropId ? 'Edit Property Details' : 'Add New Property'}
              </h3>
              <form onSubmit={propSubmit => handlePropSubmit(propSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="input-label">Property Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heights"
                    className="form-input bg-slate-950"
                    value={propName}
                    onChange={e => setPropName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Street 4, London"
                    className="form-input bg-slate-950"
                    value={propAddress}
                    onChange={e => setPropAddress(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary py-2 px-4 rounded-lg flex-1 text-xs">
                    Save Property
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPropForm(false)} 
                    className="btn btn-secondary py-2 px-3 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List items */}
          {properties.length === 0 ? (
            <div className="card glass-card p-6 text-center text-slate-500 text-sm">
              No properties registered yet. Click "New Property" to start.
            </div>
          ) : (
            <div className="space-y-2.5">
              {properties.map(p => {
                const isSelected = selectedProperty?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProperty(p)}
                    className={`card glass-card p-4 flex justify-between items-center cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30' 
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        <Building size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-sm text-slate-200 truncate">{p.name}</h3>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={10} /> {p.address || 'No address'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1.5 ml-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => startEditProperty(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="Edit Property"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handlePropDelete(p.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded"
                        title="Delete Property"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Rooms Grid */}
        <div className="lg:col-span-8 space-y-4">
          {selectedProperty ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Rooms in {selectedProperty.name}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingRoomId(null);
                    setRoomNumber('');
                    setRoomFloor('');
                    setRoomType('Medium');
                    setRoomRent('');
                    setRoomReading('0');
                    setRoomRate('17');
                    setShowRoomForm(true);
                  }}
                  className="btn btn-secondary px-3.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Room
                </button>
              </div>

              {/* Room Form */}
              {showRoomForm && (
                <div className="card glass-card border-blue-500/20 p-6 bg-slate-900/40">
                  <h3 className="font-bold text-slate-200 mb-4 text-sm flex items-center gap-2">
                    <Home size={16} className="text-blue-400" />
                    <span>{editingRoomId ? 'Edit Room Properties' : 'Register New Room'}</span>
                  </h3>
                  <form onSubmit={handleRoomSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="input-label">Room Number / Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 101 or A-12"
                        className="form-input bg-slate-950"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="input-label">Floor</label>
                      <input
                        type="text"
                        placeholder="e.g. 1st or G"
                        className="form-input bg-slate-950"
                        value={roomFloor}
                        onChange={e => setRoomFloor(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="input-label">Room Type</label>
                      <select
                        className="form-input bg-slate-955"
                        value={roomType}
                        onChange={e => setRoomType(e.target.value)}
                      >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Big(Window)">Big (window)</option>
                        <option value="Shop">Shop</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="input-label">Base Monthly Rent (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 5000"
                        className="form-input bg-slate-950"
                        value={roomRent}
                        onChange={e => setRoomRent(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="input-label">Starting Electricity Reading</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 235"
                        className="form-input bg-slate-950"
                        value={roomReading}
                        disabled={!!editingRoomId} // Prevent editing readings here if already set (prevent history issues)
                        onChange={e => setRoomReading(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="input-label">Electricity Unit Rate (₹/unit)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 17"
                        className="form-input bg-slate-950"
                        value={roomRate}
                        onChange={e => setRoomRate(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-3 pt-2">
                      <button type="submit" className="btn btn-primary py-2.5 px-4 rounded-xl flex-1 text-xs">
                        Save Room Config
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowRoomForm(false)} 
                        className="btn btn-secondary py-2.5 px-4 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Rooms Grid list */}
              {rooms.length === 0 ? (
                <div className="card glass-card p-12 text-center text-slate-500 text-sm">
                  No rooms added to this property yet. Click "Add Room" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map(room => (
                    <div key={room.id} className="card glass-card p-5 border-slate-800 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                            {room.room_number}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-200">Room {room.room_number}</h3>
                            <span className="text-xs text-slate-500 capitalize">{room.room_type} Room • Floor {room.floor || 'G'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => startEditRoom(room)}
                            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded"
                            title="Edit Room"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleRoomDelete(room.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded"
                            title="Delete Room"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Base Rent</span>
                          <p className="text-sm font-bold text-slate-200 mt-0.5">₹{room.base_rent}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Submeter</span>
                          <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono">{room.current_meter_reading} u</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rate</span>
                          <p className="text-sm font-bold text-slate-200 mt-0.5">₹{room.rate_per_unit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <Building size={48} className="text-slate-700 mb-4 animate-pulse" />
              <h3 className="font-semibold text-slate-400">No Property Selected</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">Select an existing property from the list on the left, or create a new property to manage its rooms.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
