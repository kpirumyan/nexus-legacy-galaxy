import type { GalaxySystem, MapStatsProps } from '../types';

export function MapStats({
  filteredSystems,
  loading,
  error
}: MapStatsProps) {
  return (
    <>
      {loading && <p style={{ margin: 0, color: '#aaa', fontSize: '13px' }}>Loading map data...</p>}
      {error && <p style={{ margin: 0, color: '#ff6b6b', fontSize: '13px' }}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{ fontSize: '12px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>Total Systems: <strong style={{ color: '#fff' }}>{filteredSystems.length}</strong></div>
          <div>Explored: <strong style={{ color: '#52c41a' }}>{filteredSystems.filter((p: GalaxySystem) => p.visibility !== 'fog').length}</strong></div>
          <div>Unexplored: <strong style={{ color: '#ff9800' }}>{filteredSystems.filter((p: GalaxySystem) => p.visibility === 'fog').length}</strong></div>
        </div>
      )}
    </>
  );
}
