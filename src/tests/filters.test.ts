import { filterSystems } from '../lib/utils';
import { describe, it, expect } from 'vitest';
import type { GalaxySystem } from '../types';

describe('filterSystems', () => {
  const mockSystems = [
    { id: 1, armId: 1, sectorId: 10, name: 'System A' },
    { id: 2, armId: 1, sectorId: 20, name: 'System B' },
    { id: 3, armId: 2, sectorId: 10, name: 'System C' },
    { id: 4, armId: 2, sectorId: 30, name: 'System D' },
    { id: 5, armId: 3, sectorId: 40, name: 'System E' },
  ] as GalaxySystem[];

  it('should return all systems when arm and sector are "all"', () => {
    const result = filterSystems(mockSystems, 'all', 'all');
    expect(result).toHaveLength(5);
  });

  it('should filter systems by arm correctly', () => {
    const resultArm1 = filterSystems(mockSystems, '1', 'all');
    expect(resultArm1).toHaveLength(2);
    expect(resultArm1.map(p => p.id)).toEqual([1, 2]);

    const resultArm2 = filterSystems(mockSystems, '2', 'all');
    expect(resultArm2).toHaveLength(2);
    expect(resultArm2.map(p => p.id)).toEqual([3, 4]);
  });

  it('should filter systems by sector correctly', () => {
    const resultSector10 = filterSystems(mockSystems, 'all', '10');
    expect(resultSector10).toHaveLength(2);
    expect(resultSector10.map(p => p.id)).toEqual([1, 3]);

    const resultSector40 = filterSystems(mockSystems, 'all', '40');
    expect(resultSector40).toHaveLength(1);
    expect(resultSector40[0].id).toBe(5);
  });

  it('should filter systems by both arm and sector correctly', () => {
    const result = filterSystems(mockSystems, '1', '10');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);

    const emptyResult = filterSystems(mockSystems, '3', '10');
    expect(emptyResult).toHaveLength(0);
  });

  it('should handle edge cases with string/number types', () => {
    const systemsWithMixedTypes = [
      { id: 1, armId: '1', sectorId: '10' },
      { id: 2, armId: 2, sectorId: 20 },
    ] as unknown as GalaxySystem[];
    
    // Testing numeric value passed as string against number in object
    const result1 = filterSystems(systemsWithMixedTypes, '2', '20');
    expect(result1).toHaveLength(1);
    expect(result1[0].id).toBe(2);

    // Testing numeric value passed as string against string in object
    const result2 = filterSystems(systemsWithMixedTypes, '1', '10');
    expect(result2).toHaveLength(1);
    expect(result2[0].id).toBe(1);
  });
});
