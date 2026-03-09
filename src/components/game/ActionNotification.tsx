import React from 'react';
import { Player, GameAction } from '@/lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Timer } from '../ui/Timer';
import { getActionLabel } from '@/lib/actions';
import { CHARACTERS } from '@/lib/characters';

interface ActionNotificationProps {
  isOpen: boolean;
  action: GameAction | null;
  currentPlayer: Player | null;
  timeLeft: number;
  canCounter: boolean;
  canCallBluff: boolean;
  onCounter: () => void;
  onCallBluff: () => void;
  onPass: () => void;
}

export function ActionNotification({
  isOpen,
  action,
  currentPlayer,
  timeLeft,
  canCounter,
  canCallBluff,
  onCounter,
  onCallBluff,
  onPass,
}: ActionNotificationProps) {
  if (!action || !currentPlayer) return null;

  const actionLabel = getActionLabel(action.type, action.claimedCharacter);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="">
      <div className="text-center">
        <p className="text-lg text-[#a0a0a0] mb-2">
          {currentPlayer.name} is taking an action
        </p>
        
        <div className="bg-[#0f3460] rounded-lg p-4 mb-4">
          <p className="text-2xl font-bold text-[#eaeaea]">
            {actionLabel}
          </p>
          {action.claimedCharacter && (
            <p className="text-sm text-[#a0a0a0] mt-1">
              ({CHARACTERS[action.claimedCharacter]?.icon} {CHARACTERS[action.claimedCharacter]?.name})
            </p>
          )}
        </div>

        <div className="flex justify-center mb-4">
          <Timer timeLeft={timeLeft} />
        </div>

        <div className="space-y-2">
          {canCounter && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={onCounter}
            >
              Counter
            </Button>
          )}
          
          {canCallBluff && (
            <Button
              variant="danger"
              className="w-full"
              onClick={onCallBluff}
            >
              Call Bluff!
            </Button>
          )}
          
          <Button
            variant="ghost"
            className="w-full"
            onClick={onPass}
          >
            Pass
          </Button>
        </div>
      </div>
    </Modal>
  );
}
