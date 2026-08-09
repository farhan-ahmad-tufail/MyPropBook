import React from 'react';

export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sleek green building icon badge from modern SaaS design */}
      <div 
        className="relative flex items-center justify-center flex-shrink-0 rounded-xl transition-all duration-300 group-hover:scale-105"
        style={{
          width: size,
          height: size,
          backgroundColor: '#2d5a47',
          boxShadow: '0 2px 10px rgba(45, 90, 71, 0.25)',
        }}
      >
        <svg 
          width={size * 0.55} 
          height={size * 0.55} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M8 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      </div>

      {/* Typographic brand title */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span 
            className="font-extrabold tracking-tight text-slate-800 select-none"
            style={{
              fontSize: `${size * 0.58}px`,
              letterSpacing: '-0.03em',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            Bill<span className="text-[#2d5a47]">Room</span>
          </span>
          <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
            PROPERTY OPERATIONS
          </span>
        </div>
      )}
    </div>
  );
}

