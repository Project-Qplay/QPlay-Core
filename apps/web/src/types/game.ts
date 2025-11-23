export type Room = 
  | 'probability-bay'
  | 'state-chamber'
  | 'superposition-tower'
  | 'entanglement-bridge'
  | 'tunneling-vault'
  | 'quantum-archive';

export interface GameState {
  completedRooms: Room[];
  currentProgress: number;
  achievements: string[];
  totalScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}