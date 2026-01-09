import React from 'react';
import { cn } from '../../lib/utils';

export function Tabs({ value, onValueChange, children }) {
  return <div>{React.Children.map(children, (child) => React.cloneElement(child, { value, onValueChange }))}</div>;
}

export function TabsList({ value, onValueChange, options = [] }) {
  return (
    <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onValueChange(opt.value)}
          className={cn(
            'flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
            value === opt.value ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function TabsContent({ value, current, children }) {
  if (value !== current) return null;
  return <div className="mt-6">{children}</div>;
}
