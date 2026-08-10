import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Zap, 
  Edit2, 
  Calculator, 
  UserPlus
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function RoomDetailsModal({ isOpen, onClose, room, tenant, onEdit }) {
  const navigate = useNavigate();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  const elecMode = room.elec_mode || (room.has_submeter !== false ? 'submeter' : 'direct');
  const isOccupied = room.status === 'Occupied' || !!tenant;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-300/50 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#fafbfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e2eee7] text-[#2d5a47] flex items-center justify-center font-bold text-sm">
              {room.room_number}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Room {room.room_number}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {room.room_type || 'Single'} Room • Floor {room.floor || 'G'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status & Base Rent Banner */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-[#f8faf9] border border-slate-100 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isOccupied ? 'bg-emerald-500' : room.status === 'Maintenance' ? 'bg-purple-500' : 'bg-amber-500'
                }`} />
                <span className="font-extrabold text-sm text-slate-900">
                  {isOccupied ? 'Occupied' : room.status || 'Vacant'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Monthly Rent</span>
              <p className="text-lg font-black text-[#2d5a47] mt-0.5">
                {formatINR(room.base_rent)}
              </p>
            </div>
          </div>

          {/* Tenant Info Section */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User size={13} className="text-[#2d5a47]" />
              Active Tenant
            </span>

            {tenant ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">{tenant.name}</p>
                  {tenant.phone && <p className="text-xs text-slate-400 font-medium">{tenant.phone}</p>}
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/tenants');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Manage lease
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-400 italic font-medium">No active tenant assigned to this room.</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/tenants?action=add&roomId=${room.id}`);
                  }}
                  className="px-3 py-1.5 bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <UserPlus size={13} />
                  <span>Add tenant</span>
                </button>
              </div>
            )}
          </div>

          {/* Electricity Billing Configuration Section */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" />
              Electricity Billing Method
            </span>

            {elecMode === 'submeter' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Method:</span>
                  <span className="font-bold text-[#2d5a47] bg-[#edf5f1] px-2.5 py-0.5 rounded-full text-[11px]">⚡ Submeter Reading</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Current Meter Reading:</span>
                  <span className="font-mono font-bold text-slate-900">{room.current_meter_reading || 0} units</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Rate Per Unit:</span>
                  <span className="font-bold text-slate-900">₹{room.rate_per_unit || 17}/unit</span>
                </div>
              </div>
            )}

            {elecMode === 'direct' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Method:</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full text-[11px]">📄 Direct Bill Amount</span>
                </div>
                <p className="text-slate-500 leading-relaxed pt-1">
                  Electricity amount is entered directly from main bill during monthly billing.
                </p>
              </div>
            )}

            {elecMode === 'fixed' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Method:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">🏷️ Fixed Monthly Charge</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">Fixed Charge:</span>
                  <span className="font-bold text-emerald-700">₹{room.fixed_elec_amount || 0}/month</span>
                </div>
              </div>
            )}

            {elecMode === 'shared' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Method:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px]">👥 Shared Utility Bill</span>
                </div>
                <p className="text-slate-500 leading-relaxed pt-1">
                  Electricity bill is split proportionally across property rooms.
                </p>
              </div>
            )}

            {elecMode === 'none' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Method:</span>
                  <span className="font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">🚫 Not Applicable</span>
                </div>
                <p className="text-slate-500 leading-relaxed pt-1">
                  Electricity billing is disabled or included in base rent.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#fafbfa] border-t border-slate-100 flex gap-3">
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(room);
            }}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit2 size={14} /> Edit room
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate(`/smart-calc?roomId=${room.id}`);
            }}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#2d5a47] hover:bg-[#234738] rounded-xl shadow-sm transition-all flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calculator size={14} /> Generate bill
          </button>
        </div>

      </div>
    </div>
  );
}
