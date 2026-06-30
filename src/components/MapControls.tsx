import { X, ChevronDown } from 'lucide-react';
import { ARM_MAPPING } from '../lib/constants';

interface Props {
  selectedArm: string;
  setSelectedArm: (arm: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  uniqueArms: any[];
  uniqueSectors: any[];
  planets: any[];
  filteredPlanets: any[];
  loading: boolean;
  error: string | null;
}

export function MapControls({ 
  selectedArm, 
  setSelectedArm, 
  selectedSector, 
  setSelectedSector, 
  uniqueArms, 
  uniqueSectors,
  planets,
  filteredPlanets,
  loading,
  error
}: Props) {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      color: 'white',
      fontFamily: 'sans-serif',
      pointerEvents: 'none',
      background: 'rgba(10,10,10,0.75)',
      backdropFilter: 'blur(4px)',
      padding: '1.2rem',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h1 style={{ margin: '0 0 0.2rem 0', fontSize: '24px', letterSpacing: '1px' }}>Galaxy Map</h1>
      <p style={{ margin: '0 0 0.8rem 0', fontSize: '13px', color: '#888' }}>Nexus Legacy Extension</p>

      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Arm:</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={selectedArm}
              onChange={(e) => setSelectedArm(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                paddingRight: selectedArm !== 'all' ? '40px' : '24px',
                borderRadius: '4px',
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                fontSize: '12px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All</option>
              {uniqueArms.map(arm => (
                <option key={arm as string} value={String(arm)}>
                  {ARM_MAPPING[String(arm)]?.name || `Arm ${arm as string}`}
                </option>
              ))}
            </select>
            {selectedArm !== 'all' && (
              <button
                onClick={() => setSelectedArm('all')}
                style={{
                  position: 'absolute',
                  right: '24px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  borderRadius: '50%',
                  transition: 'color 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Clear Arm Filter"
              >
                <X size={12} />
              </button>
            )}
            <div style={{
              position: 'absolute',
              right: '8px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#aaa',
            }}>
              <ChevronDown size={12} />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Sector:</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                paddingRight: selectedSector !== 'all' ? '40px' : '24px',
                borderRadius: '4px',
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                fontSize: '12px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All</option>
              {uniqueSectors.map(sector => {
                let armIdStr = selectedArm !== 'all' ? selectedArm : null;
                if (!armIdStr) {
                   const planet = planets.find(p => String(p.sectorId) === String(sector));
                   if (planet) armIdStr = String(planet.armId);
                }
                const prefix = armIdStr && ARM_MAPPING[armIdStr] ? ARM_MAPPING[armIdStr].prefix : '';
                const sId = Number(sector);
                const displayId = !isNaN(sId) ? sId % 50 : sector;
                let sectorLabel = `${prefix}${displayId}`;
                if (String(sector) === '50') sectorLabel = 'The Rift Core';
                return (
                  <option key={sector as string} value={String(sector)}>
                    {sectorLabel}
                  </option>
                );
              })}
            </select>
            {selectedSector !== 'all' && (
              <button
                onClick={() => setSelectedSector('all')}
                style={{
                  position: 'absolute',
                  right: '24px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  borderRadius: '50%',
                  transition: 'color 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Clear Sector Filter"
              >
                <X size={12} />
              </button>
            )}
            <div style={{
              position: 'absolute',
              right: '8px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#aaa',
            }}>
              <ChevronDown size={12} />
            </div>
          </div>
        </div>
      </div>

      {loading && <p style={{ margin: 0, color: '#aaa', fontSize: '13px' }}>Loading map data...</p>}
      {error && <p style={{ margin: 0, color: '#ff6b6b', fontSize: '13px' }}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{ fontSize: '12px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>Total Systems: <strong style={{ color: '#fff' }}>{filteredPlanets.length}</strong></div>
          <div>Explored: <strong style={{ color: '#52c41a' }}>{filteredPlanets.filter((p: any) => p.visibility !== 'fog').length}</strong></div>
          <div>Unexplored: <strong style={{ color: '#ff9800' }}>{filteredPlanets.filter((p: any) => p.visibility === 'fog').length}</strong></div>
        </div>
      )}
    </div>
  );
}
