import React, { useState, useEffect } from 'react';
import { 
  X, 
  Home, 
  Zap, 
  Plus, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle,
  Tag
} from 'lucide-react';

export default function RoomDrawer({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingRoom, 
  customRoomTypes = [],
  onOpenCreateTypeModal 
}) {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [roomType, setRoomType] = useState('Single Room');
  const [baseRent, setBaseRent] = useState('');
  const [status, setStatus] = useState('Vacant');
  
  // Electricity Billing Mode: 'submeter', 'direct', 'fixed', 'shared', 'none'
  const [elecMode, setElecMode] = useState('submeter');
  const [meterReading, setMeterReading] = useState('0');
  const [ratePerUnit, setRatePerUnit] = useState('17');
  const [directAmount, setDirectAmount] = useState('0');
  const [fixedAmount, setFixedAmount] = useState('500');

  useEffect(() => {
    if (editingRoom) {
      setRoomNumber(editingRoom.room_number || '');
      setFloor(editingRoom.floor || '');
      setRoomType(editingRoom.room_type || 'Single Room');
      setBaseRent(editingRoom.base_rent ? editingRoom.base_rent.toString() : '');
      setStatus(editingRoom.status || 'Vacant');
      
      const mode = editingRoom.elec_mode || (editingRoom.has_submeter !== false ? 'submeter' : 'direct');
      setElecMode(mode);
      setMeterReading((editingRoom.current_meter_reading || 0).toString());
      setRatePerUnit((editingRoom.rate_per_unit || 17).toString());
      setDirectAmount((editingRoom.direct_elec_amount || 0).toString());
      setFixedAmount((editingRoom.fixed_elec_amount || 500).toString());
    } else {
      setRoomNumber('');
      setFloor('');
      setRoomType('Single Room');
      setBaseRent('');
      setStatus('Vacant');
      setElecMode('submeter');
      setMeterReading('0');
      setRatePerUnit('17');
      setDirectAmount('0');
      setFixedAmount('500');
    }
  }, [editingRoom, isOpen]);

  if (!isOpen) return null;

  const defaultTypes = [
    'Single Room',
    'Double Room',
    'Shared Room',
    'Studio',
    '1 BHK',
    '2 BHK',
    '3 BHK',
    'Shop',
    'Office',
    'Other'
  ];

  const allRoomTypes = Array.from(new Set([...defaultTypes, ...customRoomTypes.map(t => t.name || t)]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomNumber.trim() || !baseRent) return;

    onSubmit({
      room_number: roomNumber.trim(),
      floor: floor.trim(),
      room_type: roomType,
      base_rent: parseFloat(baseRent),
      status: status,
      has_submeter: elecMode === 'submeter',
      elec_mode: elecMode,
      current_meter_reading: elecMode === 'submeter' ? parseFloat(meterReading || 0) : 0,
      rate_per_unit: elecMode === 'submeter' ? parseFloat(ratePerUnit || 17) : 0,
      direct_elec_amount: elecMode === 'direct' ? parseFloat(directAmount || 0) : 0,
      fixed_elec_amount: elecMode === 'fixed' ? parseFloat(fixedAmount || 0) : 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative animate-slide-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Home size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                {editingRoom ? 'Edit Room Details' : 'Add Room'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure room specifications, rent, and utility billing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: Basic Details */}
          <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Basic Room Details</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Room No. / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, Flat A, Shop 12"
                  className="form-input bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Floor</label>
                <input
                  type="text"
                  placeholder="e.g. 1st, 2nd, G"
                  className="form-input bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="input-label mb-0">Room Type</label>
                <button
                  type="button"
                  onClick={onOpenCreateTypeModal}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <Tag size={12} />
                  <span>+ Custom Type</span>
                </button>
              </div>

              <select
                className="form-input bg-slate-800 border-slate-700 text-slate-100"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                {allRoomTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-slate-200">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Status</label>
              <select
                className="form-input bg-slate-800 border-slate-700 text-slate-100"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Vacant" className="bg-slate-900 text-slate-200">Vacant</option>
                <option value="Occupied" className="bg-slate-900 text-slate-200">Occupied</option>
                <option value="Maintenance" className="bg-slate-900 text-slate-200">Maintenance</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: Rent */}
          <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Base Monthly Rent</h4>
            </div>

            <div>
              <label className="input-label">Monthly Rent (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  required
                  placeholder="8000"
                  className="form-input bg-slate-800 border-slate-700 pl-8 font-semibold text-slate-100 placeholder:text-slate-500"
                  value={baseRent}
                  onChange={(e) => setBaseRent(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Flexible Electricity Billing */}
          <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Electricity Billing</h4>
              </div>
              <Zap size={15} className="text-amber-400" />
            </div>

            <label className="input-label">How do you charge electricity?</label>
            
            {/* 5-Way Mode Selection Buttons */}
            <div className="space-y-2">
              {[
                { id: 'submeter', label: 'Submeter Reading', desc: 'Meter reading & per-unit rate calculation', icon: '⚡' },
                { id: 'direct', label: 'Direct Bill Amount', desc: 'Enter total electricity amount from main bill', icon: '📄' },
                { id: 'fixed', label: 'Fixed Monthly Charge', desc: 'Add a flat electricity fee every month', icon: '🏷️' },
                { id: 'shared', label: 'Shared Bill', desc: 'Proportional split of property utility bill', icon: '🤝' },
                { id: 'none', label: 'Not Applicable', desc: 'Electricity disabled or included in rent', icon: '🚫' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setElecMode(mode.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    elecMode === mode.id
                      ? 'bg-blue-600/15 border-blue-500 text-slate-100 ring-1 ring-blue-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{mode.icon}</span>
                    <div>
                      <p className="font-semibold text-xs text-slate-200">{mode.label}</p>
                      <p className="text-[10px] text-slate-400">{mode.desc}</p>
                    </div>
                  </div>
                  {elecMode === mode.id && <CheckCircle2 size={16} className="text-blue-400" />}
                </button>
              ))}
            </div>

            {/* PROGRESSIVE DISCLOSURE OF FIELDS BASED ON MODE */}

            {/* SUBMETER MODE FIELDS */}
            {elecMode === 'submeter' && (
              <div className="grid grid-cols-2 gap-3 pt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="input-label">Starting Meter Reading (units)</label>
                  <input
                    type="number"
                    required={elecMode === 'submeter'}
                    placeholder="0"
                    className="form-input bg-slate-900 font-mono text-xs"
                    value={meterReading}
                    onChange={(e) => setMeterReading(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Rate (₹/unit)</label>
                  <input
                    type="number"
                    required={elecMode === 'submeter'}
                    placeholder="17"
                    className="form-input bg-slate-900 text-xs"
                    value={ratePerUnit}
                    onChange={(e) => setRatePerUnit(e.target.value)}
                  />
                </div>
                <p className="col-span-2 text-[10px] text-blue-400 leading-snug">
                  💡 BillRoom will calculate electricity automatically from current and previous meter readings.
                </p>
              </div>
            )}

            {/* DIRECT BILL MODE FIELDS */}
            {elecMode === 'direct' && (
              <div className="pt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="input-label">Default Electricity Amount (₹)</label>
                <input
                  type="number"
                  placeholder="2450"
                  className="form-input bg-slate-900 text-xs font-semibold"
                  value={directAmount}
                  onChange={(e) => setDirectAmount(e.target.value)}
                />
                <p className="text-[10px] text-purple-400 leading-snug">
                  💡 Enter electricity bill amounts directly during monthly bill generation.
                </p>
              </div>
            )}

            {/* FIXED CHARGE MODE FIELDS */}
            {elecMode === 'fixed' && (
              <div className="pt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="input-label">Monthly Electricity Charge (₹)</label>
                <input
                  type="number"
                  required={elecMode === 'fixed'}
                  placeholder="500"
                  className="form-input bg-slate-900 text-xs font-semibold"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                />
                <p className="text-[10px] text-emerald-400 leading-snug">
                  💡 This fixed amount will be added automatically to monthly rent.
                </p>
              </div>
            )}

            {/* SHARED BILL MODE EXPLANATION */}
            {elecMode === 'shared' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs space-y-1">
                <p className="font-semibold">Shared Utility Billing</p>
                <p className="text-[11px] text-amber-400/80 leading-relaxed">
                  Shared electricity billing uses the property-level split settings during monthly bill generation.
                </p>
              </div>
            )}

            {/* NOT APPLICABLE EXPLANATION */}
            {elecMode === 'none' && (
              <div className="p-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl text-xs">
                Electricity billing is disabled for this room.
              </div>
            )}

          </div>

        </form>

        {/* Drawer Footer Controls */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary flex-1 justify-center py-3 text-xs font-bold shadow-glow"
          >
            {editingRoom ? 'Save Changes' : 'Save Room'}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary px-5 py-3 text-xs"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
