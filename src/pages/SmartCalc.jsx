import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Download,
  Share2,
  AlertTriangle,
  Building,
  User,
  Home,
  IndianRupee,
  Receipt,
  ChevronDown,
  Search,
  Check,
  X,
  PlusCircle,
  Calendar,
  Palette,
  Globe,
  Users,
  CheckCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';

/* ─────────────────────────────────────────────────────────────────────────
   Curated Professional Invoice Color Themes
───────────────────────────────────────────────────────────────────────────*/
const INVOICE_THEMES = [
  { id: 'green',  name: 'BillRoom Green', bg: '#2d5a47', border: '#234738', textAccent: 'text-emerald-200', pillBg: 'bg-emerald-100', pillText: 'text-[#2d5a47]', pillBgHex: '#d1fae5', pillTextHex: '#2d5a47', gradient: 'linear-gradient(135deg, #1a3a2b, #2d5a47)' },
  { id: 'navy',   name: 'Classic Navy',   bg: '#0f172a', border: '#1e293b', textAccent: 'text-slate-300',   pillBg: 'bg-slate-200',   pillText: 'text-slate-900', pillBgHex: '#e2e8f0', pillTextHex: '#0f172a', gradient: 'linear-gradient(135deg, #020617, #0f172a)' },
  { id: 'blue',   name: 'Royal Blue',     bg: '#1e40af', border: '#1d4ed8', textAccent: 'text-blue-200',    pillBg: 'bg-blue-100',    pillText: 'text-blue-900',  pillBgHex: '#dbeafe', pillTextHex: '#1e3a8a', gradient: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
  { id: 'maroon', name: 'Burgundy',       bg: '#881337', border: '#9f1239', textAccent: 'text-rose-200',    pillBg: 'bg-rose-100',    pillText: 'text-rose-900',  pillBgHex: '#ffe4e6', pillTextHex: '#881337', gradient: 'linear-gradient(135deg, #4c0519, #881337)' },
  { id: 'purple', name: 'Deep Purple',    bg: '#581c87', border: '#6b21a8', textAccent: 'text-purple-200',  pillBg: 'bg-purple-100',  pillText: 'text-purple-900',pillBgHex: '#f3e8ff', pillTextHex: '#581c87', gradient: 'linear-gradient(135deg, #3b0764, #581c87)' },
  { id: 'slate',  name: 'Minimal Black',  bg: '#09090b', border: '#27272a', textAccent: 'text-zinc-300',    pillBg: 'bg-zinc-200',    pillText: 'text-zinc-900',  pillBgHex: '#e4e4e7', pillTextHex: '#18181b', gradient: 'linear-gradient(135deg, #000000, #18181b)' }
];

/* ─────────────────────────────────────────────────────────────────────────
   Bilingual Invoice Translations (English / Hindi)
───────────────────────────────────────────────────────────────────────────*/
const BILL_TRANSLATIONS = {
  en: {
    previewLabel: "RENT RECEIPT",
    monthBill: (m, y) => `${m} ${y || ''}`,
    billedTo: "TENANT",
    electricity: "Total Electricity",
    totalRent: "Total Rent",
    totalElectricity: "Total Electricity",
    previous: "Previous",
    current: "Current",
    usage: "Usage",
    preLabel: "Pre:",
    curLabel: "Cur:",
    usageLabel: "Usage:",
    units: "units",
    room: "Room",
    monthlyRent: "Monthly Rent",
    previousBalance: "Previous Balance",
    otherCharges: "Other Charges",
    amountDue: "TOTAL PAYABLE AMOUNT",
    itemizedBreakdown: (count) => `ITEMIZED ROOM BREAKDOWN (${count} ROOMS)`,
    dueBadge: (m) => `DUE 10 ${m.substring(0, 3).toUpperCase()}`,
    thankYou: "Thank you for your payment.",
    waTitle: "RENT RECEIPT",
    waMonth: "Month",
    waTenant: "Tenant",
    waTotal: "Total"
  },
  hi: {
    previewLabel: "किराया रसीद",
    monthBill: (m, y) => `${m} ${y || ''}`,
    billedTo: "किरायेदार",
    electricity: "बिजली का कुल बिल",
    totalRent: "कुल किराया",
    totalElectricity: "बिजली का कुल बिल",
    previous: "पिछला",
    current: "नया",
    usage: "उपयोग",
    preLabel: "पिछला:",
    curLabel: "नया:",
    usageLabel: "उपयोग:",
    units: "यूनिट",
    room: "कमरा",
    monthlyRent: "कमरे का किराया",
    previousBalance: "पिछला बकाया",
    otherCharges: "अन्य खर्चे",
    amountDue: "कुल देय राशि",
    itemizedBreakdown: (count) => `कमरे के अनुसार विवरण (${count} कमरे)`,
    dueBadge: (m) => `लास्ट डेट: 10 ${m.substring(0, 3).toUpperCase()}`,
    thankYou: "समय पर भुगतान के लिए धन्यवाद।",
    waTitle: "किराया रसीद",
    waMonth: "महीना",
    waTenant: "किरायेदार",
    waTotal: "कुल राशि"
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   Reusable Custom SaaS Dropdown Component
───────────────────────────────────────────────────────────────────────────*/
function SaasDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choose…',
  required = false,
  disabled = false,
  icon: IconComponent,
  subtext
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()) || (o.sublabel && o.sublabel.toLowerCase().includes(query.toLowerCase())))
    : options;

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v); setQuery(''); }}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold text-left transition-all duration-150 ${disabled
            ? 'bg-slate-50 border-slate-200/60 text-slate-300 cursor-not-allowed'
            : open
              ? 'bg-white border-[#2d5a47] ring-2 ring-[#2d5a47]/10 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }`}
      >
        {IconComponent && (
          <span className={`flex-shrink-0 ${selected ? 'text-[#2d5a47]' : 'text-slate-400'}`}>
            <IconComponent size={15} />
          </span>
        )}

        <span className={`flex-1 truncate ${selected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>

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
            size={14}
            className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {subtext && (
        <p className="text-[11px] text-slate-400 mt-1 px-1 truncate">
          {subtext}
        </p>
      )}

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-[200] bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-300/40 overflow-hidden"
          style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
        >
          {options.length > 4 && (
            <div className="px-3 pt-2.5 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2d5a47]"
                />
              </div>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto py-1 px-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">No options available</div>
            ) : filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false); } }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-100 text-xs ${opt.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : opt.value === value
                      ? 'bg-[#edf5f1] text-[#2d5a47] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-semibold'
                  }`}
              >
                {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.sublabel && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${opt.disabled ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-500 font-medium'
                    }`}>
                    {opt.sublabel}
                  </span>
                )}
                {opt.value === value && !opt.disabled && (
                  <Check size={13} className="text-[#2d5a47] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Format a number as Indian-locale rupee string, e.g. ₹1,500 */
const formatINR = (amount) => `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

export default function SmartCalc() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Route URL Parameter support
  const urlRoomId = searchParams.get('roomId');

  // Loading lists
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Language State ('en' | 'hi')
  const [billLanguage, setBillLanguage] = useState('en');
  const t = BILL_TRANSLATIONS[billLanguage] || BILL_TRANSLATIONS.en;

  // Selected Theme State
  const [selectedThemeId, setSelectedThemeId] = useState('green');
  const activeTheme = INVOICE_THEMES.find(t => t.id === selectedThemeId) || INVOICE_THEMES[0];

  // Dropdown Selection States
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedSelectionKey, setSelectedSelectionKey] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Selected Room Details (Autofilled)
  const [activeTenant, setActiveTenant] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [calculatedArrears, setCalculatedArrears] = useState(0);
  const [customArrears, setCustomArrears] = useState('');

  // Form Fields
  const currentDate = new Date();
  const [billMonth, setBillMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [billYear, setBillYear] = useState(currentDate.getFullYear().toString());
  const [currentReading, setCurrentReading] = useState('');
  const [otherCharges, setOtherCharges] = useState('');

  // Electricity billing mode: 'submeter' | 'direct' | 'shared' | 'none'
  const [elecMode, setElecMode] = useState('submeter');
  const [directElecAmount, setDirectElecAmount] = useState('');
  const [propertyTotalElec, setPropertyTotalElec] = useState('');
  const [splitBasis, setSplitBasis] = useState('rooms'); // 'rooms' | 'tenants'
  const [multiRoomReadings, setMultiRoomReadings] = useState({});

  // Result & UI State
  const [result, setResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const receiptRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 1 + i).toString());

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [propsList, roomsList, tenantsList, leasesList, billsList] = await Promise.all([
        api.getProperties(ownerId).catch(() => []),
        api.getAllRooms(ownerId).catch(() => []),
        api.getTenants(ownerId).catch(() => []),
        api.getLeases(ownerId).catch(() => []),
        api.getBills(ownerId).catch(() => [])
      ]);

      setProperties(propsList);
      setRooms(roomsList);
      setTenants(tenantsList);
      setLeases(leasesList);
      setBills(billsList);

      if (urlRoomId && roomsList.length > 0) {
        const targetRoom = roomsList.find(r => r.id === urlRoomId);
        if (targetRoom) {
          setSelectedPropertyId(targetRoom.property_id);
          setSelectedSelectionKey(targetRoom.id);
          setSelectedRoomId(targetRoom.id);
        }
      } else if (propsList.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(propsList[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data for calculations');
    } finally {
      setLoading(false);
    }
  }, [user, urlRoomId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Triggered when selected room/tenant changes (Autofill execution)
  const isGroupRoomSelection = selectedSelectionKey.startsWith('room_group__');
  const [groupTenantReadings, setGroupTenantReadings] = useState({});
  const [groupResults, setGroupResults] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedSelectionKey) {
      setSelectedRoomId('');
      setActiveRoom(null);
      setActiveTenant(null);
      setCalculatedArrears(0);
      setCustomArrears('');
      setResult(null);
      setIsSaved(false);
      setGroupResults([]);
      return;
    }

    let actualRoomId = selectedSelectionKey;
    let targetTenantId = null;

    if (selectedSelectionKey.startsWith('room_group__')) {
      actualRoomId = selectedSelectionKey.replace('room_group__', '');
    } else if (selectedSelectionKey.includes('__')) {
      const parts = selectedSelectionKey.split('__');
      actualRoomId = parts[0];
      targetTenantId = parts[1];
    }

    setSelectedRoomId(actualRoomId);
    const roomObj = rooms.find(r => r.id === actualRoomId);
    setActiveRoom(roomObj);

    if (roomObj) {
      // Set default mode based on room setting if not customized
      const defaultMode = roomObj.elec_mode || ((!roomObj.elec_mode && roomObj.has_submeter !== false) ? 'submeter' : 'direct');
      setElecMode(defaultMode);
    }

    // If group mode, activeTenant is null or representative, and we initialize group readings
    if (selectedSelectionKey.startsWith('room_group__')) {
      const activeLeasesForRoom = leases.filter(l => l.room_id === actualRoomId && l.is_active);
      const roomTenantsList = activeLeasesForRoom.map(l => tenants.find(t => t.id === l.tenant_id)).filter(Boolean);
      
      const initialGroupReadings = {};
      roomTenantsList.forEach(t => {
        const autoArrears = bills
          .filter(b => b.room_id === actualRoomId && b.tenant_id === t.id && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
          .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
        initialGroupReadings[t.id] = {
          arrears: autoArrears > 0 ? autoArrears.toString() : '',
          otherCharges: ''
        };
      });
      setGroupTenantReadings(initialGroupReadings);
      setActiveTenant(roomTenantsList[0] || null);
      setCalculatedArrears(0);
      setCustomArrears('');
      return;
    }

    // Find specific tenant or active lease for this room
    let tenantObj = null;
    if (targetTenantId) {
      tenantObj = tenants.find(t => t.id === targetTenantId);
    } else {
      const activeLease = leases.find(l => l.room_id === actualRoomId && l.is_active);
      if (activeLease) {
        tenantObj = tenants.find(t => t.id === activeLease.tenant_id);
      }
    }

    if (tenantObj) {
      setActiveTenant(tenantObj);

      // Find all rooms occupied by this tenant
      const allTenantLeases = leases.filter(l => l.tenant_id === tenantObj.id && l.is_active);
      const allTenantRoomIds = allTenantLeases.map(l => l.room_id);

      const roomArrears = bills
        .filter(b => (allTenantRoomIds.includes(b.room_id) || b.tenant_id === tenantObj.id) && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
        .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
      setCalculatedArrears(roomArrears);
      setCustomArrears(roomArrears.toString());
    } else {
      setActiveTenant(null);
      setCalculatedArrears(0);
      setCustomArrears('');
    }
  }, [selectedSelectionKey, rooms, leases, tenants, bills]);

  // Compute active tenant's multi-room list
  const tenantActiveRooms = React.useMemo(() => {
    if (!activeTenant) return [];
    const tenantLeases = leases.filter(l => l.tenant_id === activeTenant.id && l.is_active);
    return tenantLeases.map(l => rooms.find(r => r.id === l.room_id)).filter(Boolean);
  }, [activeTenant, leases, rooms]);

  const isMultiRoomTenant = tenantActiveRooms.length > 1;

  // Active tenants sharing this specific room (e.g. 3 beds in Room 101)
  const roomActiveLeases = React.useMemo(() => {
    if (!activeRoom) return [];
    return leases.filter(l => l.room_id === activeRoom.id && l.is_active);
  }, [activeRoom, leases]);

  const roomTenantCount = roomActiveLeases.length || 1;
  const isSharedRoomTenants = roomTenantCount > 1;

  // Property-level occupied room and active tenant counts for shared utility splits
  const propertyOccupiedRooms = React.useMemo(() => {
    if (!selectedPropertyId) return [];
    const propRooms = rooms.filter(r => r.property_id === selectedPropertyId);
    return propRooms.filter(r => leases.some(l => l.room_id === r.id && l.is_active));
  }, [selectedPropertyId, rooms, leases]);

  const propertyActiveTenants = React.useMemo(() => {
    if (!selectedPropertyId) return [];
    const propRooms = rooms.filter(r => r.property_id === selectedPropertyId);
    const propRoomIds = propRooms.map(r => r.id);
    const activePropLeases = leases.filter(l => propRoomIds.includes(l.room_id) && l.is_active);
    const tenantIds = [...new Set(activePropLeases.map(l => l.tenant_id))];
    return tenantIds.map(tid => tenants.find(t => t.id === tid)).filter(Boolean);
  }, [selectedPropertyId, rooms, leases, tenants]);

  // Multi-room calculation breakdown
  const multiRoomItems = React.useMemo(() => {
    if (!isMultiRoomTenant) return [];
    return tenantActiveRooms.map(r => {
      const mRead = multiRoomReadings[r.id] || {};
      const pRead = parseFloat(r.current_meter_reading || 0);
      const rawCRead = mRead.currentReading;
      const cRead = (rawCRead !== undefined && rawCRead !== '' && !isNaN(rawCRead)) ? parseFloat(rawCRead) : pRead;
      const uConsumed = Math.max(0, cRead - pRead);
      const rRate = parseFloat(r.rate_per_unit || 17);
      let rElec = 0;
      if (r.elec_mode === 'submeter' || (!r.elec_mode && r.has_submeter !== false)) {
        rElec = uConsumed * rRate;
      } else {
        const rawDir = mRead.directElec;
        if (rawDir !== undefined && rawDir !== '' && !isNaN(rawDir)) {
          rElec = parseFloat(rawDir);
        } else {
          rElec = parseFloat(r.direct_elec_amount || 0);
        }
      }
      const rRent = parseFloat(r.base_rent || 0);
      return {
        room_id: r.id,
        room_number: r.room_number,
        room_type: r.room_type || 'Single Room',
        previous_reading: pRead,
        current_reading: cRead,
        units_consumed: uConsumed,
        rate_per_unit: rRate,
        rent_amount: rRent,
        elec_amount: rElec,
        electricity_amount: rElec,
        other_charges: 0
      };
    });
  }, [isMultiRoomTenant, tenantActiveRooms, multiRoomReadings]);

  // Real-time calculation computation
  const activeProperty = properties.find(p => p.id === selectedPropertyId);
  const prevReading = parseFloat(activeRoom?.current_meter_reading) || 0;
  const currReading = parseFloat(currentReading) || 0;
  const rate = parseFloat(activeRoom?.rate_per_unit) || 10;
  const unitsConsumed = (currentReading !== '' && currReading >= prevReading) ? (currReading - prevReading) : 0;
  const roomTotalElec = unitsConsumed * rate;

  let calculatedElecAmount = 0;
  if (isMultiRoomTenant) {
    calculatedElecAmount = multiRoomItems.reduce((sum, item) => sum + item.elec_amount, 0);
  } else if (elecMode === 'submeter') {
    calculatedElecAmount = isSharedRoomTenants ? Math.round(roomTotalElec / roomTenantCount) : roomTotalElec;
  } else if (elecMode === 'direct') {
    const rawDirect = parseFloat(directElecAmount) || 0;
    calculatedElecAmount = isSharedRoomTenants ? Math.round(rawDirect / roomTenantCount) : rawDirect;
  } else if (elecMode === 'shared') {
    const totalPropBill = parseFloat(propertyTotalElec) || 0;
    if (splitBasis === 'rooms') {
      const roomShare = Math.round(totalPropBill / Math.max(1, propertyOccupiedRooms.length));
      calculatedElecAmount = isSharedRoomTenants ? Math.round(roomShare / roomTenantCount) : roomShare;
    } else {
      calculatedElecAmount = Math.round(totalPropBill / Math.max(1, propertyActiveTenants.length));
    }
  }

  const baseRentAmount = isMultiRoomTenant 
    ? multiRoomItems.reduce((sum, item) => sum + item.rent_amount, 0)
    : (parseFloat(activeRoom?.base_rent) || 0);

  const activeTenantGroupInput = (isGroupRoomSelection && activeTenant) ? (groupTenantReadings[activeTenant.id] || {}) : {};
  const arrearsAmount = isGroupRoomSelection
    ? (activeTenantGroupInput.arrears !== undefined && activeTenantGroupInput.arrears !== '' ? (parseFloat(activeTenantGroupInput.arrears) || 0) : 0)
    : (customArrears !== '' ? (parseFloat(customArrears) || 0) : calculatedArrears);

  const otherChargesAmount = isGroupRoomSelection
    ? (parseFloat(activeTenantGroupInput.otherCharges) || 0)
    : (parseFloat(otherCharges) || 0);

  const grandTotalAmount = baseRentAmount + calculatedElecAmount + arrearsAmount + otherChargesAmount;

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsSaved(false);

    if (!activeRoom || !activeTenant) {
      setError('Please select a room with an active tenant');
      return;
    }

    if (isGroupRoomSelection) {
      // Generate bills for ALL roommates of this room in 1 shot!
      const activeLeasesForRoom = leases.filter(l => l.room_id === activeRoom.id && l.is_active);
      const roomTenantsList = activeLeasesForRoom.map(l => tenants.find(t => t.id === l.tenant_id)).filter(Boolean);

      if (roomTenantsList.length === 0) {
        setError('No active tenants found for this room.');
        return;
      }

      if (elecMode === 'submeter') {
        if (currentReading === '' || isNaN(currReading)) {
          setError('Please input a valid current meter reading');
          return;
        }
        if (currReading < prevReading) {
          setError(`Current meter reading cannot be less than previous reading (${prevReading} units).`);
          return;
        }
      } else if (elecMode === 'direct' && (directElecAmount === '' || isNaN(parseFloat(directElecAmount)))) {
        setError('Please enter a valid electricity bill amount');
        return;
      } else if (elecMode === 'shared' && (propertyTotalElec === '' || isNaN(parseFloat(propertyTotalElec)))) {
        setError('Please enter the total property electricity bill amount');
        return;
      }

      setIsSaving(true);
      const generatedBillsList = [];

      try {
        for (const tObj of roomTenantsList) {
          const tInputs = groupTenantReadings[tObj.id] || {};
          const tArrears = tInputs.arrears !== undefined && tInputs.arrears !== '' ? (parseFloat(tInputs.arrears) || 0) : 0;
          const tOther = parseFloat(tInputs.otherCharges) || 0;
          const tTotal = baseRentAmount + calculatedElecAmount + tArrears + tOther;

          const billPayload = {
            room_id: activeRoom.id,
            tenant_id: tObj.id,
            tenant_name: tObj.name,
            room_number: activeRoom.room_number,
            floor: activeRoom.floor,
            room_type: activeRoom.room_type,
            bill_month: billMonth,
            bill_year: billYear,
            elec_mode: elecMode,
            previous_reading: prevReading,
            current_reading: currReading,
            units_consumed: unitsConsumed,
            rate_per_unit: rate,
            room_total_elec: elecMode === 'submeter' ? roomTotalElec : (elecMode === 'direct' ? parseFloat(directElecAmount) || 0 : calculatedElecAmount * roomTenantsList.length),
            split_count: roomTenantsList.length,
            split_type: 'room_sharing',
            elec_amount: calculatedElecAmount,
            electricity_amount: calculatedElecAmount,
            rent_amount: baseRentAmount,
            arrears: tArrears,
            other_charges: tOther,
            total_payable: tTotal,
            payment_status: 'Unpaid'
          };

          const savedBill = await api.createBill(billPayload);
          generatedBillsList.push({
            bill: savedBill,
            tenant: tObj,
            totalPayable: tTotal,
            baseRentAmount,
            calculatedElecAmount,
            prevReading,
            currReading,
            unitsConsumed,
            rate,
            roomTotalElec: elecMode === 'submeter' ? roomTotalElec : (elecMode === 'direct' ? parseFloat(directElecAmount) || 0 : calculatedElecAmount * roomTenantsList.length),
            tArrears,
            tOther,
            elecMode
          });
        }

        setGroupResults(generatedBillsList);
        setIsSaved(true);
        if (elecMode === 'submeter' && currReading > prevReading) {
          setActiveRoom(prev => prev ? { ...prev, current_meter_reading: currReading } : prev);
          setRooms(prevRooms => prevRooms.map(r => r.id === activeRoom.id ? { ...r, current_meter_reading: currReading } : r));
        }

        toast(`🎉 Successfully generated ${generatedBillsList.length} individual bills for Room ${activeRoom.room_number}!`, 'success');
      } catch (err) {
        console.error('Error in group bill generation:', err);
        toast('Some or all bills failed to save.', 'error');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!isMultiRoomTenant) {
      if (elecMode === 'submeter') {
        if (currentReading === '' || isNaN(currReading)) {
          setError('Please input a valid current meter reading');
          return;
        }
        if (currReading < prevReading) {
          setError(`Current meter reading cannot be less than previous reading (${prevReading} units).`);
          return;
        }
      } else if (elecMode === 'direct' && (directElecAmount === '' || isNaN(parseFloat(directElecAmount)))) {
        setError('Please enter a valid electricity bill amount');
        return;
      } else if (elecMode === 'shared' && (propertyTotalElec === '' || isNaN(parseFloat(propertyTotalElec)))) {
        setError('Please enter the total property electricity bill amount');
        return;
      }
    }

    const calculatedBill = {
      room_id: activeRoom.id,
      tenant_id: activeTenant.id,
      tenant_name: activeTenant.name,
      room_number: isMultiRoomTenant 
        ? tenantActiveRooms.map(r => r.room_number).join(', ')
        : activeRoom.room_number,
      floor: activeRoom.floor,
      room_type: activeRoom.room_type,
      bill_month: billMonth,
      bill_year: billYear,
      elec_mode: isMultiRoomTenant ? 'multi_room' : elecMode,
      previous_reading: prevReading,
      current_reading: currReading,
      units_consumed: unitsConsumed,
      rate_per_unit: rate,
      room_total_elec: elecMode === 'submeter' ? roomTotalElec : calculatedElecAmount,
      split_count: isSharedRoomTenants ? roomTenantCount : (elecMode === 'shared' ? (splitBasis === 'rooms' ? propertyOccupiedRooms.length : propertyActiveTenants.length) : 1),
      split_type: isSharedRoomTenants ? 'room_sharing' : (elecMode === 'shared' ? splitBasis : 'individual'),
      elec_amount: calculatedElecAmount,
      electricity_amount: calculatedElecAmount,
      rent_amount: baseRentAmount,
      arrears: arrearsAmount,
      other_charges: otherChargesAmount,
      total_payable: grandTotalAmount,
      payment_status: 'Unpaid',
      room_items: isMultiRoomTenant ? multiRoomItems : null
    };

    setResult(calculatedBill);

    try {
      setIsSaving(true);
      await api.createBill(calculatedBill);
      setIsSaved(true);
      if (elecMode === 'submeter') {
        if (!isSharedRoomTenants) {
          setActiveRoom(prev => prev ? { ...prev, current_meter_reading: currReading } : prev);
          setRooms(prevRooms => prevRooms.map(r => r.id === activeRoom.id ? { ...r, current_meter_reading: currReading } : r));
        }
        setCurrentReading('');
      }
      toast('Bill saved to Billing Records!', 'success');
    } catch (err) {
      console.error('Error saving bill:', err);
      toast('Bill generated, but failed to save to database history.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: activeTheme.bg,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${activeTenant?.name || 'Tenant'}_${billMonth}_${billYear}.pdf`);
    } catch (err) {
      console.error("PDF Fail", err);
    }
  };

  const handleShareWhatsapp = async () => {
    try {
      const tenantName = activeTenant?.name || 'Tenant';
      const text = `${t.waTitle}\n${t.waMonth}: ${billMonth} ${billYear}\n${t.waTenant}: ${tenantName}\n${t.waTotal}: ₹${grandTotalAmount.toFixed(2)}`;

      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: activeTheme.bg });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Bill_${tenantName}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: t.waTitle, text });
          return;
        }
      }
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Build Options for Custom SaaS Dropdowns
  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: p.address || undefined,
    icon: <Building size={14} className="text-[#2d5a47]" />
  }));

  const roomOptions = rooms
    .filter(r => r.property_id === selectedPropertyId)
    .flatMap(r => {
      const activeLeasesForRoom = leases.filter(l => l.room_id === r.id && l.is_active);
      if (activeLeasesForRoom.length === 0) {
        return [{
          value: r.id,
          label: `Room ${r.room_number}`,
          sublabel: 'Vacant',
          disabled: true,
          icon: <Home size={14} className="text-slate-300" />
        }];
      }
      if (activeLeasesForRoom.length === 1) {
        const tenant = tenants.find(t => t.id === activeLeasesForRoom[0].tenant_id);
        return [{
          value: r.id,
          label: `Room ${r.room_number}`,
          sublabel: tenant ? tenant.name : 'Occupied',
          disabled: false,
          icon: <Home size={14} className="text-emerald-600" />
        }];
      }
      // Multi-tenant room (PG bed sharing):
      // 1. Group option to bill ALL roommates together with 1 reading!
      // 2. Individual options for single roommate billing
      const tenantNames = activeLeasesForRoom.map(l => {
        const t = tenants.find(item => item.id === l.tenant_id);
        return t ? t.name : 'Tenant';
      });

      const groupOption = {
        value: `room_group__${r.id}`,
        label: `Room ${r.room_number} · All ${activeLeasesForRoom.length} Tenants (${tenantNames.join(', ')})`,
        sublabel: `👥 Shared Group (${activeLeasesForRoom.length} tenants)`,
        disabled: false,
        icon: <Users size={14} className="text-[#2d5a47]" />
      };

      const individualOptions = activeLeasesForRoom.map(l => {
        const tenant = tenants.find(t => t.id === l.tenant_id);
        return {
          value: `${r.id}__${tenant?.id || l.id}`,
          label: `  ↳ Room ${r.room_number} · ${tenant?.name || 'Tenant'} (Solo)`,
          sublabel: `1 of ${activeLeasesForRoom.length} roommates`,
          disabled: false,
          icon: <Home size={14} className="text-slate-500" />
        };
      });

      return [groupOption, ...individualOptions];
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2d5a47] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in-up active max-w-7xl mx-auto pb-24 lg:pb-8">

      {/* ── COMPACT HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Sparkles size={12} className="text-emerald-600" />
            <span>CREATE BILL DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Bill
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compact Month & Year Selectors */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
            <Calendar size={14} className="text-[#2d5a47]" />
            <select
              value={billMonth}
              onChange={e => setBillMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer pr-1"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-slate-300">•</span>
            <select
              value={billYear}
              onChange={e => setBillYear(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ⚡ Bulk Billing Recommendation Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold">
            ⚡
          </div>
          <div>
            <p className="font-extrabold text-slate-800">Billing multiple rooms this month?</p>
            <p className="text-[#4b5563] text-[11px]">Save time by entering all meter readings together in Bulk Billing mode.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/properties?tab=bulk')}
          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow-2xs"
        >
          <span>Open Bulk Billing Matrix</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* ── MAIN 2-COLUMN COMPACT LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Compact Input Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-5">

            <form onSubmit={handleCalculate} className="space-y-4">

              {/* CUSTOM DROPDOWNS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Property Selector */}
                <SaasDropdown
                  label="Property"
                  required
                  placeholder="Choose Property…"
                  value={selectedPropertyId}
                  onChange={(v) => {
                    setSelectedPropertyId(v);
                    setSelectedSelectionKey('');
                    setSelectedRoomId('');
                  }}
                  options={propertyOptions}
                  icon={Building}
                  subtext={activeProperty?.address || 'Select property location'}
                />

                {/* Room & Tenant Selector */}
                <SaasDropdown
                  label="Room / Tenant"
                  required
                  placeholder={selectedPropertyId ? 'Choose Room / Tenant…' : 'Select property first'}
                  value={selectedSelectionKey}
                  onChange={(v) => {
                    setSelectedSelectionKey(v);
                    setCurrentReading('');
                    setOtherCharges('');
                    setDirectElecAmount('');
                    setPropertyTotalElec('');

                    setMultiRoomReadings({});
                    setResult(null);
                    setIsSaved(false);
                  }}
                  options={roomOptions}
                  disabled={!selectedPropertyId}
                  icon={Home}
                  subtext={`Billing period · 01–31 ${billMonth} ${billYear}`}
                />
              </div>

              {/* Multi-Room Tenant Notice & Reading Matrix Card */}
              {isMultiRoomTenant && (
                <div className="p-4 rounded-2xl bg-[#edf5f1] border border-[#2d5a47]/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#2d5a47] text-white font-extrabold text-[10px] uppercase">MULTI-ROOM TENANT</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeTenant.name} occupies {tenantActiveRooms.length} rooms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    This will generate <strong>1 combined bill</strong> with itemized breakdowns for all {tenantActiveRooms.length} rooms below:
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {tenantActiveRooms.map(roomItem => {
                      const isSubmeter = roomItem.elec_mode === 'submeter' || (!roomItem.elec_mode && roomItem.has_submeter !== false);
                      const rPrev = parseFloat(roomItem.current_meter_reading || 0);
                      const mData = multiRoomReadings[roomItem.id] || {};
                      return (
                        <div key={roomItem.id} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-900">Room {roomItem.room_number} ({roomItem.room_type || 'Single Room'})</span>
                            <span className="font-bold text-[#2d5a47] bg-[#edf5f1] px-2 py-0.5 rounded-md text-[11px]">
                              Rent: ₹{(roomItem.base_rent || 0).toLocaleString()}
                            </span>
                          </div>

                          {isSubmeter ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">PREV READING</span>
                                <span className="font-mono font-bold text-slate-700">{rPrev} units</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-extrabold block">CURR READING *</span>
                                <input
                                  type="number"
                                  placeholder={`≥ ${rPrev}`}
                                  value={mData.currentReading || ''}
                                  onChange={e => setMultiRoomReadings(prev => ({
                                    ...prev,
                                    [roomItem.id]: { ...(prev[roomItem.id] || {}), currentReading: e.target.value }
                                  }))}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-extrabold text-slate-900 outline-none focus:border-[#2d5a47] text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs">
                              <span className="text-[10px] text-slate-500 font-bold block">DIRECT ELEC (₹)</span>
                              <input
                                type="number"
                                placeholder="0"
                                value={mData.directElec || ''}
                                onChange={e => setMultiRoomReadings(prev => ({
                                  ...prev,
                                  [roomItem.id]: { ...(prev[roomItem.id] || {}), directElec: e.target.value }
                                }))}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 outline-none focus:border-[#2d5a47] text-xs"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ELECTRICITY MODE TOGGLE & COMPACT METER INPUT (Only for single room tenants) */}
              {!isMultiRoomTenant && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  {/* Row 1: Mode Toggle Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Zap size={15} className="text-[#2d5a47]" /> Electricity billing mode:
                    </span>
                    <div className="grid grid-cols-2 sm:flex bg-slate-100/90 p-1 rounded-xl gap-1 border border-slate-200/70 w-full sm:w-auto">
                      {[
                        { id: 'submeter', label: isSharedRoomTenants ? '⚡ Submeter (Shared)' : '⚡ Submeter' },
                        { id: 'direct', label: '📄 Direct' },
                        { id: 'shared', label: '🏢 Bldg Split' },
                        { id: 'none', label: '🚫 Included' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setElecMode(mode.id)}
                          className={`px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap text-center ${elecMode === mode.id
                              ? 'bg-[#2d5a47] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PG Multi-Tenant Submeter Split Summary (Shown only for solo roommate selection) */}
                  {isSharedRoomTenants && elecMode === 'submeter' && !isGroupRoomSelection && (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs space-y-1 text-[#2d5a47]">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Users size={13} /> Shared Room ({roomTenantCount} Roommates)
                        </span>
                        <span className="bg-[#2d5a47] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                          1/{roomTenantCount} Share = {formatINR(calculatedElecAmount)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Room {activeRoom?.room_number} total electricity ({formatINR(roomTotalElec)}) is split equally for <strong>{activeTenant?.name}</strong>.
                      </p>
                    </div>
                  )}

                  {/* Row 2: Meter Reading Box with Generous Breathing Space */}
                  {elecMode === 'submeter' && (
                    <div className="space-y-3 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-xs font-bold text-slate-700">Enter current meter reading</span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px] border border-slate-200/70">
                          Prev: {prevReading} units
                        </span>
                      </div>

                      <div className="relative bg-slate-50/80 focus-within:bg-white rounded-xl border border-slate-200/90 px-4 py-2.5 focus-within:border-[#2d5a47] focus-within:ring-2 focus-within:ring-[#2d5a47]/10 transition-all shadow-2xs">
                        <input
                          type="number"
                          required
                          disabled={!selectedRoomId}
                          placeholder={`e.g. ≥ ${prevReading || 0}`}
                          className="w-full text-2xl font-black text-slate-900 bg-transparent outline-none font-mono tracking-tight placeholder:text-slate-300"
                          value={currentReading}
                          onChange={e => setCurrentReading(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                          units
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold pt-1">
                        <span className="text-slate-500 text-[11px]">
                          {isSharedRoomTenants ? `Room usage (${unitsConsumed}u) ÷ ${roomTenantCount} tenants` : 'Usage breakdown'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[#2d5a47] font-black text-xs">
                            {unitsConsumed} units
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">× ₹{rate}/unit</span>
                          {isSharedRoomTenants && (
                            <span className="text-[#2d5a47] font-bold font-mono text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                              → {formatINR(calculatedElecAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {elecMode === 'direct' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 block">Direct Electricity Amount (₹)</label>
                        {isSharedRoomTenants && (
                          <span className="text-[10px] text-[#2d5a47] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            Split across {roomTenantCount} tenants (₹{calculatedElecAmount} each)
                          </span>
                        )}
                      </div>
                      <div className="relative bg-slate-50/80 focus-within:bg-white rounded-xl border border-slate-200/90 px-4 py-2.5 focus-within:border-[#2d5a47] focus-within:ring-2 focus-within:ring-[#2d5a47]/10 transition-all shadow-2xs">
                        <input
                          type="number"
                          required
                          disabled={!selectedRoomId}
                          placeholder="e.g. 1007"
                          className="w-full text-xl font-black text-slate-900 bg-transparent outline-none font-mono"
                          value={directElecAmount}
                          onChange={e => setDirectElecAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {elecMode === 'shared' && (
                    <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>🤝 Total Property Bill Split</span>
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Main Electricity Bill Amount (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 6000"
                            value={propertyTotalElec}
                            onChange={e => setPropertyTotalElec(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-900 outline-none focus:border-[#2d5a47]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Split Method
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setSplitBasis('rooms')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              splitBasis === 'rooms'
                                ? 'bg-emerald-50 border-[#2d5a47] text-[#2d5a47] font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <div className="text-[11px] font-extrabold">By Occupied Rooms</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{propertyOccupiedRooms.length} occupied rooms</div>
                            <div className="text-[9px] text-slate-400 mt-1">Divided per room, then split among roommates</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSplitBasis('tenants')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              splitBasis === 'tenants'
                                ? 'bg-emerald-50 border-[#2d5a47] text-[#2d5a47] font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <div className="text-[11px] font-extrabold">By Tenant Headcount</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{propertyActiveTenants.length} total tenants</div>
                            <div className="text-[9px] text-slate-400 mt-1">Divided equally per person across building</div>
                          </button>
                        </div>
                      </div>

                      {parseFloat(propertyTotalElec) > 0 && (
                        <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-xl text-xs space-y-1.5 text-[#2d5a47]">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold">Calculated Electricity Share:</span>
                            <span className="font-black text-base">{formatINR(calculatedElecAmount)}</span>
                          </div>
                          <div className="text-[10.5px] text-emerald-800 leading-snug border-t border-emerald-200/70 pt-1.5 font-mono">
                            {splitBasis === 'rooms' ? (
                              <span>
                                Formula: ₹{parseFloat(propertyTotalElec).toLocaleString('en-IN')} ÷ {Math.max(1, propertyOccupiedRooms.length)} rooms = ₹{Math.round(parseFloat(propertyTotalElec) / Math.max(1, propertyOccupiedRooms.length)).toLocaleString('en-IN')}/room
                                {isSharedRoomTenants ? ` ÷ ${roomTenantCount} roommates = ${formatINR(calculatedElecAmount)}/person` : ''}
                              </span>
                            ) : (
                              <span>
                                Formula: ₹{parseFloat(propertyTotalElec).toLocaleString('en-IN')} ÷ {Math.max(1, propertyActiveTenants.length)} tenants = {formatINR(calculatedElecAmount)}/person
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* GROUP ROOMMATE BREAKDOWN CARD (When Room Group is Selected) */}
              {isGroupRoomSelection && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in duration-200">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-[#2d5a47] flex items-center justify-center font-bold text-sm shadow-xs border border-slate-200/80">
                        <Users size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Roommates Roster ({roomTenantCount} Tenants)
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                          Electricity &amp; rent are auto-divided. Adjust balance or extras per roommate below.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <Zap size={13} className="text-[#2d5a47]" />
                      <span className="text-xs font-black text-[#2d5a47]">
                        {formatINR(calculatedElecAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">/person</span>
                    </div>
                  </div>

                  {/* Tenant List */}
                  <div className="space-y-3">
                    {roomActiveLeases.map((l, idx) => {
                      const tObj = tenants.find(t => t.id === l.tenant_id);
                      if (!tObj) return null;
                      const tInputs = groupTenantReadings[tObj.id] || {};
                      const tArrears = tInputs.arrears !== undefined && tInputs.arrears !== '' ? (parseFloat(tInputs.arrears) || 0) : 0;
                      const tOther = parseFloat(tInputs.otherCharges) || 0;
                      const tTotal = baseRentAmount + calculatedElecAmount + tArrears + tOther;

                      return (
                        <div
                          key={tObj.id}
                          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 shadow-xs space-y-3 hover:border-[#2d5a47]/40 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-[#2d5a47] text-white text-xs font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-900 text-sm">{tObj.name}</span>
                                <span className="text-xs text-slate-400 block font-medium mt-0.5">
                                  Rent {formatINR(baseRentAmount)} + Elec {formatINR(calculatedElecAmount)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">TOTAL</span>
                              <span className="text-[#2d5a47] font-black text-base">{formatINR(tTotal)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                                Prev Balance (₹)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">₹</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tInputs.arrears || ''}
                                  onChange={e => setGroupTenantReadings(prev => ({
                                    ...prev,
                                    [tObj.id]: { ...(prev[tObj.id] || {}), arrears: e.target.value }
                                  }))}
                                  className="w-full pl-7 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#2d5a47] focus:ring-2 focus:ring-[#2d5a47]/10 transition-all font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                                Other Charges (₹)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">₹</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tInputs.otherCharges || ''}
                                  onChange={e => setGroupTenantReadings(prev => ({
                                    ...prev,
                                    [tObj.id]: { ...(prev[tObj.id] || {}), otherCharges: e.target.value }
                                  }))}
                                  className="w-full pl-7 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#2d5a47] focus:ring-2 focus:ring-[#2d5a47]/10 transition-all font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMPACT INPUT FIELDS FOR ARREARS & OTHER CHARGES (Solo / Standard Room Mode) */}
              {!isGroupRoomSelection && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Previous Balance Field */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                        <IndianRupee size={12} className="text-amber-600" /> Previous Balance
                      </label>
                      {calculatedArrears > 0 && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          Auto-calculated
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        disabled={!selectedRoomId}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2d5a47]"
                        value={customArrears}
                        onChange={e => setCustomArrears(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Other Charges Field */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <PlusCircle size={12} className="text-slate-400" /> Other Charges
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        disabled={!selectedRoomId}
                        placeholder="e.g. Maintenance, Water"
                        className="w-full pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2d5a47]"
                        value={otherCharges}
                        onChange={e => setOtherCharges(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS & HOW IT WORKS */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center sm:justify-start gap-1 cursor-pointer w-full sm:w-auto pb-2 sm:pb-0"
                >
                  <HelpCircle size={13} />
                  <span>How is this calculated?</span>
                </button>

                <button
                  type="submit"
                  disabled={!selectedRoomId || isSaving}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-2xl bg-[#2d5a47] text-white font-bold text-xs hover:bg-[#234738] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                  ) : isGroupRoomSelection ? (
                    <><Users size={14} /> Generate All {roomTenantCount} Roommate Bills</>
                  ) : (
                    <><span>Save Bill Record</span><ArrowRight size={15} /></>
                  )}
                </button>
              </div>

              {/* GROUP GENERATED BILLS ROSTER */}
              {isGroupRoomSelection && groupResults.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-[#2d5a47] font-extrabold text-xs">
                    <CheckCheck size={16} />
                    <span>All {groupResults.length} Bills Generated for Room {activeRoom?.room_number}!</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {groupResults.map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-emerald-200/80 shadow-2xs space-y-1.5 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>{item.tenant?.name}</span>
                          <span className="text-[#2d5a47] font-black text-sm">{formatINR(item.totalPayable)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Bill #{item.bill?.id?.slice(0, 8) || 'REC'} · Status: Unpaid
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-emerald-800 font-medium pt-1">
                    💡 All individual roommate receipts are ready in the <strong>Billing page</strong> to view, download PDF, or share via WhatsApp.
                  </p>
                </div>
              )}

              {showHowItWorks && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Calculation breakdown:</p>
                  <p>• <strong>Electricity (Submeter):</strong> (Current Reading - Previous Reading) × Rate {isSharedRoomTenants ? `÷ ${roomTenantCount} tenants` : ''}</p>
                  <p>• <strong>Electricity (Shared Bill):</strong> Property Total ÷ {splitBasis === 'rooms' ? `${propertyOccupiedRooms.length} rooms` : `${propertyActiveTenants.length} tenants`}</p>
                  <p>• <strong>Total Payable:</strong> Monthly Rent + Electricity Share + Arrears + Other Charges</p>
                </div>
              )}

            </form>
          </div>

          {/* RIGHT COLUMN: Professional Themed Invoice Card */}
          <div className="lg:col-span-5 space-y-3 sticky top-4">

            {/* CURATED COLOR THEMES & LANGUAGE SELECTOR BAR */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2">

              {/* Language Selector Toggle */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Globe size={13} className="text-slate-700" /> Lang:
                </span>
                <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setBillLanguage('en')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${billLanguage === 'en'
                        ? 'bg-[#2d5a47] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillLanguage('hi')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${billLanguage === 'hi'
                        ? 'bg-[#2d5a47] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    हिंदी (HI)
                  </button>
                </div>
              </div>

              {/* Theme Palette */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hidden sm:inline-block mr-1">
                  Theme:
                </span>
                {INVOICE_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    title={theme.name}
                    className={`w-5 h-5 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer ${selectedThemeId === theme.id ? 'ring-2 ring-offset-1 ring-slate-800 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    style={{ background: theme.bg }}
                  >
                    {selectedThemeId === theme.id && (
                      <Check size={10} className="text-white" />
                    )}
                  </button>
                ))}
              </div>

            </div>

            {/* ── GROUP RESULTS CAROUSEL (shown after generating all roommate bills) ── */}
            {isGroupRoomSelection && groupResults.length > 0 ? (() => {
              const safeIdx = Math.max(0, Math.min(carouselIndex, groupResults.length - 1));
              const current = groupResults[safeIdx];
              const cTenant = current?.tenant;
              const cBill = current?.bill || {};
              const cTotal = current?.tTotal ?? current?.totalPayable ?? 0;
              const cArrears = current?.tArrears ?? parseFloat(cBill.arrears || 0);
              const cOther = current?.tOther ?? parseFloat(cBill.other_charges || 0);
              const cRent = current?.baseRentAmount ?? parseFloat(cBill.rent_amount || 0);
              const cElec = current?.calculatedElecAmount ?? parseFloat(cBill.elec_amount || cBill.electricity_amount || 0);
              const cPrev = current?.prevReading ?? parseFloat(cBill.previous_reading || 0);
              const cCurr = current?.currReading ?? parseFloat(cBill.current_reading || 0);
              const cUnits = current?.unitsConsumed ?? parseFloat(cBill.units_consumed || 0);
              const cRate = current?.rate ?? parseFloat(cBill.rate_per_unit || 17);
              const cRoomTotalElec = current?.roomTotalElec ?? (cUnits * cRate);
              const cElecMode = current?.elecMode || elecMode;

              const handleGroupShare = async () => {
                try {
                  const text = `🏠 *RENT RECEIPT - ${billMonth} ${billYear}*\n` +
                    `👤 *Tenant:* ${cTenant?.name || 'Tenant'}\n` +
                    `🏠 *Room:* ${activeRoom?.room_number || ''} (${activeProperty?.name || ''})\n` +
                    `--------------------------------\n` +
                    `🏢 *Base Rent:* ₹${cRent.toLocaleString('en-IN')}\n` +
                    (cElec > 0 ? `⚡ *Electricity (1/${groupResults.length} share):* ₹${cElec.toLocaleString('en-IN')} (${cPrev}u → ${cCurr}u = ${cUnits} units)\n` : '') +
                    (cArrears > 0 ? `📋 *Previous Balance:* ₹${cArrears.toLocaleString('en-IN')}\n` : '') +
                    (cOther > 0 ? `📦 *Other Charges:* ₹${cOther.toLocaleString('en-IN')}\n` : '') +
                    `--------------------------------\n` +
                    `💰 *TOTAL PAYABLE: ₹${cTotal.toLocaleString('en-IN')}*\n` +
                    `📅 *Due Date:* 10 ${billMonth} ${billYear}\n\n` +
                    `Thank you for your payment!`;

                  if (receiptRef.current) {
                    try {
                      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: activeTheme.bg, logging: false });
                      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                      const file = new File([blob], `Bill_${cTenant?.name || 'Tenant'}.png`, { type: 'image/png' });

                      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({ files: [file], title: `Rent Receipt - ${cTenant?.name}`, text });
                        return;
                      }
                    } catch (e) {
                      console.warn('Image share fallback:', e);
                    }
                  }

                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                } catch (err) {
                  console.error('Share failed:', err);
                }
              };

              return (
                <div className="space-y-3">
                  {/* Carousel Header with Pagination */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">
                        Roommate Bills
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {safeIdx + 1} of {groupResults.length}
                      </span>
                    </div>
                    {/* Dot pagination */}
                    <div className="flex items-center gap-1.5">
                      {groupResults.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCarouselIndex(i)}
                          className={`transition-all rounded-full ${i === safeIdx
                            ? 'w-5 h-2 bg-[#2d5a47]'
                            : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Carousel Receipt Card */}
                  <div
                    ref={receiptRef}
                    className="text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4 border transition-all duration-300"
                    style={{ background: activeTheme.gradient, borderColor: activeTheme.border }}
                  >
                    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

                    {/* Header */}
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest block ${activeTheme.textAccent}`}>
                          {t.previewLabel}
                        </span>
                        <h3 className="text-2xl font-black tracking-tight mt-0.5">{billMonth} {billYear}</h3>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                        <Receipt size={18} />
                      </div>
                    </div>

                    <div className="h-px bg-white/15 w-full" />

                    {/* Tenant */}
                    <div className="space-y-0.5 relative z-10">
                      <span className={`text-[10px] font-bold uppercase tracking-widest block ${activeTheme.textAccent}`}>{t.billedTo}</span>
                      <h4 className="text-xl font-black text-white tracking-tight">{cTenant?.name || '—'}</h4>
                      <p className="text-xs text-white/70">
                        {activeProperty?.name} · Room {activeRoom?.room_number}
                      </p>
                    </div>

                    {/* Room charges */}
                    <div className="space-y-3 pt-1 relative z-10 text-xs">
                      <div className="bg-black/20 border border-white/15 rounded-2xl p-3.5 space-y-2 text-xs backdrop-blur-xs">
                        <div className="flex justify-between items-center font-extrabold text-white">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <Home size={15} className="text-white/80 flex-shrink-0" />
                            <span className="break-words leading-snug">{activeRoom?.room_type ? `${activeRoom.room_type} (Room ${activeRoom?.room_number})` : `Room ${activeRoom?.room_number}`}</span>
                          </div>
                          <span className="font-mono text-sm font-bold flex-shrink-0 ml-auto">₹{cRent.toLocaleString('en-IN')}</span>
                        </div>

                        {cElec > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-white/10 text-[11px] text-white/90">
                            {cElecMode === 'submeter' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span>{t.preLabel} <strong className="text-white">{cPrev} {t.units}</strong></span>
                                  <span>{t.curLabel} <strong className="text-white">{cCurr} {t.units}</strong></span>
                                </div>
                                <div className="flex justify-between items-center pt-0.5 font-mono">
                                  <span>{t.usageLabel} <strong className="text-white">{cUnits} {t.units} × ₹{cRate} = ₹{cRoomTotalElec.toLocaleString('en-IN')} (1/{groupResults.length} share)</strong></span>
                                  <span className="font-bold text-white">₹{cElec.toLocaleString('en-IN')}</span>
                                </div>
                              </>
                            )}
                            {cElecMode === 'direct' && (
                              <div className="flex justify-between">
                                <span>{t.electricity} (1/{groupResults.length} share)</span>
                                <span className="font-mono font-bold text-white">₹{cElec.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/15">
                        <div className="flex justify-between text-white/90">
                          <span>{t.totalRent}</span>
                          <span className="font-mono font-bold text-white">₹{cRent.toLocaleString('en-IN')}</span>
                        </div>
                        {cElec > 0 && (
                          <div className="flex justify-between text-white/90">
                            <span>{t.totalElectricity}</span>
                            <span className="font-mono font-bold text-white">₹{cElec.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {cOther > 0 && (
                          <div className="flex justify-between text-white/90">
                            <span>{t.otherCharges}</span>
                            <span className="font-mono font-bold text-white">₹{cOther.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {cArrears > 0 && (
                          <div className="flex justify-between text-white/90">
                            <span>{t.previousBalance}</span>
                            <span className="font-mono font-bold text-white">₹{cArrears.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-white/15 w-full" />

                    <div className="flex justify-between items-end relative z-10 pt-0.5">
                      <div>
                        <span className={`text-xs font-semibold block ${activeTheme.textAccent}`}>{t.amountDue}</span>
                        <div className="text-3xl font-black tracking-tight text-white mt-0.5 font-mono leading-none">
                          ₹{cTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: activeTheme.pillBgHex,
                          color: activeTheme.pillTextHex,
                          padding: '5px 13px',
                          borderRadius: '9999px',
                          fontSize: '9px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          lineHeight: '1',
                          flexShrink: 0,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {t.dueBadge(billMonth)}
                      </div>
                    </div>

                    <div className="flex justify-center items-center text-[10px] text-white/50 pt-3 border-t border-white/10 italic">
                      <span>{t.thankYou}</span>
                    </div>
                  </div>

                  {/* Carousel Navigation + Per-Tenant WhatsApp */}
                  <div className="space-y-2">
                    {/* Prev / Next + WhatsApp row */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safeIdx === 0}
                        onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={handleGroupShare}
                        className="flex-1 py-2.5 px-3 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        style={{ background: activeTheme.bg }}
                      >
                        <Share2 size={14} />
                        <span>Share {cTenant?.name}'s Bill via WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        disabled={safeIdx === groupResults.length - 1}
                        onClick={() => setCarouselIndex(i => Math.min(groupResults.length - 1, i + 1))}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Download PDF for current */}
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download PDF — {cTenant?.name}</span>
                    </button>

                    <p className="text-[11px] text-center font-medium text-slate-500 bg-slate-100/70 py-1.5 px-2.5 rounded-xl border border-slate-200/60">
                      ← Swipe left/right or use arrows to view each roommate's bill
                    </p>
                  </div>
                </div>
              );
            })() : (() => {
              const sBill = (isSaved && result) ? result : null;
              const sRent = sBill ? (parseFloat(sBill.rent_amount) || 0) : baseRentAmount;
              const sElec = sBill ? (parseFloat(sBill.elec_amount || sBill.electricity_amount) || 0) : calculatedElecAmount;
              const sPrev = sBill ? (parseFloat(sBill.previous_reading) || 0) : prevReading;
              const sCurr = sBill ? (parseFloat(sBill.current_reading) || 0) : currReading;
              const sUnits = sBill ? (parseFloat(sBill.units_consumed) || 0) : unitsConsumed;
              const sRate = sBill ? (parseFloat(sBill.rate_per_unit) || 17) : rate;
              const sArrears = sBill ? (parseFloat(sBill.arrears) || 0) : arrearsAmount;
              const sOther = sBill ? (parseFloat(sBill.other_charges) || 0) : otherChargesAmount;
              const sTotal = sBill ? (parseFloat(sBill.total_payable) || 0) : grandTotalAmount;
              const sElecMode = sBill ? sBill.elec_mode : elecMode;
              const sRoomTotalElec = sBill ? (sBill.room_total_elec || (sUnits * sRate)) : roomTotalElec;

              return (
                <>
                  {/* NORMAL SINGLE-TENANT INVOICE PREVIEW */}
                  <div
                    ref={receiptRef}
                    className="text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4 border transition-colors duration-200"
                    style={{
                      background: activeTheme.gradient,
                      borderColor: activeTheme.border
                    }}
                  >
                    {/* Background Decorative Rings */}
                    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

                    {/* Top header row */}
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest block ${activeTheme.textAccent}`}>
                          {t.previewLabel}
                        </span>
                        <h3 className="text-2xl font-black tracking-tight mt-0.5">{billMonth} {billYear}</h3>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                        <Receipt size={18} />
                      </div>
                    </div>

                    <div className="h-px bg-white/15 w-full" />

                    {/* Tenant Section */}
                    <div className="space-y-0.5 relative z-10">
                      <span className={`text-[10px] font-bold uppercase tracking-widest block ${activeTheme.textAccent}`}>{t.billedTo}</span>
                      <h4 className="text-xl font-black text-white tracking-tight">{activeTenant?.name || (billLanguage === 'hi' ? 'कमरा चुनें' : 'Select a room')}</h4>
                      <p className="text-xs text-white/70">
                        {activeProperty?.name || 'Property'} · {isMultiRoomTenant ? `Rooms ${tenantActiveRooms.map(r => r.room_number).join(', ')}` : `${t.room} ${activeRoom?.room_number || '00'}`}
                      </p>
                    </div>

                    {/* Room Breakdown & Charges */}
                    <div className="space-y-3 pt-1 relative z-10 text-xs">
                      {isMultiRoomTenant ? (
                        <div className="space-y-2.5">
                          {multiRoomItems.map((item, idx) => {
                            return (
                              <div key={idx} className="bg-black/20 border border-white/15 rounded-2xl p-3.5 space-y-2 text-xs backdrop-blur-xs">
                                <div className="flex justify-between items-center font-extrabold text-white">
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <Home size={15} className="text-white/80 flex-shrink-0" />
                                    <span className="break-words leading-snug">{item.room_type ? `${item.room_type} (Room ${item.room_number})` : `Room ${item.room_number}`}</span>
                                  </div>
                                  <span className="font-mono text-sm font-bold flex-shrink-0 ml-auto">₹{item.rent_amount.toLocaleString('en-IN')}</span>
                                </div>
                                {item.elec_amount > 0 && (
                                  <div className="space-y-1 pt-1.5 border-t border-white/10 text-[11px] text-white/90">
                                    <div className="flex justify-between items-center">
                                      <span>{t.preLabel} <strong className="text-white font-bold">{item.previous_reading} {t.units}</strong></span>
                                      <span>{t.curLabel} <strong className="text-white font-bold">{item.current_reading} {t.units}</strong></span>
                                    </div>
                                    <div className="flex justify-between items-center pt-0.5 font-mono">
                                      <span>{t.usageLabel} <strong className="text-white font-bold">{item.units_consumed} {t.units} × ₹{item.rate_per_unit}</strong></span>
                                      <span className="font-bold text-white text-xs">₹{item.elec_amount.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-black/20 border border-white/15 rounded-2xl p-3.5 space-y-2 text-xs backdrop-blur-xs">
                          <div className="flex justify-between items-center font-extrabold text-white">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Home size={15} className="text-white/80 flex-shrink-0" />
                              <span className="break-words leading-snug">{activeRoom?.room_type ? `${activeRoom.room_type} (Room ${activeRoom.room_number})` : `Room ${activeRoom?.room_number || '00'}`}</span>
                            </div>
                            <span className="font-mono text-sm font-bold flex-shrink-0 ml-auto">₹{sRent.toLocaleString('en-IN')}</span>
                          </div>

                          {sElec > 0 && (
                            <div className="space-y-1 pt-1.5 border-t border-white/10 text-[11px] text-white/90">
                              {sElecMode === 'submeter' && (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span>{t.preLabel} <strong className="text-white font-bold">{sPrev} {t.units}</strong></span>
                                    <span>{t.curLabel} <strong className="text-white font-bold">{sCurr} {t.units}</strong></span>
                                  </div>
                                  <div className="flex justify-between items-center pt-0.5 font-mono">
                                    <span>
                                      {t.usageLabel} <strong className="text-white font-bold">{sUnits} {t.units} × ₹{sRate}{isSharedRoomTenants ? ` = ₹${sRoomTotalElec.toLocaleString('en-IN')} (1/${roomTenantCount} ${billLanguage === 'hi' ? 'हिस्सा' : 'share'})` : ''}</strong>
                                    </span>
                                    <span className="font-bold text-white text-xs">₹{sElec.toLocaleString('en-IN')}</span>
                                  </div>
                                </>
                              )}
                              {sElecMode === 'direct' && (
                                <div className="flex justify-between items-center">
                                  <span>{t.electricity}{isSharedRoomTenants ? ` (1/${roomTenantCount} ${billLanguage === 'hi' ? 'हिस्सा' : 'share'})` : ''}</span>
                                  <span className="font-mono font-bold text-white text-xs">₹{sElec.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {sElecMode === 'shared' && (
                                <div className="flex justify-between items-center">
                                  <span>
                                    {billLanguage === 'hi' ? 'साझा बिजली बिल' : 'Shared Utility Split'} ({splitBasis === 'rooms' ? `1/${propertyOccupiedRooms.length} ${billLanguage === 'hi' ? 'कमरे' : 'rooms'}` : `1/${propertyActiveTenants.length} ${billLanguage === 'hi' ? 'किरायेदार' : 'tenants'}`})
                                  </span>
                                  <span className="font-mono font-bold text-white text-xs">₹{sElec.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Summary Totals */}
                      <div className="space-y-2 pt-2 border-t border-white/15 text-xs">
                        <div className="flex justify-between items-center text-white/90">
                          <span className="font-medium">{t.totalRent}</span>
                          <span className="font-mono font-bold text-white">₹{sRent.toLocaleString('en-IN')}</span>
                        </div>
                        {sElec > 0 && (
                          <div className="flex justify-between items-center text-white/90">
                            <span className="font-medium">{t.totalElectricity}</span>
                            <span className="font-mono font-bold text-white">₹{sElec.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {sOther > 0 && (
                          <div className="flex justify-between items-center text-white/90">
                            <span className="font-medium">{t.otherCharges}</span>
                            <span className="font-mono font-bold text-white">₹{sOther.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {sArrears > 0 && (
                          <div className="flex justify-between items-center text-white/90">
                            <span className="font-medium">{t.previousBalance}</span>
                            <span className="font-mono font-bold text-white">₹{sArrears.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-white/15 w-full" />

                    {/* Amount Due Section */}
                    <div className="flex justify-between items-end relative z-10 pt-0.5">
                      <div>
                        <span className={`text-xs font-semibold block ${activeTheme.textAccent}`}>{t.amountDue}</span>
                        <div className="text-3xl font-black tracking-tight text-white mt-0.5 font-mono leading-none">
                          ₹{sTotal.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: activeTheme.pillBgHex,
                          color: activeTheme.pillTextHex,
                          padding: '5px 13px',
                          borderRadius: '9999px',
                          fontSize: '9px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          lineHeight: '1',
                          flexShrink: 0,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {t.dueBadge(billMonth)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center items-center text-[10px] text-white/50 pt-3 border-t border-white/10 relative z-10 italic">
                      <span>{t.thankYou}</span>
                    </div>

                  </div>

                {/* Quick Action Toolbar underneath preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={handleShareWhatsapp}
                      className="flex-1 py-2.5 px-3 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      style={{ background: activeTheme.bg }}
                    >
                      <Share2 size={14} />
                      <span>Share WhatsApp</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-center font-medium text-slate-500 bg-slate-100/70 py-1.5 px-2.5 rounded-xl border border-slate-200/60">
                    💡 <strong>Tip:</strong> Share or download receipt now before clicking <em>Save Bill Record</em>. (Saved bills can also be shared anytime from <strong>Billing</strong> page).
                  </p>
                </div>
              </>
            );
          })()}

          </div>

        </div>
    </div>
  );


}


