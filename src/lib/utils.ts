import { ARM_MAPPING } from './constants';
import type { GalaxySystem } from '../types';

export function formatSectorDisplay(sectorId: string | number, armId: string | number | undefined) {
  if (String(sectorId) === '50') return 'The Rift Core';
  const armPrefix = armId ? (ARM_MAPPING[String(armId)]?.prefix || '') : '';
  const sId = Number(sectorId);
  return !isNaN(sId) ? `${armPrefix}${sId % 50}` : `${armPrefix}${sectorId}`;
}

export function formatArmDisplay(armId: string | number) {
  return ARM_MAPPING[String(armId)]?.name || `Arm ${armId}`;
}

export function filterSystems(systems: GalaxySystem[], selectedArm: string, selectedSector: string) {
  return systems.filter((p: GalaxySystem) => {
    const armMatch = selectedArm === 'all' || String(p.armId) === selectedArm;
    const sectorMatch = selectedSector === 'all' || String(p.sectorId) === selectedSector;
    return armMatch && sectorMatch;
  });
}

export function processGalaxyData3D(data: GalaxySystem[]) {
  let maxR = 0;
  for (const p of data) {
    const x = p.x || 0;
    const y = p.y || 0;
    const r = Math.sqrt(x*x + y*y);
    if (r > maxR) maxR = r;
  }

  if (maxR === 0) maxR = 1000;

  const bulgeRadius = maxR * 0.15;
  const diskThickness = maxR * 0.02;
  const bulgeThickness = maxR * 0.12;

  const randomNormal = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const tradingHubIds = new Set([501, 2851, 5201, 7551, 9901, 12251, 2001, 4351, 6701, 9051, 11401, 13751]);

  return data.map((p, idx) => {
    const x = p.x || 0;
    const y = p.y || 0;
    const r = Math.sqrt(x*x + y*y);
    
    const thickness = diskThickness + Math.exp(-(r * r) / (bulgeRadius * bulgeRadius)) * bulgeThickness;
    let z = randomNormal() * thickness;
    
    let factor: number;
    if (r * r > z * z) {
      factor = Math.sqrt(r * r - z * z) / r;
    } else {
      z = r * (z > 0 ? 1 : -1);
      factor = 0;
    }
    
    const isTradingHub = tradingHubIds.has(p.id) || (data.length - idx) <= 12;

    return {
      ...p,
      x3d: x * factor,
      y3d: y * factor,
      z3d: z,
      isTradingHub
    };
  });
}
