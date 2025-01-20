import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import App from '../App';
import { initializeEnvironment } from '../utils/initialization';

// Mock the initialization utility
vi.mock('../utils/initialization', () => ({
  initializeEnvironment: vi.fn()
}));

// Mock the route components
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>
}));

vi.mock('../pages/Analysis', () => ({
  default: () => <div data-testid="analysis">Analysis</div>
}));

vi.mock('../pages/Recommendations', () => ({
  default: () => <div data-testid="recommendations">Recommendations</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mocked initializeEnvironment to resolve successfully by default
    (initializeEnvironment as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('initializes successfully and renders main content', async () => {
    render(<App />);
    
    // Should show loading state initially
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verify initialization was called
    expect(initializeEnvironment).toHaveBeenCalledTimes(1);
  });

  it('handles initialization failure and retries', async () => {
    // Mock initialization to fail initially
    (initializeEnvironment as any)
      .mockRejectedValueOnce(new Error('Init failed'))
      .mockResolvedValueOnce(undefined);

    vi.useFakeTimers();
    
    render(<App />);

    // Wait for the first failure
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });

    // Fast-forward past retry delay
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should succeed on retry
    await waitFor(() => {
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    });

    // Verify initialization was called twice (initial + retry)
    expect(initializeEnvironment).toHaveBeenCalledTimes(2);
  });

  it('gives up after max retry attempts', async () => {
    // Mock initialization to always fail
    (initializeEnvironment as any).mockRejectedValue(new Error('Init failed'));

    vi.useFakeTimers();
    
    render(<App />);

    // Fast-forward through all retry attempts
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000 * (i + 1));
      });
    }

    // Should show final error message
    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application after multiple attempts/i))
        .toBeInTheDocument();
    });

    // Verify initialization was called maxAttempts times
    expect(initializeEnvironment).toHaveBeenCalledTimes(3);
  });

  it('renders error boundary for runtime errors', async () => {
    // Mock Dashboard to throw an error
    vi.mocked(require('../pages/Dashboard').default).mockImplementation(() => {
      throw new Error('Runtime error');
    });

    render(<App />);

    // Wait for initialization
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Should show error boundary content
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
