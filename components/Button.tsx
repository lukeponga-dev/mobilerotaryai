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
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-offset-dark-bg disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-px active:scale-95';

  const variantClasses = {
    primary: 'bg-accent text-gray-900 hover:brightness-105 shadow-sm',
    secondary: 'bg-light-panel-muted text-light-text hover:bg-light-border dark:bg-dark-panel-muted dark:text-dark-text dark:hover:bg-dark-border',
    ghost: 'bg-transparent text-light-muted hover:bg-light-panel-muted/70 dark:text-dark-muted dark:hover:bg-dark-panel-muted/70',
    destructive: 'bg-danger text-white hover:brightness-110 shadow-sm',
    warning: 'bg-warning text-white hover:brightness-110 shadow-sm',
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