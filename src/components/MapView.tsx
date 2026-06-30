import { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView, OrthographicViewport } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { SphereGeometry } from '@luma.gl/engine';

import { INITIAL_VIEW_STATE, lightingEffect, STAR_CONFIGS, VISIBILITY_OPACITIES } from '../lib/constants';
import { getHoverTooltip } from '../lib/tooltip';
import { filterSystems } from '../lib/utils';
import { SelectedObjectPopup } from './SelectedObjectPopup';
import { MapControls } from './MapControls';

interface MapViewProps {
  systems: any[];
  loading: boolean;
  error: string | null;
  selectedObject: any | null;
  onSelectObject: (obj: any | null) => void;
}

export function MapView({ systems, loading, error, selectedObject, onSelectObject }: MapViewProps) {
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

  const uniqueArms = useMemo(() => {
    return Array.from(new Set(systems.map((p: any) => p.armId)))
      .filter(v => v != null)
      .sort((a: any, b: any) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [systems]);

  const uniqueSectors = useMemo(() => {
    const relevantSystems = selectedArm === 'all' 
      ? systems 
      : systems.filter((p: any) => String(p.armId) === selectedArm);
    
    return Array.from(new Set(relevantSystems.map((p: any) => p.sectorId)))
      .filter(v => v != null)
      .sort((a: any, b: any) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [systems, selectedArm]);

  useEffect(() => {
    setSelectedSector('all');
  }, [selectedArm]);

  const filteredSystems = useMemo(() => {
    return filterSystems(systems, selectedArm, selectedSector);
  }, [systems, selectedArm, selectedSector]);

  const homeSystem = filteredSystems.find((p: any) => p.name === 'G3-37' && p.sectorId === 103 && p.armId === 3);

  const layers = [
    new SimpleMeshLayer({
      id: 'systems-2d',
      data: filteredSystems,
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
      data: filteredSystems.filter((p: any) => p.isTradingHub),
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
      data: filteredSystems.filter((p: any) => p.isTradingHub),
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
        getTooltip={({ object }) => getHoverTooltip({ object, selectedObject })}
      />

      {selectedObject && pos && (
        <SelectedObjectPopup 
          selectedObject={selectedObject} 
          pos={pos} 
          onClose={() => onSelectObject(null)} 
        />
      )}
      
      <MapControls 
        selectedArm={selectedArm}
        setSelectedArm={setSelectedArm}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        uniqueArms={uniqueArms}
        uniqueSectors={uniqueSectors}
        systems={systems}
        filteredSystems={filteredSystems}
        loading={loading}
        error={error}
      />
    </div>
  );
}
