"use client";

import { Player, ROLE_EMOJI, ROLE_COLOR } from "@/lib/types";
import { useGameStore } from "@/stores/game-store";

interface PlayerCardProps {
  player: Player;
  onSelect?: () => void;
  isSelectable?: boolean;
}

export default function PlayerCard({
  player,
  onSelect,
  isSelectable = false,
}: PlayerCardProps) {
  const { peerId } = useGameStore();
  const isCurrentPlayer = player.id === peerId;

  return (
    <button
      onClick={isSelectable ? onSelect : undefined}
      disabled={!isSelectable}
      className={`
        relative w-full rounded-2xl p-4 transition-all duration-300 text-left
        ${
          isCurrentPlayer
            ? "bg-linear-to-br from-cyan-500/15 to-blue-600/15 border-2 border-cyan-500/40"
            : "bg-slate-800/60 border border-slate-700/40"
        }
        ${
          isSelectable
            ? "cursor-pointer hover:border-amber-400/60 hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
            : ""
        }
        ${!player.isAlive ? "opacity-50" : ""}
      `}
    >
      {/* Protection Shield */}
      {player.isProtected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-sm shadow-lg shadow-blue-500/50 animate-pulse">
          🛡️
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
          style={{
            background: isCurrentPlayer
              ? "linear-gradient(135deg, #06b6d4, #3b82f6)"
              : "linear-gradient(135deg, #334155, #475569)",
          }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate">
              {player.name}
            </span>
            {isCurrentPlayer && (
              <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded-full">
                YOU
              </span>
            )}
          </div>

          {/* Cards row */}
          <div className="flex items-center gap-1 mt-1">
            {isCurrentPlayer
              ? player.cards.map((card) => (
                  <span
                    key={card.id}
                    className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{
                      backgroundColor: ROLE_COLOR[card.role] + "30",
                      color: ROLE_COLOR[card.role],
                    }}
                  >
                    {ROLE_EMOJI[card.role]} {card.role}
                  </span>
                ))
              : Array.from({ length: player.cards.length }).map((_, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700/60 text-slate-400"
                  >
                    🂠
                  </span>
                ))}
          </div>
        </div>

        {/* Coins */}
        <div className="flex flex-col items-center shrink-0">
          <span className="text-xl">🪙</span>
          <span className="text-amber-400 font-bold text-sm">
            {player.coins}
          </span>
        </div>
      </div>
    </button>
  );
}
