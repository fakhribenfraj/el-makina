import { CharacterType, ActionType } from './types';

export const ACTIONS_BY_CHARACTER: Record<CharacterType, ActionType[]> = {
  policeman: ['inspect_policeman'],
  politician: ['exchange_politician'],
  businessman: ['take_4_coins'],
  fisc: ['take_1_coin_fisc'],
  terrorist: ['kill_terrorist'],
  colonel: ['guess_colonel'],
  thief: ['steal_2_coins'],
};

export const COUNTER_ABILITIES: Record<CharacterType, CharacterType[]> = {
  policeman: ['policeman'],
  politician: [],
  businessman: [],
  fisc: [],
  terrorist: ['colonel'],
  colonel: ['terrorist'],
  thief: ['thief'],
};

export const BASIC_ACTIONS: ActionType[] = [
  'take_1_coin',
  'take_2_coins',
  'bluff',
];

export const SPECIAL_ACTIONS: Record<CharacterType, ActionType> = {
  policeman: 'inspect_policeman',
  politician: 'exchange_politician',
  businessman: 'take_4_coins',
  fisc: 'take_1_coin_fisc',
  terrorist: 'kill_terrorist',
  colonel: 'guess_colonel',
  thief: 'steal_2_coins',
};

export function isBasicAction(action: ActionType): boolean {
  return BASIC_ACTIONS.includes(action);
}

export function getActionCost(action: ActionType): number {
  switch (action) {
    case 'kill_terrorist':
      return 3;
    case 'kill_7_coins':
      return 7;
    case 'guess_colonel':
      return 4;
    case 'take_4_coins':
      return 0;
    case 'take_2_coins':
      return 0;
    case 'take_1_coin':
    case 'take_1_coin_fisc':
    case 'steal_2_coins':
    case 'inspect_policeman':
    case 'exchange_politician':
    case 'bluff':
      return 0;
    default:
      return 0;
  }
}

export function getActionLabel(action: ActionType, claimedCharacter?: CharacterType): string {
  if (action === 'bluff' && claimedCharacter) {
    return `Bluff (${claimedCharacter})`;
  }
  
  switch (action) {
    case 'take_1_coin':
      return 'Take 1 Coin';
    case 'take_2_coins':
      return 'Take 2 Coins';
    case 'take_4_coins':
      return 'Take 4 Coins (Businessman)';
    case 'steal_2_coins':
      return 'Steal 2 Coins (Thief)';
    case 'take_1_coin_fisc':
      return 'Take 1 Coin (Fisc)';
    case 'kill_terrorist':
      return 'Kill (Terrorist - 3 coins)';
    case 'kill_7_coins':
      return 'Kill (7 coins)';
    case 'inspect_policeman':
      return 'Inspect (Policeman)';
    case 'guess_colonel':
      return 'Guess (Colonel - 4 coins)';
    case 'exchange_politician':
      return 'Exchange Cards (Politician)';
    case 'bluff':
      return 'Bluff';
    default:
      return action;
  }
}
