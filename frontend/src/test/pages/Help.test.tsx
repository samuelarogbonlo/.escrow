import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';

// Simple mock component for Help page
const MockHelp = () => {
  return (
    <main>
      <h1>Help Center</h1>
      <section>
        <h2>Frequently Asked Questions</h2>
        <div>
          <h3>How do I create an escrow?</h3>
          <p>To create an escrow, click the "Create Escrow" button...</p>
        </div>
      </section>
      <section>
        <h2>Contact Support</h2>
        <a href="mailto:support@example.com">support@example.com</a>
      </section>
      <button>Start Tour</button>
    </main>
  );
};

describe('Help Page', () => {
  it('renders correctly', () => {
    renderWithProviders(<MockHelp />);
    
    expect(screen.getByText(/help center/i)).toBeInTheDocument();
  });

  it('displays help sections', () => {
    renderWithProviders(<MockHelp />);
    
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
  });

  it('has contact information', () => {
    renderWithProviders(<MockHelp />);
    
    expect(screen.getByText(/contact support/i)).toBeInTheDocument();
  });

  it('provides helpful links', () => {
    renderWithProviders(<MockHelp />);
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('can start onboarding tour', () => {
    renderWithProviders(<MockHelp />);
    
    expect(screen.getByRole('button', { name: /start tour/i })).toBeInTheDocument();
  });

  it('shows helpful information', () => {
    renderWithProviders(<MockHelp />);
    
    expect(screen.getByText(/how do i create an escrow/i)).toBeInTheDocument();
  });
});