import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Home, 
  User, 
  Zap, 
  Edit2, 
  Calculator, 
  Users, 
  Layers, 
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function RoomDetailsModal({ isOpen, onClose, room, tenant, onEdit }) {
  const navigate = useNavigate();

  if (!isOpen || !room) return null;

  const elecMode = room.elec_mode || (room.has_submeter !== false ? 'submeter' : 'direct');
  const isOccupied = room.status === 'Occupied' || !!tenant;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-base">
              {room.room_number}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Room {room.room_number}</h3>
              <p className="text-xs text-slate-400">
                {room.room_type || 'Standard'} Room • Floor {room.floor || 'G'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status & Base Rent Banner */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isOccupied ? 'bg-emerald-400' : room.status === 'Maintenance' ? 'bg-purple-400' : 'bg-amber-400'
                }`} />
                <span className="font-bold text-sm text-slate-100">
                  {isOccupied ? 'Occupied' : room.status || 'Vacant'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Monthly Rent</span>
              <p className="text-lg font-black text-blue-400 mt-0.5">
                {formatINR(room.base_rent)}
              </p>
            </div>
          </div>

          {/* Tenant Info Section */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-blue-400" />
              Active Tenant
            </span>

            {tenant ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-semibold text-sm text-slate-200">{tenant.name}</p>
                  {tenant.phone && <p className="text-xs text-slate-400">{tenant.phone}</p>}
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/tenants');
                  }}
                  className="btn btn-secondary text-xs px-3 py-1.5 rounded-lg"
                >
                  Manage Lease
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500 italic">No active tenant assigned to this room.</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/tenants');
                  }}
                  className="btn btn-primary text-xs px-3 py-1 rounded-lg"
                >
                  + Add Tenant
                </button>
              </div>
            )}
          </div>

          {/* Electricity Billing Configuration Section */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Electricity Billing Method
            </span>

            {elecMode === 'submeter' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">⚡ Submeter Reading</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Meter Reading:</span>
                  <span className="font-mono font-bold text-slate-200">{room.current_meter_reading || 0} units</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rate Per Unit:</span>
                  <span className="font-bold text-slate-200">₹{room.rate_per_unit || 17}/unit</span>
                </div>
              </div>
            )}

            {elecMode === 'direct' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">📄 Direct Bill Amount</span>
                </div>
                <p className="text-slate-400 leading-relaxed pt-1">
                  Electricity amount is entered directly from main bill during monthly billing.
                </p>
              </div>
            )}

            {elecMode === 'fixed' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">🏷️ Fixed Monthly Charge</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Fixed Charge:</span>
                  <span className="font-bold text-emerald-400">₹{room.fixed_elec_amount || 0}/month</span>
                </div>
              </div>
            )}

            {elecMode === 'shared' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">🤝 Shared Utility Bill</span>
                </div>
                <p className="text-slate-400 leading-relaxed pt-1">
                  Electricity bill is split proportionally across property rooms.
                </p>
              </div>
            )}

            {elecMode === 'none' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">🚫 Not Applicable</span>
                </div>
                <p className="text-slate-500 leading-relaxed pt-1">
                  Electricity billing is disabled or included in base rent.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(room);
            }}
            className="btn btn-secondary flex-1 py-2 text-xs justify-center"
          >
            <Edit2 size={14} /> Edit Room
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate(`/smart-calc?roomId=${room.id}`);
            }}
            className="btn btn-primary flex-1 py-2 text-xs justify-center font-bold shadow-glow"
          >
            <Calculator size={14} /> Generate Bill
          </button>
        </div>

      </div>
    </div>
  );
}
