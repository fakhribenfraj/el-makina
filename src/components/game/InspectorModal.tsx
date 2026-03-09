import React from 'react';
import { Card as CardType } from '@/lib/types';
import { CHARACTERS } from '@/lib/characters';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface InspectorModalProps {
  isOpen: boolean;
  playerName: string;
  card: CardType;
  onKeep: () => void;
  onChange: () => void;
}

export function InspectorModal({ 
  isOpen, 
  playerName, 
  card, 
  onKeep, 
  onChange 
}: InspectorModalProps) {
  const character = CHARACTERS[card.character];

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={`${playerName}'s card`}>
      <div className="flex justify-center mb-4">
        <div 
          className="w-32 h-48 rounded-xl flex flex-col items-center justify-center border-4"
          style={{ borderColor: character?.color }}
        >
          <span className="text-5xl">{character?.icon}</span>
          <span className="font-bold mt-2" style={{ color: character?.color }}>
            {character?.name}
          </span>
        </div>
      </div>
      <p className="text-center text-[#a0a0a0] mb-4">
        What to do?
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onKeep}
        >
          Keep
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onChange}
        >
          Change
        </Button>
      </div>
    </Modal>
  );
}
