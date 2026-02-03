export type Action =
  | 'forward'
  | 'turnLeft'
  | 'turnRight'
  | 'jump'
  | 'use'
  | 'pickup'
  | 'loop';

export type CellType = 'path' | 'ground';

export type ObjectType =
  | 'start'
  | 'finish'
  | 'key'
  | 'lock'
  | 'obstacle'
  | 'bulb'
  | 'ammeter'
  | 'battery'
  | 'resistor'
  | 'switch'
  | 'voltmeter';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  playerPosition: Position;
  playerDirection: Direction;
  inventory: string[];
  objectsMatrix: (ObjectType | null)[][];
  isComplete: boolean;
  isFailed: boolean;
  isJumping: boolean;
  timeElapsed: number;
  moveLog: string[];
}

export interface Level {
  index: number;
  name: string;
  description: string;
  actions: Action[];
  levelMatrix: CellType[][];
  objectsMatrix: (ObjectType | null)[][];
}

export interface LoopAction {
  type: 'loop';
  iterations: number;
  actions: Action[];
}

export type GameAction = Action | LoopAction;
