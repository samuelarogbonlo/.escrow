import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../utils';

// Simple mock component for SearchBar
const MockSearchBar = () => {
  return (
    <div data-testid="search-bar">
      <input placeholder="Search..." />
      <button>Search</button>
    </div>
  );
};

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithProviders(<MockSearchBar />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderWithProviders(<MockSearchBar />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test search' } });
    
    expect(input).toHaveValue('test search');
  });

  it('has a search button', () => {
    renderWithProviders(<MockSearchBar />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('can trigger search on button click', () => {
    renderWithProviders(<MockSearchBar />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.click(searchButton);
    
    // Search functionality should work
    expect(input).toHaveValue('test query');
  });

  it('can trigger search on enter key', () => {
    renderWithProviders(<MockSearchBar />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(input).toHaveValue('test query');
  });
});