import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TournamentResults } from '../../components/TournamentResults';
import type { TournamentResult } from '../../types';

describe('TournamentResults', () => {
  const mockResult: TournamentResult = {
    totalScore: 80,
    totalTime: 125000, // 2:05
    sessionsCompleted: 3,
  };

  const defaultProps = {
    result: mockResult,
    onMainMenu: vi.fn(),
    onPlayAgain: vi.fn(),
  };

  it('renders the tournament results region', () => {
    render(<TournamentResults {...defaultProps} />);
    expect(screen.getByRole('region', { name: 'Tournament results' })).toBeInTheDocument();
  });

  it('displays total score as percentage', () => {
    render(<TournamentResults {...defaultProps} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('displays completion time formatted as mm:ss', () => {
    render(<TournamentResults {...defaultProps} />);
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('displays sessions completed as x/3', () => {
    render(<TournamentResults {...defaultProps} />);
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('shows celebration header for scores >= 75%', () => {
    render(<TournamentResults {...defaultProps} />);
    const header = screen.getByText('Amazing!').closest('.tournament-results__header');
    expect(header).toHaveClass('tournament-results__header--celebrate');
  });

  it('does not show celebration header for scores < 75%', () => {
    const lowResult: TournamentResult = { totalScore: 50, totalTime: 90000, sessionsCompleted: 3 };
    render(<TournamentResults {...defaultProps} result={lowResult} />);
    const header = screen.getByText('Well done!').closest('.tournament-results__header');
    expect(header).not.toHaveClass('tournament-results__header--celebrate');
  });

  it('shows champion message for perfect score', () => {
    const perfectResult: TournamentResult = { totalScore: 100, totalTime: 60000, sessionsCompleted: 3 };
    render(<TournamentResults {...defaultProps} result={perfectResult} />);
    expect(screen.getByText('Champion!')).toBeInTheDocument();
  });

  it('calls onPlayAgain when Play Again button is clicked', () => {
    const onPlayAgain = vi.fn();
    render(<TournamentResults {...defaultProps} onPlayAgain={onPlayAgain} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('calls onMainMenu when Main Menu button is clicked', () => {
    const onMainMenu = vi.fn();
    render(<TournamentResults {...defaultProps} onMainMenu={onMainMenu} />);
    fireEvent.click(screen.getByRole('button', { name: 'Main Menu' }));
    expect(onMainMenu).toHaveBeenCalledTimes(1);
  });

  it('formats time correctly for values under a minute', () => {
    const quickResult: TournamentResult = { totalScore: 90, totalTime: 45000, sessionsCompleted: 3 };
    render(<TournamentResults {...defaultProps} result={quickResult} />);
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('formats time correctly for values over 10 minutes', () => {
    const slowResult: TournamentResult = { totalScore: 60, totalTime: 720000, sessionsCompleted: 3 };
    render(<TournamentResults {...defaultProps} result={slowResult} />);
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });
});
