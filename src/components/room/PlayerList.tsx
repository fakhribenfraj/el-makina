import React from 'react';
import { Player } from '@/lib/types';

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  const sortedPlayers = [...players].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-[#eaeaea]">
        Players ({players.length}/8)
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 bg-[#16213e] rounded-lg"
          >
            <span className="w-6 h-6 flex items-center justify-center bg-[#0f3460] rounded-full text-sm text-[#a0a0a0]">
              {index + 1}
            </span>
            <span className="text-lg">👤</span>
            <span className="flex-1 text-[#eaeaea] font-medium">
              {player.name}
            </span>
            {player.isHost && (
              <span className="text-xs text-[#4ecca3] bg-[#4ecca3]/20 px-2 py-1 rounded">
                HOST
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
