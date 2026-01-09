import React from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className }) {
  return (
    <div className={cn('animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 h-6 w-6', className)} />
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
        <Spinner className="h-12 w-12 mb-4" />
        <p className="text-sm font-medium text-slate-600">Processing...</p>
      </div>
    </div>
  );
}
