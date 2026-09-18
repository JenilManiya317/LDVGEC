import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'solid' | 'interactive';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  let baseStyle = 'glass-surface rounded-3xl p-6 transition-all duration-300 text-white';

  if (variant === 'elevated') {
    baseStyle = 'glass-surface-elevated rounded-3xl p-6 transition-all duration-300 text-white';
  } else if (variant === 'subtle') {
    baseStyle = 'glass-surface-subtle rounded-2xl p-6 transition-all duration-300 text-white';
  } else if (variant === 'solid') {
    baseStyle = 'bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-6 transition-all duration-300 text-white';
  } else if (variant === 'interactive') {
    baseStyle = 'glass-surface glass-card-hover rounded-3xl p-6 cursor-pointer select-none active:scale-[0.99] text-white';
  }

  return (
    <div className={`${baseStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
