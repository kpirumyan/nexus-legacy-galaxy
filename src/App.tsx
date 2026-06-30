import { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DeckGL from '@deck.gl/react';
import { OrthographicView, OrthographicViewport, LightingEffect, AmbientLight, PointLight } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { SphereGeometry } from '@luma.gl/engine';
import { X, ChevronDown } from 'lucide-react';
import { SidebarLayout } from './components/SidebarLayout';
import { SidebarContent } from './components/SidebarContent';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5
});

const sunLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [0, 0, 0]
});

const lightingEffect = new LightingEffect({ ambientLight, sunLight });

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0] as [number, number, number],
  zoom: -1.5
};

const ARM_MAPPING: Record<string, { name: string, prefix: string }> = {
  '1': { name: 'Alpha Arm', prefix: 'A' },
  '2': { name: 'Beta Arm', prefix: 'B' },
  '3': { name: 'Gamma Arm', prefix: 'G' },
  '4': { name: 'Delta Arm', prefix: 'D' },
  '5': { name: 'Epsilon Arm', prefix: 'E' },
  '6': { name: 'Zeta Arm', prefix: 'Z' },
  '7': { name: 'Eta Arm', prefix: 'H' },
  '8': { name: 'Theta Arm', prefix: 'Th' },
};

function formatSectorDisplay(sectorId: any, armId: any) {
  if (String(sectorId) === '50') return 'The Rift Core';
  const armPrefix = armId ? (ARM_MAPPING[String(armId)]?.prefix || '') : '';
  const sId = Number(sectorId);
  return !isNaN(sId) ? `${armPrefix}${sId % 50}` : `${armPrefix}${sectorId}`;
}

function formatArmDisplay(armId: any) {
  return ARM_MAPPING[String(armId)]?.name || `Arm ${armId}`;
}

// Mapping for Star Types (Colors and Base Sizes)
const STAR_CONFIGS: Record<string, { color: [number, number, number], size: number }> = {
  neutron: { color: [180, 100, 255], size: 0.8 },      // Violet, small, dense
  white_dwarf: { color: [220, 230, 255], size: 1.0 },  // White-blue, small
  red_dwarf: { color: [255, 70, 70], size: 1.8 },      // Red, medium-small
  orange: { color: [255, 140, 0], size: 2.8 },         // Orange, medium
  yellow: { color: [255, 220, 80], size: 3.5 },        // Yellow, medium-large (like Sun)
  blue_giant: { color: [50, 150, 255], size: 6.0 },    // Blue, very large
};

// Visibility Opacities (0-255)
const VISIBILITY_OPACITIES: Record<string, number> = {
  fog: 85,
  outline: 110,
  partial: 180,
  full: 255
};

