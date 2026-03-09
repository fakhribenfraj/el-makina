# El Cartel - Technical Architecture

## 1. Overview

This document describes the technical architecture for building "El Cartel" - a real-time multiplayer card game using Next.js 16, PeerJS for P2P communication, and Zustand for state management.

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16 | React framework with App Router |
| UI | React 19 + TailwindCSS 4 | Component library and styling |
| State | Zustand | Global state management |
| Real-time | PeerJS | Peer-to-peer WebRTC connections |
| QR Codes | qrcode.react | Generate QR codes for room joining |
| QR Scanning | html5-qrcode | Scan QR codes to join rooms |
| IDs | uuid | Generate unique IDs for players/actions |

---

## 2. Architecture Pattern

### Host-Authoritative Model

The game uses a **host-authoritative** architecture where:
- **Host player** acts as the server and source of truth
- **Other players** send action requests to the host
- **Host** validates, processes, and broadcasts game state

```
┌─────────────────────────────────────────────────────────┐
│                     PLAYERS (Clients)                   │
│                                                          │
│   ┌──────────────┐         ┌──────────────┐           │
│   │    HOST      │         │   CLIENT 2   │           │
│   │              │         │              │           │
│   │ ✅ Game State│◄───────│ Send Actions │           │
│   │ ✅ Validation│────────►│ Receive State│           │
│   │ ✅ Turn Order │         │              │           │
│   └──────────────┘         └──────────────┘           │
│          │                                                  │
│          │  Broadcast State                               │
│          ▼                                                  │
│   ┌──────────────┐         ┌──────────────┐            │
│   │   CLIENT 3   │         │   CLIENT N   │           │
│   │              │         │              │           │
│   │ Receive State│         │ Receive State│           │
│   └──────────────┘         └──────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### Why PeerJS?

- **Free**: No server costs for real-time communication
- **P2P**: Direct connections between players
- **Simple**: Easy integration with React
- **Suitable**: Perfect for 2-8 player games

### Trade-offs

- If host disconnects, game cannot continue
- All players must have decent internet
- No cross-region performance optimization

---

## 3. Project Structure

```
el-makina/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing/Home page
│   │   ├── create/
│   │   │   └── page.tsx              # Create room (host)
│   │   ├── join/
│   │   │   └── page.tsx              # Join with code/QR
│   │   ├── lobby/
│   │   │   └── [roomId]/
│   │   │       └── page.tsx          # Pre-game lobby
│   │   └── game/
│   │       └── [roomId]/
│   │           └── page.tsx          # Main game view
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.tsx            # Custom button
│   │   │   ├── Card.tsx              # Game card component
│   │   │   ├── Modal.tsx             # Modal/dialog
│   │   │   ├── CoinDisplay.tsx       # Coin counter
│   │   │   ├── PlayerAvatar.tsx      # Player icon
│   │   │   ├── Timer.tsx             # Countdown timer
│   │   │   └── Input.tsx              # Form inputs
│   │   │
│   │   ├── game/                     # Game-specific components
│   │   │   ├── PlayerBar.tsx         # Horizontal scroll player list
│   │   │   ├── Hand.tsx              # Player's cards display
│   │   │   ├── ActionMenu.tsx        # Turn action buttons
│   │   │   ├── ActionNotification.tsx # Counter/bluff modal
│   │   │   ├── InspectorModal.tsx    # Policeman inspection
│   │   │   ├── GuessModal.tsx        # Colonel guess modal
│   │   │   ├── TargetSelector.tsx    # Select target player
│   │   │   └── GameOverModal.tsx     # Winner display
│   │   │
│   │   └── room/                     # Room-specific components
│   │       ├── QRCode.tsx            # Room QR code display
│   │       ├── RoomCode.tsx          # 4-digit code display
│   │       ├── PlayerList.tsx        # Joined players list
│   │       ├── PlayOrder.tsx         # Drag-drop ordering
│   │       └── QRScanner.tsx         # Camera QR scanner
│   │
│   ├── stores/                       # Zustand state stores
│   │   ├── usePeerStore.ts           # PeerJS connection state
│   │   ├── useRoomStore.ts           # Room/players state
│   │   └── useGameStore.ts           # Game state & logic
│   │
│   ├── lib/                         # Core game logic
│   │   ├── types.ts                  # TypeScript interfaces
│   │   ├── characters.ts             # Character definitions
│   │   ├── actions.ts                # Action definitions
│   │   ├── abilities.ts              # Character ability handlers
│   │   ├── validation.ts             # Action validation
│   │   ├── game-engine.ts            # Main game logic
│   │   └── peer.ts                   # PeerJS setup
│   │
│   └── utils/                       # Helper functions
│       ├── generateCode.ts           # Generate 4-digit room code
│       ├── shuffle.ts                # Deck shuffling
│       └── format.ts                 # Formatting helpers
│
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 4. State Management (Zustand)

