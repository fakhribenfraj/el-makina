import React from 'react';

interface TimerProps {
  timeLeft: number;
  isActive?: boolean;
}

export function Timer({ timeLeft, isActive = true }: TimerProps) {
  const isUrgent = timeLeft <= 5;

  return (
    <div 
      className={`
        flex 
        items-center 
        justify-center 
        w-16 
        h-16 
        rounded-full 
        font-bold 
        text-2xl
        transition-all
        duration-300
        ${isActive 
          ? isUrgent 
            ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50' 
            : 'bg-[#16213e] text-[#eaeaea] border-2 border-[#e94560]' 
          : 'bg-[#0f3460] text-[#a0a0a0]'
        }
      `}
    >
      {timeLeft}
    </div>
  );
}
