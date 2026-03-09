import React from 'react';
import { Card as CardType } from '@/lib/types';
import { Card as CardComponent } from '../ui/Card';

interface HandProps {
  cards: CardType[];
  isMyHand?: boolean;
}

export function Hand({ cards, isMyHand = false }: HandProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[#a0a0a0]">
        No cards
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          isMyCard={isMyHand}
          size="md"
        />
      ))}
    </div>
  );
}
