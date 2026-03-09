import React from 'react';
import { Player, ActionType } from '@/lib/types';
import { Button } from '../ui/Button';
import { getActionLabel } from '@/lib/actions';
import { isBasicAction } from '@/lib/actions';

interface ActionMenuProps {
  player: Player;
  onActionSelect: (action: ActionType, targetId?: string, claimedCharacter?: string) => void;
  onBluffSelect: () => void;
  disabled?: boolean;
}

export function ActionMenu({ player, onActionSelect, onBluffSelect, disabled }: ActionMenuProps) {
  const characterActions: ActionType[] = player.cards
    .map(card => {
      const mapping: Record<string, ActionType> = {
        policeman: 'inspect_policeman',
        politician: 'exchange_politician',
        businessman: 'take_4_coins',
        fisc: 'take_1_coin_fisc',
        terrorist: 'kill_terrorist',
        colonel: 'guess_colonel',
        thief: 'steal_2_coins',
      };
      return mapping[card.character];
    })
    .filter(Boolean);

  const canAfford = (cost: number) => player.coins >= cost;

  const specialActionsAvailable = characterActions.filter(action => {
    switch (action) {
      case 'take_4_coins':
        return canAfford(0);
      case 'kill_terrorist':
        return canAfford(3);
      case 'guess_colonel':
        return canAfford(4);
      case 'kill_7_coins':
        return canAfford(7);
      default:
        return canAfford(0);
    }
  });

  return (
    <div className="bg-[#16213e] rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-bold text-[#eaeaea] text-center mb-4">
        Your Turn
      </h3>

      <div className="space-y-2">
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => onActionSelect('take_1_coin')}
          disabled={disabled}
        >
          Take 1 Coin
        </Button>

        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => onActionSelect('take_2_coins')}
          disabled={disabled}
        >
          Take 2 Coins
        </Button>
      </div>

      {specialActionsAvailable.length > 0 && (
        <>
          <div className="border-t border-[#0f3460] pt-3">
            <p className="text-xs text-[#a0a0a0] mb-2">Special Actions</p>
            <div className="space-y-2">
              {specialActionsAvailable.map((action) => (
                <Button
                  key={action}
                  variant="success"
                  className="w-full justify-start"
                  onClick={() => onActionSelect(action)}
                  disabled={disabled}
                >
                  {getActionLabel(action)}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {player.coins >= 7 && (
        <Button
          variant="danger"
          className="w-full justify-start"
          onClick={() => onActionSelect('kill_7_coins')}
          disabled={disabled}
        >
          Kill (7 coins)
        </Button>
      )}

      <div className="border-t border-[#0f3460] pt-3">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onBluffSelect}
          disabled={disabled}
        >
          Bluff
        </Button>
      </div>
    </div>
  );
}
