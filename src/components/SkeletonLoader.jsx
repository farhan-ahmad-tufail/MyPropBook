import React from 'react';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-5 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse space-y-3 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-slate-200" />
      <div className="space-y-1.5">
        <div className="w-20 h-3 rounded-md bg-slate-200" />
        <div className="w-32 h-7 rounded-lg bg-slate-200" />
      </div>
      <div className="w-24 h-3 rounded-md bg-slate-150 bg-slate-200/60" />
    </div>
  );
}

export function SkeletonTableRow({ rows = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100">
          <td className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-slate-200 flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-28 h-3.5 rounded-md bg-slate-200" />
                <div className="w-20 h-2.5 rounded-md bg-slate-200/70" />
              </div>
            </div>
          </td>
          <td className="py-4 px-4"><div className="w-24 h-3.5 rounded-md bg-slate-200" /></td>
          <td className="py-4 px-4"><div className="w-20 h-4 rounded-md bg-slate-200" /></td>
          <td className="py-4 px-4"><div className="w-16 h-3.5 rounded-md bg-slate-200" /></td>
          <td className="py-4 px-4"><div className="w-16 h-5 rounded-full bg-slate-200" /></td>
          <td className="py-4 px-4 text-right"><div className="w-16 h-7 rounded-xl bg-slate-200 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  if (type === 'table') {
    return <SkeletonTableRow rows={count} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
