import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-bold rounded-xl gap-1.5',
    md: 'px-6 py-2.5 text-sm font-bold rounded-2xl gap-2',
    lg: 'px-8 py-3.5 text-base font-extrabold rounded-2xl gap-2.5'
  };

  const variantClasses = {
    primary:
      'glass-btn-primary text-white active:scale-[0.98] select-none',
    secondary:
      'glass-btn-secondary text-white active:scale-[0.98] select-none',
    outline:
      'bg-transparent hover:bg-white/15 text-white border border-white/40 active:scale-[0.98] hover:border-white/70 backdrop-blur-md',
    danger:
      'bg-rose-600/85 hover:bg-rose-600 text-white shadow-md active:scale-[0.98] border border-rose-300/50 backdrop-blur-md',
    ghost:
      'bg-transparent hover:bg-white/10 text-white/80 active:scale-[0.98] hover:text-white backdrop-blur-xs'
  };

  return (
    <button
      className={`inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
      {children}
    </button>
  );
};
