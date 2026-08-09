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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Tag size={18} />
            </div>
            <h3 className="font-bold text-base text-slate-100">Create Custom Room Type</h3>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="input-label">Room Type Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Premium AC Single, 2 BHK, 4 Sharing"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              className="form-input bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Spacious room with attached balcony"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="btn btn-primary flex-1 justify-center py-2.5 text-xs font-bold shadow-glow"
            >
              <Plus size={16} /> Create Room Type
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-4 py-2.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
