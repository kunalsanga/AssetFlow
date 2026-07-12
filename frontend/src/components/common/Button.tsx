import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 shadow-sm',
          {
            'bg-primary text-white hover:bg-[#1565A8] active:bg-[#0f4d85]': variant === 'primary',
            'border border-border bg-secondary hover:bg-[#C9E1F2] text-primary font-semibold': variant === 'outline',
            'hover:bg-secondary text-text shadow-none': variant === 'ghost',
            'h-8 px-3 text-xs rounded-lg': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-12 px-8 rounded-2xl': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
