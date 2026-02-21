import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'btn font-bold py-3 transition-all duration-200';
  
  const variants = {
    primary: 'bg-tokyo-blue hover:bg-tokyo-blue/80 text-tokyo-bg border-none shadow-lg shadow-tokyo-blue/20',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    ghost: 'btn-ghost text-gray-400 hover:text-white',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
