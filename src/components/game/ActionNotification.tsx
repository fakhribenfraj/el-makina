import React from "react";
import { Player, GameAction, GameState } from "@/lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Timer } from "../ui/Timer";
import { getActionLabel } from "@/lib/actions";
import { CHARACTERS } from "@/lib/characters";

interface ActionNotificationProps {
  isOpen: boolean;
  action: GameAction | null;
  currentPlayer: Player | null;
  gameState: GameState | null;
  timeLeft: number;
  canCounter: boolean;
  canCallBluff: boolean;
  onCounter: () => void;
  onCallBluff: () => void;
  onPass: () => void;
}

export function ActionNotification({
  isOpen,
  action,
  currentPlayer,
  gameState,
  timeLeft,
  canCounter,
  canCallBluff,
  onCounter,
  onCallBluff,
  onPass,
}: ActionNotificationProps) {
  if (!action || !currentPlayer) return null;

  const actionLabel = getActionLabel(action.type, action.claimedCharacter);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="">
      <div className="text-center">
        <p className="text-lg text-[#a0a0a0] mb-2">
          {action.status === "counter_phase"
            ? `${gameState?.players.find((p) => p.id === action.counteredBy)?.name} is blocking`
            : `${currentPlayer.name} is taking an action`}
        </p>

        <div
          className="rounded-lg p-6 mb-6 shadow-xl border-t-4"
          style={{
            backgroundColor: (
              action.status === "counter_phase"
                ? action.counterCharacter
                : action.claimedCharacter
            )
              ? `${CHARACTERS[(action.status === "counter_phase" ? action.counterCharacter : action.claimedCharacter)!]?.color}22`
              : "#0f3460",
            borderColor: (
              action.status === "counter_phase"
                ? action.counterCharacter
                : action.claimedCharacter
            )
              ? CHARACTERS[
                  (action.status === "counter_phase"
                    ? action.counterCharacter
                    : action.claimedCharacter)!
                ]?.color
              : "transparent",
          }}
        >
          <p className="text-2xl font-black text-[#eaeaea] tracking-tight">
            {action.status === "counter_phase"
              ? `BLOCKING AS ${action.counterCharacter?.toUpperCase()}`
              : actionLabel}
          </p>
          {(action.status === "counter_phase"
            ? action.counterCharacter
            : action.claimedCharacter) && (
            <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-black/30 rounded-full w-fit mx-auto px-4 border border-white/10">
              <span className="text-xl">
                {
                  CHARACTERS[
                    (action.status === "counter_phase"
                      ? action.counterCharacter
                      : action.claimedCharacter)!
                  ]?.icon
                }
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-white/90">
                {
                  CHARACTERS[
                    (action.status === "counter_phase"
                      ? action.counterCharacter
                      : action.claimedCharacter)!
                  ]?.name
                }
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-4">
          <Timer timeLeft={timeLeft} />
        </div>

        <div
          className={`grid ${canCallBluff || action.type === "take_2_coins" || action.status === "counter_phase" ? "grid-cols-2" : "grid-cols-1"} gap-4`}
        >
          {action.status === "counter_phase" ? (
            <>
              <Button
                variant="danger"
                className="w-full text-xl py-8 font-black uppercase tracking-widest animate-pulse border-4 border-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.4)]"
                onClick={onCallBluff}
              >
                Lying!
              </Button>
              <Button
                variant="secondary"
                className="w-full py-8 text-xl font-bold uppercase tracking-tight bg-[#16213e] hover:bg-[#1a1a2e]"
                onClick={onPass}
              >
                Pass
              </Button>
            </>
          ) : (
            <>
              {action.type === "take_2_coins" && (
                <Button
                  variant="primary"
                  className="w-full py-8 text-xl font-bold uppercase tracking-tight bg-[#0f3460] border-2 border-[#e94560]"
                  onClick={onCounter}
                >
                  Block as Fisc
                </Button>
              )}

              {canCallBluff && (
                <Button
                  variant="danger"
                  className="w-full text-xl py-8 font-black uppercase tracking-widest animate-pulse border-4 border-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.4)]"
                  onClick={onCallBluff}
                >
                  Lying!
                </Button>
              )}

              <Button
                variant="secondary"
                className="w-full py-8 text-xl font-bold uppercase tracking-tight bg-[#16213e] hover:bg-[#1a1a2e]"
                onClick={onPass}
              >
                Pass
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
