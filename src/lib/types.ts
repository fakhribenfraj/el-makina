// ─── Card Roles ──────────────────────────────────────────────────────
export type Role =
  | "Policeman"
  | "Politician"
  | "Businesswoman"
  | "Fisc"
  | "Terrorist"
  | "Colonel"
  | "Thief";

export const ALL_ROLES: Role[] = [
  "Policeman",
  "Politician",
  "Businesswoman",
  "Fisc",
  "Terrorist",
  "Colonel",
  "Thief",
];

export const ROLE_EMOJI: Record<Role, string> = {
  Policeman: "🛡️",
  Politician: "🏛️",
  Businesswoman: "💼",
  Fisc: "📋",
  Terrorist: "💣",
  Colonel: "⭐",
  Thief: "🗝️",
};

export const ROLE_COLOR: Record<Role, string> = {
  Policeman: "#3b82f6", // blue
  Politician: "#8b5cf6", // purple
  Businesswoman: "#f59e0b", // amber
  Fisc: "#10b981", // emerald
  Terrorist: "#ef4444", // red
  Colonel: "#f97316", // orange
  Thief: "#6366f1", // indigo
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  Policeman:
    "Inspect another player's card. Can swap it for a new one from the deck. Blocks other Policemen.",
  Politician: "Change your hand with new cards from the deck.",
  Businesswoman: "Take 4 coins.",
  Fisc: "Tax players: take 1 coin from anyone with 7+ coins. Stops others from taking 2 coins.",
  Terrorist: "Kill a player (cost: 3 coins).",
  Colonel:
    "Spend 4 coins to guess a card; if correct, they lose it; if wrong, they gain 4 coins. Blocks Terrorist.",
  Thief: "Steal 2 coins from another player. Blocks other Thieves.",
};

// ─── Card ────────────────────────────────────────────────────────────
export interface Card {
  id: string;
  role: Role;
}

// ─── Player ──────────────────────────────────────────────────────────
export interface Player {
  id: string; // peerId
  name: string;
  cards: Card[];
  coins: number;
  isAlive: boolean;
  isProtected: boolean; // Policeman protection toggle
}

// ─── Game State ──────────────────────────────────────────────────────
export type GamePhase = "lobby" | "playing" | "finished";

export interface GameState {
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  logs: LogEntry[];
  currentTurnIndex: number;
  hostId: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: "action" | "system" | "inspect";
}

// ─── Peer Messages ───────────────────────────────────────────────────
export type PeerMessageType =
  | "STATE_UPDATE"
  | "JOIN_REQUEST"
  | "JOIN_ACCEPTED"
  | "INSPECT_RESULT"
  | "ACTION_REQUEST"
  | "PLAYER_NAME";

export interface PeerMessage {
  type: PeerMessageType;
  payload: unknown;
}

export interface JoinRequestPayload {
  peerId: string;
  name: string;
}

export interface InspectResultPayload {
  targetId: string;
  targetName: string;
  card: Card;
}

export interface ActionRequestPayload {
  action: GameAction;
  playerId: string;
  targetId?: string;
  data?: unknown;
}

export type GameAction =
  | "ADD_COIN"
  | "REMOVE_COIN"
  | "DRAW_CARD"
  | "DISCARD_CARD"
  | "INSPECT"
  | "FORCE_SWAP"
  | "KEEP_CARD"
  | "TOGGLE_PROTECTION";
