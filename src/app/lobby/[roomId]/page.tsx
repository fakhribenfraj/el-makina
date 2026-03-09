"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePeerStore } from "@/stores/usePeerStore";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/Button";
import { PlayerList } from "@/components/room/PlayerList";
import { RoomCodeDisplay } from "@/components/room/RoomCode";
import { GameState, GameEvent, Player } from "@/lib/types";

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomId as string;

  const {
    players,
    isHost,
    roomCode: storeRoomCode,
    broadcast,
    connections,
    setOnEvent,
  } = usePeerStore();

  const { initGame, setGameEngine, updateGameState } = useGameStore();

  useEffect(() => {
    if (!isHost) {
      setOnEvent((event) => {
        if (event.type === "game_started") {
          updateGameState(event.gameState);
          router.push(`/game/${roomCode}`);
        }
      });
    }
    return () => setOnEvent(() => {});
  }, [isHost, setOnEvent, updateGameState, router, roomCode]);

  useEffect(() => {
    if (!storeRoomCode) {
      router.push("/");
    }
  }, [storeRoomCode, router]);

  const handleStartGame = () => {
    if (players.length < 2) return;

    const { GameEngine } = require("@/lib/game-engine");
    const { hidePrivateData } = require("@/lib/abilities");

    const initialState = GameEngine.createInitialState(players);

    // Setup engine callbacks for the host
    const callbacks = {
      broadcast: (data: GameEvent) => {
        // Broadcast to all peers, but secure the state for each one
        Object.keys(connections).forEach((peerId) => {
          const conn = connections[peerId];
          if (!conn) return;

          let dataToSend = data;
          if (
            data.type === "state_update" ||
            data.type === "game_started" ||
            data.type === "action_resolved"
          ) {
            dataToSend = {
              ...data,
              gameState: hidePrivateData(data.gameState, peerId),
            } as GameEvent;
          }
          conn.send(dataToSend);
        });
      },
      sendTo: (playerId: string, data: GameEvent) => {
        const conn = connections[playerId];
        if (conn) {
          let dataToSend = data;
          if (
            data.type === "state_update" ||
            data.type === "game_started" ||
            data.type === "action_resolved"
          ) {
            dataToSend = {
              ...data,
              gameState: hidePrivateData(data.gameState, playerId),
            } as GameEvent;
          }
          conn.send(dataToSend);
        }
      },
    };

    // Also wrap broadcast to trigger local events for the host
    const originalBroadcast = callbacks.broadcast;
    callbacks.broadcast = (data: GameEvent) => {
      originalBroadcast(data);
      // Don't loop back certain events to avoid infinite recursion in handleEvent
      if (data.type !== "action_proposed" && data.type !== "action_responded") {
        const onEvent = usePeerStore.getState().onEvent;
        if (onEvent) onEvent(data);
      }
    };

    const engine = new GameEngine(initialState, callbacks);

    setGameEngine(engine);
    // Note: initGame in store also creates an engine, but we want to use the one we just configured with P2P callbacks
    updateGameState(initialState);

    // Initial broadcast to start the game on all clients
    // Wait a tiny bit for the route transition to be ready to handle events?
    // Actually store handles it before redirect
    Object.keys(connections).forEach((peerId) => {
      const conn = connections[peerId];
      if (conn) {
        conn.send({
          type: "game_started",
          gameState: hidePrivateData(initialState, peerId),
        });
      }
    });

    router.push(`/game/${roomCode}`);
  };

  if (!storeRoomCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-[#eaeaea] mb-6">Game Lobby</h1>

      <div className="w-full max-w-md space-y-6">
        <RoomCodeDisplay code={storeRoomCode} />

        <PlayerList players={players} />

        {isHost ? (
          <Button
            className="w-full"
            onClick={handleStartGame}
            disabled={players.length < 2}
          >
            {players.length < 2
              ? `Need ${2 - players.length} more player(s)`
              : "Start Game"}
          </Button>
        ) : (
          <div className="text-center p-4 bg-[#16213e] rounded-lg">
            <p className="text-[#a0a0a0]">
              Waiting for host to start the game...
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            usePeerStore.getState().disconnect();
            router.push("/");
          }}
        >
          Leave Room
        </Button>
      </div>
    </div>
  );
}
