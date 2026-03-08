import { create } from "zustand";
import { GameState, PeerMessage, InspectResultPayload } from "@/lib/types";
import { createInitialGameState } from "@/lib/game-engine";
import Peer, { DataConnection } from "peerjs";

interface GameStore {
  // ─── Identity ────────────────────────────────────────────────────
  peerId: string | null;
  playerName: string;
  isHost: boolean;

  // ─── PeerJS ──────────────────────────────────────────────────────
  peer: Peer | null;
  connections: DataConnection[];
  isConnected: boolean;

  // ─── Game State ──────────────────────────────────────────────────
  gameState: GameState | null;

  // ─── UI State ────────────────────────────────────────────────────
  inspectResult: InspectResultPayload | null;
  selectedCardId: string | null;

  // ─── Actions ─────────────────────────────────────────────────────
  setPeerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setIsHost: (isHost: boolean) => void;
  setPeer: (peer: Peer | null) => void;
  addConnection: (conn: DataConnection) => void;
  removeConnection: (peerId: string) => void;
  setIsConnected: (connected: boolean) => void;
  setGameState: (state: GameState) => void;
  initGameState: (hostId: string) => void;
  setInspectResult: (result: InspectResultPayload | null) => void;
  setSelectedCardId: (cardId: string | null) => void;

  // ─── Broadcasting ────────────────────────────────────────────────
  broadcastState: () => void;
  sendToHost: (message: PeerMessage) => void;
  sendToPeer: (peerId: string, message: PeerMessage) => void;

  // ─── Cleanup ─────────────────────────────────────────────────────
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // ─── Initial State ──────────────────────────────────────────────
  peerId: null,
  playerName: "",
  isHost: false,
  peer: null,
  connections: [],
  isConnected: false,
  gameState: null,
  inspectResult: null,
  selectedCardId: null,

  // ─── Setters ────────────────────────────────────────────────────
  setPeerId: (id) => set({ peerId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setIsHost: (isHost) => set({ isHost }),
  setPeer: (peer) => set({ peer }),

  addConnection: (conn) =>
    set((s) => ({
      connections: [...s.connections.filter((c) => c.peer !== conn.peer), conn],
    })),

  removeConnection: (peerId) =>
    set((s) => ({
      connections: s.connections.filter((c) => c.peer !== peerId),
    })),

  setIsConnected: (connected) => set({ isConnected: connected }),
  setGameState: (state) => set({ gameState: state }),

  initGameState: (hostId) => set({ gameState: createInitialGameState(hostId) }),

  setInspectResult: (result) => set({ inspectResult: result }),
  setSelectedCardId: (cardId) => set({ selectedCardId: cardId }),

  // ─── Broadcasting ──────────────────────────────────────────────
  broadcastState: () => {
    const { connections, gameState, isHost } = get();
    if (!isHost || !gameState) return;

    const message: PeerMessage = {
      type: "STATE_UPDATE",
      payload: gameState,
    };

    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  },

  sendToHost: (message) => {
    const { connections } = get();
    // Guest has a single connection to the host
    const hostConn = connections[0];
    if (hostConn?.open) {
      hostConn.send(message);
    }
  },

  sendToPeer: (peerId, message) => {
    const { connections } = get();
    const conn = connections.find((c) => c.peer === peerId);
    if (conn?.open) {
      conn.send(message);
    }
  },

  // ─── Cleanup ────────────────────────────────────────────────────
  reset: () => {
    const { peer, connections } = get();
    connections.forEach((c) => c.close());
    peer?.destroy();
    set({
      peerId: null,
      playerName: "",
      isHost: false,
      peer: null,
      connections: [],
      isConnected: false,
      gameState: null,
      inspectResult: null,
      selectedCardId: null,
    });
  },
}));
