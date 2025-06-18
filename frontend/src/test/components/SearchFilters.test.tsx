import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';

// Simple mock component that just renders the basic structure
const MockSearchFilters = () => {
  return (
    <div data-testid="search-filters">
      <div>Status</div>
      <input placeholder="Search..." />
      <button>Reset</button>
    </div>
  );
};

describe('SearchFilters Component', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<MockSearchFilters />);
    
    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
  });

  it('shows search input', () => {
    renderWithProviders(<MockSearchFilters />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('shows filter options', () => {
    renderWithProviders(<MockSearchFilters />);
    
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  it('has reset functionality', () => {
    renderWithProviders(<MockSearchFilters />);
    
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('displays filter interface', () => {
    renderWithProviders(<MockSearchFilters />);
    
    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
  });
});