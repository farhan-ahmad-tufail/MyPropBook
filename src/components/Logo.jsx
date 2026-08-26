import React from 'react';

export default function Logo({ size = 28, showText = true, className = '', dark = false }) {
  const iconColor = dark ? 'text-white' : 'text-[#2d5a47]';
  const textColor = dark ? 'text-white' : 'text-slate-900';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Minimal Book / Ledger Mark — sits directly on whitespace without badge container */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={iconColor}
        >
          {/* Ledger cover & spine */}
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
          {/* Bottom ledger fold */}
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          {/* Subtle ledger rule entries */}
          <line x1="8.5" y1="7" x2="14.5" y2="7" strokeWidth="2" />
          <line x1="8.5" y1="11" x2="13" y2="11" strokeWidth="2" />
        </svg>
      </div>

      {/* Solid single-color typographic wordmark — no two-tone split, no tagline */}
      {showText && (
        <span 
          className={`font-black tracking-tight select-none ${textColor}`}
          style={{
            fontSize: `${Math.max(16, size * 0.72)}px`,
            letterSpacing: '-0.035em',
          }}
        >
          MyPropBook
        </span>
      )}
    </div>
  );
}

