import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from './components/SidebarLayout';
import { SidebarContent } from './components/SidebarContent';
import { MapView } from './components/MapView';
import { processGalaxyData3D } from './lib/utils';

export default function App() {
  const [planets, setPlanets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  useEffect(() => {
    async function fetchGalaxyMap() {
      try {
        const response = await fetch('/api/map');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const planetsData = Array.isArray(data) ? data : (data.planets || data.data || data.map || data.systems || []);
        
        const processedData = processGalaxyData3D(planetsData);
        setPlanets(processedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGalaxyMap();
  }, []);

  return (
    <SidebarLayout sidebarContent={<SidebarContent object={selectedObject} />}>
      <Routes>
        <Route path="/" element={<MapView planets={planets} loading={loading} error={error} selectedObject={selectedObject} onSelectObject={setSelectedObject} />} />
      </Routes>
    </SidebarLayout>
  );
}
