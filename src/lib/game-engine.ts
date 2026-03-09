import {
  GameState,
  GameAction,
  ActionResponse,
  Player,
  Card,
  CharacterType,
  GameEvent,
  GameSettings,
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

    if (this.state.settings.timerDuration > 0) {
      this.state.actionTimer = this.state.settings.timerDuration;
      this.startResponseTimer();
    } else {
      this.state.actionTimer = null;
    }

    this.callbacks.broadcast({
      type: "action_proposed",
      action,
    });
  }

  processResponse(response: ActionResponse): void {
    if (!this.state.pendingAction) return;

    // Check if player already responded in this phase (prevent duplicate passes)
    if (response.playerId !== "system") {
      const alreadyResponded = this.state.pendingAction.responses.some(
        (r) => r.playerId === response.playerId,
      );
      if (alreadyResponded) return;
    }

    this.state.pendingAction.responses.push(response);

    const alivePlayers = this.state.players.filter((p) => p.isAlive);
    const otherPlayersCount = alivePlayers.length - 1;

    // Instant resolution: Counter
    if (
      response.type === "counter" &&
      this.state.pendingAction.status === "pending"
    ) {
      this.state.pendingAction.status = "counter_phase";
      this.state.pendingAction.counteredBy = response.playerId;
      this.state.pendingAction.counterCharacter = response.characterUsed;
      // Reset responses for the counter phase challenges
      this.state.pendingAction.responses = [];

      if (this.state.settings.timerDuration > 0) {
        this.state.actionTimer = this.state.settings.timerDuration;
        this.startResponseTimer();
      } else {
        this.state.actionTimer = null;
      }

      this.callbacks.broadcast({
        type: "state_update",
        gameState: this.state,
      });
      return;
    }

    // Instant resolution: Call Bluff (Lying!)
    if (response.type === "call_bluff") {
      if (this.state.pendingAction.status === "counter_phase") {
        this.resolveCounterBluff(this.state.pendingAction, response.playerId);
      } else if (this.state.pendingAction.status === "fisc_phase") {
        if (response.targetId) {
          this.resolveFiscBluff(
            this.state.pendingAction,
            response.playerId,
            response.targetId,
          );
        }
      } else {
        this.resolveBluff(this.state.pendingAction, response.playerId);
      }
      return;
    }

    // Handle Pass or Timeout or take_one_as_fisc
    if (
      response.type === "pass" ||
      response.type === "take_one_as_fisc" ||
      response.playerId === "system"
    ) {
      if (this.state.pendingAction.status === "fisc_phase") {
        const fiscClaimants = this.state.pendingAction.responses
          .filter((r) => r.type === "take_one_as_fisc")
          .map((r) => r.playerId);

        const requiredPlayers = this.state.players.filter(
          (p) => p.isAlive && !fiscClaimants.includes(p.id),
        );

        const fiscPasses = this.state.pendingAction.responses.filter(
          (r) =>
            r.type === "pass" &&
            requiredPlayers.some((p) => p.id === r.playerId),
        );

        if (
          fiscPasses.length >= requiredPlayers.length ||
          response.playerId === "system"
        ) {
          this.resolveCurrentAction();
        } else {
          this.callbacks.broadcast({
            type: "state_update",
            gameState: this.state,
          });
        }
        return;
      }

      const otherResponded = this.state.pendingAction.responses.filter(
        (r) =>
          r.type === "pass" ||
          r.type === "take_one_as_fisc" ||
          r.playerId === "system",
      );

      // Check if everyone passed/responded
      if (
        otherResponded.length >= otherPlayersCount ||
        response.playerId === "system"
      ) {
        if (this.state.pendingAction.status === "counter_phase") {
          // Blocked by everyone passing on the counter
          this.state.pendingAction.status = "blocked";
          this.callbacks.broadcast({
            type: "action_resolved",
            action: this.state.pendingAction,
            gameState: this.state,
          });

          this.state.pendingAction = null;
          this.state.actionTimer = null;
          this.clearTimer();

          this.callbacks.broadcast({
            type: "state_update",
            gameState: this.state,
          });
        } else if (
          this.state.pendingAction.type === "take_4_coins" &&
          this.state.pendingAction.responses.some(
            (r) => r.type === "take_one_as_fisc",
          )
        ) {
          // Transition to fisc_phase
          this.state.pendingAction.status = "fisc_phase";
          // Remove old passes and system responses, keep take_one_as_fisc
          this.state.pendingAction.responses =
            this.state.pendingAction.responses.filter(
              (r) => r.type === "take_one_as_fisc",
            );

          if (this.state.settings.timerDuration > 0) {
            this.state.actionTimer = this.state.settings.timerDuration;
            this.startResponseTimer();
          } else {
            this.state.actionTimer = null;
          }

          this.callbacks.broadcast({
            type: "state_update",
            gameState: this.state,
          });
        } else {
          // Success! Everyone passed on initial action
          this.resolveCurrentAction();
        }
      } else {
        // Just Update state to show who has responded
        this.callbacks.broadcast({
          type: "state_update",
          gameState: this.state,
        });
      }
    }
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

      // Clear pending action and end turn (one player clicked lying)
      this.state.pendingAction = null;
      this.state.actionTimer = null;
      this.clearTimer();
      this.endTurn();
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

      // Action proceeds to resolution
      this.resolveCurrentAction();
    }
  }

  private resolveCounterBluff(action: GameAction, callerId: string): void {
    const blockerId = action.counteredBy;
    const blocker = this.state.players.find((p) => p.id === blockerId);
    const caller = this.state.players.find((p) => p.id === callerId);

    if (!blocker || !caller || !action.counterCharacter) {
      this.resolveCurrentAction();
      return;
    }

    const isActuallyBluff = !blocker.cards.some(
      (c) => c.character === action.counterCharacter,
    );

    if (isActuallyBluff) {
      if (blocker.cards.length > 0) {
        const lostCard = blocker.cards.shift()!;
        this.state.deck.push({
          ...lostCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      caller.coins += 3;
      this.resolveCurrentAction();
    } else {
      if (caller.cards.length > 0) {
        const lostCard = caller.cards.shift()!;
        this.state.deck.push({
          ...lostCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      blocker.coins += 2;

      // Changed card for blocker
      if (blocker.cards.length > 0) {
        const changedCard = blocker.cards.shift()!;
        this.state.deck.push({
          ...changedCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      if (this.state.deck.length > 0) {
        this.state.deck = shuffle(this.state.deck);
        const newCard = this.state.deck.shift()!;
        blocker.cards.push(newCard);
      }

      action.status = "blocked";
      this.callbacks.broadcast({
        type: "action_resolved",
        action: action,
        gameState: this.state,
      });

      // Stay on current player's turn as per user requirements
      this.state.pendingAction = null;
      this.state.actionTimer = null;
      this.clearTimer();

      this.callbacks.broadcast({
        type: "state_update",
        gameState: this.state,
      });
    }
  }

  private resolveFiscBluff(
    action: GameAction,
    callerId: string,
    fiscPlayerId: string,
  ): void {
    const fiscPlayer = this.state.players.find((p) => p.id === fiscPlayerId);
    const caller = this.state.players.find((p) => p.id === callerId);

    if (!fiscPlayer || !caller) {
      return;
    }

    const isActuallyBluff = !fiscPlayer.cards.some(
      (c) => c.character === "fisc",
    );

    if (isActuallyBluff) {
      // Fisc player was lying
      if (fiscPlayer.cards.length > 0) {
        const lostCard = fiscPlayer.cards.shift()!;
        this.state.deck.push({
          ...lostCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      caller.coins += 3;

      // Remove the fisc claim from responses so they don't take coins later
      action.responses = action.responses.filter(
        (r) => !(r.playerId === fiscPlayerId && r.type === "take_one_as_fisc"),
      );

      // If no more fiscs left, resolve
      if (!action.responses.some((r) => r.type === "take_one_as_fisc")) {
        this.resolveCurrentAction();
        return;
      }
    } else {
      // Fisc player was telling the truth
      if (caller.cards.length > 0) {
        const lostCard = caller.cards.shift()!;
        this.state.deck.push({
          ...lostCard,
          isRevealed: false,
          isKnown: false,
        });
      }
      fiscPlayer.coins += 2;

      // Replace the fisc player's card
      const cardIndex = fiscPlayer.cards.findIndex(
        (c) => c.character === "fisc",
      );
      if (cardIndex !== -1) {
        const oldCard = fiscPlayer.cards.splice(cardIndex, 1)[0];
        this.state.deck.push({ ...oldCard, isRevealed: false, isKnown: false });
        this.state.deck = shuffle(this.state.deck);
        fiscPlayer.cards.push(this.state.deck.shift()!);
      }
    }

    this.callbacks.broadcast({
      type: "state_update",
      gameState: this.state,
    });
  }

  private resolveCurrentAction(): void {
    if (!this.state.pendingAction) return;

    const action = this.state.pendingAction;
    action.status = "resolved";
    this.state.lastAction = action;

    // Handle Businessman penalty (Fisc taking 1 coin)
    if (action.type === "take_4_coins") {
      const fiscResponses = action.responses.filter(
        (r) => r.type === "take_one_as_fisc",
      );
      const businessman = this.state.players.find(
        (p) => p.id === action.playerId,
      );
      if (businessman) {
        for (const resp of fiscResponses) {
          const fiscPlayer = this.state.players.find(
            (p) => p.id === resp.playerId,
          );
          if (fiscPlayer && businessman.coins >= 1) {
            businessman.coins -= 1;
            fiscPlayer.coins += 1;
          }
        }
      }
    }

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

  static createInitialState(
    players: Player[],
    settings: GameSettings = { timerDuration: 10 },
  ): GameState {
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
      settings,
    };
  }
}
