import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-px active:scale-95';

  const variantClasses = {
    primary: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700/70',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;