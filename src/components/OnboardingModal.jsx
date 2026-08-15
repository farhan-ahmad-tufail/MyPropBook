import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles,
  Home,
  Receipt,
  ChevronRight
} from 'lucide-react';
import Logo from './Logo';

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState('Apartment');
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [utilityMode, setUtilityMode] = useState('submeter');
  const [roomNumber, setRoomNumber] = useState('101');
  const [baseRent, setBaseRent] = useState('8500');
  const [tenantName, setTenantName] = useState('');

  if (!isOpen) return null;

  const totalSteps = 5;

  const propertyTypes = [
    { id: 'Apartment', label: 'Apartment Building', desc: 'Flats, multi-story residential units' },
    { id: 'PG', label: 'PG / Co-Living', desc: 'Paying guest accommodation & shared spaces' },
    { id: 'Hostel', label: 'Hostel', desc: 'Dormitories or individual student/worker rooms' },
    { id: 'Rental Property', label: 'Independent House / Villa', desc: 'Single or multiple rented floors/houses' },
    { id: 'Society', label: 'Housing Society', desc: 'Maintenance & society billing management' },
    { id: 'Multiple', label: 'Multiple Property Portfolio', desc: 'Mix of apartments, PG, and commercial shops' },
  ];

  const utilityModes = [
    { 
      id: 'submeter', 
      label: 'Submeter Reading', 
      desc: 'Automatic calculation based on monthly electricity unit consumption (Previous vs Current reading).',
      badge: 'Popular'
    },
    { 
      id: 'direct', 
      label: 'Direct Electricity Bill', 
      desc: 'Enter total electricity bill amount directly per room without meter unit calculation.' 
    },
    { 
      id: 'fixed', 
      label: 'Fixed Monthly Charge', 
      desc: 'Charge a flat electricity/utility fee every month added to base rent.' 
    },
    { 
      id: 'shared', 
      label: 'Shared Utility Bill', 
      desc: 'Distribute a total main property bill proportionally among occupied rooms.' 
    },
    { 
      id: 'none', 
      label: 'Not Applicable / Included in Rent', 
      desc: 'Electricity and utilities are fully included in the base room rent.' 
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (onComplete) {
        onComplete({
          propertyType,
          propertyName,
          propertyAddress,
          utilityMode,
          roomNumber,
          baseRent,
          tenantName
        });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              Quick Setup Wizard
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            <span>Skip for now</span>
            <X size={14} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-5 pb-2 bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && 'Property Category'}
              {step === 2 && 'First Property'}
              {step === 3 && 'Utility Billing Mode'}
              {step === 4 && 'Room Configuration'}
              {step === 5 && 'Tenant Setup'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body - Dynamic Steps */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Property Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100">What kind of properties do you manage?</h3>
                <p className="text-sm text-slate-400 mt-1">Select your primary property portfolio category to customize your default setup.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {propertyTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPropertyType(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                      propertyType === t.id
                        ? 'bg-blue-600/10 border-blue-500 text-slate-100 ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{t.label}</span>
                      {propertyType === t.id && (
                        <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 leading-relaxed">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: First Property */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Add your first property</h3>
                <p className="text-sm text-slate-400 mt-1">Give your building, apartment, or hostel a name and location address.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="input-label">Property / Building Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Green Heights Apartments or Krishna PG"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="input-label">Address / Location (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Flat 302, Sector 14, HSR Layout, Bengaluru"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    className="form-input resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Utility Billing preference */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100">How do you handle utility billing?</h3>
                <p className="text-sm text-slate-400 mt-1">MyPropBook supports multiple flexible billing methods per property or room.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {utilityModes.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUtilityMode(u.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                      utilityMode === u.id
                        ? 'bg-blue-600/10 border-blue-500 text-slate-100 ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${utilityMode === u.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Zap size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{u.label}</span>
                        {u.badge && (
                          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {u.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{u.desc}</p>
                    </div>
                    {utilityMode === u.id && (
                      <CheckCircle2 size={18} className="text-blue-400 flex-shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: First Room */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Add a sample room</h3>
                <p className="text-sm text-slate-400 mt-1">Set up your first room number and monthly rent amount.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="input-label">Room / Flat Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 101 or Flat A"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="input-label">Base Monthly Rent (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      placeholder="8500"
                      value={baseRent}
                      onChange={(e) => setBaseRent(e.target.value)}
                      className="form-input pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: First Tenant */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                <Sparkles size={24} className="text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">Almost ready to generate your first bill!</h4>
                  <p className="text-xs text-slate-400">Add an optional tenant name now, or finish setup immediately.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="input-label">Tenant Full Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary text-xs py-2 px-3"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary shadow-glow py-2.5 px-5 text-sm flex items-center gap-2"
          >
            <span>{step === totalSteps ? 'Complete Setup & Go to Dashboard' : 'Next Step'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
