import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapControls } from '../components/MapControls';

describe('MapControls', () => {
  const mockSystems = [
    { id: 1, armId: 1, sectorId: 10, visibility: 'visible' },
    { id: 2, armId: 1, sectorId: 20, visibility: 'fog' },
    { id: 3, armId: 2, sectorId: 30, visibility: 'visible' },
  ];

  const defaultProps = {
    selectedArm: 'all',
    setSelectedArm: vi.fn(),
    selectedSector: 'all',
    setSelectedSector: vi.fn(),
    uniqueArms: [1, 2],
    uniqueSectors: [10, 20, 30],
    systems: mockSystems,
    filteredSystems: mockSystems,
    loading: false,
    error: null,
  };

  it('renders select elements correctly', () => {
    render(<MapControls {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2); // Arm and Sector selects
  });

  it('calls setSelectedArm when arm is changed', () => {
    const setSelectedArm = vi.fn();
    render(<MapControls {...defaultProps} setSelectedArm={setSelectedArm} />);
    
    const selects = screen.getAllByRole('combobox');
    const armSelect = selects[0]; // Assuming first is Arm based on DOM order
    
    fireEvent.change(armSelect, { target: { value: '1' } });
    expect(setSelectedArm).toHaveBeenCalledWith('1');
  });

  it('calls setSelectedSector when sector is changed', () => {
    const setSelectedSector = vi.fn();
    render(<MapControls {...defaultProps} setSelectedSector={setSelectedSector} />);
    
    const selects = screen.getAllByRole('combobox');
    const sectorSelect = selects[1]; // Assuming second is Sector
    
    fireEvent.change(sectorSelect, { target: { value: '10' } });
    expect(setSelectedSector).toHaveBeenCalledWith('10');
  });

  it('displays the correct number of total and explored systems based on filteredSystems', () => {
    render(<MapControls {...defaultProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Total systems (filteredSystems.length)
    expect(screen.getByText('2')).toBeInTheDocument(); // Explored systems
    expect(screen.getByText('1')).toBeInTheDocument(); // Unexplored (fog)
  });

  it('displays loading state correctly', () => {
    render(<MapControls {...defaultProps} loading={true} />);
    expect(screen.getByText('Loading map data...')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    render(<MapControls {...defaultProps} error="Failed to fetch" />);
    expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
  });

  it('shows clear buttons only when a specific arm or sector is selected', () => {
    // When both are 'all', no clear buttons should be present
    const { rerender } = render(<MapControls {...defaultProps} />);
    expect(screen.queryByTitle('Clear Arm Filter')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Clear Sector Filter')).not.toBeInTheDocument();

    // When an arm is selected
    rerender(<MapControls {...defaultProps} selectedArm="1" />);
    expect(screen.getByTitle('Clear Arm Filter')).toBeInTheDocument();
    expect(screen.queryByTitle('Clear Sector Filter')).not.toBeInTheDocument();

    // When a sector is selected
    rerender(<MapControls {...defaultProps} selectedArm="all" selectedSector="10" />);
    expect(screen.queryByTitle('Clear Arm Filter')).not.toBeInTheDocument();
    expect(screen.getByTitle('Clear Sector Filter')).toBeInTheDocument();
  });

  it('calls setSelectedArm with "all" when clear arm filter is clicked', () => {
    const setSelectedArm = vi.fn();
    render(<MapControls {...defaultProps} selectedArm="1" setSelectedArm={setSelectedArm} />);
    
    const clearArmButton = screen.getByTitle('Clear Arm Filter');
    fireEvent.click(clearArmButton);
    expect(setSelectedArm).toHaveBeenCalledWith('all');
  });

  it('calls setSelectedSector with "all" when clear sector filter is clicked', () => {
    const setSelectedSector = vi.fn();
    render(<MapControls {...defaultProps} selectedSector="10" setSelectedSector={setSelectedSector} />);
    
    const clearSectorButton = screen.getByTitle('Clear Sector Filter');
    fireEvent.click(clearSectorButton);
    expect(setSelectedSector).toHaveBeenCalledWith('all');
  });
});
