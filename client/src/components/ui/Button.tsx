import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus:ring-brand-500 shadow-sm border border-transparent',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400 border border-slate-200',
    outline:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-brand-500 shadow-sm',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm border border-transparent',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-3.5 py-2 gap-2 h-10',
    lg: 'text-base px-4 py-2.5 gap-2.5 h-11',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
