import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapStats } from '../components/MapStats';
import type { GalaxySystem } from '../types';

describe('MapStats', () => {
  const mockFilteredSystems: GalaxySystem[] = [
    { id: 1, armId: 1, sectorId: 1, visibility: 'explored' },
    { id: 2, armId: 1, sectorId: 2, visibility: 'unexplored' },
    { id: 3, armId: 2, sectorId: 1, visibility: 'fog' },
    { id: 4, armId: 2, sectorId: 2, visibility: 'explored' },
  ];

  it('renders loading state correctly', () => {
    render(<MapStats filteredSystems={[]} loading={true} error={null} />);
    expect(screen.getByText('Loading map data...')).toBeInTheDocument();
    expect(screen.queryByText(/Total Systems:/)).not.toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    render(<MapStats filteredSystems={[]} loading={false} error="Network Error" />);
    expect(screen.getByText('Error: Network Error')).toBeInTheDocument();
    expect(screen.queryByText(/Total Systems:/)).not.toBeInTheDocument();
  });

  it('renders statistical data correctly when data is loaded successfully', () => {
    render(<MapStats filteredSystems={mockFilteredSystems} loading={false} error={null} />);
    
    // Total Systems should be 4
    expect(screen.getByText('Total Systems:')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Explored systems (not in fog): id 1, id 2, id 4 -> 3
    expect(screen.getByText('Explored:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Unexplored systems (in fog): id 3 -> 1
    expect(screen.getByText('Unexplored:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    
    expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
  });

  it('handles empty filtered systems list correctly', () => {
    render(<MapStats filteredSystems={[]} loading={false} error={null} />);
    
    expect(screen.getByText('Total Systems:')).toBeInTheDocument();
    const strongs = screen.getAllByRole('strong');
    // For empty list, total, explored, unexplored should all be 0
    strongs.forEach((strong) => {
      expect(strong.textContent).toBe('0');
    });
  });
});
