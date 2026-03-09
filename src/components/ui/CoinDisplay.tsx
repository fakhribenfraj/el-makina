import React from 'react';

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CoinDisplay({ amount, size = 'md' }: CoinDisplayProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      <span className="text-[#f9a826]">💰</span>
      <span className="font-bold text-[#f9a826]">{amount}</span>
      <span className="text-[#a0a0a0] text-sm">coins</span>
    </div>
  );
}
