import {
  GameState,
  GameAction,
  ActionResponse,
  Player,
  Card,
  CharacterType,
  GameEvent,
} from "./types";
import {
  resolveAction,
  checkWinner,
  getNextAlivePlayer,
  createDeck,
  hidePrivateData,
} from "./abilities";
import { shuffle } from "./utils";
import { CHARACTER_LIST } from "./characters";
import { v4 as uuidv4 } from "uuid";

export interface HostCallbacks {
  broadcast: (data: GameEvent) => void;
  sendTo: (playerId: string, data: GameEvent) => void;
}

export class GameEngine {
  private state: GameState;
  private callbacks: HostCallbacks;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(initialState: GameState, callbacks: HostCallbacks) {
    this.state = initialState;
    this.callbacks = callbacks;
  }

  getState(): GameState {
    return this.state;
  }

  setState(state: GameState): void {
    this.state = state;
  }

  processAction(action: GameAction): void {
    const player = this.state.players.find((p) => p.id === action.playerId);
    if (!player) return;

    action.status = "pending";
    this.state.pendingAction = action;
    this.state.actionTimer = 10;

    this.callbacks.broadcast({
      type: "action_proposed",
      action,
    });

    this.startResponseTimer();
  }

  processResponse(response: ActionResponse): void {
    if (!this.state.pendingAction) return;

    this.state.pendingAction.responses.push(response);

    if (response.type === "counter") {
      const responder = this.state.players.find(
        (p) => p.id === response.playerId,
      );
      if (responder) {
        const canCounter = this.checkCounter(
          responder,
          this.state.pendingAction,
        );
        if (canCounter) {
          this.state.pendingAction.status = "blocked";
          this.callbacks.broadcast({
            type: "action_resolved",
            action: this.state.pendingAction,
            gameState: this.state,
          });
          this.endTurn();
          return;
        }
      }
    }

    if (response.type === "call_bluff") {
      this.resolveBluff(this.state.pendingAction, response.playerId);
      return;
    }

    this.resolveCurrentAction();
  }

  private checkCounter(responder: Player, action: GameAction): boolean {
    if (!responder.cards || responder.cards.length === 0) return false;

    const counterMappings: Record<CharacterType, string[]> = {
      policeman: ["inspect_policeman"],
      politician: [],
      businessman: [],
      fisc: ["take_2_coins"],
      terrorist: [],
      colonel: ["kill_terrorist"],
      thief: ["steal_2_coins"],
    };

    for (const card of responder.cards) {
      const canCounterActions = counterMappings[card.character];
      if (canCounterActions && canCounterActions.includes(action.type)) {
        return true;
      }
    }
    return false;
  }

  private resolveBluff(action: GameAction, callerId: string): void {
    const bluffer = this.state.players.find((p) => p.id === action.playerId);
    const caller = this.state.players.find((p) => p.id === callerId);

    if (!bluffer || !caller) {
      this.resolveCurrentAction();
      return;
    }

    const isActuallyBluff = !bluffer.cards.some(
      (c) => c.character === action.claimedCharacter,
    );

    if (isActuallyBluff) {
      if (bluffer.cards.length > 0) {
        const lostCard = bluffer.cards.shift()!;
        this.state.deck.push({
          ...lostCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      caller.coins += 3;
    } else {
      if (caller.cards.length > 0) {
        const lostCard = caller.cards.shift()!;
        this.state.deck.push({
          ...lostCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      bluffer.coins += 2;
      if (bluffer.cards.length > 0) {
        const changedCard = bluffer.cards.shift()!;
        changedCard.isRevealed = true;
        changedCard.isKnown = true;
        this.state.deck.push(changedCard);
      }
      if (this.state.deck.length > 0) {
        const newCard = this.state.deck.shift()!;
        newCard.isRevealed = false;
        newCard.isKnown = false;
        bluffer.cards.push(newCard);
      }
    }

    this.resolveCurrentAction();
  }

  private resolveCurrentAction(): void {
    if (!this.state.pendingAction) return;

    const action = this.state.pendingAction;
    action.status = "resolved";
    this.state.lastAction = action;

    this.state = resolveAction(action, this.state);

    const winner = checkWinner(this.state);
    if (winner) {
      this.callbacks.broadcast({
        type: "game_over",
        winner,
      });
      this.state.winner = winner;
      return;
    }

    this.callbacks.broadcast({
      type: "action_resolved",
      action,
      gameState: this.state,
    });

    this.endTurn();
  }

  private endTurn(): void {
    this.clearTimer();

    const nextPlayerId = getNextAlivePlayer(this.state);
    if (!nextPlayerId) return;

    const nextIndex = this.state.players.findIndex(
      (p) => p.id === nextPlayerId,
    );
    this.state.currentTurnIndex = nextIndex;
    this.state.currentPlayerId = nextPlayerId;
    this.state.pendingAction = null;
    this.state.actionTimer = null;

    this.callbacks.broadcast({
      type: "turn_changed",
      playerId: nextPlayerId,
      turnIndex: nextIndex,
    });

    this.callbacks.broadcast({
      type: "state_update",
      gameState: this.state,
    });
  }

  private startResponseTimer(): void {
    this.clearTimer();

    this.timerInterval = setInterval(() => {
      if (this.state.actionTimer === null) {
        this.clearTimer();
        return;
      }

      this.state.actionTimer -= 1;

      this.callbacks.broadcast({
        type: "timer_tick",
        timeLeft: this.state.actionTimer,
      });

      if (this.state.actionTimer <= 0) {
        this.clearTimer();
        this.processResponse({
          playerId: "system",
          type: "pass",
          timestamp: Date.now(),
        });
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  static createInitialState(players: Player[]): GameState {
    const orderedPlayers = [...players].sort((a, b) => a.order - b.order);

    let cardsPerPlayer = 3;
    if (players.length > 4) {
      cardsPerPlayer = 2;
    }

    let deck = createDeck(CHARACTER_LIST);
    deck = shuffle(deck);

    for (const player of orderedPlayers) {
      player.coins = 2;
      player.cards = [];
      player.isAlive = true;
      for (let i = 0; i < cardsPerPlayer && deck.length > 0; i++) {
        const card = deck.shift()!;
        player.cards.push(card);
      }
    }

    const firstAliveIndex = orderedPlayers.findIndex((p) => p.isAlive);

    return {
      players: orderedPlayers,
      deck,
      currentTurnIndex: firstAliveIndex >= 0 ? firstAliveIndex : 0,
      currentPlayerId:
        orderedPlayers[firstAliveIndex >= 0 ? firstAliveIndex : 0]?.id || null,
      pendingAction: null,
      actionTimer: null,
      winner: null,
      lastAction: null,
    };
  }
}
