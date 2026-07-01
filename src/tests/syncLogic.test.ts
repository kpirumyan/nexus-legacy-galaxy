import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { syncSystemsData } from '../lib/syncLogic';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getFirestore: vi.fn(),
}));

import { getDocs, setDoc } from 'firebase/firestore';

// --- TESTS ---
describe('syncSystemsData', () => {
  let mockOnProgress: Mock;
  let mockOnComplete: Mock;

  beforeEach(() => {
    mockOnProgress = vi.fn();
    mockOnComplete = vi.fn();
    
    // Clear mocks before each test
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn();
    
    // Spy on console.error to verify logging
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to mock DB response with IDs
  const mockDbIds = (ids: string[]) => {
    (getDocs as Mock).mockResolvedValue({
      forEach: (callback: (doc: { id: string }) => void) => ids.forEach(id => callback({ id }))
    });
  };

  it('successfully fetches IDs from DB, makes API requests, and saves to DB', async () => {
    mockDbIds(['sys-1', 'sys-2']);
    
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Test System', type: 'neutron' })
    });

    await syncSystemsData(mockOnProgress, mockOnComplete);

    // Verify that getDocs was called to fetch IDs
    expect(getDocs).toHaveBeenCalledOnce();
    
    // Verify that fetch was called for each ID
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/systems/sys-1');
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/systems/sys-2');

    // Verify that setDoc was called 2 times for saving
    expect(setDoc).toHaveBeenCalledTimes(2);
    
    // Verify progress calls (0%, 50%, 100%)
    expect(mockOnProgress).toHaveBeenNthCalledWith(1, 0);
    expect(mockOnProgress).toHaveBeenNthCalledWith(2, 50);
    expect(mockOnProgress).toHaveBeenNthCalledWith(3, 100);
    
    // Verify completion
    expect(mockOnComplete).toHaveBeenCalledOnce();
  });

  it('logs an error and CONTINUES if the API returns an error for one system', async () => {
    mockDbIds(['sys-1', 'sys-2', 'sys-3']);
    
    // API fails on the second request
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // sys-1 success
      .mockRejectedValueOnce(new Error('Network failure'))         // sys-2 fail
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });// sys-3 success

    await syncSystemsData(mockOnProgress, mockOnComplete);

    // Ensure the loop was not interrupted and fetch was called 3 times
    expect(global.fetch).toHaveBeenCalledTimes(3);
    
    // Saving to DB should only be called 2 times (for sys-1 and sys-3)
    expect(setDoc).toHaveBeenCalledTimes(2);

    // Ensure the error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error syncing system sys-2:',
      expect.any(Error)
    );

    // Progress should still reach 100% (steps: 0, 33, 67, 100)
    expect(mockOnProgress).toHaveBeenLastCalledWith(100);
    expect(mockOnComplete).toHaveBeenCalledOnce();
  });

  it('correctly handles an empty ID database (no data to sync)', async () => {
    mockDbIds([]);

    await syncSystemsData(mockOnProgress, mockOnComplete);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
    
    // Progress should immediately jump from 0 to 100
    expect(mockOnProgress).toHaveBeenCalledWith(0);
    expect(mockOnProgress).toHaveBeenCalledWith(100);
    expect(mockOnComplete).toHaveBeenCalledOnce();
  });
});


