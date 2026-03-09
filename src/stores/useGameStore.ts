import { create } from 'zustand';
import { GameState, GameAction, ActionResponse, Player, Card, GameEvent } from '@/lib/types';
import { GameEngine } from '@/lib/game-engine';
import { v4 as uuidv4 } from 'uuid';

interface GameStoreState {
  gameState: GameState | null;
  gameEngine: GameEngine | null;
  isMyTurn: boolean;
  showActionModal: boolean;
  showCounterModal: boolean;
  showGuessModal: boolean;
  showInspectorModal: boolean;
  showTargetSelector: boolean;
  showGameOverModal: boolean;
  selectedTargetId: string | null;
  selectedCharacter: string | null;
  timeLeft: number | null;
  inspectorResult: { playerName: string; character: string } | null;
  winner: Player | null;

  initGame: (players: Player[]) => void;
  setGameEngine: (engine: GameEngine) => void;
  updateGameState: (state: GameState) => void;
  setMyTurn: (isMyTurn: boolean) => void;
  setShowActionModal: (show: boolean) => void;
  setShowCounterModal: (show: boolean) => void;
  setShowGuessModal: (show: boolean) => void;
  setShowInspectorModal: (show: boolean) => void;
  setShowTargetSelector: (show: boolean) => void;
  setShowGameOverModal: (show: boolean) => void;
  setSelectedTargetId: (id: string | null) => void;
  setSelectedCharacter: (character: string | null) => void;
  setTimeLeft: (time: number | null) => void;
  setInspectorResult: (result: { playerName: string; character: string } | null) => void;
  setWinner: (player: Player | null) => void;
  createAction: (type: string, targetId?: string, claimedCharacter?: string) => GameAction;
  respondToAction: (response: ActionResponse) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: null,
  gameEngine: null,
  isMyTurn: false,
  showActionModal: false,
  showCounterModal: false,
  showGuessModal: false,
  showInspectorModal: false,
  showTargetSelector: false,
  showGameOverModal: false,
  selectedTargetId: null,
  selectedCharacter: null,
  timeLeft: null,
  inspectorResult: null,
  winner: null,

  initGame: (players: Player[]) => {
    const callbacks = {
      broadcast: (data: GameEvent) => {
        console.log('[Host Broadcast]', data);
      },
      sendTo: (playerId: string, data: GameEvent) => {
        console.log('[Host to ' + playerId + ']', data);
      },
    };

    const gameState = GameEngine.createInitialState(players);
    const engine = new GameEngine(gameState, callbacks);

    set({
      gameState,
      gameEngine: engine,
      isMyTurn: false,
      showActionModal: false,
      showCounterModal: false,
      showGuessModal: false,
      showInspectorModal: false,
      showTargetSelector: false,
      showGameOverModal: false,
      selectedTargetId: null,
      selectedCharacter: null,
      timeLeft: null,
      inspectorResult: null,
      winner: null,
    });
  },

  setGameEngine: (engine: GameEngine) => {
    set({ gameEngine: engine });
  },

  updateGameState: (state: GameState) => {
    const { gameEngine } = get();
    if (gameEngine) {
      gameEngine.setState(state);
    }
    set({ gameState: state });
  },

  setMyTurn: (isMyTurn: boolean) => {
    set({ isMyTurn });
  },

  setShowActionModal: (show: boolean) => {
    set({ showActionModal: show });
  },

  setShowCounterModal: (show: boolean) => {
    set({ showCounterModal: show });
  },

  setShowGuessModal: (show: boolean) => {
    set({ showGuessModal: show });
  },

  setShowInspectorModal: (show: boolean) => {
    set({ showInspectorModal: show });
  },

  setShowTargetSelector: (show: boolean) => {
    set({ showTargetSelector: show });
  },

  setShowGameOverModal: (show: boolean) => {
    set({ showGameOverModal: show });
  },

  setSelectedTargetId: (id: string | null) => {
    set({ selectedTargetId: id });
  },

  setSelectedCharacter: (character: string | null) => {
    set({ selectedCharacter: character });
  },

  setTimeLeft: (time: number | null) => {
    set({ timeLeft: time });
  },

  setInspectorResult: (result: { playerName: string; character: string } | null) => {
    set({ inspectorResult: result });
  },

  setWinner: (player: Player | null) => {
    set({ winner: player, showGameOverModal: player !== null });
  },

  createAction: (type: string, targetId?: string, claimedCharacter?: string) => {
    const { gameState } = get();
    const currentPlayerId = gameState?.currentPlayerId;
    
    return {
      id: uuidv4(),
      playerId: currentPlayerId || '',
      type: type as GameAction['type'],
      targetId,
      claimedCharacter: claimedCharacter as any,
      timestamp: Date.now(),
      status: 'pending' as const,
      responses: [],
    };
  },

  respondToAction: (response: ActionResponse) => {
    const { gameEngine } = get();
    if (gameEngine) {
      gameEngine.processResponse(response);
    }
  },

  reset: () => {
    set({
      gameState: null,
      gameEngine: null,
      isMyTurn: false,
      showActionModal: false,
      showCounterModal: false,
      showGuessModal: false,
      showInspectorModal: false,
      showTargetSelector: false,
      showGameOverModal: false,
      selectedTargetId: null,
      selectedCharacter: null,
      timeLeft: null,
      inspectorResult: null,
      winner: null,
    });
  },
}));
