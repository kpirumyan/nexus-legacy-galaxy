import { useState, ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapView } from '../components/MapView';
import type { GalaxySystem } from '../types';

// Mock ResizeObserver to prevent errors in JSDOM resize tracking
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill setPointerCapture/releasePointerCapture for JSDOM
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// Mock @deck.gl/core to make OrthographicViewport calculation deterministic and safe in JSDOM
vi.mock('@deck.gl/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@deck.gl/core')>();
  return {
    ...actual,
    OrthographicViewport: class {
      project(coords: [number, number, number]): [number, number] {
        return [coords[0] + 100, coords[1] + 100];
      }
    }
  };
});

interface DeckGLMockProps {
  layers: Array<{
    props: {
      id: string;
      data?: GalaxySystem[];
      onClick?: (info: { object: GalaxySystem }) => void;
    };
  }>;
  getCursor?: (info: { isHovering: boolean }) => string;
  getTooltip?: (info: { object: GalaxySystem | null }) => { html: string; style: Record<string, string> } | null;
  viewState?: {
    target: [number, number, number];
    zoom: number;
  };
}

// Mock @deck.gl/react to render a high-fidelity interactive HTML harness
vi.mock('@deck.gl/react', () => {
  return {
    default: function DeckGLMock({ layers, getCursor, getTooltip, viewState }: DeckGLMockProps): ReactElement {
      const [hoveredObject, setHoveredObject] = useState<GalaxySystem | null>(null);
      
      const cursor = getCursor ? getCursor({ isHovering: !!hoveredObject }) : 'default';
      const tooltipResult = (getTooltip && hoveredObject) ? getTooltip({ object: hoveredObject }) : null;

      return (
        <div 
          data-testid="deck-gl-container" 
          style={{ cursor }}
        >
          <div data-testid="deck-gl-cursor-display">{cursor}</div>
          <div data-testid="deck-gl-view-state">
            {viewState ? JSON.stringify(viewState) : ''}
          </div>
          {tooltipResult && (
            <div 
              data-testid="deck-gl-tooltip" 
              dangerouslySetInnerHTML={{ __html: tooltipResult.html }} 
            />
          )}
          {layers.map((layer) => {
            if (!layer || !layer.props) return null;
            const { id, data, onClick } = layer.props;
            return (
              <div key={id} data-testid={`layer-${id}`}>
                {data && Array.isArray(data) && data.map((item: GalaxySystem, idx: number) => (
                  <button
                    key={item.id || idx}
                    data-testid={`system-node-${item.id}`}
                    onMouseEnter={() => setHoveredObject(item)}
                    onMouseLeave={() => setHoveredObject(null)}
                    onClick={() => {
                      if (onClick) {
                        onClick({ object: item });
                      }
                    }}
                  >
                    {item.name || 'system'}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      );
    }
  };
});

describe('MapView Interactions', () => {
  const mockSystems: GalaxySystem[] = [
    {
      id: 1,
      name: 'Sol',
      x: 10,
      y: 20,
      z: 0,
      sectorId: 1,
      armId: 1,
      visibility: 'explored',
      starType: 'yellow',
      securityZone: 'sentinel',
      hasColonies: true,
    },
    {
      id: 2,
      name: 'Vega',
      x: -50,
      y: 80,
      z: 10,
      sectorId: 2,
      armId: 1,
      visibility: 'fog',
    }
  ];

  const defaultProps = {
    systems: mockSystems,
    loading: false,
    error: null,
    selectedObject: null,
    onSelectObject: vi.fn(),
  };

  it('shows tooltip on hover', () => {
    render(<MapView {...defaultProps} />);
    
    // Find the system node button in our mocked DeckGL
    const solButton = screen.getByTestId('system-node-1');
    
    // Hover over it
    fireEvent.mouseEnter(solButton);
    
    // Verify that the tooltip is shown
    const tooltip = screen.getByTestId('deck-gl-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.innerHTML).toContain('Sol');
    expect(tooltip.innerHTML).toContain('Sector');
    expect(tooltip.innerHTML).toContain('yellow');
  });

  it('changes cursor on hover and reverts when leaving', () => {
    render(<MapView {...defaultProps} />);
    
    const cursorDisplay = screen.getByTestId('deck-gl-cursor-display');
    expect(cursorDisplay.textContent).toBe('default');
    
    const solButton = screen.getByTestId('system-node-1');
    
    // Hover
    fireEvent.mouseEnter(solButton);
    expect(cursorDisplay.textContent).toBe('pointer');
    
    // Leave
    fireEvent.mouseLeave(solButton);
    expect(cursorDisplay.textContent).toBe('default');
  });

  it('opens popup on left click and keeps it open', () => {
    function TestWrapper(): ReactElement {
      const [selected, setSelected] = useState<GalaxySystem | null>(null);
      return (
        <MapView 
          systems={mockSystems}
          loading={false}
          error={null}
          selectedObject={selected}
          onSelectObject={setSelected}
        />
      );
    }

    render(<TestWrapper />);
    
    const solButton = screen.getByTestId('system-node-1');
    
    // Left click on Sol
    fireEvent.click(solButton);
    
    // Assert that the popup opens by checking for popup-exclusive labels
    expect(screen.getByText('Security:')).toBeInTheDocument();
    expect(screen.getByText(/Sentinel/i)).toBeInTheDocument();
    
    // It stays open (is still in the document)
    expect(screen.getByText('Security:')).toBeInTheDocument();
  });

  it('closes popup when close button is clicked', () => {
    function TestWrapper(): ReactElement {
      const [selected, setSelected] = useState<GalaxySystem | null>(null);
      return (
        <MapView 
          systems={mockSystems}
          loading={false}
          error={null}
          selectedObject={selected}
          onSelectObject={setSelected}
        />
      );
    }

    render(<TestWrapper />);
    
    const solButton = screen.getByTestId('system-node-1');
    
    // Click to open
    fireEvent.click(solButton);
    expect(screen.getByText('Security:')).toBeInTheDocument();
    
    // Find close button (the SVG X parent button within the popup container)
    const securityLabel = screen.getByText('Security:');
    const popupCard = securityLabel.parentElement?.parentElement;
    expect(popupCard).toBeInTheDocument();
    
    const closeButton = popupCard?.querySelector('button');
    expect(closeButton).toBeInTheDocument();
    
    // Click close button
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    
    // Assert that the popup is closed
    expect(screen.queryByText('Security:')).not.toBeInTheDocument();
  });

  it('changes cursor to move/crosshair style on right pointerdown', () => {
    render(<MapView {...defaultProps} />);
    
    const container = screen.getByTestId('deck-gl-container').parentElement;
    expect(container).toBeInTheDocument();
    
    // Right click pointerdown (button 2)
    fireEvent.pointerDown(container!, { button: 2, clientX: 100, clientY: 100 });
    
    // Since rightButtonDown is true, a style tag with * { cursor: move !important; } should be rendered
    const styleElement = document.querySelector('style');
    expect(styleElement).toBeInTheDocument();
    expect(styleElement?.textContent).toContain('cursor: move !important');
    
    // Pointerup releases the right button
    fireEvent.pointerUp(container!, { button: 2 });
    
    // Style tag should be removed or no longer active
    expect(document.querySelector('style')).not.toBeInTheDocument();
  });

  it('moves map when right button is dragged', () => {
    render(<MapView {...defaultProps} />);
    
    const container = screen.getByTestId('deck-gl-container').parentElement;
    expect(container).toBeInTheDocument();
    
    const viewStateDisplay = screen.getByTestId('deck-gl-view-state');
    const initialViewState = JSON.parse(viewStateDisplay.textContent || '{}');
    expect(initialViewState.target).toEqual([0, 0, 0]);
    
    // Start right click drag
    fireEvent.pointerDown(container!, { button: 2, clientX: 100, clientY: 100 });
    
    // Move pointer
    fireEvent.pointerMove(container!, { clientX: 150, clientY: 120 });
    
    // Get new view state
    const currentViewState = JSON.parse(viewStateDisplay.textContent || '{}');
    
    // Target x and y should have changed
    expect(currentViewState.target[0]).not.toBe(0);
    expect(currentViewState.target[1]).not.toBe(0);
    
    // Release pointer
    fireEvent.pointerUp(container!, { button: 2 });
  });

  it('does not crash when pointerMove and pointerUp are batched', () => {
    render(<MapView {...defaultProps} />);
    
    const container = screen.getByTestId('deck-gl-container').parentElement;
    expect(container).toBeInTheDocument();
    
    // Start right click drag
    fireEvent.pointerDown(container!, { button: 2, clientX: 100, clientY: 100 });
    
    // In React 18 event handlers are batched. If pointerMove and pointerUp
    // happen in the same batch, the state updater function from pointerMove
    // will be executed AFTER pointerUp has already set dragStartRef.current to null.
    // By firing them synchronously together, we simulate this batching.
    fireEvent.pointerMove(container!, { clientX: 150, clientY: 120 });
    fireEvent.pointerUp(container!, { button: 2 });
    
    // The test passes if no error is thrown during the rendering phase.
    const viewStateDisplay = screen.getByTestId('deck-gl-view-state');
    const currentViewState = JSON.parse(viewStateDisplay.textContent || '{}');
    expect(currentViewState.target[0]).not.toBe(0);
  });
});
