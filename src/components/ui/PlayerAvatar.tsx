import React from 'react';
import { Player } from '@/lib/types';

interface PlayerAvatarProps {
  player: Player;
  isCurrent?: boolean;
  isEliminated?: boolean;
}

export function PlayerAvatar({ player, isCurrent = false, isEliminated = false }: PlayerAvatarProps) {
  return (
    <div 
      className={`
        flex 
        flex-col 
        items-center 
        p-3 
        rounded-xl 
        min-w-[80px]
        transition-all
        ${isCurrent 
          ? 'bg-[#16213e] ring-2 ring-[#e94560] shadow-lg shadow-[#e94560]/20 scale-105' 
          : 'bg-[#0f3460]'
        }
        ${isEliminated ? 'opacity-40 grayscale' : ''}
      `}
    >
      <div className="text-2xl mb-1">
        {isEliminated ? '💀' : '👤'}
      </div>
      <div className="text-xs font-medium text-[#eaeaea] text-center truncate max-w-[70px]">
        {player.name}
      </div>
      <div className="flex items-center gap-1 mt-1">
        <span>🃏</span>
        <span className="text-xs text-[#a0a0a0]">{player.cards.length}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💰</span>
        <span className="text-xs text-[#f9a826]">{player.coins}</span>
      </div>
      {player.isHost && (
        <span className="text-[10px] text-[#4ecca3] mt-1">HOST</span>
      )}
    </div>
  );
}
