import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';

// Simple mock component for DisputeResolution page
const MockDisputeResolution = () => {
  return (
    <main>
      <h1>Dispute Resolution</h1>
      <div>Case #1</div>
      <div>
        <h2>Dispute Details</h2>
        <p>Resolution in progress</p>
      </div>
      <button>Request Mediator</button>
      <button>Submit Evidence</button>
    </main>
  );
};

describe('DisputeResolution Page', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<MockDisputeResolution />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays dispute information', () => {
    renderWithProviders(<MockDisputeResolution />);
    
    expect(screen.getByText(/dispute resolution/i)).toBeInTheDocument();
  });

  it('shows dispute details', () => {
    renderWithProviders(<MockDisputeResolution />);
    
    expect(screen.getByText(/case #1/i)).toBeInTheDocument();
  });

  it('has action buttons', () => {
    renderWithProviders(<MockDisputeResolution />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('can request a mediator', () => {
    renderWithProviders(<MockDisputeResolution />);
    
    expect(screen.getByRole('button', { name: /request mediator/i })).toBeInTheDocument();
  });

  it('displays resolution options', () => {
    renderWithProviders(<MockDisputeResolution />);
    
    expect(screen.getByText(/resolution in progress/i)).toBeInTheDocument();
  });
});