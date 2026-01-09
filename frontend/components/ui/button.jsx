import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
  outline: 'border border-slate-200 text-slate-800 hover:bg-slate-50',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
});
