"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { usePeerManager } from "@/lib/peer-manager";
import PlayerCard from "./PlayerCard";
import HandView from "./HandView";
import ActionsPanel from "./ActionsPanel";
import InspectModal from "./InspectModal";
import TargetSelector from "./TargetSelector";
import GameLog from "./GameLog";

export default function GameBoard() {
  const {
    peerId,
    gameState,
    inspectResult,
    selectedCardId,
    setSelectedCardId,
    setInspectResult,
  } = useGameStore();
  const { sendAction } = usePeerManager();
  const [showTargetSelector, setShowTargetSelector] = useState(false);

  if (!peerId || !gameState) return null;

  const currentPlayer = gameState.players.find((p) => p.id === peerId);
  if (!currentPlayer) return null;

  const otherPlayers = gameState.players.filter((p) => p.id !== peerId);

  // ─── Inspect flow ────────────────────────────────────────────────
  const handleInspect = () => {
    setShowTargetSelector(true);
  };

  const handleSelectTarget = (targetId: string) => {
    setShowTargetSelector(false);
    sendAction({
      action: "INSPECT",
      playerId: peerId,
      targetId,
    });
  };

  const handleForceSwap = () => {
    if (inspectResult) {
      sendAction({
        action: "FORCE_SWAP",
        playerId: peerId,
        targetId: inspectResult.targetId,
        data: inspectResult.card.id,
      });
      setInspectResult(null);
    }
  };

  const handleKeep = () => {
    setInspectResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="text-lg font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              El Makina
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {gameState.players.length} players
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-6">
        {/* All Players Overview */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Players
          </h3>
          <div className="space-y-2">
            <PlayerCard player={currentPlayer} />
            {otherPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Own Hand */}
        <section>
          <HandView
            cards={currentPlayer.cards}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
          />
        </section>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Actions */}
        <section>
          <ActionsPanel sendAction={sendAction} onInspect={handleInspect} />
        </section>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Game Log */}
        <section className="pb-8">
          <GameLog />
        </section>
      </main>

      {/* Modals */}
      {showTargetSelector && (
        <TargetSelector
          players={gameState.players}
          currentPlayerId={peerId}
          onSelect={handleSelectTarget}
          onCancel={() => setShowTargetSelector(false)}
          title="Select a player to inspect"
        />
      )}

      {inspectResult && (
        <InspectModal onForceSwap={handleForceSwap} onKeep={handleKeep} />
      )}
    </div>
  );
}
