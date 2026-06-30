import type { MapHeaderProps } from '../types';

export function MapHeader({ 
  title = 'Galaxy Map', 
  subtitle = 'Nexus Legacy Extension' 
}: MapHeaderProps) {
  return (
    <>
      <h1 style={{ margin: '0 0 0.2rem 0', fontSize: '24px', letterSpacing: '1px' }}>{title}</h1>
      <p style={{ margin: '0 0 0.8rem 0', fontSize: '13px', color: '#888' }}>{subtitle}</p>
    </>
  );
}
