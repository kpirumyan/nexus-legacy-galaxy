import { ReactNode } from 'react';
import type { GalaxySystem } from './models';

export interface SidebarLayoutProps {
  children: ReactNode;
  sidebarContent: ReactNode;
}

export interface SelectedObjectPopupProps {
  selectedObject: GalaxySystem;
  pos: { x: number, y: number };
  onClose: () => void;
}

export interface MapControlsProps {
  selectedArm: string;
  setSelectedArm: (arm: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  uniqueArms: (string | number)[];
  uniqueSectors: (string | number)[];
  systems: GalaxySystem[];
  filteredSystems: GalaxySystem[];
  loading: boolean;
  error: string | null;
}

export interface MapHeaderProps {
  title?: string;
  subtitle?: string;
}

export interface MapFiltersProps {
  selectedArm: string;
  setSelectedArm: (arm: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  uniqueArms: (string | number)[];
  uniqueSectors: (string | number)[];
  systems: GalaxySystem[];
}

export interface MapStatsProps {
  filteredSystems: GalaxySystem[];
  loading: boolean;
  error: string | null;
}

export interface MapViewProps {
  systems: GalaxySystem[];
  loading: boolean;
  error: string | null;
  selectedObject: GalaxySystem | null;
  onSelectObject: (obj: GalaxySystem | null) => void;
}

