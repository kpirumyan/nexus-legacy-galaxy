export interface GalaxySystem {
  id: number;
  x?: number;
  y?: number;
  z?: number;
  sectorId: number;
  armId: number;
  visibility: 'fog' | 'explored' | 'unexplored' | string;
  name?: string;
  isTradingHub?: boolean;
  radius?: number;
  color?: [number, number, number, number] | [number, number, number];
  x3d?: number;
  y3d?: number;
  z3d?: number;
  starType?: string;
  securityZone?: string;
  hasColonies?: boolean;
}