Three separate stores maintain different aspects of the application:

### 4.1 usePeerStore

Manages PeerJS connection state.

```typescript
interface PeerState {
  peer: Peer | null;
  connections: Record<string, DataConnection>;  // Plain object instead of Map
  isConnected: boolean;
  isHost: boolean;
  myPlayerId: string | null;
  
  // Actions
  createRoom: () => string;
  joinRoom: (roomCode: string, playerName: string) => void;
  broadcast: (data: GameEvent) => void;
  sendTo: (playerId: string, data: GameEvent) => void;
}
```

### 4.2 useRoomStore

Manages room and player list state (before game starts).

```typescript
interface RoomState {
  roomCode: string | null;
  players: Player[];
  isHost: boolean;
  isInRoom: boolean;
  status: 'idle' | 'waiting' | 'playing' | 'finished';
  
  // Actions
  setRoomCode: (code: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setPlayOrder: (orderedIds: string[]) => void;
  startGame: () => void;
}
```

### 4.3 useGameStore

Manages the actual game state during gameplay.

```typescript
interface GameState {
  players: Player[];
  deck: Card[];
  currentTurnIndex: number;
  currentPlayerId: string | null;
  pendingAction: GameAction | null;
  actionTimer: number | null;
  winner: Player | null;
  
  // Actions
  playAction: (action: GameAction) => void;
  respondToAction: (response: ActionResponse) => void;
  resolveAction: () => void;
  nextTurn: () => void;
  updateFromHost: (state: GameState) => void;
}
```

### State Flow

```
User Action
     │
     ▼
[If Host]
  │
  ├─► Validate action
  │
  ├─► Apply effects
  │
  ├─► Update useGameStore
  │
  └─► Broadcast to all clients
  
[If Client]
  │
  └─► Send action request to host
        │
        ▼
  [Receive state update]
        │
        useGameStore
```

---

## 5. Component Hierarchy

```
src/app/
├── page.tsx (Home)
│   └── LandingPage
│       ├── CreateRoomButton
│       └── JoinRoomButton
│
├── create/page.tsx (Host creates room)
│   └── CreateRoomPage
│       ├── QRCodeDisplay
│       ├── RoomCodeDisplay
│       ├── PlayerList
│       └── StartGameButton
│
├── join/page.tsx (Player joins)
│   └── JoinRoomPage
│       ├── CodeInputForm
│       └── QRScanner
│
├── lobby/[roomId]/page.tsx (Pre-game)
│   └── LobbyPage
│       ├── RoomInfo
│       ├── PlayerList
│       ├── PlayOrder (Host only - drag-drop)
│       └── StartButton (Host only)
│
└── game/[roomId]/page.tsx (Main game)
    └── GamePage
        ├── PlayerBar (horizontal scroll)
        ├── Hand (player's cards)
        ├── CoinDisplay
        ├── ActionMenu (when turn)
        ├── ActionNotification (when other plays)
        ├── InspectorModal (Policeman)
        ├── GuessModal (Colonel)
        ├── TargetSelector (multi-player targeting)
        ├── GameOverModal
        └── Toast/Notifications
```

---

## 6. Core Modules

### 6.1 lib/types.ts

All TypeScript interfaces and types.

