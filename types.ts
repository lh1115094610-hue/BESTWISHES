
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface ParticleData {
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  size: number;
}

export interface OrnamentData {
  id: number;
  type: 'gift' | 'sphere' | 'light';
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  color: string;
  weight: number;
}
