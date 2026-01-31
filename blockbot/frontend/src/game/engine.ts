import { soundManager } from '@/utils/sound';
import type {
  Level,
  GameState,
  Direction,
  Position,
  ObjectType,
  Action,
  GameAction,
  LoopAction,
  CellType,
} from '../types/game';

const DIRECTION_DELTAS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const TURN_LEFT: Record<Direction, Direction> = {
  up: 'left',
  left: 'down',
  down: 'right',
  right: 'up',
};

const TURN_RIGHT: Record<Direction, Direction> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

function findStartPosition(
  objectsMatrix: (ObjectType | null)[][],
): Position | null {
  for (let y = 0; y < objectsMatrix.length; y++) {
    for (let x = 0; x < objectsMatrix[y].length; x++) {
      if (objectsMatrix[y][x] === 'start') {
        return { x, y };
      }
    }
  }
  return null;
}

export function initializeGameState(level: Level): GameState {
  const startPos = findStartPosition(level.objectsMatrix);

  if (!startPos) {
    throw new Error('No start position found in level');
  }

  return {
    playerPosition: startPos,
    playerDirection: 'right',
    inventory: [],
    objectsMatrix: level.objectsMatrix.map((row) => [...row]),
    isComplete: false,
    isFailed: false,
    isJumping: false,
    timeElapsed: 0,
    moveLog: ['Game started'],
  };
}

function isValidPosition(
  pos: Position,
  levelMatrix: CellType[][],
  objectsMatrix: (ObjectType | null)[][],
  isJumping: boolean = false,
): boolean {
  if (
    pos.y < 0 ||
    pos.y >= levelMatrix.length ||
    pos.x < 0 ||
    pos.x >= levelMatrix[0].length
  ) {
    return false;
  }

  if (levelMatrix[pos.y][pos.x] !== 'path') {
    return false;
  }

  const obj = objectsMatrix[pos.y][pos.x];

  if (obj === 'obstacle' && !isJumping) {
    return false;
  }

  if (obj === 'lock') {
    return false;
  }

  return true;
}

function moveForward(
  state: GameState,
  level: Level,
  isJumping: boolean = false,
): GameState {
  const delta = DIRECTION_DELTAS[state.playerDirection];
  const newPos: Position = {
    x: state.playerPosition.x + delta.x,
    y: state.playerPosition.y + delta.y,
  };

  if (
    !isValidPosition(newPos, level.levelMatrix, state.objectsMatrix, isJumping)
  ) {
    return {
      ...state,
      isFailed: true,
      isJumping: false,
      moveLog: [...state.moveLog, 'Invalid move - FAILED!'],
    };
  }
  soundManager.play('move');

  const obj = state.objectsMatrix[newPos.y][newPos.x];
  const pickedUpKey = obj === 'key';
  const reachedFinish = obj === 'finish';

  const objectsMatrix = pickedUpKey
    ? state.objectsMatrix.map((row) => [...row])
    : state.objectsMatrix;

  if (pickedUpKey) {
    objectsMatrix[newPos.y][newPos.x] = null;
  }

  const moveLog = [
    ...state.moveLog,
    `Moved forward to (${newPos.x}, ${newPos.y})`,
  ];
  if (pickedUpKey) {
    moveLog.push('Picked up key');
    soundManager.play('pickup');
  } 
  if (reachedFinish) {
    moveLog.push('Reached finish! Level complete!');
    soundManager.play('win');
  } 

  return {
    ...state,
    playerPosition: newPos,
    isJumping: false,
    objectsMatrix,
    inventory: pickedUpKey ? [...state.inventory, 'key'] : state.inventory,
    isComplete: reachedFinish,
    moveLog,
  };
}

function turnLeft(state: GameState): GameState {
  soundManager.play('turn')
  return {
    ...state,
    playerDirection: TURN_LEFT[state.playerDirection],
    moveLog: [
      ...state.moveLog,
      `Turned left, now facing ${TURN_LEFT[state.playerDirection]}`,
    ],
  };
}

