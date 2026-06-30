import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ));
  });

  it('renders without crashing and displays Galaxy Map title', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(await screen.findByText('Galaxy Map')).toBeInTheDocument();
  });
});
