"use client";

import { useGameStore } from "@/stores/game-store";
import { ROLE_EMOJI, ROLE_COLOR } from "@/lib/types";

interface InspectModalProps {
  onForceSwap: () => void;
  onKeep: () => void;
}

export default function InspectModal({
  onForceSwap,
  onKeep,
}: InspectModalProps) {
  const { inspectResult } = useGameStore();

  if (!inspectResult) return null;

  const { targetName, card } = inspectResult;
  const color = ROLE_COLOR[card.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 rounded-2xl p-6 mx-4 max-w-sm w-full border border-slate-700/50 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-bold text-white">Inspection Result</h3>
          <p className="text-slate-400 text-sm mt-1">
            You inspected{" "}
            <span className="text-white font-medium">{targetName}</span>
          </p>
        </div>

        {/* Card Reveal */}
        <div
          className="rounded-2xl p-6 mb-6 text-center border-2 relative overflow-hidden"
          style={{
            borderColor: color + "60",
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: color }}
          />
          <div className="relative">
            <span className="text-5xl block mb-3">{ROLE_EMOJI[card.role]}</span>
            <h4 className="text-xl font-bold mb-1" style={{ color }}>
              {card.role}
            </h4>
            <p className="text-xs text-slate-400">{targetName} has this card</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onKeep}
            className="py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300
              bg-slate-800 border border-slate-700/50 text-slate-300
              hover:bg-slate-700 hover:text-white active:scale-[0.97]"
          >
            Keep Card
          </button>
          <button
            onClick={onForceSwap}
            className="py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300
              bg-linear-to-r from-red-500 to-orange-500 text-white
              hover:from-red-400 hover:to-orange-400
              shadow-lg shadow-red-500/25 active:scale-[0.97]"
          >
            Force Swap
          </button>
        </div>
      </div>
    </div>
  );
}
