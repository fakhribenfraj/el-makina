import React from 'react';
import { Player } from '@/lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player | null;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function GameOverModal({
  isOpen,
  winner,
  onPlayAgain,
  onBackToHome,
}: GameOverModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#eaeaea] mb-4">
          GAME OVER!
        </h2>
        
        <div className="text-6xl mb-4">🏆</div>
        
        <p className="text-xl text-[#4ecca3] font-bold mb-2">
          WINNER
        </p>
        
        <p className="text-2xl text-[#eaeaea] font-bold mb-4">
          {winner?.name || 'Unknown'}
        </p>
        
        <p className="text-[#f9a826] mb-6">
          💰 {winner?.coins || 0} coins remaining
        </p>

        <div className="space-y-2">
          <Button
            variant="success"
            className="w-full"
            onClick={onPlayAgain}
          >
            Play Again
          </Button>
          
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBackToHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </Modal>
  );
}
