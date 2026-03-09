import React from "react";
import { Player, GameAction } from "@/lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Timer } from "../ui/Timer";
import { getActionLabel } from "@/lib/actions";
import { CHARACTERS } from "@/lib/characters";

interface ActionNotificationProps {
  isOpen: boolean;
  action: GameAction | null;
  currentPlayer: Player | null;
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
          {currentPlayer.name} is taking an action
        </p>

        <div
          className="rounded-lg p-6 mb-6 shadow-xl border-t-4"
          style={{
            backgroundColor: action.claimedCharacter
              ? `${CHARACTERS[action.claimedCharacter]?.color}22`
              : "#0f3460",
            borderColor: action.claimedCharacter
              ? CHARACTERS[action.claimedCharacter]?.color
              : "transparent",
          }}
        >
          <p className="text-2xl font-black text-[#eaeaea] tracking-tight">
            {actionLabel}
          </p>
          {action.claimedCharacter && (
            <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-black/30 rounded-full w-fit mx-auto px-4 border border-white/10">
              <span className="text-xl">
                {CHARACTERS[action.claimedCharacter]?.icon}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-white/90">
                {CHARACTERS[action.claimedCharacter]?.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-4">
          <Timer timeLeft={timeLeft} />
        </div>

        <div
          className={`grid ${canCallBluff ? "grid-cols-2" : "grid-cols-1"} gap-4`}
        >
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
        </div>
      </div>
    </Modal>
  );
}