```typescript
// Core types
export type CharacterType = 
  | 'policeman' | 'politician' | 'businessman' 
  | 'fisc' | 'terrorist' | 'colonel' | 'thief';

export interface Card {
  id: string;
  character: CharacterType;
  isRevealed: boolean;
  isKnown: boolean;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  cards: Card[];
  isAlive: boolean;
  isHost: boolean;
  order: number;
}

export type ActionType = 
  | 'take_1_coin' | 'take_2_coins' | 'take_4_coins'
  | 'steal_2_coins' | 'take_1_coin_fisc'
  | 'kill_terrorist' | 'kill_7_coins'
  | 'inspect_policeman' | 'guess_colonel' 
  | 'exchange_politician' | 'bluff';

export type ResponseType = 'pass' | 'counter' | 'call_bluff';

export interface GameAction { /* ... */ }
export interface ActionResponse { /* ... */ }

// Event types for PeerJS
export type GameEvent = { type: string; [key: string]: any };
```

### 6.2 lib/characters.ts

Character definitions with metadata.

```typescript
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
```

### 6.3 lib/actions.ts

Action definitions and helper functions.

```typescript
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
```

### 6.4 lib/validation.ts

Validates whether actions are legal.

```typescript
export function canPlayAction(
  player: Player,
  action: ActionType,
  gameState: GameState
): { valid: boolean; reason?: string } {
  
  // Check enough coins
  if (action === 'kill_terrorist' && player.coins < 3) {
    return { valid: false, reason: 'Need 3 coins to kill' };
  }
  
  if (action === 'guess_colonel' && player.coins < 4) {
    return { valid: false, reason: 'Need 4 coins to guess' };
  }
  
  // Check has card
  if (!isBasicAction(action)) {
    const card = player.cards.find(c => actionMatchesCard(action, c.character));
    if (!card) {
      return { valid: false, reason: `Need ${action} card to play this` };
    }
  }
  
  // Check target exists
  if (requiresTarget(action) && !gameState.players.find(p => p.id === targetId)) {
    return { valid: false, reason: 'Invalid target' };
  }
  
  return { valid: true };
}
```

### 6.5 lib/abilities.ts

Implements character ability logic.

```typescript
export function resolveAction(
  action: GameAction,
  gameState: GameState,
  response?: ActionResponse
): GameState {
  // Create copy of state
  let newState = { ...gameState };
  
  switch (action.type) {
    case 'take_1_coin':
      newState = applyTake1Coin(action, newState);
      break;
    case 'take_2_coins':
      newState = applyTake2Coins(action, newState);
      break;
    case 'take_4_coins':
      newState = applyTake4Coins(action, newState);
      break;
    case 'steal_2_coins':
      newState = applySteal2Coins(action, newState);
      break;
    // ... other actions
  }
  
  return newState;
}

function applyTake1Coin(action: GameAction, state: GameState): GameState {
  const player = state.players.find(p => p.id === action.playerId);
  if (player) {
    player.coins += 1;
  }
  return state;
}

// ... other ability implementations
```

### 6.6 lib/game-engine.ts

Main game orchestration.

