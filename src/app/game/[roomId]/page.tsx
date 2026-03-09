"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePeerStore } from "@/stores/usePeerStore";
import { useGameStore } from "@/stores/useGameStore";
import { PlayerBar } from "@/components/game/PlayerBar";
import { Hand } from "@/components/game/Hand";
import { ActionMenu } from "@/components/game/ActionMenu";
import { ActionNotification } from "@/components/game/ActionNotification";
import { TargetSelector } from "@/components/game/TargetSelector";
import { GuessModal } from "@/components/game/GuessModal";
import { InspectorModal } from "@/components/game/InspectorModal";
import { GameOverModal } from "@/components/game/GameOverModal";
import { CoinDisplay } from "@/components/ui/CoinDisplay";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import {
  ActionType,
  CharacterType,
  GameEvent,
  Player,
  ActionResponse,
} from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomId as string;

  const {
    myPlayerId,
    isHost,
    broadcast,
    connections,
    roomCode: storeRoomCode,
    setOnEvent,
  } = usePeerStore();

  const {
    gameState,
    gameEngine,
    isMyTurn,
    showActionModal,
    showCounterModal,
    showGuessModal,
    showInspectorModal,
    showTargetSelector,
    showGameOverModal,
    selectedTargetId,
    selectedCharacter,
    timeLeft,
    inspectorResult,
    winner,
    updateGameState,
    setMyTurn,
    setShowTargetSelector,
    setShowGuessModal,
    setShowInspectorModal,
    setShowGameOverModal,
    setSelectedTargetId,
    setSelectedCharacter,
    setTimeLeft,
    setInspectorResult,
    setWinner,
    reset,
  } = useGameStore();

  useEffect(() => {
    const handleEvent = (event: GameEvent) => {
      switch (event.type) {
        case "action_proposed":
          if (isHost && gameEngine) {
            // Guard: Host shouldn't process its own actions (already handled in sendAction)
            // Or re-process guest actions it's already working on
            if (
              event.action.playerId === myPlayerId ||
              gameEngine.getState().pendingAction?.id === event.action.id
            ) {
              return;
            }
            gameEngine.processAction(event.action);
            const newState = gameEngine.getState();
            updateGameState(newState);
            broadcast({ type: "state_update", gameState: newState });
          }
          break;
        case "action_responded":
          if (isHost && gameEngine) {
            const currentPending = gameEngine.getState().pendingAction;
            if (!currentPending) return;

            // Guard: Don't re-process duplicate responses
            const alreadyProcessed = currentPending.responses.some(
              (r) =>
                r.playerId === event.response.playerId &&
                r.type === event.response.type &&
                r.timestamp === event.response.timestamp,
            );
            if (alreadyProcessed) return;

            gameEngine.processResponse(event.response);
            const newState = gameEngine.getState();
            updateGameState(newState);
            broadcast({ type: "state_update", gameState: newState });
          }
          break;
        case "state_update":
        case "action_resolved":
          if (event.gameState) {
            updateGameState(event.gameState);
            if (!event.gameState.pendingAction) {
              setTimeLeft(null);
            }
          }
          break;
        case "timer_tick":
          if (event.timeLeft !== undefined) setTimeLeft(event.timeLeft);
          break;
        case "game_over":
          setWinner(event.winner);
          setShowGameOverModal(true);
          break;
      }
    };

    setOnEvent(handleEvent);
    return () => setOnEvent(() => {});
  }, [
    isHost,
    myPlayerId,
    gameEngine,
    broadcast,
    setOnEvent,
    updateGameState,
    setTimeLeft,
    setWinner,
    setShowGameOverModal,
  ]);

  const [pendingAction, setPendingAction] = useState<{
    type: ActionType;
    claimedCharacter?: CharacterType;
  } | null>(null);

  useEffect(() => {
    if (!storeRoomCode) {
      router.push("/");
    }
  }, [storeRoomCode, router]);

  useEffect(() => {
    if (!gameState || !myPlayerId) return;

    const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
    const currentPlayer = gameState.players[gameState.currentTurnIndex];

    setMyTurn(currentPlayer?.id === myPlayerId && !gameState.pendingAction);
  }, [gameState, myPlayerId, setMyTurn]);

  const handleActionSelect = (
    action: ActionType,
    targetId?: string,
    claimedCharacter?: string,
  ) => {
    if (!gameState || !myPlayerId) return;

    const currentPlayer = gameState.players.find((p) => p.id === myPlayerId);
    if (!currentPlayer) return;

    const needsTarget = [
      "steal_2_coins",
      "take_1_coin_fisc",
      "kill_terrorist",
      "kill_7_coins",
      "inspect_policeman",
      "guess_colonel",
    ].includes(action);

    if (needsTarget && !targetId) {
      setPendingAction({
        type: action,
        claimedCharacter: claimedCharacter as CharacterType,
      });
      setShowTargetSelector(true);
      return;
    }

    if (action === "guess_colonel" && !claimedCharacter) {
      setPendingAction({ type: action });
      setShowGuessModal(true);
      return;
    }

    sendAction(action, targetId, claimedCharacter as CharacterType);
  };

  const sendAction = (
    action: ActionType,
    targetId?: string,
    claimedCharacter?: CharacterType,
  ) => {
    if (!myPlayerId) return;

    const actionData: GameEvent = {
      type: isHost ? "action_proposed" : "action_proposed",
      action: {
        id: uuidv4(),
        playerId: myPlayerId,
        type: action,
        targetId,
        claimedCharacter,
        timestamp: Date.now(),
        status: "pending",
        responses: [],
      },
    };

    if (isHost && gameEngine) {
      gameEngine.processAction(actionData.action);
      const newState = gameEngine.getState();
      updateGameState(newState);
      broadcast({ type: "state_update", gameState: newState });
    } else {
      broadcast(actionData);
    }

    setPendingAction(null);
    setShowTargetSelector(false);
    setShowGuessModal(false);
  };

  const handleTargetSelect = (targetId: string) => {
    setSelectedTargetId(targetId);

    if (pendingAction?.type === "guess_colonel") {
      setShowGuessModal(true);
    } else if (pendingAction) {
      sendAction(
        pendingAction.type,
        targetId,
        pendingAction.claimedCharacter as CharacterType | undefined,
      );
    }
  };

  const handleGuessSelect = (character: CharacterType) => {
    sendAction("guess_colonel", selectedTargetId || undefined, character);
    setShowGuessModal(false);
    setSelectedTargetId(null);
  };

  const handleBluffSelect = () => {
    setShowTargetSelector(true);
    setPendingAction({ type: "bluff" });
  };

  const handleCounter = () => {
    const response: ActionResponse = {
      playerId: myPlayerId || "",
      type: "counter" as const,
      timestamp: Date.now(),
    };

    if (isHost && gameEngine) {
      gameEngine.processResponse(response);
      const newState = gameEngine.getState();
      updateGameState(newState);
      broadcast({ type: "state_update", gameState: newState });
    } else {
      broadcast({ type: "action_responded", response });
    }
  };

  const handleCallBluff = () => {
    const response: ActionResponse = {
      playerId: myPlayerId || "",
      type: "call_bluff" as const,
      timestamp: Date.now(),
    };

    if (isHost && gameEngine) {
      gameEngine.processResponse(response);
      const newState = gameEngine.getState();
      updateGameState(newState);
      broadcast({ type: "state_update", gameState: newState });
    } else {
      broadcast({ type: "action_responded", response });
    }
  };

  const handlePass = () => {
    const response: ActionResponse = {
      playerId: myPlayerId || "",
      type: "pass" as const,
      timestamp: Date.now(),
    };

    if (isHost && gameEngine) {
      gameEngine.processResponse(response);
      const newState = gameEngine.getState();
      updateGameState(newState);
      broadcast({ type: "state_update", gameState: newState });
    } else {
      broadcast({ type: "action_responded", response });
    }
  };

  const handlePlayAgain = () => {
    reset();
    router.push("/");
  };

  const handleBackToHome = () => {
    reset();
    usePeerStore.getState().disconnect();
    router.push("/");
  };

  if (!gameState || !myPlayerId) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <p className="text-[#a0a0a0]">Loading game...</p>
      </div>
    );
  }

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const currentPlayer = gameState.players[gameState.currentTurnIndex];

  return (
    <div className="h-dvh bg-[#1a1a2e] flex flex-col p-4 overflow-hidden relative">
      {/* Top: Player Bar */}
      <div className="mb-4">
        <PlayerBar
          players={gameState?.players || []}
          currentPlayerId={currentPlayer?.id || null}
          myPlayerId={myPlayerId || undefined}
        />
      </div>

      {/* Middle: Current player info */}
      <div className="flex-1 flex flex-col items-center justify-start py-8 overflow-y-auto scrollbar-hide">
        {currentPlayer && (
          <div className="text-center mb-4">
            <p className="text-lg text-[#a0a0a0]">
              {currentPlayer.name}'s turn
            </p>
            {(gameState?.actionTimer !== null || timeLeft !== null) && (
              <div className="mt-2">
                <Timer timeLeft={timeLeft ?? gameState?.actionTimer ?? 0} />
              </div>
            )}
          </div>
        )}

        {myPlayer && (
          <>
            <CoinDisplay amount={myPlayer.coins} size="lg" />

            <div className="mt-6 w-full">
              <Hand cards={myPlayer.cards} isMyHand={true} />
            </div>
          </>
        )}
      </div>

      {/* Bottom: Action Menu & Status */}
      {myPlayer && (
        <ActionMenu
          player={myPlayer}
          onActionSelect={handleActionSelect}
          onBluffSelect={handleBluffSelect}
          isMyTurn={isMyTurn}
        />
      )}

      {!isMyTurn && !gameState?.pendingAction && (
        <div className="fixed bottom-20 left-4 right-4 text-center p-3 bg-[#16213e]/80 backdrop-blur-sm rounded-xl border border-[#0f3460] z-20">
          <p className="text-[#a0a0a0] flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Waiting for {currentPlayer?.name}...
          </p>
        </div>
      )}

      {/* Modals */}
      <TargetSelector
        isOpen={showTargetSelector && pendingAction?.type !== "guess_colonel"}
        players={gameState?.players || []}
        excludeId={myPlayerId || undefined}
        title={
          pendingAction?.type === "inspect_policeman"
            ? "Select player to inspect"
            : pendingAction?.type === "steal_2_coins"
              ? "Select player to steal from"
              : pendingAction?.type === "take_1_coin_fisc"
                ? "Select player (7+ coins)"
                : pendingAction?.type === "kill_terrorist" ||
                    pendingAction?.type === "kill_7_coins"
                  ? "Select player to kill"
                  : pendingAction?.type === "bluff"
                    ? "Select target"
                    : "Select target"
        }
        onSelect={handleTargetSelect}
        onCancel={() => {
          setShowTargetSelector(false);
          setPendingAction(null);
        }}
      />

      <GuessModal
        isOpen={showGuessModal}
        onSelect={handleGuessSelect}
        onCancel={() => {
          setShowGuessModal(false);
          setSelectedTargetId(null);
        }}
      />

      <ActionNotification
        isOpen={!!gameState?.pendingAction}
        action={gameState?.pendingAction || null}
        currentPlayer={
          gameState?.players.find(
            (p) => p.id === gameState?.pendingAction?.playerId,
          ) || null
        }
        timeLeft={timeLeft ?? gameState?.actionTimer ?? 0}
        canCounter={
          !!myPlayer &&
          !!gameState?.pendingAction &&
          gameState.pendingAction.playerId !== myPlayerId
        }
        canCallBluff={
          !!myPlayer &&
          !!gameState?.pendingAction &&
          gameState.pendingAction.playerId !== myPlayerId &&
          !!gameState.pendingAction.claimedCharacter
        }
        onCounter={handleCounter}
        onCallBluff={handleCallBluff}
        onPass={handlePass}
      />

      <GameOverModal
        isOpen={showGameOverModal}
        winner={winner}
        onPlayAgain={handlePlayAgain}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}
