import { v4 as uuidv4 } from "uuid";
import { Card, Role, ALL_ROLES, GameState, Player, LogEntry } from "./types";

// ─── Deck Creation ───────────────────────────────────────────────────
export function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const role of ALL_ROLES) {
    for (let i = 0; i < 3; i++) {
      cards.push({ id: uuidv4(), role });
    }
  }
  return shuffleDeck(cards);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Draw Cards ──────────────────────────────────────────────────────
export function drawCards(
  deck: Card[],
  count: number,
): { drawn: Card[]; remaining: Card[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

// ─── Create Log Entry ────────────────────────────────────────────────
export function createLog(
  message: string,
  type: LogEntry["type"] = "action",
): LogEntry {
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    message,
    type,
  };
}

// ─── Initial Game State ──────────────────────────────────────────────
export function createInitialGameState(hostId: string): GameState {
  return {
    phase: "lobby",
    players: [],
    deck: createDeck(),
    discardPile: [],
    logs: [createLog("Game created. Waiting for players...", "system")],
    currentTurnIndex: 0,
    hostId,
  };
}

// ─── Add Player ──────────────────────────────────────────────────────
export function addPlayer(
  state: GameState,
  peerId: string,
  name: string,
): GameState {
  if (state.players.find((p) => p.id === peerId)) return state;

  const newPlayer: Player = {
    id: peerId,
    name,
    cards: [],
    coins: 2,
    isAlive: true,
    isProtected: false,
  };

  return {
    ...state,
    players: [...state.players, newPlayer],
    logs: [...state.logs, createLog(`${name} joined the game`, "system")],
  };
}

// ─── Start Game ──────────────────────────────────────────────────────
export function startGame(state: GameState): GameState {
  let deck = [...state.deck];
  const players = state.players.map((player) => {
    const { drawn, remaining } = drawCards(deck, 2);
    deck = remaining;
    return { ...player, cards: drawn };
  });

  return {
    ...state,
    phase: "playing",
    deck,
    players,
    logs: [
      ...state.logs,
      createLog("Game started! Each player received 2 cards.", "system"),
    ],
  };
}

// ─── Game Actions ────────────────────────────────────────────────────
export function addCoin(state: GameState, playerId: string): GameState {
  return updatePlayer(state, playerId, (p) => ({
    ...p,
    coins: Math.min(10, p.coins + 1),
  }));
}

export function removeCoin(state: GameState, playerId: string): GameState {
  return updatePlayer(state, playerId, (p) => ({
    ...p,
    coins: Math.max(0, p.coins - 1),
  }));
}

export function drawCard(state: GameState, playerId: string): GameState {
  if (state.deck.length === 0) return state;
  const { drawn, remaining } = drawCards(state.deck, 1);
  const newState = {
    ...state,
    deck: remaining,
  };
  const player = state.players.find((p) => p.id === playerId);
  return {
    ...updatePlayer(newState, playerId, (p) => ({
      ...p,
      cards: [...p.cards, ...drawn],
    })),
    logs: [
      ...state.logs,
      createLog(`${player?.name || "Unknown"} drew a card`),
    ],
  };
}

export function discardCard(
  state: GameState,
  playerId: string,
  cardId: string,
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const card = player.cards.find((c) => c.id === cardId);
  if (!card) return state;

  const newState = updatePlayer(state, playerId, (p) => ({
    ...p,
    cards: p.cards.filter((c) => c.id !== cardId),
  }));

  return {
    ...newState,
    discardPile: [...state.discardPile, card],
    logs: [...state.logs, createLog(`${player.name} discarded a card`)],
  };
}

// ─── Policeman Actions ───────────────────────────────────────────────
export function getInspectResult(
  state: GameState,
  targetId: string,
): Card | null {
  const target = state.players.find((p) => p.id === targetId);
  if (!target || target.cards.length === 0) return null;
  if (target.isProtected) return null;
  // Return first card for inspection
  return target.cards[0];
}

export function forceSwap(
  state: GameState,
  inspectorId: string,
  targetId: string,
  cardId: string,
): GameState {
  const target = state.players.find((p) => p.id === targetId);
  const inspector = state.players.find((p) => p.id === inspectorId);
  if (!target || !inspector) return state;

  const card = target.cards.find((c) => c.id === cardId);
  if (!card) return state;
  if (state.deck.length === 0) return state;

  const { drawn, remaining } = drawCards(state.deck, 1);

  let newState: GameState = {
    ...state,
    deck: remaining,
    discardPile: [...state.discardPile, card],
  };

  newState = updatePlayer(newState, targetId, (p) => ({
    ...p,
    cards: [...p.cards.filter((c) => c.id !== cardId), ...drawn],
  }));

  return {
    ...newState,
    logs: [
      ...state.logs,
      createLog(
        `${inspector.name} inspected ${target.name} and forced a card swap`,
        "inspect",
      ),
    ],
  };
}

export function toggleProtection(
  state: GameState,
  playerId: string,
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  return {
    ...updatePlayer(state, playerId, (p) => ({
      ...p,
      isProtected: !p.isProtected,
    })),
    logs: [
      ...state.logs,
      createLog(
        `${player?.name || "Unknown"} ${
          player?.isProtected ? "disabled" : "enabled"
        } Policeman protection`,
        "action",
      ),
    ],
  };
}

// ─── Utility ─────────────────────────────────────────────────────────
function updatePlayer(
  state: GameState,
  playerId: string,
  updater: (player: Player) => Player,
): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? updater(p) : p)),
  };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  const player = state.players.find((p) => p.id === playerId);
  return {
    ...state,
    players: state.players.filter((p) => p.id !== playerId),
    logs: [
      ...state.logs,
      createLog(`${player?.name || "Unknown"} left the game`, "system"),
    ],
  };
}

// ─── Role Helpers ────────────────────────────────────────────────────
export function playerHasRole(player: Player, role: Role): boolean {
  return player.cards.some((c) => c.role === role);
}
