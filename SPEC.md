# El Cartel - Game Specification

## 1. Project Overview

**Project Name:** El Cartel  
**Type:** Online Multiplayer Card Game  
**Core Functionality:** A real-time multiplayer card game where players use character cards with special abilities to gain coins, eliminate opponents, and be the last one standing.  
**Target Users:** Groups of 2-8 friends wanting to play together on their mobile devices.

---

## 2. Game Mechanics

### 2.1 Card Deck

The game uses **21 cards** total (7 character types × 3 copies each):

| Character | Abilities |
|-----------|-----------|
| **Policeman** | Choose a player to see their card. The target chooses which card to show. Can decide to keep it or change it (target gets new card from deck). Can stop other Policemen from seeing cards (blocked player loses turn). |
| **Politician** | Exchange their entire hand with new cards from the deck. |
| **Businessman** | Take 4 coins from the bank. |
| **Fisc** | Take 1 coin from any player with 7+ coins (choice). Can choose to take 1 coin when Businessman takes 4. Block other players from taking 2 coins. |
| **Terrorist** | Kill another player (target loses their card) if the terrorist has 3 coins. |
| **Kill (7 coins)** | Any player can spend 7 coins to kill another player (target loses their card). No character card required. |
| **Colonel** | Spend 4 coins to guess another player's card. If correct, the target loses their card. If wrong, the guesser loses their card (and target gains 4 coins). Can block Terrorist kills. |
| **Thief** | Steal 2 coins from any player. Can block other Thieves from stealing. |

### 2.2 Card Distribution

- **≤4 players:** 3 cards each
- **>4 players:** 2 cards each
- **>8 players:** Add 1 extra card of each role to the deck

### 2.3 Starting Resources

- **2 coins** per player at game start

### 2.4 Turn Actions

Each player on their turn can choose ONE of these actions:

1. **Play Character Role** - Use the special ability of their current card
2. **Take 1 Coin** - Always allowed
3. **Take 2 Coins** - Can be blocked by Fisc
4. **Bluff** - Claim to play any role (even without the matching card)

### 2.5 Ways to Lose a Card

| Action | If Correct | If Wrong |
|--------|-----------|----------|
| **Colonel guess** | Target loses their card | Guesser loses their card, target gains 4 coins |
| **Terrorist kill** | Target loses their card | N/A |
| **Kill with 7 coins** | Target loses their card | N/A |
| **Bluff called** | Bluffer loses 1 card, caller wins 3 coins | Caller loses 1 card, bluffer wins 2 coins AND must change their revealed card |

### 2.6 Counter Actions

Certain characters can counter other actions:

| Counter | Blocks |
|---------|--------|
| **Policeman** | Other Policemen from inspecting |
| **Fisc** | Other players from taking 2 coins |
| **Colonel** | Terrorist kills |
| **Thief** | Other Thieves from stealing |

### 2.7 Win Condition

**Last player standing wins.** When all other players are eliminated (have 0 cards), the remaining player is the winner.

### 2.8 Elimination

A player is eliminated when they have **0 cards**. Eliminated players are removed from the game and cannot participate further.

When a player is eliminated:
- **Cards** return to the deck
- **Coins** disappear (removed from game)

---

## 3. Game Flow

### 3.1 Room Creation & Joining

1. **Host** creates a game room
2. System generates:
   - QR code (for mobile camera scanning)
   - 4-digit room code (for manual entry)
3. **Other players** scan QR or enter code + their name
4. All players appear in a lobby
5. **Host** sets the play order before starting
6. **Host** clicks "Start Game"

### 3.2 Gameplay Loop

1. **Turn begins** - Current player sees their hand and options
2. **Player chooses action** - From action menu
3. **All players notified** - Others see what action was taken
4. **Counter/Bluff window** - Other players have 10 seconds to:
   - Play a counter action (if available)
   - Call bluff
   - Pass
5. **If no response in 10 seconds** - Action automatically passes
6. **Turn ends** - Next player plays

### 3.3 Action Resolution Order

1. Main action resolves (coins transferred, cards lost/gained)
2. Counter actions resolve (if any)
3. Win condition checked
4. State broadcast to all players
5. Next turn begins

---

## 4. UI/UX Specification

### 4.1 Screens

#### Screen 1: Home/Landing
- Game title: "El Cartel"
- Subtitle: "A multiplayer card game"
- Button: "Create Game Room"
- Button: "Join Game Room"

#### Screen 2: Create Room (Host)
- Display: QR Code (large, scannable)
- Display: 4-digit Room Code (prominent)
- Display: "Share this code with players"
- Display: List of joined players with names
- Button: "Start Game" (enabled when 2+ players)
- Feature: Drag-and-drop player list to set play order

