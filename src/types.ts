export type Player = 'X' | 'O';
export type GameMode = 'classic' | 'infinite';
export type OpponentType = 'player' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Scores {
  X: number;
  O: number;
  draws: number;
}

export interface WinnerInfo {
  winner: Player;
  line: number[];
}
