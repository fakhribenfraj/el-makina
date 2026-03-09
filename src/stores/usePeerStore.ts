import { create } from "zustand";
import Peer, { DataConnection } from "peerjs";
import { v4 as uuidv4 } from "uuid";
import { Player, GameEvent } from "@/lib/types";
import { generateRoomCode } from "@/lib/utils";

interface PeerState {
  peer: Peer | null;
  connections: Record<string, DataConnection>;
  isConnected: boolean;
  isHost: boolean;
  myPlayerId: string | null;
  roomCode: string | null;
  players: Player[];
  gameSettings: { timerDuration: number };
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  error: string | null;

  createRoom: (playerName: string) => Promise<string>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  disconnect: () => void;
  broadcast: (data: GameEvent) => void;
  sendTo: (playerId: string, data: GameEvent) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setMyPlayerId: (id: string) => void;
  updateSettings: (settings: { timerDuration: number }) => void;
  onEvent?: (event: GameEvent) => void;
  setOnEvent: (callback: (event: GameEvent) => void) => void;
}

export const usePeerStore = create<PeerState>((set, get) => ({
  peer: null,
  connections: {},
  isConnected: false,
  isHost: false,
  myPlayerId: null,
  roomCode: null,
  players: [],
  gameSettings: { timerDuration: 10 },
  connectionStatus: "disconnected",
  error: null,
  onEvent: undefined,

  setOnEvent: (callback) => set({ onEvent: callback }),

  createRoom: async (playerName: string) => {
    const roomCode = generateRoomCode();

    set({
      connectionStatus: "connecting",
      roomCode,
      isHost: true,
    });

    const peer = new Peer(roomCode, {
      debug: 1,
    });

    return new Promise<string>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      peer.on("open", (id) => {
        clearTimeout(timeoutId);
        set({
          isConnected: true,
          connectionStatus: "connected",
          myPlayerId: id,
          peer,
        });

        const hostPlayer: Player = {
          id,
          name: playerName,
          coins: 2,
          cards: [],
          isAlive: true,
          isHost: true,
          order: 0,
        };

        set({ players: [hostPlayer] });
        resolve(roomCode);
      });

      peer.on("connection", (conn) => {
        console.log("Incoming connection from:", conn.peer);

        conn.on("data", (data) => {
          handleData(conn.peer, data as GameEvent, get);
        });

        conn.on("open", () => {
          set((state) => ({
            connections: { ...state.connections, [conn.peer]: conn },
          }));
        });

        conn.on("close", () => {
          const { connections } = get();
          const newConnections = { ...connections };
          delete newConnections[conn.peer];
          set({ connections: newConnections });

          const playerId = conn.peer;
          get().removePlayer(playerId);
          get().broadcast({ type: "player_left", playerId });
        });

        // Store connection immediately too
        set((state) => ({
          connections: { ...state.connections, [conn.peer]: conn },
        }));
      });

      peer.on("error", (err) => {
        clearTimeout(timeoutId);
        console.error("Peer error:", err);
        set({
          error: err.message,
          connectionStatus: "error",
        });
        reject(err);
      });

      timeoutId = setTimeout(() => {
        peer.destroy();
        set({
          error: "Failed to create room: Timeout connecting to PeerJS server",
          connectionStatus: "error",
        });
        reject(new Error("Timeout"));
      }, 10000);
    });
  },

  joinRoom: async (roomCode: string, playerName: string) => {
    set({
      connectionStatus: "connecting",
      roomCode,
      isHost: false,
    });

    const myId = uuidv4();
    const peer = new Peer(myId, {
      debug: 1,
    });

    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const finishWithReject = (err: any) => {
        clearTimeout(timeoutId);
        reject(err);
      };

      peer.on("open", (id) => {
        set({
          myPlayerId: id,
          peer,
        });

        // Now that we are connected to the central server, connect to the host
        const conn = peer.connect(roomCode, { reliable: true });

        conn.on("open", () => {
          clearTimeout(timeoutId);
          set({
            isConnected: true,
            connectionStatus: "connected",
            connections: { [roomCode]: conn },
          });

          conn.send({
            type: "join_request",
            playerName,
            playerId: myId,
          } as GameEvent);

          resolve(undefined);
        });

        conn.on("data", (data) => {
          handleData(conn.peer, data as GameEvent, get);
        });

        conn.on("error", (err) => {
          console.error("Connection error:", err);
          set({
            error: err.message,
            connectionStatus: "error",
          });
          finishWithReject(err);
        });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        set({
          error: err.message,
          connectionStatus: "error",
        });
        finishWithReject(err);
      });

      // Prevent hanging indefinitely if WebRTC connection fails silently
      timeoutId = setTimeout(() => {
        set({
          error: "Connection timeout",
          connectionStatus: "error",
        });
        finishWithReject(new Error("Connection timeout"));
      }, 10000);
    });
  },

  disconnect: () => {
    const { peer, connections } = get();

    Object.values(connections).forEach((conn) => conn.close());

    if (peer) {
      peer.destroy();
    }

    set({
      peer: null,
      connections: {},
      isConnected: false,
      isHost: false,
      myPlayerId: null,
      roomCode: null,
      players: [],
      connectionStatus: "disconnected",
    });
  },

  broadcast: (data: GameEvent) => {
    const { connections, isHost, roomCode, myPlayerId } = get();

    if (!isHost) {
      const hostConn = connections[roomCode || ""];
      if (hostConn) {
        hostConn.send(data);
      }
      return;
    }

    Object.values(connections).forEach((conn) => {
      conn.send(data);
    });
  },

  sendTo: (playerId: string, data: GameEvent) => {
    const { connections } = get();
    const conn = connections[playerId];
    if (conn) {
      conn.send(data);
    }
  },

  setPlayers: (players: Player[]) => {
    set({ players });
  },

  addPlayer: (player: Player) => {
    set((state) => ({
      players: [...state.players, player],
    }));
  },

  removePlayer: (playerId: string) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    }));
  },

  setMyPlayerId: (id: string) => {
    set({ myPlayerId: id });
  },

  updateSettings: (settings) => {
    set({ gameSettings: settings });
    if (get().isHost) {
      get().broadcast({ type: "settings_update", settings });
    }
  },
}));

function handleData(senderId: string, data: GameEvent, get: () => PeerState) {
  const { isHost, addPlayer, removePlayer, setPlayers, broadcast, onEvent } =
    get();

  // Forward to global listeners (like GameStore)
  if (onEvent) {
    onEvent(data);
  }

  switch (data.type) {
    case "join_request":
      if (isHost) {
        const { players } = get();
        const newPlayer: Player = {
          id: data.playerId,
          name: data.playerName,
          coins: 2,
          cards: [],
          isAlive: true,
          isHost: false,
          order: players.length,
        };

        addPlayer(newPlayer);
        broadcast({ type: "player_joined", player: newPlayer });
        broadcast({ type: "players_update", players: [...get().players] });

        get().sendTo(data.playerId, {
          type: "join_accepted",
          players: get().players,
          isHost: false,
        });
      }
      break;

    case "player_joined":
      addPlayer(data.player);
      break;

    case "player_left":
      removePlayer(data.playerId);
      break;

    case "join_accepted":
      setPlayers(data.players);
      break;

    case "settings_update":
      usePeerStore.setState({ gameSettings: data.settings });
      break;

    case "players_update":
      setPlayers(data.players);
      break;
  }
}
