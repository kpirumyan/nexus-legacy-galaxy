import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

export const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5
});

export const sunLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [0, 0, 0]
});

export const lightingEffect = new LightingEffect({ ambientLight, sunLight });

export const INITIAL_VIEW_STATE = {
  target: [0, 0, 0] as [number, number, number],
  zoom: -1.5
};

export const ARM_MAPPING: Record<string, { name: string, prefix: string }> = {
  '1': { name: 'Alpha Arm', prefix: 'A' },
  '2': { name: 'Beta Arm', prefix: 'B' },
  '3': { name: 'Gamma Arm', prefix: 'G' },
  '4': { name: 'Delta Arm', prefix: 'D' },
  '5': { name: 'Epsilon Arm', prefix: 'E' },
  '6': { name: 'Zeta Arm', prefix: 'Z' },
  '7': { name: 'Eta Arm', prefix: 'H' },
  '8': { name: 'Theta Arm', prefix: 'Th' },
};

export const STAR_CONFIGS: Record<string, { color: [number, number, number], size: number }> = {
  neutron: { color: [180, 100, 255], size: 0.8 },      
  white_dwarf: { color: [220, 230, 255], size: 1.0 },  
  red_dwarf: { color: [255, 70, 70], size: 1.8 },      
  orange: { color: [255, 140, 0], size: 2.8 },         
  yellow: { color: [255, 220, 80], size: 3.5 },        
  blue_giant: { color: [50, 150, 255], size: 6.0 },    
};

export const VISIBILITY_OPACITIES: Record<string, number> = {
  fog: 85,
  outline: 110,
  partial: 180,
  full: 255
};
