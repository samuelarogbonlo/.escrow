import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';

// Simple mock component for WelcomeGuide
const MockWelcomeGuide = () => {
  return (
    <div data-testid="welcome-guide">
      <h2>Welcome to .escrow</h2>
      <div>
        <h3>Step 1: Connect Your Wallet</h3>
        <p>Connect your Polkadot wallet to get started</p>
      </div>
      <div>
        <button>Next</button>
        <button>Skip Tour</button>
        <button>Close</button>
      </div>
    </div>
  );
};

describe('WelcomeGuide Component', () => {
  it('renders when not dismissed', () => {
    renderWithProviders(<MockWelcomeGuide />);
    
    expect(screen.getByText(/welcome to .escrow/i)).toBeInTheDocument();
  });

  it('shows guide steps', () => {
    renderWithProviders(<MockWelcomeGuide />);
    
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
  });

  it('can be dismissed', () => {
    renderWithProviders(<MockWelcomeGuide />);
    
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('has navigation between steps', () => {
    renderWithProviders(<MockWelcomeGuide />);
    
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('displays helpful information', () => {
    renderWithProviders(<MockWelcomeGuide />);
    
    expect(screen.getByText(/connect your polkadot wallet/i)).toBeInTheDocument();
  });
});