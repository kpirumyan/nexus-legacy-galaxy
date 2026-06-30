# Application Architecture

## Overview
This application is a React-based 3D Galaxy Map visualizer. It uses `deck.gl` for high-performance WebGL rendering of star systems and UI overlays for navigation and data inspection.

## Directory Structure
- `/src/components/`: React UI components.
  - `MapView.tsx`: The core 3D map component wrapping `DeckGL`. Handles camera controls, rendering scatterplot, path, and text layers, as well as user interactions (click/drag/hover).
  - `MapControls.tsx`: UI overlay container for coordinating map UI panels and controls.
  - `MapHeader.tsx`: Atomic heading component showing the map title and subtitle.
  - `MapFilters.tsx`: Atomic filter controls for choosing the galaxy arm and sector.
  - `MapStats.tsx`: Atomic statistical summary showing total, explored, and unexplored systems.
  - `SelectedObjectPopup.tsx`: A detail popup component that renders detailed information about a selected star system or trading hub.
  - `SidebarLayout.tsx` & `SidebarContent.tsx`: Application sidebar layout and content elements.
- `/src/types/`: Centralized TypeScript interfaces and type definitions. All domain and component types MUST be declared here to ensure a single source of truth.
- `/src/lib/`: Reusable logic and constants.
  - `constants.ts`: Global configuration including map visual states, lighting effects, color mappings for stars (`STAR_CONFIGS`), and arm/sector data definitions.
  - `utils.ts`: Data processing functions, including `processGalaxyData3D` which translates 2D planetary coordinates into 3D positions, simulating a galactic disk thickness and central bulge.
  - `tooltip.ts`: Logic for generating HTML tooltips displayed when hovering over systems in `deck.gl`.
- `/src/App.tsx`: Main application entry point. Handles global state management (e.g., loading planet data) and sets up routing.

## State Management
State is managed via React's built-in hooks (`useState`, `useMemo`, `useEffect`).
- Global data (`planets`) is fetched and stored in `App.tsx` and passed down to `MapView.tsx` as props.
- Map view state (camera position, selected objects) and filtering state (selected arm/sector) are maintained in `MapView.tsx` and propagated to controls.

## Types and Interfaces
- All application and component types must be placed in the `/src/types/` directory with semantic file separation.
  - Domain models (e.g., `GalaxySystem`) should be placed in `models.ts`.
  - Component prop types (e.g., `MapViewProps`, `MapControlsProps`) should be placed in `components.ts`.
- All types are then re-exported from `/src/types/index.ts` to allow centralized importing throughout the application.
- Do not define `interface` or `type` blocks directly inside component files (like `MapView.tsx` or `MapControls.tsx`). Instead, define them in the semantically appropriate file in the `types` directory and import them. This ensures centralized type management, avoids file bloat, and provides easier refactoring.

## Rendering Engine
- **Deck.gl**: Used for rendering massive datasets of stars and trading hubs performantly. Currently uses `OrthographicView` for a 2.5D visual layout.
- **Styling**: Tailwind CSS is used globally, with inline styles handling dynamic data-driven visual properties in popups and overlays.
