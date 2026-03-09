import { CharacterType, CharacterDefinition } from './types';

export const CHARACTERS: Record<CharacterType, CharacterDefinition> = {
  policeman: {
    name: 'Policeman',
    icon: '👮',
    description: 'Inspect a player\'s card or block other Policemen',
    color: '#3b82f6',
  },
  politician: {
    name: 'Politician',
    icon: '🏛️',
    description: 'Exchange all your cards with new ones',
    color: '#8b5cf6',
  },
  businessman: {
    name: 'Businessman',
    icon: '💼',
    description: 'Take 4 coins from the bank',
    color: '#22c55e',
  },
  fisc: {
    name: 'Fisc',
    icon: '💰',
    description: 'Take 1 coin from rich players or block 2-coin takes',
    color: '#f59e0b',
  },
  terrorist: {
    name: 'Terrorist',
    icon: '💣',
    description: 'Kill a player (costs 3 coins)',
    color: '#ef4444',
  },
  colonel: {
    name: 'Colonel',
    icon: '🎖️',
    description: 'Guess a card or block Terrorist kills',
    color: '#6366f1',
  },
  thief: {
    name: 'Thief',
    icon: '🦹',
    description: 'Steal 2 coins or block other Thieves',
    color: '#ec4899',
  },
};

export const CHARACTER_LIST: CharacterType[] = [
  'policeman',
  'politician',
  'businessman',
  'fisc',
  'terrorist',
  'colonel',
  'thief',
];
