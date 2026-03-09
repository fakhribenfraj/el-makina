import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#e94560] hover:bg-[#d63850] text-white shadow-lg shadow-[#e94560]/20',
    secondary: 'bg-[#16213e] hover:bg-[#0f3460] text-[#eaeaea] border border-[#0f3460]',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-[#4ecca3] hover:bg-[#3db892] text-[#1a1a2e]',
    ghost: 'bg-transparent hover:bg-[#16213e] text-[#a0a0a0] hover:text-[#eaeaea]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
