"use client";

import { Player } from "@/lib/types";
import PlayerCard from "./PlayerCard";

interface TargetSelectorProps {
  players: Player[];
  currentPlayerId: string;
  onSelect: (playerId: string) => void;
  onCancel: () => void;
  title: string;
}

export default function TargetSelector({
  players,
  currentPlayerId,
  onSelect,
  onCancel,
  title,
}: TargetSelectorProps) {
  const selectablePlayers = players.filter(
    (p) => p.id !== currentPlayerId && p.isAlive && p.cards.length > 0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 mx-0 sm:mx-4 w-full sm:max-w-md border-t sm:border border-slate-700/50 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {selectablePlayers.length === 0 ? (
            <p className="text-slate-500 text-center py-8 text-sm">
              No valid targets available
            </p>
          ) : (
            selectablePlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isSelectable
                onSelect={() => onSelect(player.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
