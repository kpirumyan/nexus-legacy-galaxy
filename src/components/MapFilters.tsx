import { X, ChevronDown } from 'lucide-react';
import { ARM_MAPPING } from '../lib/constants';
import type { MapFiltersProps } from '../types';

export function MapFilters({
  selectedArm,
  setSelectedArm,
  selectedSector,
  setSelectedSector,
  uniqueArms,
  uniqueSectors,
  systems
}: MapFiltersProps) {
  return (
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
                 const system = systems.find(p => String(p.sectorId) === String(sector));
                 if (system) armIdStr = String(system.armId);
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
  );
}
