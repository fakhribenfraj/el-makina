import React, { useState, useEffect } from "react";
import { Player, ActionType } from "@/lib/types";
import { Button } from "../ui/Button";
import { getActionLabel, getCharacterForAction } from "@/lib/actions";

interface ActionMenuProps {
  player: Player;
  onActionSelect: (
    action: ActionType,
    targetId?: string,
    claimedCharacter?: string,
  ) => void;
  onBluffSelect?: () => void;
  disabled?: boolean;
  isMyTurn?: boolean;
}

export function ActionMenu({
  player,
  onActionSelect,
  disabled,
  isMyTurn,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-show when it's my turn
  useEffect(() => {
    if (isMyTurn) {
      setIsOpen(true);
    }
  }, [isMyTurn]);

  const allSpecialActions: ActionType[] = [
    "inspect_policeman",
    "exchange_politician",
    "take_4_coins",
    "take_1_coin_fisc",
    "kill_terrorist",
    "guess_colonel",
    "steal_2_coins",
  ];

  const canAfford = (cost: number) => player.coins >= cost;

  const specialActionsAvailable = allSpecialActions.map((action) => {
    let cost = 0;
    switch (action) {
      case "kill_terrorist":
        cost = 3;
        break;
      case "guess_colonel":
        cost = 4;
        break;
      default:
        cost = 0;
    }

    return {
      type: action,
      enabled: canAfford(cost),
    };
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Trigger (Visible when closed) */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 transition-transform duration-500 z-30 ${isOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <div className="flex justify-center">
          <Button
            variant={isMyTurn ? "primary" : "secondary"}
            onClick={() => setIsOpen(true)}
            size="lg"
            className={`shadow-[0_-5px_20px_rgba(233,69,96,0.3)] px-12 transition-all duration-300 transform rounded-b-none border-b-0 min-w-[200px] ${isMyTurn ? "animate-pulse scale-105" : "opacity-90"}`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-1 bg-white/20 rounded-full mb-1" />
              <span>{isMyTurn ? "🔥 ACTION!" : "SHOW ACTIONS"}</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[#16213e]/95 backdrop-blur-md border-t-4 border-[#e94560] rounded-t-[2.5rem] p-8 space-y-6 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-50 transition-all duration-500 transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle for dragging visual */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[#0f3460] rounded-full cursor-pointer hover:bg-[#e94560]/50 transition-colors"
          onClick={() => setIsOpen(false)}
        />

        <div className="flex justify-between items-center mb-2 border-b border-[#0f3460] pb-6">
          <div className="flex-1 text-center">
            <h3
              className={`text-2xl font-black italic tracking-tighter uppercase ${isMyTurn ? "text-[#e94560]" : "text-[#a0a0a0]"}`}
            >
              {isMyTurn ? "It's Your Turn" : "Action Menu"}
            </h3>
            <p className="text-[10px] text-[#a0a0a0]/60 font-mono tracking-widest uppercase mt-1">
              Player: {player.name}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-6 top-6 text-[#a0a0a0] hover:text-[#eaeaea] p-2 rounded-full hover:bg-[#0f3460] transition-colors"
            title="Hide Menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2">
          <Button
            variant="secondary"
            className="w-full justify-center h-14 text-lg"
            onClick={() => {
              onActionSelect("take_1_coin");
              setIsOpen(false);
            }}
            disabled={disabled || !isMyTurn}
          >
            Take 1 Coin
          </Button>

          <Button
            variant="secondary"
            className="w-full justify-center h-14 text-lg"
            onClick={() => {
              onActionSelect("take_2_coins");
              setIsOpen(false);
            }}
            disabled={disabled || !isMyTurn}
          >
            Take 2 Coins
          </Button>
        </div>

        {specialActionsAvailable.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-[#a0a0a0] mb-2 uppercase tracking-widest font-bold opacity-60">
              Character Special Actions
            </p>
            <div className="space-y-3">
              {specialActionsAvailable.map((actionObj) => (
                <Button
                  key={actionObj.type}
                  variant="success"
                  className="w-full justify-center py-4 text-lg shadow-lg font-bold"
                  onClick={() => {
                    onActionSelect(
                      actionObj.type,
                      undefined,
                      getCharacterForAction(actionObj.type),
                    );
                    setIsOpen(false);
                  }}
                  disabled={disabled || !isMyTurn || !actionObj.enabled}
                >
                  {getActionLabel(actionObj.type)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 space-y-3">
          {player.coins >= 7 && (
            <Button
              variant="danger"
              className="w-full justify-center py-4 text-lg shadow-lg font-bold"
              onClick={() => {
                onActionSelect("kill_7_coins");
                setIsOpen(false);
              }}
              disabled={disabled || !isMyTurn}
            >
              Kill Player (7 coins)
            </Button>
          )}
        </div>

        {/* Extra padding for safe areas on mobile */}
        <div className="h-4" />
      </div>
    </>
  );
}