#### Screen 3: Join Room
- Tab 1: Enter 4-digit code + Player Name
- Tab 2: QR Scanner (camera view)
- Button: "Join Game"

#### Screen 4: Game Lobby (Waiting)
- Display: Room Code
- Display: List of players with names
- Display: "Waiting for host to start..."
- (Host only): Play order assignment interface (drag-drop)

#### Screen 5: Main Game View

**Top Section - Player Bar (Horizontal Scroll)**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Player1  │  │ Player2  │  │ Player3  │  │ Player4  │
│ 👤 2 cards│  │ 👤 1 card│  │ 👤 3 cards│  │ 👤 ELIM  │
│ 💰 5     │  │ 💰 12    │  │ 💰 0     │  │ 💰 -     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```
- Horizontally scrollable container
- Shows each player: Name, card count, coin count
- Current player: Highlighted with glow/border
- Eliminated players: Grayed out with "ELIM" label

**Middle Section - Player's Hand**
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  [?]    │  │  [?]    │  │  [?]    │
│  card   │  │  card   │  │  card   │
└─────────┘  └─────────┘  └─────────┘
```
- Cards shown face-down by default
- Face-down card: Dark colored with "?" symbol
- **Hover (desktop) / Touch-and-hold (mobile):** Temporarily reveals the character role

**Bottom Section - Player's Coins**
```
💰 12 coins
```
- Large, prominent coin display

