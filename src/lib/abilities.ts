import {
  GameState,
  GameAction,
  ActionResponse,
  Player,
  Card,
  CharacterType,
} from "./types";
import { v4 as uuidv4 } from "uuid";

export function resolveAction(
  action: GameAction,
  gameState: GameState,
  response?: ActionResponse,
): GameState {
  let newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const player = newState.players.find((p) => p.id === action.playerId);
  const target = action.targetId
    ? newState.players.find((p) => p.id === action.targetId)
    : null;

  if (!player) return newState;

  switch (action.type) {
    case "take_1_coin":
      player.coins += 1;
      break;

    case "take_2_coins":
      player.coins += 2;
      break;

    case "take_4_coins":
      player.coins += 4;
      const fisc = newState.players.find(
        (p) =>
          p.isAlive &&
          p.cards.some((c) => c.character === "fisc") &&
          p.id !== player.id,
      );
      if (fisc && fisc.coins >= 1) {
        fisc.coins -= 1;
        player.coins += 1;
      }
      break;

    case "steal_2_coins":
      if (target) {
        const stolen = Math.min(2, target.coins);
        target.coins -= stolen;
        player.coins += stolen;
      }
      break;

    case "take_1_coin_fisc":
      if (target && target.coins >= 7) {
        target.coins -= 1;
        player.coins += 1;
      }
      break;

    case "kill_terrorist":
      if (player.coins >= 3 && target) {
        player.coins -= 3;
        if (target.cards.length > 0) {
          const removedCard = target.cards.shift();
          if (removedCard) {
            newState.deck.push(removedCard);
          }
        }
      }
      break;

    case "kill_7_coins":
      if (player.coins >= 7 && target) {
        player.coins -= 7;
        if (target.cards.length > 0) {
          const removedCard = target.cards.shift();
          if (removedCard) {
            newState.deck.push(removedCard);
          }
        }
      }
      break;

    case "inspect_policeman":
      break;

    case "guess_colonel":
      if (player.coins >= 4 && target && target.cards.length > 0) {
        player.coins -= 4;
        const claimedCharacter = action.claimedCharacter;
        const targetCard = target.cards[0];

        if (claimedCharacter && targetCard.character === claimedCharacter) {
          const removedCard = target.cards.shift();
          if (removedCard) {
            newState.deck.push(removedCard);
          }
        } else {
          if (player.cards.length > 0) {
            const lostCard = player.cards.shift();
            if (lostCard) {
              newState.deck.push(lostCard);
            }
          }
          target.coins += 4;
        }
      }
      break;

    case "exchange_politician":
      while (player.cards.length > 0) {
        const card = player.cards.shift();
        if (card) newState.deck.push(card);
      }
      while (player.cards.length < 3 && newState.deck.length > 0) {
        const newCard = newState.deck.shift();
        if (newCard) {
          newCard.isRevealed = false;
          newCard.isKnown = false;
          player.cards.push(newCard);
        }
      }
      break;

    case "bluff":
      if (response?.type === "call_bluff") {
        const caller = newState.players.find((p) => p.id === response.playerId);
        const isActuallyBluff = !player.cards.some(
          (c) => c.character === action.claimedCharacter,
        );

        if (isActuallyBluff) {
          if (player.cards.length > 0) {
            const lostCard = player.cards.shift();
            if (lostCard) {
              newState.deck.push(lostCard);
            }
          }
          if (caller) {
            caller.coins += 3;
          }
        } else {
          if (caller && caller.cards.length > 0) {
            const lostCard = caller.cards.shift();
            if (lostCard) {
              newState.deck.push(lostCard);
            }
          }
          player.coins += 2;
          if (player.cards.length > 0) {
            const changedCard = player.cards.shift();
            if (changedCard) {
              changedCard.isRevealed = true;
              changedCard.isKnown = true;
              newState.deck.push(changedCard);
            }
          }
          if (newState.deck.length > 0) {
            const newCard = newState.deck.shift() as Card;
            newCard.isRevealed = false;
            newCard.isKnown = false;
            player.cards.push(newCard);
          }
        }
      }
      break;
  }

  newState = checkEliminations(newState);

  return newState;
}

function checkEliminations(gameState: GameState): GameState {
  for (const player of gameState.players) {
    if (player.isAlive && player.cards.length === 0) {
      player.isAlive = false;
    }
  }
  return gameState;
}

export function checkWinner(gameState: GameState): Player | null {
  const alivePlayers = gameState.players.filter((p) => p.isAlive);
  if (alivePlayers.length === 1) {
    return alivePlayers[0];
  }
  return null;
}

export function getNextAlivePlayer(gameState: GameState): string | null {
  const currentIndex = gameState.currentTurnIndex;
  const players = gameState.players;

  for (let i = 1; i <= players.length; i++) {
    const nextIndex = (currentIndex + i) % players.length;
    if (players[nextIndex].isAlive) {
      return players[nextIndex].id;
    }
  }
  return null;
}

export function createDeck(characterList: CharacterType[]): Card[] {
  const deck: Card[] = [];
  for (const character of characterList) {
    deck.push({
      id: uuidv4(),
      character,
      isRevealed: false,
      isKnown: false,
    });
  }
  return deck;
}

export function hidePrivateData(state: GameState, viewerId: string): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;

  newState.players = newState.players.map((player) => {
    if (player.id === viewerId) return player;

    return {
      ...player,
      cards: player.cards.map((card) => ({
        ...card,
        character: card.isRevealed ? card.character : ("thief" as any), // Placeholder character
      })),
    };
  });

  newState.deck = []; // Never leak deck

  return newState;
}
