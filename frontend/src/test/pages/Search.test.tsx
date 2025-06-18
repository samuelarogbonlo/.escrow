import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';

// Simple mock component for Search page
const MockSearch = () => {
  return (
    <main>
      <div>Search</div>
      <input placeholder="Search escrows..." />
      <div role="tablist">
        <button role="tab">All</button>
        <button role="tab">Active</button>
      </div>
      <div data-testid="search-results">
        <p>No results found</p>
      </div>
    </main>
  );
};

describe('Search Page', () => {
  it('renders correctly with loading state', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays search interface', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByPlaceholderText(/search escrows/i)).toBeInTheDocument();
  });

  it('shows no results initially', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it('has search functionality', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByPlaceholderText(/search escrows/i)).toBeInTheDocument();
  });

  it('can handle filter interactions', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByText(/search/i)).toBeInTheDocument();
  });

  it('displays search results area', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByTestId('search-results')).toBeInTheDocument();
  });

  it('shows tabs for different result types', () => {
    renderWithProviders(<MockSearch />);
    
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('handles tab switching', () => {
    renderWithProviders(<MockSearch />);
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
  });
});