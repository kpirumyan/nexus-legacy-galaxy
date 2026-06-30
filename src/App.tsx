import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from './components/SidebarLayout';
import { SidebarContent } from './components/SidebarContent';
import { MapView } from './components/MapView';
import { processGalaxyData3D } from './lib/utils';

export default function App() {
  const [systems, setSystems] = useState<any[]>([]);
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
        const systemsData = Array.isArray(data) ? data : (data.planets || data.data || data.map || data.systems || []);
        
        const processedData = processGalaxyData3D(systemsData);
        setSystems(processedData);
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
        <Route path="/" element={<MapView systems={systems} loading={loading} error={error} selectedObject={selectedObject} onSelectObject={setSelectedObject} />} />
      </Routes>
    </SidebarLayout>
  );
}