**Action Menu (when player's turn)**
```
┌────────────────────────────────────────┐
│           YOUR TURN                    │
├────────────────────────────────────────┤
│  Take 1 Coin                          │
│  Take 2 Coins                         │
│  ─────────── Special ───────────      │
│  Take 4 Coins (Businessman)           │
│  Steal 2 Coins (Thief)                │
│  Take 1 Coin (Fisc)                   │
│  Kill (Terrorist - 3 coins)           │
│  Kill (7 coins)                       │
│  Arrest (Colonel - 4 coins)           │
│  Inspect (Policeman)                  │
│  Exchange Cards (Politician)          │
│  ─────────── Other ───────────        │
│  Bluff                                │
└────────────────────────────────────────┘
```

#### Screen 6: Action Notification Modal

When another player takes an action:
```
┌─────────────────────────────────────┐
│  Player X is taking an action       │
│                                     │
│  ACTION: Take 4 Coins               │
│  (Businessman ability)              │
│                                     │
│  ⏱️ 8 seconds remaining              │
│                                     │
│  ┌─────────┐  ┌─────────┐           │
│  │ Counter │  │  Pass   │           │
│  └─────────┘  └─────────┘           │
│                                     │
│  ┌─────────────────────┐            │
│  │    Call Bluff!     │            │
│  └─────────────────────┘            │
└─────────────────────────────────────┘
```
- 10-second countdown timer
- Counter button (if character ability available)
- Call Bluff button (always available)
- Pass button

#### Screen 7: Inspector Modal (Policeman)

When Policeman inspects:
```
┌─────────────────────────────────────┐
│  Player X's card                    │
│                                     │
│  ┌─────────────────────────┐        │
│  │      👮 POLICEMAN       │        │
│  └─────────────────────────┘        │
│                                     │
│  What to do?                        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  KEEP    │  │  CHANGE  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

#### Screen 8: Colonel Guess Modal

When Colonel guesses:
```
┌─────────────────────────────────────┐
│  Guess Player X's card              │
│                                     │
│  Select a character:               │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │👮  │ │🏛️  │ │💼  │ │💰  │       │
│  │Pol │ │Pol │ │Biz │ │Fisc│       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │💣  │ │🎖️  │ │🦹  │              │
│  │Terr│ │Col │ │Thief│             │
│  └────┘ └────┘ └────┘              │
│                                     │
│  Cost: 4 coins                      │
│  ┌─────────────────────────┐        │
│  │       CONFIRM           │        │
│  └─────────────────────────┘        │
└─────────────────────────────────────┘
```

#### Screen 9: Game Over Modal

```
┌─────────────────────────────────────┐
│           GAME OVER!                │
│                                     │
│         🏆 WINNER 🏆                │
│                                     │
│         Player Name                 │
│                                     │
│    💰 15 coins remaining            │
│                                     │
│  ┌─────────────────────────┐        │
│  │   Play Again            │        │
│  └─────────────────────────┘        │
│                                     │
│  ┌─────────────────────────┐        │
│  │   Back to Home          │        │
│  └─────────────────────────┘        │
└─────────────────────────────────────┘
```

### 4.2 Visual Design

**Color Palette:**
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Background | #1a1a2e | Main background |
| Secondary Background | #16213e | Cards, modals |
| Tertiary | #0f3460 | Hover states |
| Accent (Action) | #e94560 | Primary buttons, alerts |
| Success | #4ecca3 | Positive actions, wins |
| Warning (Coins) | #f9a826 | Coin displays |
| Text Primary | #eaeaea | Main text |
| Text Secondary | #a0a0a0 | Subtitles |
| Card Face-Down | #2d2d44 | Hidden card backs |

**Typography:**
- Headings: Bold, sans-serif (system font)
- Body: Regular, sans-serif
- Numbers (coins): Monospace for alignment
- Card text: Small but readable

**Card Design:**
- Size: ~80px × 120px (mobile)
- Face-down: Solid color with "?" or pattern
- Face-up: Character icon + name + ability text

**Animations:**
| Animation | Duration | Trigger |
|-----------|----------|---------|
| Card flip | 300ms | Reveal on hover/tap |
| Coin move | 500ms | Coin transfer |
| Player eliminate | 800ms | Fade out + scale |
| Timer pulse | 1000ms (loop) | Countdown < 5s |
| Modal slide | 200ms | Open/close |

### 4.3 Responsive Design

**Breakpoints:**
- Mobile: < 640px (primary target)
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Considerations:**
- Touch-friendly: Min 44px tap targets
- Portrait orientation
- Bottom-anchored action buttons
- Horizontal scroll for player bar

---

## 5. Data Models

### Player
```typescript
interface Player {
  id: string;              // Unique ID (UUID)
  name: string;            // Display name
  coins: number;           // Current coins (starts at 2)
  cards: Card[];           // Hand of cards
  isAlive: boolean;        // Not eliminated
  isHost: boolean;         // Created the room
  order: number;           // Play order position
}
```

### Card
```typescript
interface Card {
  id: string;              // Unique ID
  character: CharacterType; // The role
  isRevealed: boolean;     // Shown to player?
  isKnown: boolean;        // Publicly revealed (after failed bluff)
}

type CharacterType = 
  | 'policeman'
  | 'politician'
  | 'businessman'
  | 'fisc'
  | 'terrorist'
  | 'colonel'
  | 'thief';
```

### GameRoom
```typescript
interface GameRoom {
  code: string;                    // 4-digit room code
  hostId: string;                  // Host player ID
  players: Player[];               // All players
  deck: Card[];                    // Remaining cards
  currentTurnIndex: number;        // Whose turn (by player order)
  status: RoomStatus;
  createdAt: number;               // Timestamp
}

type RoomStatus = 'waiting' | 'playing' | 'finished';
```

### GameAction
```typescript
interface GameAction {
  id: string;                      // Unique action ID
  playerId: string;                // Who performed action
  type: ActionType;
  targetId?: string;               // Target player (if applicable)
  claimedCharacter?: CharacterType; // For bluff actions
  timestamp: number;
  status: ActionStatus;
  responses: ActionResponse[];     // Counter/bluff responses
}

type ActionType =
  | 'take_1_coin'
  | 'take_2_coins'
  | 'take_4_coins'
  | 'steal_2_coins'
  | 'take_1_coin_fisc'
  | 'kill_terrorist'
  | 'kill_7_coins'
  | 'inspect_policeman'
  | 'guess_colonel'
  | 'exchange_politician'
  | 'bluff';

type ActionStatus = 'pending' | 'counter_phase' | 'resolved' | 'blocked';
```

### ActionResponse
```typescript
interface ActionResponse {
  playerId: string;       // Who responded
  type: ResponseType;
  characterUsed?: CharacterType;  // If counter action
}

type ResponseType = 
  | 'pass'
  | 'counter'
  | 'call_bluff';
```

### GameEvent (PeerJS Messages)
```typescript
type GameEvent =
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; playerId: string }
  | { type: 'game_started'; deck: Card[] }
  | { type: 'turn_changed'; playerId: string }
  | { type: 'action_proposed'; action: GameAction }
  | { type: 'action_responded'; response: ActionResponse }
  | { type: 'action_resolved'; action: GameAction }
  | { type: 'state_update'; gameState: GameState }
  | { type: 'game_over'; winner: Player };

