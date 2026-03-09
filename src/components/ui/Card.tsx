import React from 'react';
import { Card as CardType, CharacterType } from '@/lib/types';
import { CHARACTERS } from '@/lib/characters';

interface CardProps {
  card: CardType;
  isMyCard?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ card, isMyCard = false, size = 'md', onClick }: CardProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const sizes = {
    sm: 'w-16 h-24',
    md: 'w-20 h-32',
    lg: 'w-28 h-44',
  };

  const shouldShow = !isMyCard || isRevealed || card.isKnown;

  const character = CHARACTERS[card.character];

  return (
    <div
      className={`
        ${sizes[size]} 
        rounded-xl 
        transition-all 
        duration-300 
        cursor-pointer
        relative
        overflow-hidden
        ${shouldShow 
          ? 'bg-[#16213e] border-2' 
          : 'bg-[#2d2d44] border-2 border-[#3d3d5c]'
        }
        ${onClick ? 'hover:scale-105 active:scale-95' : ''}
      `}
      style={{
        borderColor: shouldShow ? character?.color || '#3b82f6' : '#3d3d5c',
      }}
      onMouseEnter={() => isMyCard && setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      onTouchStart={() => isMyCard && setIsRevealed(true)}
      onTouchEnd={() => setIsRevealed(false)}
      onClick={onClick}
    >
      {shouldShow ? (
        <div className="flex flex-col items-center justify-center h-full p-2 text-center">
          <span className="text-3xl mb-1">{character?.icon}</span>
          <span 
            className="text-xs font-bold"
            style={{ color: character?.color }}
          >
            {character?.name}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-4xl text-[#4a4a6a]">?</span>
        </div>
      )}
    </div>
  );
}

export function CardBack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-16 h-24',
    md: 'w-20 h-32',
    lg: 'w-28 h-44',
  };

  return (
    <div
      className={`
        ${sizes[size]} 
        rounded-xl 
        bg-[#2d2d44] 
        border-2 
        border-[#3d3d5c]
        flex 
        items-center 
        justify-center
      `}
    >
      <span className="text-4xl text-[#4a4a6a]">?</span>
    </div>
  );
}
