"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePeerStore } from "@/stores/usePeerStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QRCodeDisplay } from "@/components/room/QRCode";
import { RoomCodeDisplay } from "@/components/room/RoomCode";
import { PlayerList } from "@/components/room/PlayerList";

export default function CreateRoomPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    roomCode,
    players,
    isHost,
    connectionStatus,
    error,
    createRoom,
    updateSettings,
    gameSettings,
  } = usePeerStore();

  const [timerSeconds, setTimerSeconds] = useState(10);

  useEffect(() => {
    if (players.length > 0 && roomCode) {
      // Stay on this page - host is waiting for players
    }
  }, [players, roomCode]);

  const handleCreate = async () => {
    if (!playerName.trim()) return;

    setIsCreating(true);
    try {
      await createRoom(playerName.trim());
      updateSettings({ timerDuration: timerSeconds });
    } catch (err) {
      console.error("Failed to create room:", err);
      setIsCreating(false);
    }
  };

  const handleStartGame = () => {
    if (players.length < 2) return;
    router.push(`/lobby/${roomCode}`);
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-[#eaeaea] mb-8">
          Create Game Room
        </h1>

        <div className="w-full max-w-sm space-y-4">
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-[#a0a0a0]">
              Turn Timer
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 30, 60, 0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTimerSeconds(val)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                    timerSeconds === val
                      ? "bg-[#e94560] border-[#e94560] text-white shadow-[0_0_10px_rgba(233,69,96,0.3)]"
                      : "bg-[#0f3460] border-[#1a4a7a] text-[#a0a0a0] hover:border-[#e94560]/50"
                  }`}
                >
                  {val === 0 ? "None" : `${val}s`}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!playerName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Room"}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-[#eaeaea] mb-6">
        Waiting for Players
      </h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center space-y-6">
          <QRCodeDisplay roomCode={roomCode} />
          <RoomCodeDisplay code={roomCode} />
        </div>

        <div className="space-y-6">
          <PlayerList players={players} />

          <Button
            className="w-full"
            onClick={handleStartGame}
            disabled={players.length < 2}
          >
            {players.length < 2
              ? `Need ${2 - players.length} more player(s)`
              : "Start Game"}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              usePeerStore.getState().disconnect();
              router.push("/");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
