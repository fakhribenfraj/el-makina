"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { ActionRequestPayload } from "@/lib/types";

interface ActionsPanelProps {
  sendAction: (payload: ActionRequestPayload) => void;
  onInspect: () => void;
}

export default function ActionsPanel({
  sendAction,
  onInspect,
}: ActionsPanelProps) {
  const { peerId, gameState, selectedCardId } = useGameStore();
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  if (!peerId || !gameState) return null;

  const currentPlayer = gameState.players.find((p) => p.id === peerId);
  if (!currentPlayer) return null;

  const hasPoliceman = currentPlayer.cards.some((c) => c.role === "Policeman");

  const actions = [
    {
      label: "+1 Coin",
      icon: "🪙",
      color: "from-amber-500 to-yellow-500",
      shadow: "shadow-amber-500/25",
      action: () => sendAction({ action: "ADD_COIN", playerId: peerId }),
    },
    {
      label: "-1 Coin",
      icon: "💸",
      color: "from-slate-600 to-slate-700",
      shadow: "shadow-slate-500/25",
      disabled: currentPlayer.coins === 0,
      action: () => sendAction({ action: "REMOVE_COIN", playerId: peerId }),
    },
    {
      label: "Draw",
      icon: "🃏",
      color: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/25",
      disabled: gameState.deck.length === 0,
      action: () => sendAction({ action: "DRAW_CARD", playerId: peerId }),
    },
    {
      label: "Discard",
      icon: "🗑️",
      color: "from-red-500 to-rose-600",
      shadow: "shadow-red-500/25",
      disabled: !selectedCardId,
      action: () => {
        if (selectedCardId) {
          sendAction({
            action: "DISCARD_CARD",
            playerId: peerId,
            data: selectedCardId,
          });
          useGameStore.getState().setSelectedCardId(null);
        }
      },
    },
  ];

  return (
    <div className="w-full space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        Actions
      </h3>

      {/* Basic Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        {actions.map(({ label, icon, color, shadow, disabled, action }) => (
          <button
            key={label}
            onClick={action}
            disabled={disabled}
            className={`
              flex flex-col items-center gap-1 py-3 px-2 rounded-xl font-medium text-xs
              transition-all duration-300 text-white
              bg-linear-to-b ${color} ${shadow} shadow-lg
              hover:scale-[1.05] active:scale-[0.95]
              disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
            `}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Policeman Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onInspect}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm
            transition-all duration-300 text-white
            bg-linear-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25
            hover:from-blue-400 hover:to-indigo-500 hover:scale-[1.02]
            active:scale-[0.98]"
        >
          <span>🔍</span>
          <span>Inspect</span>
        </button>

        <button
          onClick={() =>
            sendAction({
              action: "TOGGLE_PROTECTION",
              playerId: peerId,
            })
          }
          className={`
            flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm
            transition-all duration-300 border-2
            ${
              currentPlayer.isProtected
                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-blue-500/50 hover:text-blue-400"
            }
            hover:scale-[1.02] active:scale-[0.98]
          `}
        >
          <span>🛡️</span>
          <span>{currentPlayer.isProtected ? "Protected" : "Protect"}</span>
        </button>
      </div>

      {/* Deck / Discard Info */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          🃏 Deck:{" "}
          <strong className="text-slate-300">{gameState.deck.length}</strong>
        </span>
        <span className="flex items-center gap-1">
          🗑️ Discard:{" "}
          <strong className="text-slate-300">
            {gameState.discardPile.length}
          </strong>
        </span>
      </div>
    </div>
  );
}
