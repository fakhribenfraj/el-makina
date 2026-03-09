export type CharacterType =
  | "policeman"
  | "politician"
  | "businessman"
  | "fisc"
  | "terrorist"
  | "colonel"
  | "thief";

export type ActionType =
  | "take_1_coin"
  | "take_2_coins"
  | "take_4_coins"
  | "steal_2_coins"
  | "take_1_coin_fisc"
  | "kill_terrorist"
  | "kill_7_coins"
  | "inspect_policeman"
  | "guess_colonel"
  | "exchange_politician"
  | "bluff";

export type ResponseType = "pass" | "counter" | "call_bluff";

export type ActionStatus = "pending" | "counter_phase" | "resolved" | "blocked";

export type RoomStatus = "idle" | "waiting" | "playing" | "finished";

export interface Card {
  id: string;
  character: CharacterType;
  isRevealed: boolean;
  isKnown: boolean;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  cards: Card[];
  isAlive: boolean;
  isHost: boolean;
  order: number;
}

export interface GameAction {
  id: string;
  playerId: string;
  type: ActionType;
  targetId?: string;
  claimedCharacter?: CharacterType;
  timestamp: number;
  status: ActionStatus;
  responses: ActionResponse[];
  counteredBy?: string;
  counterCharacter?: CharacterType;
}

export interface ActionResponse {
  playerId: string;
  type: ResponseType;
  characterUsed?: CharacterType;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  currentTurnIndex: number;
  currentPlayerId: string | null;
  pendingAction: GameAction | null;
  actionTimer: number | null;
  winner: Player | null;
  lastAction: GameAction | null;
}

export interface GameRoom {
  code: string;
  hostId: string;
  players: Player[];
  status: RoomStatus;
  createdAt: number;
}

export type GameEvent =
  | { type: "player_joined"; player: Player }
  | { type: "player_left"; playerId: string }
  | { type: "players_update"; players: Player[] }
  | { type: "game_started"; gameState: GameState }
  | { type: "turn_changed"; playerId: string; turnIndex: number }
  | { type: "action_proposed"; action: GameAction }
  | { type: "action_responded"; response: ActionResponse }
  | { type: "action_resolved"; action: GameAction; gameState: GameState }
  | { type: "state_update"; gameState: GameState }
  | { type: "game_over"; winner: Player }
  | { type: "join_request"; playerName: string; playerId: string }
  | {
      type: "join_accepted";
      players: Player[];
      isHost: boolean;
      gameState?: GameState;
    }
  | { type: "join_rejected"; reason: string }
  | { type: "action_rejected"; reason: string }
  | { type: "timer_tick"; timeLeft: number }
  | { type: "room_closed" };

export interface CharacterDefinition {
  name: string;
  icon: string;
  description: string;
  color: string;
}
