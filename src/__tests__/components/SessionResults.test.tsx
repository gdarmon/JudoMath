import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SessionResults } from '../../components/SessionResults';
import { Belt } from '../../types';

describe('SessionResults', () => {
  const defaultProps = {
    correctCount: 8,
    totalCount: 10,
    score: 80,
    stripeAwarded: false,
    beltPromotion: false,
    onPlayAgain: vi.fn(),
    onMainMenu: vi.fn(),
  };

  it('displays the score as a percentage', () => {
    render(<SessionResults {...defaultProps} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('displays the correct/total count', () => {
    render(<SessionResults {...defaultProps} />);
    expect(screen.getByText('8/10 correct')).toBeInTheDocument();
  });

  it('displays an encouraging message for good scores', () => {
    render(<SessionResults {...defaultProps} score={80} />);
    expect(screen.getByText('Great job!')).toBeInTheDocument();
  });

  it('displays a perfect message for 100%', () => {
    render(<SessionResults {...defaultProps} correctCount={10} score={100} />);
    expect(screen.getByText('Perfect!')).toBeInTheDocument();
  });

  it('displays a keep practicing message for low scores', () => {
    render(<SessionResults {...defaultProps} correctCount={3} score={30} />);
    expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
  });

  it('shows stripe earned indicator when stripeAwarded is true', () => {
    render(<SessionResults {...defaultProps} stripeAwarded={true} />);
    expect(screen.getByText('Stripe Earned!')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Stripe earned' })).toBeInTheDocument();
  });

  it('does not show stripe indicator when stripeAwarded is false', () => {
    render(<SessionResults {...defaultProps} stripeAwarded={false} />);
    expect(screen.queryByText('Stripe Earned!')).not.toBeInTheDocument();
  });

  it('shows belt promotion message when beltPromotion is true', () => {
    render(
      <SessionResults
        {...defaultProps}
        stripeAwarded={true}
        beltPromotion={true}
        newBelt={Belt.Yellow}
      />
    );
    expect(screen.getByText('Yellow')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Promoted to Yellow belt' })).toBeInTheDocument();
  });

  it('does not show belt promotion when beltPromotion is false', () => {
    render(<SessionResults {...defaultProps} beltPromotion={false} />);
    expect(screen.queryByRole('status', { name: /Promoted to/ })).not.toBeInTheDocument();
  });

  it('renders Play Again button and calls onPlayAgain when clicked', () => {
    const onPlayAgain = vi.fn();
    render(<SessionResults {...defaultProps} onPlayAgain={onPlayAgain} />);
    const button = screen.getByRole('button', { name: 'Play Again' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });

  it('renders Main Menu button and calls onMainMenu when clicked', () => {
    const onMainMenu = vi.fn();
    render(<SessionResults {...defaultProps} onMainMenu={onMainMenu} />);
    const button = screen.getByRole('button', { name: 'Main Menu' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onMainMenu).toHaveBeenCalledOnce();
  });

  it('has accessible score label', () => {
    render(<SessionResults {...defaultProps} />);
    expect(screen.getByLabelText('Score: 80 percent')).toBeInTheDocument();
  });

  it('has accessible correct count label', () => {
    render(<SessionResults {...defaultProps} />);
    expect(screen.getByLabelText('8 out of 10 correct')).toBeInTheDocument();
  });
});
