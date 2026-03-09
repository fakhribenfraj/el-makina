import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full 
          px-4 
          py-3 
          bg-[#0f3460] 
          border 
          border-[#1a4a7a] 
          rounded-lg 
          text-[#eaeaea] 
          placeholder-[#6a6a8a]
          focus:outline-none 
          focus:border-[#e94560]
          transition-colors
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
