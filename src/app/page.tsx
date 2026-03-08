"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/stores/game-store";
import { usePeerManager } from "@/lib/peer-manager";
import { ROLE_EMOJI, ALL_ROLES } from "@/lib/types";

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();
  const { setupHost, setupGuest } = usePeerManager();
  const { isConnected } = useGameStore();

  const [name, setName] = useState("");
  const [mode, setMode] = useState<"idle" | "host" | "join">("idle");
  const [showScanner, setShowScanner] = useState(false);
  const [manualRoomId, setManualRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for room ID in URL on initial load
  useState(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const room = urlParams.get("room");
      if (room) {
        setMode("join");
        setManualRoomId(room);
      }
    }
  });

  const handleHost = () => {
    if (!name.trim()) return;
    setIsLoading(true);
    setupHost(name.trim());
    // Small delay to let PeerJS open
    setTimeout(() => {
      router.push("/game?role=host");
    }, 1500);
  };

  const handleJoinViaQR = useCallback(
    (scannedText: string) => {
      if (!name.trim()) return;

      // Ensure we extract the room ID if the scanned content is a full URL
      let peerId = scannedText;
      try {
        const url = new URL(scannedText);
        peerId = url.searchParams.get("room") || scannedText;
      } catch (e) {
        // If it throws, it's not a URL, so peerId is just the scannedText
      }

      setShowScanner(false);
      setIsLoading(true);
      setupGuest(peerId, name.trim());
      setTimeout(() => {
        router.push("/game?role=guest");
      }, 1500);
    },
    [name, router, setupGuest],
  );

  const handleJoinManual = () => {
    if (!name.trim() || !manualRoomId.trim()) return;
    setIsLoading(true);
    setupGuest(manualRoomId.trim(), name.trim());
    setTimeout(() => {
      router.push("/game?role=guest");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Floating Role Icons */}
        <div className="absolute inset-0">
          {ALL_ROLES.map((role, i) => (
            <div
              key={role}
              className="absolute text-2xl opacity-10 animate-float"
              style={{
                top: `${15 + ((i * 12) % 70)}%`,
                left: `${10 + ((i * 15) % 80)}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            >
              {ROLE_EMOJI[role]}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo / Title */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="text-6xl mb-2 animate-float">⚙️</div>
            <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-2xl" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-linear-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              El Makina
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            Local multiplayer card game • 7 roles • Pure strategy
          </p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label
            htmlFor="player-name"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
          >
            Your Name
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 
              text-white placeholder-slate-500 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
              transition-all duration-300"
          />
        </div>

        {/* Mode Selection */}
        {mode === "idle" && (
          <div className="space-y-3">
            <button
              onClick={() => {
                if (name.trim()) setMode("host");
              }}
              disabled={!name.trim()}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300
                bg-linear-to-r from-cyan-500 to-blue-600 text-white
                shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
                hover:from-cyan-400 hover:to-blue-500
                active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-cyan-500/25"
            >
              <span className="flex items-center justify-center gap-2">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Game
              </span>
            </button>

            <button
              onClick={() => {
                if (name.trim()) setMode("join");
              }}
              disabled={!name.trim()}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300
                bg-slate-800/50 border-2 border-slate-700/50 text-slate-200
                hover:border-purple-500/50 hover:bg-slate-800/80
                active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                Join Game
              </span>
            </button>
          </div>
        )}

        {/* Host Mode */}
        {mode === "host" && (
          <div className="space-y-4 animate-scale-in">
            <button
              onClick={handleHost}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300
                bg-linear-to-r from-cyan-500 to-blue-600 text-white
                shadow-lg shadow-cyan-500/25
                disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating room...
                </span>
              ) : (
                "Create Room"
              )}
            </button>
            <button
              onClick={() => setMode("idle")}
              className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Join Mode */}
        {mode === "join" && (
          <div className="space-y-4 animate-scale-in">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300
                bg-linear-to-r from-purple-500 to-pink-600 text-white
                shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                📸 Scan QR to Join
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-700/50" />
              <span className="text-xs text-slate-500">or</span>
              <div className="h-px flex-1 bg-slate-700/50" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualRoomId}
                onChange={(e) => setManualRoomId(e.target.value)}
                placeholder="Enter Room ID..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                  text-white placeholder-slate-500 text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                  transition-all duration-300"
              />
              <button
                onClick={handleJoinManual}
                disabled={!manualRoomId.trim() || isLoading}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  bg-purple-500 text-white hover:bg-purple-400
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Join"
                )}
              </button>
            </div>

            <button
              onClick={() => setMode("idle")}
              className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-[10px] text-slate-600">
            P2P connection • No servers • Works offline
          </p>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleJoinViaQR}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
