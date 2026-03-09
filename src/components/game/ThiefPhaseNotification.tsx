import React from "react";
import { Player, GameAction, GameState } from "@/lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CHARACTERS } from "@/lib/characters";

interface ThiefPhaseNotificationProps {
  isOpen: boolean;
  action: GameAction;
  gameState: GameState;
  myPlayerId: string;
  onCallBluff: (thiefPlayerId: string) => void;
  onPass: () => void;
}

export function ThiefPhaseNotification({
  isOpen,
  action,
  gameState,
  myPlayerId,
  onCallBluff,
  onPass,
}: ThiefPhaseNotificationProps) {
  const thiefResponses = action.responses.filter(
    (r) => r.type === "take_one_as_thief",
  );

  const hasAlreadyResponded = action.responses.some(
    (r) => r.playerId === myPlayerId && r.type === "pass",
  );

  if (hasAlreadyResponded) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div className="bg-[#16213e] border-2 border-[#ff9d00] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 border-4 border-[#ff9d00] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2 italic">
            WAITING FOR OTHERS
          </h3>
          <p className="text-[#a0a0a0]">
            Waiting for other players to decide on Thief claims...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Thief Claims">
      <div className="text-center">
        <p className="text-lg text-[#a0a0a0] mb-4">
          The following players are taking 1 coin from you as Thief:
        </p>

        <div className="space-y-3 mb-6">
          {thiefResponses.map((resp) => {
            const player = gameState.players.find(
              (p) => p.id === resp.playerId,
            );
            if (!player) return null;

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-[#0f3460] rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff9d00]/20 rounded-full flex items-center justify-center text-xl">
                    {CHARACTERS.thief.icon}
                  </div>
                  <span className="text-lg font-bold text-white">
                    {player.name}
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onCallBluff(player.id)}
                >
                  Lying!
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          variant="secondary"
          className="w-full py-4 text-xl font-bold uppercase tracking-tight bg-[#16213e] hover:bg-[#1a1a2e]"
          onClick={onPass}
        >
          Pass All
        </Button>
      </div>
    </Modal>
  );
}
