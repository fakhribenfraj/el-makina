import { Player, GameState, ActionType, CharacterType } from './types';
import { isBasicAction, getActionCost } from './actions';

export function canPlayAction(
  player: Player,
  action: ActionType,
  gameState: GameState
): { valid: boolean; reason?: string } {
  if (player.coins < getActionCost(action)) {
    return { valid: false, reason: `Need ${getActionCost(action)} coins to play this` };
  }

  if (action === 'kill_terrorist' && player.coins < 3) {
    return { valid: false, reason: 'Need 3 coins to kill as Terrorist' };
  }

  if (action === 'guess_colonel' && player.coins < 4) {
    return { valid: false, reason: 'Need 4 coins to guess as Colonel' };
  }

  if (action === 'kill_7_coins' && player.coins < 7) {
    return { valid: false, reason: 'Need 7 coins to kill' };
  }

  if (!isBasicAction(action) && action !== 'bluff') {
    const hasCard = player.cards.some(card => cardMatchesAction(card.character, action));
    if (!hasCard) {
      return { valid: false, reason: `Need the required character card to play this action` };
    }
  }

  if (requiresTarget(action)) {
    if (!gameState.pendingAction?.targetId) {
      const aliveTargets = gameState.players.filter(p => p.isAlive && p.id !== player.id);
      if (aliveTargets.length === 0) {
        return { valid: false, reason: 'No valid targets available' };
      }
    }
  }

  return { valid: true };
}

export function cardMatchesAction(character: CharacterType, action: ActionType): boolean {
  const mapping: Record<CharacterType, ActionType> = {
    policeman: 'inspect_policeman',
    politician: 'exchange_politician',
    businessman: 'take_4_coins',
    fisc: 'take_1_coin_fisc',
    terrorist: 'kill_terrorist',
    colonel: 'guess_colonel',
    thief: 'steal_2_coins',
  };
  return mapping[character] === action;
}

export function requiresTarget(action: ActionType): boolean {
  const targetActions: ActionType[] = [
    'steal_2_coins',
    'take_1_coin_fisc',
    'kill_terrorist',
    'kill_7_coins',
    'inspect_policeman',
    'guess_colonel',
  ];
  return targetActions.includes(action);
}

export function canCounter(
  counterCharacter: CharacterType,
  actionType: ActionType,
  originalPlayerId: string,
  counterPlayerId: string
): { valid: boolean; reason?: string } {
  if (originalPlayerId === counterPlayerId) {
    return { valid: false, reason: 'Cannot counter your own action' };
  }

  const counterMappings: Record<CharacterType, ActionType[]> = {
    policeman: ['inspect_policeman'],
    politician: [],
    businessman: [],
    fisc: ['take_2_coins'],
    terrorist: [],
    colonel: ['kill_terrorist'],
    thief: ['steal_2_coins'],
  };

  const canCounterActions = counterMappings[counterCharacter];
  if (!canCounterActions || !canCounterActions.includes(actionType)) {
    return { valid: false, reason: 'Your character cannot counter this action' };
  }

  return { valid: true };
}

export function canCallBluff(
  playerId: string,
  actionPlayerId: string,
  action: ActionType,
  playerCards: { character: CharacterType }[]
): { valid: boolean; reason?: string } {
  if (playerId === actionPlayerId) {
    return { valid: false, reason: 'Cannot call bluff on your own action' };
  }

  if (action === 'bluff') {
    return { valid: true };
  }

  if (!playerCards || playerCards.length === 0) {
    return { valid: false, reason: 'Need cards to call bluff' };
  }

  return { valid: true };
}

export function isBluff(
  action: ActionType,
  playerCards: { character: CharacterType }[],
  claimedCharacter?: CharacterType
): boolean {
  if (action !== 'bluff') {
    return false;
  }

  if (!claimedCharacter) {
    return true;
  }

  const hasCard = playerCards.some(card => card.character === claimedCharacter);
  return !hasCard;
}