```typescript
export class GameEngine {
  private state: GameState;
  private hostCallbacks: HostCallbacks;
  
  constructor(initialState: GameState, callbacks: HostCallbacks) {
    this.state = initialState;
    this.hostCallbacks = callbacks;
  }
  
  // Process incoming action from player
  processAction(action: GameAction): void {
    // 1. Validate
    const validation = validateAction(action, this.state);
    if (!validation.valid) {
      this.hostCallbacks.sendTo(action.playerId, {
        type: 'action_rejected',
        reason: validation.reason,
      });
      return;
    }
    
    // 2. Set pending, start timer
    this.state.pendingAction = action;
    this.hostCallbacks.broadcast({
      type: 'action_pending',
      action,
      timer: 10,
    });
    
    // 3. Start countdown
    this.startResponseTimer();
  }
  
  // Handle player's response (counter/bluff/pass)
  processResponse(response: ActionResponse): void {
    if (!this.state.pendingAction) return;
    
    // Handle counter
    if (response.type === 'counter') {
      // Check if counter is valid
      const canCounter = checkCounter(
        response.characterUsed,
        this.state.pendingAction.type
      );
      
      if (canCounter) {
        this.state.pendingAction.status = 'blocked';
        // Apply counter effects
      }
    }
    
    // Handle bluff call
    if (response.type === 'call_bluff') {
      this.resolveBluff(this.state.pendingAction, response.playerId);
    }
    
    // Handle pass or timeout
    this.resolveAction(this.state.pendingAction);
  }
  
  private resolveAction(action: GameAction): void {
    // Apply effects
    this.state = resolveAction(action, this.state);
    
    // Check elimination
    this.checkEliminations();
    
    // Check win condition
    const winner = this.checkWinner();
    if (winner) {
      this.hostCallbacks.broadcast({ type: 'game_over', winner });
      return;
    }
    
    // Broadcast resolved
    this.hostCallbacks.broadcast({
      type: 'action_resolved',
      action,
      state: this.state,
    });
    
    // Next turn
    this.nextTurn();
  }
}
```

### 6.7 lib/peer.ts

PeerJS setup and connection management.

```typescript
import Peer, { DataConnection } from 'peerjs';

export class PeerManager {
  private peer: Peer | null = null;
  private connections: Record<string, DataConnection> = {};  // Plain object
  
  // Create room (host)
  async createRoom(): Promise<string> {
    const roomCode = generateRoomCode();
    this.peer = new Peer(roomCode);
    
    this.peer.on('connection', (conn) => {
      conn.on('data', (data) => this.handleData(conn.peer, data));
      this.connections[conn.peer] = conn;
    });
    
    return roomCode;
  }
  
  // Join room (client)
  async joinRoom(roomCode: string, playerName: string): Promise<void> {
    this.peer = new Peer(); // Auto-generate ID
    
    const conn = this.peer.connect(roomCode);
    conn.on('open', () => {
      conn.send({
        type: 'join_request',
        playerName,
        playerId: this.peer!.id,
      });
    });
    
    conn.on('data', (data) => this.handleData(conn.peer, data));
    this.connections[roomCode] = conn;
  }
  
  // Broadcast to all
  broadcast(data: GameEvent): void {
    Object.values(this.connections).forEach((conn) => {
      conn.send(data);
    });
  }
  
  // Handle incoming data
  private handleData(senderId: string, data: GameEvent): void {
    // Route to appropriate handler
    switch (data.type) {
      case 'join_request':
        // Host handles
        break;
      case 'action_proposed':
        // Host handles
        break;
      // ...
    }
  }
}
```

---

## 7. Page Flows

### 7.1 Host Flow

```
1. Visit /create
   │
   ▼
2. PeerJS creates room with 4-digit code
   │
   ▼
3. Display QR + code
   │
   ▼
4. Players connect via PeerJS
   │
   ▼
5. Host sees player list update
   │
   ▼
6. Host sets play order (drag-drop)
   │
   ▼
7. Host clicks "Start Game"
   │
   ▼
8. Redirect to /game/[roomCode]
   │
   ▼
9. Host runs GameEngine (is authority)
```

### 7.2 Client Flow

```
1. Visit /join
   │
   ▼
2. Enter code OR scan QR
   │
   ▼
3. Connect to host via PeerJS
   │
   ▼
4. Redirect to /lobby/[roomCode]
   │
   ▼
5. Wait for host to start
   │
   ▼
6. Redirect to /game/[roomCode]
   │
   ▼
7. Receive game state, show UI
   │
   ▼
8. Send actions when it's turn
   │
   ▼
9. Receive state updates from host
```

---

## 8. Real-Time Communication

