import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Home,
  Zap,
  Check,
  Tag,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

// Electricity billing modes — user-facing labels mapped to internal values
const ELEC_MODES = [
  {
    id: 'submeter',
    label: 'Meter-based',
    desc: 'Calculate from meter readings',
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
    label: 'Shared / split bill',
    desc: 'Proportional split of property utility bill',
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
            <div className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[15px] font-bold text-slate-900">Electricity billing</h3>
                <span className="text-xs text-slate-400 font-medium">3 of 3</span>
              </div>
              <p className="text-[13px] text-slate-500 mb-5">
                Choose how electricity is charged for this room.
              </p>

              {/* Billing mode selectable cards */}
              <div className="space-y-2.5">
                {ELEC_MODES.map((mode) => {
                  const isSelected = elecMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setElecMode(mode.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center gap-3.5 group ${
                        isSelected
                          ? 'bg-[#edf5f1] border-[#2d5a47]/50 ring-1 ring-[#2d5a47]/15'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2d5a47] text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                      }`}>
                        {mode.icon}
                      </div>

                      {/* Label + description */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${
                          isSelected ? 'text-[#1c4032]' : 'text-slate-700'
                        }`}>{mode.label}</p>
                        <p className={`text-xs mt-0.5 leading-snug ${
                          isSelected ? 'text-[#2d5a47]/70' : 'text-slate-400'
                        }`}>{mode.desc}</p>
                      </div>

                      {/* Checkmark */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#2d5a47] text-white scale-100'
                          : 'border-2 border-slate-200 scale-90 group-hover:border-slate-300'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ─── Progressive Disclosure: Fields for selected mode ─── */}

              {/* SUBMETER MODE */}
              {elecMode === 'submeter' && (
                <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl space-y-4 animate-fade-in-up active">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Starting meter reading</label>
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
                      <label className={labelClass}>Rate per unit</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none pointer-events-none">₹</span>
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
                  <p className="text-xs text-slate-500 flex items-start gap-1.5">
                    <Zap size={12} className="text-[#2d5a47] mt-0.5 flex-shrink-0" />
                    Electricity is calculated from the difference between previous and current readings.
                  </p>
                </div>
              )}

              {/* DIRECT BILL MODE */}
              {elecMode === 'direct' && (
                <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl space-y-3 animate-fade-in-up active">
                  <div>
                    <label className={labelClass}>Electricity bill amount</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none pointer-events-none">₹</span>
                      <input
                        type="number"
                        placeholder="1,850"
                        className={`${inputClass} pl-8`}
                        value={directAmount}
                        onChange={(e) => setDirectAmount(e.target.value)}
                        onWheel={blockScroll}
                        min="0"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    This amount will be added to the tenant's monthly bill.
                  </p>
                </div>
              )}

              {/* FIXED CHARGE MODE */}
              {elecMode === 'fixed' && (
                <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl space-y-3 animate-fade-in-up active">
                  <div>
                    <label className={labelClass}>Monthly electricity charge</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none pointer-events-none">₹</span>
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
                  </div>
                  <p className="text-xs text-slate-500">
                    This fixed amount is added to rent every month.
                  </p>
                </div>
              )}

              {/* SHARED BILL MODE */}
              {elecMode === 'shared' && (
                <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl animate-fade-in-up active">
                  <p className="text-xs text-amber-800 font-medium">Shared utility billing</p>
                  <p className="text-xs text-amber-700/70 mt-0.5 leading-relaxed">
                    Electricity will be split using your property-level settings during bill generation.
                  </p>
                </div>
              )}

              {/* NOT APPLICABLE */}
              {elecMode === 'none' && (
                <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in-up active">
                  <p className="text-xs text-slate-500">
                    No separate electricity charge. This room's bill will only include rent and any other charges.
                  </p>
                </div>
              )}
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
