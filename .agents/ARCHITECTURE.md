# Application Architecture

## Overview
This application is a React-based 3D Galaxy Map visualizer. It uses `deck.gl` for high-performance WebGL rendering of star systems and UI overlays for navigation and data inspection.

## Directory Structure
- `/src/components/`: React UI components.
  - `MapView.tsx`: The core 3D map component wrapping `DeckGL`. Handles camera controls, rendering scatterplot, path, and text layers, as well as user interactions (click/drag/hover).
  - `MapControls.tsx`: UI overlay for filtering the map by Galaxy Arm and Sector.
  - `SelectedObjectPopup.tsx`: A detail popup component that renders detailed information about a selected star system or trading hub.
  - `SidebarLayout.tsx` & `SidebarContent.tsx`: Application sidebar layout and content elements.
- `/src/lib/`: Reusable logic and constants.
  - `constants.ts`: Global configuration including map visual states, lighting effects, color mappings for stars (`STAR_CONFIGS`), and arm/sector data definitions.
  - `utils.ts`: Data processing functions, including `processGalaxyData3D` which translates 2D planetary coordinates into 3D positions, simulating a galactic disk thickness and central bulge.
  - `tooltip.ts`: Logic for generating HTML tooltips displayed when hovering over systems in `deck.gl`.
- `/src/App.tsx`: Main application entry point. Handles global state management (e.g., loading planet data) and sets up routing.

## State Management
State is managed via React's built-in hooks (`useState`, `useMemo`, `useEffect`).
- Global data (`planets`) is fetched and stored in `App.tsx` and passed down to `MapView.tsx` as props.
- Map view state (camera position, selected objects) and filtering state (selected arm/sector) are maintained in `MapView.tsx` and propagated to controls.

## Rendering Engine
- **Deck.gl**: Used for rendering massive datasets of stars and trading hubs performantly. Currently uses `OrthographicView` for a 2.5D visual layout.
- **Styling**: Tailwind CSS is used globally, with inline styles handling dynamic data-driven visual properties in popups and overlays.
