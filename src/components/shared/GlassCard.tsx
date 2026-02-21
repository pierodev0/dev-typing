import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={`glass-card rounded-xl md:rounded-2xl p-4 md:p-6 transform transition-all hover:-translate-y-1 duration-300 ${className}`}>
      {children}
    </div>
  );
};