function turnRight(state: GameState): GameState {
  soundManager.play('turn')
  return {
    ...state,
    playerDirection: TURN_RIGHT[state.playerDirection],
    moveLog: [
      ...state.moveLog,
      `Turned right, now facing ${TURN_RIGHT[state.playerDirection]}`,
    ],
  };
}

function jump(state: GameState, level: Level): GameState {
  soundManager.play('jump');
  const stateWithLog = {
    ...state,
    moveLog: [...state.moveLog, 'Jumping...'],
  };
  const result = moveForward(stateWithLog, level, true);
  result.isJumping = true;
  return result;
}

function performUseAction(state: GameState): GameState {
  const delta = DIRECTION_DELTAS[state.playerDirection];
  const targetPos: Position = {
    x: state.playerPosition.x + delta.x,
    y: state.playerPosition.y + delta.y,
  };

  if (
    targetPos.y < 0 ||
    targetPos.y >= state.objectsMatrix.length ||
    targetPos.x < 0 ||
    targetPos.x >= state.objectsMatrix[0].length
  ) {
    return {
      ...state,
      moveLog: [...state.moveLog, 'Nothing to use'],
    };
  }

  const obj = state.objectsMatrix[targetPos.y][targetPos.x];

  if (obj === 'lock') {
    if (state.inventory.includes('key')) {
      const objectsMatrix = state.objectsMatrix.map((row) => [...row]);
      objectsMatrix[targetPos.y][targetPos.x] = null;
      soundManager.play('unlock');

      return {
        ...state,
        objectsMatrix,
        inventory: state.inventory.filter((item) => item !== 'key'),
        moveLog: [...state.moveLog, 'Used key to unlock lock'],
      };
    } else {
      return {
        ...state,
        moveLog: [...state.moveLog, 'Need key to unlock lock'],
      };
    }
  }

  return {
    ...state,
    moveLog: [...state.moveLog, 'Nothing to use here'],
  };
}

function executeAction(
  state: GameState,
  action: Action,
  level: Level,
): GameState {
  if (state.isComplete || state.isFailed) {
    return state;
  }

  switch (action) {
    case 'forward':
      return moveForward(state, level);
    case 'turnLeft':
      return turnLeft(state);
    case 'turnRight':
      return turnRight(state);
    case 'jump':
      return jump(state, level);
    case 'use':
      return performUseAction(state);
    default:
      return state;
  }
}

export async function executeActions(
  level: Level,
  actions: GameAction[],
  onStateUpdate?: (state: GameState) => void,
  startTime: number = Date.now(),
  delay: number = 500,
): Promise<GameState> {
  let state = initializeGameState(level);

  if (onStateUpdate) onStateUpdate(state);
  const actionStartTime = Date.now();

  for (const action of actions) {
    const beforeDelay = Date.now();
    await new Promise((resolve) => setTimeout(resolve, delay));
    const afterDelay = Date.now();
    console.log('Actual delay:', afterDelay - beforeDelay, 'ms');

    if (typeof action === 'object' && action.type === 'loop') {
      const loopAction = action as LoopAction;
      for (let i = 0; i < loopAction.iterations; i++) {
        for (const loopedAction of loopAction.actions) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          state = executeAction(state, loopedAction as Action, level);
          if (onStateUpdate) onStateUpdate(state);
          if (state.isComplete || state.isFailed) break;
        }
        if (state.isComplete || state.isFailed) break;
      }
    } else {
      state = executeAction(state, action as Action, level);
      if (onStateUpdate) onStateUpdate(state);
    }

    if (state.isComplete || state.isFailed) {
      break;
    }
  }

  const totalTime = Date.now() - actionStartTime;
  console.log('Total execution time:', totalTime, 'ms for ', actions.length, 'actions');

  if (!state.isComplete) {
    state.isFailed = true;
    soundManager.play('fail');
    state.moveLog = [...state.moveLog, 'Failed to reach finish'];
  }

  state.timeElapsed = Date.now() - startTime;

  return state;
}
