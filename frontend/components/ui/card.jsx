import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children }) {
  return <div className={cn('rounded-2xl bg-white border border-slate-100 shadow-card p-6', className)}>{children}</div>;
}

export function CardHeader({ className, children }) {
  return <div className={cn('mb-4 flex items-center justify-between gap-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-lg font-bold text-slate-900', className)}>{children}</h3>;
}

export function CardContent({ className, children }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
