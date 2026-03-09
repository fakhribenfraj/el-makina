import React from 'react';
import { CharacterType } from '@/lib/types';
import { CHARACTERS } from '@/lib/characters';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface GuessModalProps {
  isOpen: boolean;
  onSelect: (character: CharacterType) => void;
  onCancel: () => void;
}

export function GuessModal({ isOpen, onSelect, onCancel }: GuessModalProps) {
  const characters = Object.entries(CHARACTERS);

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Guess a card">
      <p className="text-sm text-[#a0a0a0] mb-4 text-center">
        Select a character to guess. Cost: 4 coins
      </p>
      <div className="grid grid-cols-4 gap-2">
        {characters.map(([key, char]) => (
          <button
            key={key}
            className="flex flex-col items-center p-2 bg-[#0f3460] rounded-lg hover:bg-[#16213e] transition-colors"
            onClick={() => onSelect(key as CharacterType)}
          >
            <span className="text-2xl">{char.icon}</span>
            <span className="text-xs text-[#a0a0a0] mt-1">{char.name}</span>
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        className="w-full mt-4"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </Modal>
  );
}