function processGalaxyData3D(data: any[]) {
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
    
    let factor = 1;
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

function MapView({ planets, loading, error, selectedObject, onSelectObject }: { planets: any[], loading: boolean, error: string | null, selectedObject: any | null, onSelectObject: (obj: any | null) => void }) {
  const [selectedArm, setSelectedArm] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; target: [number, number, number] } | null>(null);
  const [viewState, setViewState] = useState<any>(INITIAL_VIEW_STATE);
  const [rightButtonDown, setRightButtonDown] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setRightButtonDown(false);
        isDraggingRef.current = false;
        dragStartRef.current = null;
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getStickyPosition = () => {
    if (!selectedObject) return null;
    try {
      const viewport = new OrthographicViewport({
        width: dimensions.width,
        height: dimensions.height,
        target: viewState.target,
        zoom: viewState.zoom
      });
      const [x, y] = viewport.project([selectedObject.x || 0, selectedObject.y || 0, selectedObject.z || 0]);
      return { x, y };
    } catch (e) {
      return null;
    }
  };

  const sphereGeometry = useMemo(() => new SphereGeometry(), []);
  const location = useLocation();

  const uniqueArms = useMemo(() => {
    return Array.from(new Set(planets.map((p: any) => p.armId)))
      .filter(v => v != null)
      .sort((a: any, b: any) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [planets]);

  const uniqueSectors = useMemo(() => {
    const relevantPlanets = selectedArm === 'all' 
      ? planets 
      : planets.filter((p: any) => String(p.armId) === selectedArm);
    
    return Array.from(new Set(relevantPlanets.map((p: any) => p.sectorId)))
      .filter(v => v != null)
      .sort((a: any, b: any) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [planets, selectedArm]);

  // Reset sector when arm changes
  useEffect(() => {
    setSelectedSector('all');
  }, [selectedArm]);

  const filteredPlanets = useMemo(() => {
    return planets.filter((p: any) => {
      const armMatch = selectedArm === 'all' || String(p.armId) === selectedArm;
      const sectorMatch = selectedSector === 'all' || String(p.sectorId) === selectedSector;
      return armMatch && sectorMatch;
    });
  }, [planets, selectedArm, selectedSector]);

  const homeSystem = filteredPlanets.find((p: any) => p.name === 'G3-37' && p.sectorId === 103 && p.armId === 3);

  const layers = [
    new SimpleMeshLayer({
      id: 'planets-2d',
      data: filteredPlanets,
      mesh: sphereGeometry,
      pickable: true,
      onClick: (info) => {
        if (info.object) {
          onSelectObject(info.object);
        }
      },
      getPosition: (d: any) => {
        return [d.x || 0, d.y || 0, d.z || 0] as [number, number, number];
      },
      getColor: (d: any) => {
        if (d.isTradingHub) {
          return [255, 255, 255, 255] as [number, number, number, number];
        }
        
        const opacity = VISIBILITY_OPACITIES[d.visibility] ?? 255;
        
        if (d.visibility === 'fog') {
          return [120, 120, 120, opacity] as [number, number, number, number];
        }
        
        if (d.starType && STAR_CONFIGS[d.starType]) {
          const { color } = STAR_CONFIGS[d.starType];
          return [...color, opacity] as [number, number, number, number];
        }
        
        return [255, 255, 255, opacity] as [number, number, number, number]; 
      },
      getOrientation: [0, 0, 0],
      getScale: (d: any) => {
        if (d.isTradingHub) {
          return [2.5, 2.5, 2.5];
        }
        if (d.visibility === 'fog') {
          const yellowSize = STAR_CONFIGS['yellow'].size;
          return [yellowSize, yellowSize, yellowSize]; 
        }
        const baseSize = STAR_CONFIGS[d.starType]?.size ?? 1.5;
        return [baseSize, baseSize, baseSize];
      }
    }),
    new PathLayer({
      id: 'trading-hubs-squares',
      data: filteredPlanets.filter((p: any) => p.isTradingHub),
      getPath: (d: any) => {
        const r = 10;
        const x = d.x || 0;
        const y = d.y || 0;
        const z = d.z || 0;
        return [
          [x - r, y - r, z],
          [x - r, y + r, z],
          [x + r, y + r, z],
          [x + r, y - r, z],
          [x - r, y - r, z]
        ];
      },
      getColor: [255, 210, 0, 255],
      getWidth: 3,
      widthMinPixels: 2,
      pickable: false,
      parameters: {
        depthTest: false
      }
    }),
    new TextLayer({
      id: 'trading-hub-labels',
      data: filteredPlanets.filter((p: any) => p.isTradingHub),
      getPosition: (d: any) => [d.x || 0, d.y || 0, d.z || 0] as [number, number, number],
      getText: (d: any) => d.name || 'Trading Post',
      getSize: 12,
      getColor: [255, 210, 0, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: [0, 18],
      fontWeight: 'bold',
      fontFamily: 'Inter, sans-serif',
      parameters: {
        depthTest: false
      }
    }),
    new ScatterplotLayer({
      id: 'rift-core-glow',
      data: [
        { radius: 105, color: [110, 30, 180, 15] },
        { radius: 75, color: [110, 30, 180, 60] },
        { radius: 50, color: [110, 30, 180, 40] },
        { radius: 35, color: [110, 30, 180, 90] },
      ],
      getPosition: [0, 0, 0],
      getFillColor: (d: any) => d.color,
      getRadius: (d: any) => d.radius,
      filled: true,
      stroked: false,
      pickable: false,
    }),
    new ScatterplotLayer({
      id: 'rift-core-hole',
      data: [{ radius: 22, x: 0, y: 0, z: 0 }],
      getPosition: (d: any) => [d.x, d.y, d.z] as [number, number, number],
      getFillColor: [0, 0, 0, 255],
      getRadius: (d: any) => d.radius,
      filled: true,
      stroked: false,
      pickable: false,
    }),
    ...(homeSystem ? [
      new ScatterplotLayer({
        id: 'home-system-highlight',
        data: [homeSystem],
        getPosition: (d: any) => [d.x || 0, d.y || 0, d.z || 0] as [number, number, number],
        getFillColor: [0, 0, 0, 0],
        getLineColor: [0, 255, 0, 255],
        lineWidthMinPixels: 2,
        getRadius: STAR_CONFIGS['blue_giant'].size,
        stroked: true,
        filled: false,
        pickable: false,
      })
    ] : [])
  ];

  const pos = getStickyPosition();

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (e.button === 2) {
          e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            target: [viewState.target[0], viewState.target[1], viewState.target[2] || 0]
          };
          isDraggingRef.current = true;
          setRightButtonDown(true);
        }
      }}
      onPointerMove={(e) => {
        if (isDraggingRef.current && dragStartRef.current) {
          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;
          const scale = Math.pow(2, viewState.zoom);
          const worldDx = dx / scale;
          const worldDy = dy / scale;
          
          setViewState((prev: any) => ({
            ...prev,
            target: [
              dragStartRef.current!.target[0] - worldDx,
              dragStartRef.current!.target[1] - worldDy,
              0
            ]
          }));
        }
      }}
      onPointerUp={(e) => {
        if (e.button === 2 && isDraggingRef.current) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          isDraggingRef.current = false;
          dragStartRef.current = null;
          setRightButtonDown(false);
        }
      }}
      onPointerCancel={(e) => {
        if (isDraggingRef.current) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          isDraggingRef.current = false;
          dragStartRef.current = null;
          setRightButtonDown(false);
        }
      }}
    >
      {rightButtonDown && (
        <style>{`
          * {
            cursor: move !important;
          }
        `}</style>
      )}
      <DeckGL
        views={new OrthographicView()}
        viewState={viewState}
        onViewStateChange={({ viewState: nextViewState }) => setViewState(nextViewState)}
        controller={{
          dragPan: false,
          dragRotate: false,
          doubleClickZoom: true,
          scrollZoom: true,
        }}
        layers={layers}
        effects={[lightingEffect]}
        style={{backgroundColor: '#0a0a0a'}}
        getCursor={({ isHovering }) => {
          if (isHovering) {
            return 'pointer';
          }
          return 'default';
        }}
        getTooltip={({ object }) => {
          if (!object) return null;
          if (selectedObject && object.id === selectedObject.id) return null;
          
          const displaySector = formatSectorDisplay(object.sectorId, object.armId);
          const displayArm = formatArmDisplay(object.armId);
          
          if (object.isTradingHub) {
            const displayName = object.name || 'Trading Post';
            const securityLabel = object.securityZone || 'sentinel';
            const securityColor = 
              securityLabel === 'rift' ? '#ff4d4d' :
              securityLabel === 'dead' ? '#ff9c6e' : '#52c41a';
 
            return {
              html: `
                <div style="font-family: sans-serif; padding: 10px; background: #141103; border: 1px solid #ffd700; border-radius: 6px; color: #fff; min-width: 160px; box-shadow: 0 4px 12px rgba(255,215,0,0.15);">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #ffd700;">${displayName}</div>
                  <div style="font-size: 11px; color: #aaa; margin-bottom: 8px; text-transform: capitalize;">
                    ${String(object.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • ${displayArm} • Trading Hub
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="color: #aaa;">Security:</span>
                    <span style="font-weight: bold; color: ${securityColor}; text-transform: capitalize;">${securityLabel}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span style="color: #aaa;">Type:</span>
                    <span style="font-weight: bold; color: #ffd700;">Trading Post</span>
                  </div>
                </div>
              `,
              style: { backgroundColor: 'transparent', boxShadow: 'none' }
            };
          }
          
          if (object.visibility === 'fog') {
            return {
              html: `
                <div style="font-family: sans-serif; padding: 8px; background: #151515; border: 1px solid #333; border-radius: 4px; color: #fff;">
                  <div style="font-weight: bold; color: #777;">Unexplored System</div>
                  <div style="font-size: 11px; margin-top: 4px; color: #aaa;">${String(object.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • ${displayArm}</div>
                  <div style="font-size: 10px; margin-top: 4px; color: #ff9800; font-style: italic;">Fog of War</div>
                </div>
              `,
              style: { backgroundColor: 'transparent', boxShadow: 'none' }
            };
          }
          
          const typeLabel = (object.starType || 'unknown').replace('_', ' ');
          const starColor = STAR_CONFIGS[object.starType]?.color || [255, 255, 255];
          const securityColor = 
            object.securityZone === 'rift' ? '#ff4d4d' :
            object.securityZone === 'dead' ? '#ff9c6e' :
            object.securityZone === 'sentinel' ? '#52c41a' : '#1890ff';
            
          return {
            html: `
              <div style="font-family: sans-serif; padding: 10px; background: #0f0f14; border: 1px solid #444; border-radius: 6px; color: #fff; min-width: 160px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #fff;">${object.name || 'Unknown System'}</div>
                <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: capitalize;">
                  ${String(object.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • ${displayArm} • ${object.visibility} info
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="color: #aaa;">Type:</span>
                  <span style="font-weight: bold; color: rgb(${starColor.join(',')}); text-transform: capitalize;">${typeLabel}</span>
                </div>
                ${object.securityZone ? `
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="color: #aaa;">Security:</span>
                  <span style="font-weight: bold; color: ${securityColor}; text-transform: capitalize;">${object.securityZone}</span>
                </div>` : ''}
                ${object.hasColonies !== undefined ? `
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span style="color: #aaa;">Colonies:</span>
                  <span style="font-weight: bold; color: ${object.hasColonies ? '#52c41a' : '#ff4d4f'}">${object.hasColonies ? 'Yes' : 'No'}</span>
                </div>` : ''}
              </div>
            `,
            style: { backgroundColor: 'transparent', boxShadow: 'none' }
          };
        }}
      />

      {selectedObject && pos && (() => {
        const displaySector = formatSectorDisplay(selectedObject.sectorId, selectedObject.armId);
        const displayArm = formatArmDisplay(selectedObject.armId);
        
        let content;
        if (selectedObject.isTradingHub) {
          const displayName = selectedObject.name || 'Trading Post';
          const securityLabel = selectedObject.securityZone || 'sentinel';
          const securityColor = 
            securityLabel === 'rift' ? '#ff4d4d' :
            securityLabel === 'dead' ? '#ff9c6e' : '#52c41a';
            
          content = (
            <div style={{
              fontFamily: 'sans-serif',
              padding: '12px',
              background: '#141103',
              border: '2px solid #ffd700',
              borderRadius: '8px',
              color: '#fff',
              minWidth: '200px',
              boxShadow: '0 4px 20px rgba(255,215,0,0.25)',
              position: 'relative',
            }}>
              <button
                onClick={() => onSelectObject(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ffd700',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,215,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={14} />
              </button>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#ffd700', paddingRight: '20px' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', textTransform: 'capitalize' }}>
                {String(selectedObject.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • {displayArm} • Trading Hub
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>Security:</span>
                <span style={{ fontWeight: 'bold', color: securityColor, textTransform: 'capitalize' }}>{securityLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#aaa' }}>Type:</span>
                <span style={{ fontWeight: 'bold', color: '#ffd700' }}>Trading Post</span>
              </div>
            </div>
          );
        } else if (selectedObject.visibility === 'fog') {
          content = (
            <div style={{
              fontFamily: 'sans-serif',
              padding: '12px',
              background: '#151515',
              border: '2px solid #555',
              borderRadius: '8px',
              color: '#fff',
              minWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              position: 'relative',
            }}>
              <button
                onClick={() => onSelectObject(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={14} />
              </button>
              <div style={{ fontWeight: 'bold', color: '#777', paddingRight: '20px' }}>Unexplored System</div>
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#aaa' }}>
                {String(selectedObject.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • {displayArm}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px', color: '#ff9800', fontStyle: 'italic' }}>Fog of War</div>
            </div>
          );
        } else {
          const typeLabel = (selectedObject.starType || 'unknown').replace('_', ' ');
          const starColor = STAR_CONFIGS[selectedObject.starType]?.color || [255, 255, 255];
          const securityColor = 
            selectedObject.securityZone === 'rift' ? '#ff4d4d' :
            selectedObject.securityZone === 'dead' ? '#ff9c6e' :
            selectedObject.securityZone === 'sentinel' ? '#52c41a' : '#1890ff';
            
          content = (
            <div style={{
              fontFamily: 'sans-serif',
              padding: '12px',
              background: '#0f0f14',
              border: '2px solid #555',
              borderRadius: '8px',
              color: '#fff',
              minWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              position: 'relative',
            }}>
              <button
                onClick={() => onSelectObject(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={14} />
              </button>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#fff', paddingRight: '20px' }}>
                {selectedObject.name || 'Unknown System'}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'capitalize' }}>
                {String(selectedObject.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • {displayArm} • {selectedObject.visibility} info
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>Type:</span>
                <span style={{ fontWeight: 'bold', color: `rgb(${starColor.join(',')})`, textTransform: 'capitalize' }}>{typeLabel}</span>
              </div>
              {selectedObject.securityZone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#aaa' }}>Security:</span>
                  <span style={{ fontWeight: 'bold', color: securityColor, textTransform: 'capitalize' }}>{selectedObject.securityZone}</span>
                </div>
              )}
              {selectedObject.hasColonies !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#aaa' }}>Colonies:</span>
                  <span style={{ fontWeight: 'bold', color: selectedObject.hasColonies ? '#52c41a' : '#ff4d4f' }}>{selectedObject.hasColonies ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -105%)',
            pointerEvents: 'auto',
            zIndex: 1000,
          }}>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '16px',
              height: '16px',
              background: selectedObject.isTradingHub ? '#141103' : (selectedObject.visibility === 'fog' ? '#151515' : '#0f0f14'),
              borderBottom: `2px solid ${selectedObject.isTradingHub ? '#ffd700' : '#555'}`,
              borderRight: `2px solid ${selectedObject.isTradingHub ? '#ffd700' : '#555'}`,
              zIndex: -1,
            }} />
            {content}
          </div>
        );
      })()}
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
                  // If an arm is selected, use its prefix. Otherwise find the arm for this sector.
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
    </div>
  );
}

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
