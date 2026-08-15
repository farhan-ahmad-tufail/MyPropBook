import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Search,
  LayoutDashboard,
  Building2,
  Users,
  Zap,
  Receipt,
  BarChart3,
  Calculator,
  Home,
  User,
  ArrowRight,
  Sparkles,
  Command,
  X,
  FileText
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ properties: [], rooms: [], tenants: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Load searchable data on mount / open
  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);

    const loadData = async () => {
      try {
        const ownerId = user?.id || 'mock_owner_id';
        const [props, rms, tnts] = await Promise.all([
          api.getProperties(ownerId),
          api.getAllRooms(ownerId),
          api.getTenants(ownerId)
        ]);
        setData({ properties: props || [], rooms: rms || [], tenants: tnts || [] });
      } catch (e) {
        console.error('CommandPalette error:', e);
      }
    };
    loadData();
  }, [isOpen, user]);

  // Handle ESC
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ── Search Items ── */
  const navItems = [
    { type: 'nav', id: 'dashboard', title: 'Dashboard Overview', category: 'Navigation', icon: LayoutDashboard, path: '/dashboard' },
    { type: 'nav', id: 'properties', title: 'Properties & Buildings', category: 'Navigation', icon: Building2, path: '/properties' },
    { type: 'nav', id: 'tenants', title: 'Tenants & Leases', category: 'Navigation', icon: Users, path: '/tenants' },
    { type: 'nav', id: 'create-bill', title: 'Create Single Bill', category: 'Actions', icon: Zap, path: '/create-bill' },
    { type: 'nav', id: 'bulk-bill', title: '⚡ Bulk Generate All Bills', sub: 'Generate bills for all rooms at once', category: 'Fast Actions', icon: Zap, path: '/properties?tab=bulk' },
    { type: 'nav', id: 'billing', title: 'Billing & Invoices', category: 'Navigation', icon: Receipt, path: '/billing' },
    { type: 'nav', id: 'analytics', title: 'Financial Analytics', category: 'Navigation', icon: BarChart3, path: '/analytics' },
    { type: 'nav', id: 'quick-calc', title: 'Quick Rent Calculator', category: 'Tools', icon: Calculator, path: '/quick-calc' },
  ];

  const propItems = data.properties.map(p => ({
    type: 'property',
    id: `prop-${p.id}`,
    title: p.name,
    sub: p.address || 'Property',
    category: 'Properties',
    icon: Building2,
    path: '/properties'
  }));

  const roomItems = data.rooms.map(r => ({
    type: 'room',
    id: `room-${r.id}`,
    title: `Room ${r.room_number}`,
    sub: `${r.room_type || 'Room'} · ₹${r.rent_amount || 0}/mo`,
    category: 'Rooms',
    icon: Home,
    path: '/properties'
  }));

  const tenantItems = data.tenants.map(t => ({
    type: 'tenant',
    id: `tenant-${t.id}`,
    title: t.name,
    sub: t.phone || t.email || 'Tenant',
    category: 'Tenants',
    icon: User,
    path: '/tenants'
  }));

  const allItems = [...navItems, ...propItems, ...roomItems, ...tenantItems];

  const filtered = query.trim() === ''
    ? navItems
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.sub && item.sub.toLowerCase().includes(query.toLowerCase())) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex min-h-full items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden relative animate-fade-in my-auto">

          {/* Search Bar Input */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search size={18} className="text-[#2d5a47] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search properties, tenants, rooms, pages..."
              className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <kbd className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white rounded-md border border-slate-200 shadow-2xs font-mono">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No results found for "<strong className="text-slate-700">{query}</strong>"
              </div>
            ) : (
              filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#edf5f1] text-[#1c4032] shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#2d5a47] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate leading-tight">{item.title}</p>
                        {item.sub && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">{item.sub}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/60">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight size={14} className="text-[#2d5a47]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-slate-200 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-slate-200 rounded">↵</kbd> Select</span>
            </div>
            <div className="flex items-center gap-1 text-[#2d5a47] font-bold">
              <Command size={12} />
              <span>MyPropBook Command Palette</span>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
