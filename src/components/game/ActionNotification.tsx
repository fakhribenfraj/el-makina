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

        <div className="bg-[#0f3460] rounded-lg p-4 mb-4">
          <p className="text-2xl font-bold text-[#eaeaea]">{actionLabel}</p>
          {action.claimedCharacter && (
            <p className="text-sm text-[#a0a0a0] mt-1">
              ({CHARACTERS[action.claimedCharacter]?.icon}{" "}
              {CHARACTERS[action.claimedCharacter]?.name})
            </p>
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
