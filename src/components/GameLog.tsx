"use client";

import { useGameStore } from "@/stores/game-store";

export default function GameLog() {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const logs = [...gameState.logs].reverse().slice(0, 30);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "system":
        return "⚙️";
      case "inspect":
        return "🔍";
      default:
        return "▸";
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "system":
        return "text-slate-500";
      case "inspect":
        return "text-blue-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>📜</span> Game Log
      </h3>
      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 max-h-48 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-4">
            No actions yet
          </p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <div
                key={log.id}
                className="px-4 py-2.5 flex items-start gap-2 text-xs"
              >
                <span className="shrink-0 mt-0.5">{getLogIcon(log.type)}</span>
                <span className={getLogColor(log.type)}>{log.message}</span>
                <span className="text-slate-600 shrink-0 ml-auto text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
