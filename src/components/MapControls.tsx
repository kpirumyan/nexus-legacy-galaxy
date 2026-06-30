import { MapHeader } from './MapHeader';
import { MapFilters } from './MapFilters';
import { MapStats } from './MapStats';
import type { MapControlsProps } from '../types';

export function MapControls({ 
  selectedArm, 
  setSelectedArm, 
  selectedSector, 
  setSelectedSector, 
  uniqueArms, 
  uniqueSectors,
  systems,
  filteredSystems,
  loading,
  error
}: MapControlsProps) {
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
      <MapHeader />
      
      <MapFilters
        selectedArm={selectedArm}
        setSelectedArm={setSelectedArm}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        uniqueArms={uniqueArms}
        uniqueSectors={uniqueSectors}
        systems={systems}
      />

      <MapStats
        filteredSystems={filteredSystems}
        loading={loading}
        error={error}
      />
    </div>
  );
}