interface GameState {
  players: Player[];
  currentTurnIndex: number;
  deck: Card[];
  lastAction?: GameAction;
  pendingAction?: GameAction;
}
```

---

## 6. Character Abilities Reference

| Character | Action | Cost | Effect | Counter |
|-----------|--------|------|--------|---------|
| **Policeman** | Inspect | 0 | See target's card (target chooses which), choose keep or change (target draws new) | Another Policeman (blocked loses turn) |
| **Policeman** | Block | 0 | Block other Policeman's inspection | None |
| **Politician** | Exchange | 0 | Swap all hand cards with new deck cards | None |
| **Businessman** | Take Coins | 0 | +4 coins from bank | Fisc can choose to take 1 |
| **Fisc** | Tax | 0 | Take 1 coin from player with 7+ (choice) | None |
| **Fisc** | Block | 0 | Stop player from taking 2 coins | None |
| **Terrorist** | Kill | 3 coins | Target loses their card | Colonel blocks |
| **Kill (anyone)** | Execute | 7 coins | Target loses their card | None |
| **Colonel** | Guess | 4 coins | Guess target's card (correct → target loses, wrong → guesser loses) | None |
| **Colonel** | Block | 0 | Block Terrorist kill | None |
| **Thief** | Steal | 0 | Take 2 coins from target | Another Thief |

---

## 7. Event Flow (PeerJS)

### Connection Flow
```
Host creates room
     │
     ▼
Host generates PeerID (roomCode)
     │
     ▼
Players connect to Host's PeerID
     │
     ▼
Host maintains list of connections
     │
     ▼
Game starts - Host is authority
```

### Action Flow
```
Current Player selects action
     │
     ▼
[If action needs target] → Select target player
     │
     ▼
Send action to Host
     │
     ▼
Host validates action
     │
     ├─ Invalid → Reject, notify player
     │
     └─ Valid → 
           │
           ▼
     Set action to 'pending'
           │
           ▼
     Broadcast to all players
           │
           ▼
     Start 10-second timer
           │
           ▼
     [Players respond or timeout]
           │
           ▼
     Resolve action (apply effects)
           │
           ▼
     Check win condition
           │
           ▼
     Broadcast state update
           │
           ▼
     Next turn
```

---

## 8. Acceptance Criteria

### Room Management
- [x] Host can create room and receive unique 4-digit code
- [x] QR code displays and is scannable
- [x] Players can join via 4-digit code entry
- [ ] Players can join via QR code scan
- [x] Player list updates in real-time as players join
- [ ] Host can drag-drop to set play order
- [x] Host can start game with 2-8 players

### Game Setup
- [x] Each player receives correct number of cards (2 or 3)
- [x] Each player starts with 2 coins
- [x] Remaining cards form deck
- [x] Turn order follows host's configured order

### Gameplay
- [x] Current player clearly indicated
- [x] Players can see their cards (hidden by default, reveal on hover/tap)
- [x] Horizontal scrollable player bar shows all players
- [x] Each player shows: name, card count, coin count
- [x] Action menu shows valid actions for current player
- [x] 10-second timer displays for counter/bluff phase
- [x] Auto-pass after 10 seconds with no response

### Character Abilities
- [x] **Policeman:** Can inspect target's card, choose keep/change
- [x] **Policeman:** Can counter other Policemen
- [x] **Politician:** Can exchange all hand cards with deck
- [x] **Businessman:** Can take 4 coins
- [x] **Fisc:** Can take 1 coin from player with 7+
- [x] **Fisc:** Takes 1 coin when Businessman takes 4
- [x] **Fisc:** Can block 2-coin takes
- [x] **Terrorist:** Can kill (cost 3 coins)
- [x] **Colonel:** Can guess card (cost 4 coins)
- [x] **Colonel:** Correct guess = target loses card
- [x] **Colonel:** Wrong guess = guesser loses card, target gains 4 coins
- [x] **Colonel:** Can block Terrorist kills
- [x] **Thief:** Can steal 2 coins from target
- [x] **Thief:** Can counter other Thieves

### Bluff System
- [x] Any player can claim any role
- [x] Other players can call bluff
- [x] Correct call: bluffer loses 1 card, caller wins 3 coins
- [x] Wrong call: caller loses 1 card, bluffer wins 2 coins + must change card

### Card Loss
- [x] Player loses card from Colonel correct guess
- [x] Player loses card from Terrorist kill
- [x] Player loses card from 7-coin kill
- [x] Player loses card from correct bluff call
- [x] Player loses card from wrong bluff call

### Elimination
- [x] Player with 0 cards is eliminated
- [x] Eliminated players cannot take turns
- [x] Eliminated players shown in player bar with indicator

### Win Condition
- [x] Game ends when 1 player remains
- [x] Winner displayed in game over screen

### Technical
- [x] Real-time sync across all players (< 200ms)
- [x] Works on mobile browsers (Chrome, Safari)
- [ ] No critical console errors
- [x] Responsive on mobile devices

---

## 9. Future Enhancements (Out of Scope)

- AI opponents for single-player
- In-game chat system
- Game history/replay
- Sound effects and music
- Achievements/badges
- Multiple simultaneous rooms
- Reconnection handling for dropped players
