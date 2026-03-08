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
  const [isAddingCoins, setIsAddingCoins] = useState(true);

  if (!peerId || !gameState) return null;

  const currentPlayer = gameState.players.find((p) => p.id === peerId);
  if (!currentPlayer) return null;

  // Wait, wait, I can just remove the whole hasPoliceman since it's not needed anymore

  const handleCoinAction = (amount: number) => {
    sendAction({
      action: isAddingCoins ? "ADD_COIN" : "REMOVE_COIN",
      playerId: peerId,
      data: amount,
    });
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        Actions
      </h3>

      {/* Row 1: Coins Switch + Numbers */}
      <div className="flex flex-col gap-2">
        {/* Switch */}
        <div className="flex justify-center mb-1">
          <div className="bg-slate-800/80 p-1 rounded-full flex gap-1 items-center border border-slate-700">
            <button
              onClick={() => setIsAddingCoins(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                isAddingCoins
                  ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              +
            </button>
            <button
              onClick={() => setIsAddingCoins(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                !isAddingCoins
                  ? "bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              -
            </button>
          </div>
        </div>

        {/* Number Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((num) => {
            // Disable rule: can't remove more coins than you have
            const disabled = !isAddingCoins && currentPlayer.coins < num;
            return (
              <button
                key={num}
                onClick={() => handleCoinAction(num)}
                disabled={disabled}
                className={`
                   py-3 px-2 rounded-xl font-bold text-lg
                   transition-all duration-300
                   ${
                     isAddingCoins
                       ? "bg-slate-800/80 border-2 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                       : "bg-slate-800/80 border-2 border-rose-500/30 text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/10 shadow-lg shadow-rose-500/5"
                   }
                   hover:scale-[1.05] active:scale-[0.95]
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-transparent disabled:hover:bg-slate-800/80
                 `}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Inspect Action */}
      <div className="grid gap-2">
        <button
          onClick={onInspect}
          className="flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl font-semibold text-sm
            transition-all duration-300 text-white
            bg-linear-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25
            hover:from-blue-400 hover:to-indigo-500 hover:scale-[1.02]
            active:scale-[0.98]"
        >
          <span className="text-xl">🔍</span>
          <span>Inspect</span>
        </button>
      </div>

      {/* Row 3: Draw and Discard */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => sendAction({ action: "DRAW_CARD", playerId: peerId })}
          disabled={gameState.deck.length === 0}
          className={`
            flex flex-col items-center gap-1 py-3 px-2 rounded-xl font-medium text-xs
            transition-all duration-300 text-white
            bg-linear-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25 shadow-lg
            hover:scale-[1.05] active:scale-[0.95]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          <span className="text-lg">🃏</span>
          <span>Draw</span>
        </button>

        <button
          onClick={() => {
            if (selectedCardId) {
              sendAction({
                action: "DISCARD_CARD",
                playerId: peerId,
                data: selectedCardId,
              });
              useGameStore.getState().setSelectedCardId(null);
            }
          }}
          disabled={!selectedCardId}
          className={`
            flex flex-col items-center gap-1 py-3 px-2 rounded-xl font-medium text-xs
            transition-all duration-300 text-white
            bg-linear-to-b from-red-500 to-rose-600 shadow-red-500/25 shadow-lg
            hover:scale-[1.05] active:scale-[0.95]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          <span className="text-lg">�️</span>
          <span>Return</span>
        </button>
      </div>

      {/* Deck Info */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2">
        <span className="flex items-center gap-1">
          🃏 Deck:{" "}
          <strong className="text-slate-300">{gameState.deck.length}</strong>
        </span>
      </div>
    </div>
  );
}
