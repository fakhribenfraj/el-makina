import React from 'react';
import { Player } from '@/lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface TargetSelectorProps {
  isOpen: boolean;
  players: Player[];
  excludeId?: string;
  title: string;
  onSelect: (targetId: string) => void;
  onCancel: () => void;
}

export function TargetSelector({
  isOpen,
  players,
  excludeId,
  title,
  onSelect,
  onCancel,
}: TargetSelectorProps) {
  const availablePlayers = players.filter(
    p => p.isAlive && p.id !== excludeId
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-2">
        {availablePlayers.map((player) => (
          <Button
            key={player.id}
            variant="secondary"
            className="w-full justify-between"
            onClick={() => onSelect(player.id)}
          >
            <span>{player.name}</span>
            <span className="text-[#a0a0a0]">
              💰{player.coins} 🃏{player.cards.length}
            </span>
          </Button>
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