### Message Types

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_request` | Client → Host | `{ playerName, playerId }` |
| `player_joined` | Host → All | `{ player }` |
| `game_started` | Host → All | `{ deck, players, currentTurn }` |
| `action_proposed` | Client → Host | `{ action }` |
| `action_pending` | Host → All | `{ action, timer }` |
| `action_responded` | Client → Host | `{ response }` |
| `action_resolved` | Host → All | `{ action, state }` |
| `state_update` | Host → All | `{ state }` |
| `game_over` | Host → All | `{ winner }` |

---

## 9. Key Implementation Details

### 9.1 Timer Handling

The host manages the 10-second response timer:

```typescript
// Host side
function startResponseTimer() {
  let timeLeft = 10;
  
  const interval = setInterval(() => {
    timeLeft -= 1;
    
    // Broadcast countdown
    this.broadcast({ type: 'timer_tick', timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      // Auto-pass
      this.processResponse({ playerId: 'system', type: 'pass' });
    }
  }, 1000);
}
```

### 9.2 Card Reveal on Hover/Tap

```typescript
function Card({ card, isMyCard }) {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <div
      className="card"
      onMouseEnter={() => isMyCard && setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={() => isMyCard && setRevealed(true)}
      onTouchEnd={() => setRevealed(false)}
    >
      {revealed || !isMyCard ? (
        <CharacterDisplay character={card.character} />
      ) : (
        <CardBack />
      )}
    </div>
  );
}
```

### 9.3 Horizontal Player Bar

```typescript
function PlayerBar({ players, currentPlayerId }) {
  return (
    <div className="flex overflow-x-auto gap-2 pb-2">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isCurrent={player.id === currentPlayerId}
          isEliminated={!player.isAlive}
        />
      ))}
    </div>
  );
}
```

### 9.4 QR Code Generation

```typescript
import { QRCodeSVG } from 'qrcode.react';

function QRCodeDisplay({ roomCode }) {
  const joinUrl = `${window.location.origin}/join?code=${roomCode}`;
  
  return (
    <QRCodeSVG
      value={joinUrl}
      size={200}
      level="M"
    />
  );
}
```

---

## 10. Security Considerations

1. **Host as authority**: All actions validated server-side (host)
2. **No client-side state trust**: Clients only display, don't validate
3. **Connection validation**: Verify player IDs match
4. **Rate limiting**: Prevent action spam (1 action per turn)
5. **Input sanitization**: Sanitize player names

---

## 11. Development Phases

### Phase 1: Foundation
- Project setup
- Types and constants
- Basic UI components

### Phase 2: Room Management
- Create/join room
- QR code generation/scanning
- Player list updates

### Phase 3: Game Setup
- Deck generation
- Card dealing
- Play order

### Phase 4: Core Actions
- Basic actions (take 1/2 coins)
- Turn management
- State sync

### Phase 5: Character Abilities
- Implement all 7 characters
- Counter system
- Target selection

### Phase 6: Bluff System
- Bluff claims
- Call bluff
- Resolution

### Phase 7: Win Condition
- Elimination logic
- Game over
- Play again

### Phase 8: Polish
- Animations
- Error handling
- Mobile optimization

---

## 12. File Summary

| File | Responsibility |
|------|----------------|
| `lib/types.ts` | All TypeScript interfaces |
| `lib/characters.ts` | Character metadata |
| `lib/actions.ts` | Action definitions |
| `lib/validation.ts` | Action validation |
| `lib/abilities.ts` | Ability resolution |
| `lib/game-engine.ts` | Game orchestration |
| `lib/peer.ts` | PeerJS wrapper |
| `stores/usePeerStore.ts` | Connection state |
| `stores/useRoomStore.ts` | Room state |
| `stores/useGameStore.ts` | Game state |
| `components/game/*.tsx` | Game UI components |
| `components/room/*.tsx` | Room UI components |

---

## 13. Quick Start for Developers

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Understand the game rules** - Read `SPEC.md`

4. **Start implementing** - Follow the phases above

5. **Test locally** - Open multiple browser tabs/windows

---

## 14. External Dependencies

All dependencies are already in `package.json`:

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "zustand": "^5.0.11",
    "peerjs": "^1.5.5",
    "qrcode.react": "^4.2.0",
    "html5-qrcode": "^2.3.8",
    "uuid": "^13.0.0"
  }
}
```

---

## 15. References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [PeerJS Documentation](https://peerjs.com/docs.html)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TailwindCSS 4 Documentation](https://tailwindcss.com/docs)
