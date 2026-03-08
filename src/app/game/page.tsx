"use client";

import { useGameStore } from "@/stores/game-store";
import Lobby from "@/components/Lobby";
import GameBoard from "@/components/GameBoard";

export default function GamePage() {
  const { gameState, isConnected } = useGameStore();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Connecting...</p>
          <a
            href="/"
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">Waiting for game state...</p>
          <div className="w-8 h-8 border-3 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (gameState.phase === "lobby") {
    return <Lobby />;
  }

  return <GameBoard />;
}
