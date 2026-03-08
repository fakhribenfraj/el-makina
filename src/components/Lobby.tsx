"use client";

import { useGameStore } from "@/stores/game-store";
import { startGame } from "@/lib/game-engine";
import QRGenerator from "./QRGenerator";

export default function Lobby() {
  const { gameState, setGameState, broadcastState, isHost, peerId } =
    useGameStore();

  if (!gameState || !peerId) return null;

  const handleStartGame = () => {
    const updated = startGame(gameState);
    setGameState(updated);
    setTimeout(() => broadcastState(), 50);
  };

  const playerCount = gameState.players.length;

  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Game Lobby</h2>
        <p className="text-slate-400 text-sm">
          {isHost
            ? "Share the QR code with other players to join"
            : "Waiting for the host to start the game..."}
        </p>
      </div>

      {/* QR Code (Host only) */}
      {isHost && <QRGenerator peerId={peerId} />}

      {/* Player List */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Players
          </h3>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
            {playerCount} joined
          </span>
        </div>
        <div className="space-y-2">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/30 transition-all duration-300 hover:border-slate-600/50"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: `hsl(${index * 60 + 200}, 70%, 50%)`,
                }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium flex-1">
                {player.name}
              </span>
              {player.id === gameState.hostId && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  Host
                </span>
              )}
              {player.id === peerId && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Button (Host only) */}
      {isHost && (
        <button
          onClick={handleStartGame}
          disabled={playerCount < 2}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
            text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
            active:scale-[0.98]"
        >
          {playerCount < 2
            ? "Need at least 2 players"
            : `Start Game (${playerCount} players)`}
        </button>
      )}

      {!isHost && (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm">Connected — waiting for host</span>
        </div>
      )}
    </div>
  );
}
