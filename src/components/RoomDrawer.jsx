import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Home,
  Zap,
  Check,
  Tag,
  ArrowRight,
  ChevronDown,
  Building2
} from 'lucide-react';

// Electricity billing modes — user-facing labels mapped to internal values
const ELEC_MODES = [
  {
    id: 'submeter',
    label: 'Room Submeter (Meter-based)',
    desc: 'Units × Rate per unit (automatically splits for roommates)',
    icon: <Zap size={16} />,
  },
  {
    id: 'direct',
    label: 'From electricity bill',
    desc: "Add the amount from your property's bill",
    icon: <span className="text-sm">🧾</span>,
  },
  {
    id: 'fixed',
    label: 'Fixed monthly charge',
    desc: 'Charge the same amount every month',
    icon: <Tag size={16} />,
  },
  {
    id: 'shared',
    label: 'Building Main Bill Split',
    desc: 'Proportional split of whole property power board bill (₹)',
    icon: <span className="text-sm">🤝</span>,
  },
  {
    id: 'none',
    label: 'Included / not charged',
    desc: 'No separate electricity charge',
    icon: <span className="text-sm leading-none">—</span>,
  },
];

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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  // Prevent scroll-to-increment on number inputs
  const blockScroll = (e) => e.target.blur();

  // Shared input class for the light theme
  const inputClass = `w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-[15px]
    placeholder:text-slate-400 focus:outline-none focus:border-[#2d5a47] focus:ring-1 focus:ring-[#2d5a47]/20
    transition-all duration-200`;

  const labelClass = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300" />

      {/* Drawer */}
      <div
        className="relative w-full sm:max-w-[520px] bg-[#fafbfa] h-full flex flex-col shadow-xl border-l border-slate-200/70 animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ─── Header ─── */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center flex-shrink-0">
              <Home size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {editingRoom ? 'Edit room' : 'Add room'}
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Set up this room and its billing preferences.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── Form Body (scrollable) ─── */}
        <form onSubmit={handleSubmit} id="room-form" className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-0">

            {/* ═══ SECTION 1: Room Details ═══ */}
            <div className="pb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[15px] font-bold text-slate-900">Room details</h3>
                <span className="text-xs text-slate-400 font-medium">1 of 3</span>
              </div>
              <p className="text-[13px] text-slate-500 mb-4">
                Give this space a name and a few basics.
              </p>

              <div className="space-y-4">
                {/* Room Number + Floor (side by side on desktop, stacked on mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Room number / name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 101, Flat A, Shop 12"
                      className={inputClass}
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Floor</label>
                    <input
                      type="text"
                      placeholder="e.g. Ground, 1st, 2nd"
                      className={inputClass}
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                    />
                  </div>
                </div>

                {/* Room Type Custom SaaS Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`${labelClass} mb-0`}>Room type</label>
                    <button
                      type="button"
                      onClick={onOpenCreateTypeModal}
                      className="text-xs text-[#2d5a47] hover:text-[#1a3e2f] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Tag size={12} />
                      <span>Manage types</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`${inputClass} flex items-center justify-between cursor-pointer bg-white text-left font-medium hover:border-slate-300 ${
                      dropdownOpen ? 'border-[#2d5a47] ring-1 ring-[#2d5a47]/20' : ''
                    }`}
                  >
                    <span className="text-slate-800">{roomType}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180 text-[#2d5a47]' : ''
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 max-h-56 overflow-y-auto animate-fade-in-up active">
                      {allRoomTypes.map((type) => {
                        const isSelected = roomType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setRoomType(type);
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-[14px] text-left flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-[#edf5f1] text-[#2d5a47] font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{type}</span>
                            {isSelected && <Check size={16} className="text-[#2d5a47]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/80" />

            {/* ═══ SECTION 2: Monthly Rent ═══ */}
            <div className="py-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[15px] font-bold text-slate-900">Monthly rent</h3>
                <span className="text-xs text-slate-400 font-medium">2 of 3</span>
              </div>
              <p className="text-[13px] text-slate-500 mb-4">
                The base rent before utility charges.
              </p>

              <div>
                <label className={labelClass}>Monthly rent <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none pointer-events-none">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="8,000"
                    className={`${inputClass} pl-8 font-semibold`}
                    value={baseRent}
                    onChange={(e) => setBaseRent(e.target.value)}
                    onWheel={blockScroll}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/80" />

            {/* ═══ SECTION 3: Electricity Billing ═══ */}
            <div className="pt-6 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Electricity billing</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how electricity is metered or charged for this room.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Step 3 of 3
                </span>
              </div>

              {/* 3 Clear SaaS Category Cards */}
              <div className="space-y-3">
                {/* 1. ROOM SUBMETER CARD */}
                <div
                  onClick={() => setElecMode('submeter')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    elecMode === 'submeter'
                      ? 'bg-[#edf5f1]/90 border-[#2d5a47] ring-1 ring-[#2d5a47]/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        elecMode === 'submeter' ? 'bg-[#2d5a47] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${elecMode === 'submeter' ? 'text-[#1c4032]' : 'text-slate-900'}`}>
                            Room Submeter (Meter-based)
                          </span>
                          <span className="bg-emerald-100 text-[#2d5a47] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Popular for PGs
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Physical electric meter in this room. Calculates: (Current − Previous) × Rate.
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      elecMode === 'submeter'
                        ? 'bg-[#2d5a47] text-white'
                        : 'border-2 border-slate-200'
                    }`}>
                      {elecMode === 'submeter' && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Expanded Submeter Inputs */}
                  {elecMode === 'submeter' && (
                    <div className="mt-4 pt-3.5 border-t border-[#2d5a47]/15 space-y-3" onClick={e => e.stopPropagation()}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Starting meter reading</label>
                          <input
                            type="number"
                            required
                            placeholder="0"
                            className={inputClass}
                            value={meterReading}
                            onChange={(e) => setMeterReading(e.target.value)}
                            onWheel={blockScroll}
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Rate per unit</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none pointer-events-none">₹</span>
                            <input
                              type="number"
                              required
                              placeholder="17"
                              className={`${inputClass} pl-8`}
                              value={ratePerUnit}
                              onChange={(e) => setRatePerUnit(e.target.value)}
                              onWheel={blockScroll}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80 text-xs space-y-1 text-slate-700">
                        <div className="flex items-center gap-1.5 font-bold text-[#2d5a47]">
                          <Zap size={13} />
                          <span>Formula: (Current Reading − Previous) × ₹{ratePerUnit || 17}/unit</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          💡 <strong>Automatic Roommate Split:</strong> If 2, 3, or more tenants share this room, total meter usage is divided equally on each tenant's bill automatically.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. BUILDING / SHARED UTILITY CARD */}
                <div
                  onClick={() => {
                    if (elecMode !== 'shared' && elecMode !== 'fixed' && elecMode !== 'direct') {
                      setElecMode('shared');
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    elecMode === 'shared' || elecMode === 'fixed' || elecMode === 'direct'
                      ? 'bg-[#edf5f1]/90 border-[#2d5a47] ring-1 ring-[#2d5a47]/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        elecMode === 'shared' || elecMode === 'fixed' || elecMode === 'direct'
                          ? 'bg-[#2d5a47] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            elecMode === 'shared' || elecMode === 'fixed' || elecMode === 'direct' ? 'text-[#1c4032]' : 'text-slate-900'
                          }`}>
                            Building Main Bill / Flat Fee (No Room Submeter)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          For properties where the whole building or floor shares a main DISCOM electricity bill.
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      elecMode === 'shared' || elecMode === 'fixed' || elecMode === 'direct'
                        ? 'bg-[#2d5a47] text-white'
                        : 'border-2 border-slate-200'
                    }`}>
                      {(elecMode === 'shared' || elecMode === 'fixed' || elecMode === 'direct') && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Expanded Building Options */}
                  {(elecMode === 'shared' || elecMode === 'fixed' || elecMode === 'direct') && (
                    <div className="mt-4 pt-3.5 border-t border-[#2d5a47]/15 space-y-3" onClick={e => e.stopPropagation()}>
                      <label className="block text-xs font-bold text-slate-700">Choose charge method:</label>
                      
                      {/* Segmented Sub-Option Toggle */}
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setElecMode('shared')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                            elecMode === 'shared'
                              ? 'bg-[#2d5a47] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          🤝 Split Main Bill
                        </button>
                        <button
                          type="button"
                          onClick={() => setElecMode('fixed')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                            elecMode === 'fixed'
                              ? 'bg-[#2d5a47] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          🏷️ Fixed ₹ / Mo
                        </button>
                        <button
                          type="button"
                          onClick={() => setElecMode('direct')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                            elecMode === 'direct'
                              ? 'bg-[#2d5a47] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          🧾 Direct Entry
                        </button>
                      </div>

                      {/* Sub-Option Details */}
                      {elecMode === 'shared' && (
                        <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                          <p className="font-bold text-[#2d5a47]">🏢 Proportional Main Bill Split</p>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Enter the total building electricity bill (e.g. ₹5,600) when generating bills. It will be divided proportionally among rooms or total tenant headcount.
                          </p>
                        </div>
                      )}

                      {elecMode === 'fixed' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Monthly fixed charge</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none pointer-events-none">₹</span>
                            <input
                              type="number"
                              required
                              placeholder="500"
                              className={`${inputClass} pl-8`}
                              value={fixedAmount}
                              onChange={(e) => setFixedAmount(e.target.value)}
                              onWheel={blockScroll}
                              min="0"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">This fixed amount is added to rent every month.</p>
                        </div>
                      )}

                      {elecMode === 'direct' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Default direct amount (optional)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none pointer-events-none">₹</span>
                            <input
                              type="number"
                              placeholder="0"
                              className={`${inputClass} pl-8`}
                              value={directAmount}
                              onChange={(e) => setDirectAmount(e.target.value)}
                              onWheel={blockScroll}
                              min="0"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">You can adjust this amount every month on bill creation.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. INCLUDED / NOT CHARGED CARD */}
                <div
                  onClick={() => setElecMode('none')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    elecMode === 'none'
                      ? 'bg-[#edf5f1]/90 border-[#2d5a47] ring-1 ring-[#2d5a47]/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        elecMode === 'none' ? 'bg-[#2d5a47] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="text-sm font-extrabold">—</span>
                      </div>
                      <div>
                        <span className={`text-sm font-bold ${elecMode === 'none' ? 'text-[#1c4032]' : 'text-slate-900'}`}>
                          Included in Rent / Not Charged
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Electricity is free or already factored into the monthly base rent (₹0 separate charge).
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      elecMode === 'none'
                        ? 'bg-[#2d5a47] text-white'
                        : 'border-2 border-slate-200'
                    }`}>
                      {elecMode === 'none' && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* ─── Footer ─── */}
        <div className="px-6 py-4 bg-white border-t border-slate-200/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="room-form"
            className="px-6 py-2.5 bg-[#2d5a47] text-white text-sm font-semibold rounded-xl hover:bg-[#234738] transition-colors flex items-center gap-2 shadow-sm"
          >
            {editingRoom ? 'Save changes' : 'Save room'}
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
