"use client";

import { useCallback, useEffect, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { useGameStore } from "@/stores/game-store";
import {
  PeerMessage,
  ActionRequestPayload,
  GameState,
  InspectResultPayload,
} from "@/lib/types";
import {
  addPlayer,
  addCoin,
  removeCoin,
  drawCard,
  discardCard,
  getInspectResult,
  forceSwap,
  toggleProtection,
  removePlayer,
  createLog,
} from "@/lib/game-engine";

export function usePeerManager() {
  const store = useGameStore();
  const isSettingUp = useRef(false);

  // ─── Handle incoming messages (HOST) ─────────────────────────────
  const handleHostMessage = useCallback(
    (message: PeerMessage, fromPeerId: string) => {
      const { gameState, setGameState, broadcastState, sendToPeer } =
        useGameStore.getState();
      if (!gameState) return;

      switch (message.type) {
        case "PLAYER_NAME": {
          const name = message.payload as string;
          const updated = addPlayer(gameState, fromPeerId, name);
          setGameState(updated);
          setTimeout(() => useGameStore.getState().broadcastState(), 50);
          break;
        }

        case "ACTION_REQUEST": {
          const { action, playerId, targetId, data } =
            message.payload as ActionRequestPayload;
          let newState = { ...gameState };

          switch (action) {
            case "ADD_COIN":
              newState = addCoin(newState, playerId);
              break;
            case "REMOVE_COIN":
              newState = removeCoin(newState, playerId);
              break;
            case "DRAW_CARD":
              newState = drawCard(newState, playerId);
              break;
            case "DISCARD_CARD":
              newState = discardCard(newState, playerId, data as string);
              break;
            case "INSPECT": {
              if (!targetId) break;
              const target = newState.players.find((p) => p.id === targetId);
              if (target?.isProtected) {
                const inspector = newState.players.find(
                  (p) => p.id === playerId,
                );
                newState = {
                  ...newState,
                  logs: [
                    ...newState.logs,
                    createLog(
                      `${inspector?.name} tried to inspect ${target.name} but was blocked by protection!`,
                      "inspect",
                    ),
                  ],
                };
                break;
              }
              const card = getInspectResult(newState, targetId);
              if (card && target) {
                const result: InspectResultPayload = {
                  targetId,
                  targetName: target.name,
                  card,
                };
                sendToPeer(playerId, {
                  type: "INSPECT_RESULT",
                  payload: result,
                });
                const inspector = newState.players.find(
                  (p) => p.id === playerId,
                );
                newState = {
                  ...newState,
                  logs: [
                    ...newState.logs,
                    createLog(
                      `${inspector?.name} inspected ${target.name}'s card`,
                      "inspect",
                    ),
                  ],
                };
              }
              break;
            }
            case "FORCE_SWAP": {
              if (!targetId) break;
              newState = forceSwap(
                newState,
                playerId,
                targetId,
                data as string,
              );
              break;
            }
            case "TOGGLE_PROTECTION":
              newState = toggleProtection(newState, playerId);
              break;
          }

          setGameState(newState);
          setTimeout(() => useGameStore.getState().broadcastState(), 50);
          break;
        }
      }
    },
    [],
  );

  // ─── Handle incoming messages (GUEST) ────────────────────────────
  const handleGuestMessage = useCallback((message: PeerMessage) => {
    const { setGameState, setInspectResult } = useGameStore.getState();

    switch (message.type) {
      case "STATE_UPDATE":
        setGameState(message.payload as GameState);
        break;
      case "INSPECT_RESULT":
        setInspectResult(message.payload as InspectResultPayload);
        break;
    }
  }, []);

  // ─── Setup Host ──────────────────────────────────────────────────
  const setupHost = useCallback(
    (playerName: string) => {
      if (isSettingUp.current) return;
      isSettingUp.current = true;

      const peer = new Peer();

      peer.on("open", (id) => {
        const {
          setPeerId,
          setPeer,
          setIsHost,
          setIsConnected,
          setPlayerName,
          initGameState,
          setGameState,
        } = useGameStore.getState();

        setPeerId(id);
        setPeer(peer);
        setIsHost(true);
        setIsConnected(true);
        setPlayerName(playerName);
        initGameState(id);

        // Add host as the first player
        const state = useGameStore.getState().gameState;
        if (state) {
          const updated = addPlayer(state, id, playerName);
          setGameState(updated);
        }
      });

      peer.on("connection", (conn: DataConnection) => {
        conn.on("open", () => {
          const { addConnection } = useGameStore.getState();
          addConnection(conn);
        });

        conn.on("data", (data) => {
          handleHostMessage(data as PeerMessage, conn.peer);
        });

        conn.on("close", () => {
          const { removeConnection, gameState, setGameState } =
            useGameStore.getState();
          removeConnection(conn.peer);
          if (gameState) {
            const updated = removePlayer(gameState, conn.peer);
            setGameState(updated);
            setTimeout(() => useGameStore.getState().broadcastState(), 50);
          }
        });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        isSettingUp.current = false;
      });
    },
    [handleHostMessage],
  );

  // ─── Setup Guest ─────────────────────────────────────────────────
  const setupGuest = useCallback(
    (hostPeerId: string, playerName: string) => {
      if (isSettingUp.current) return;
      isSettingUp.current = true;

      const peer = new Peer();

      peer.on("open", (id) => {
        const {
          setPeerId,
          setPeer,
          setIsHost,
          setIsConnected,
          setPlayerName,
          addConnection,
        } = useGameStore.getState();

        setPeerId(id);
        setPeer(peer);
        setIsHost(false);
        setPlayerName(playerName);

        const conn = peer.connect(hostPeerId, { reliable: true });

        conn.on("open", () => {
          addConnection(conn);
          setIsConnected(true);

          // Send our name to the host
          conn.send({
            type: "PLAYER_NAME",
            payload: playerName,
          } as PeerMessage);
        });

        conn.on("data", (data) => {
          handleGuestMessage(data as PeerMessage);
        });

        conn.on("close", () => {
          setIsConnected(false);
        });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        isSettingUp.current = false;
      });
    },
    [handleGuestMessage],
  );

  // ─── Send Action (from any player) ──────────────────────────────
  const sendAction = useCallback(
    (payload: ActionRequestPayload) => {
      const { isHost, gameState, setGameState, broadcastState, sendToHost } =
        useGameStore.getState();

      if (isHost && gameState) {
        // Host processes locally
        handleHostMessage(
          { type: "ACTION_REQUEST", payload },
          payload.playerId,
        );
      } else {
        // Guest sends to host
        sendToHost({ type: "ACTION_REQUEST", payload });
      }
    },
    [handleHostMessage],
  );

  // ─── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      isSettingUp.current = false;
    };
  }, []);

  return { setupHost, setupGuest, sendAction };
}
