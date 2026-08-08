import React from 'react';

export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sleek, crisp modern gradient icon badge */}
      <div 
        className="relative flex items-center justify-center flex-shrink-0 rounded-xl transition-all duration-300 group-hover:scale-105"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
          boxShadow: '0 4px 20px -2px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <svg 
          width={size * 0.58} 
          height={size * 0.58} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white drop-shadow-sm"
        >
          {/* Roof */}
          <path d="M3 9l9-7 9 7" />
          {/* Walls */}
          <path d="M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10" />
          {/* Electric/Receipt Badge inside */}
          <path d="M12 7.5l-2.5 4.5h3.5l-1 4.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Crisp, clean typographic brand title (Stripe / Vercel style) */}
      {showText && (
        <span 
          className="font-extrabold tracking-tight text-white select-none"
          style={{
            fontSize: `${size * 0.65}px`,
            letterSpacing: '-0.03em',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          Bill<span className="text-blue-500">Room</span>
        </span>
      )}
    </div>
  );
}
