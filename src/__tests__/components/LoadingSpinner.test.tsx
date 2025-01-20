import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<LoadingSpinner />);
    const spinnerContainer = screen.getByRole('status').parentElement;
    expect(spinnerContainer).toHaveClass('flex', 'items-center', 'justify-center', 'p-4');
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'h-8',
      'w-8',
      'border-b-2',
      'border-white'
    );
  });

  it('is accessible', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});
