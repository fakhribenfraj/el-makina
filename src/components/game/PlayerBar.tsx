import React from 'react';
import { Player } from '@/lib/types';
import { PlayerAvatar } from '../ui/PlayerAvatar';

interface PlayerBarProps {
  players: Player[];
  currentPlayerId: string | null;
  myPlayerId?: string;
}

export function PlayerBar({ players, currentPlayerId, myPlayerId }: PlayerBarProps) {
  const sortedPlayers = [...players].sort((a, b) => a.order - b.order);

  return (
    <div className="flex overflow-x-auto gap-3 pb-3 px-2">
      {sortedPlayers.map((player) => (
        <PlayerAvatar
          key={player.id}
          player={player}
          isCurrent={player.id === currentPlayerId}
          isEliminated={!player.isAlive}
        />
      ))}
    </div>
  );
}
