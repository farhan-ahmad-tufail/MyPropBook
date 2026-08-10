import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';

export default function CreateRoomTypeModal({ isOpen, onClose, onCreate }) {
  const [typeName, setTypeName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    onCreate({
      name: typeName.trim(),
      description: description.trim()
    });

    setTypeName('');
    setDescription('');
    onClose();
  };

  const inputClass = `w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-[15px]
    placeholder:text-slate-400 focus:outline-none focus:border-[#2d5a47] focus:ring-1 focus:ring-[#2d5a47]/20
    transition-all duration-200`;

  const labelClass = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#edf5f1] text-[#2d5a47] flex items-center justify-center">
              <Tag size={16} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Create room type</h3>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Room type name <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Premium AC Single, 2 BHK, 4 Sharing"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Spacious room with attached balcony"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2d5a47] text-white text-sm font-semibold rounded-xl hover:bg-[#234738] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={15} />
              Create type
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
