import React from 'react';

export default function Logo({ size = 28, showText = true, className = '', dark = false }) {
  const borderColor = dark ? 'border-white/30' : 'border-[#2d5a47]/25';
  const iconColor = dark ? 'text-white' : 'text-[#2d5a47]';
  const textColor = dark ? 'text-white' : 'text-slate-900';
  const boxSize = Math.round(size * 1.25);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon in a rounded square border box — matches mockup */}
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded-lg border-2 ${borderColor}`}
        style={{ width: boxSize, height: boxSize }}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
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

      {/* Wordmark */}
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
