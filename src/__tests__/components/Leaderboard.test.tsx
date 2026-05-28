import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Leaderboard } from '../../components/Leaderboard';
import type { LeaderboardEntry } from '../../types';

describe('Leaderboard', () => {
  const mockEntries: LeaderboardEntry[] = [
    { playerId: '1', playerName: 'Alice', totalScore: 95, totalTime: 60000, date: '2024-01-01' },
    { playerId: '2', playerName: 'Bob', totalScore: 90, totalTime: 75000, date: '2024-01-02' },
    { playerId: '3', playerName: 'Charlie', totalScore: 85, totalTime: 80000, date: '2024-01-03' },
    { playerId: '4', playerName: 'Diana', totalScore: 80, totalTime: 90000, date: '2024-01-04' },
    { playerId: '5', playerName: 'Eve', totalScore: 75, totalTime: 95000, date: '2024-01-05' },
  ];

  it('renders the leaderboard region', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByRole('region', { name: 'Leaderboard' })).toBeInTheDocument();
  });

  it('displays the leaderboard title', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('displays all entries in a ranked list', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
  });

  it('shows scores as percentages', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('shows formatted times', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByText('01:00')).toBeInTheDocument(); // 60000ms
    expect(screen.getByText('01:15')).toBeInTheDocument(); // 75000ms
  });

  it('shows medal emojis for top 3', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  it('shows numeric rank for entries beyond top 3', () => {
    render(<Leaderboard entries={mockEntries} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('limits display to 10 entries', () => {
    const manyEntries: LeaderboardEntry[] = Array.from({ length: 15 }, (_, i) => ({
      playerId: `p${i}`,
      playerName: `Player ${i + 1}`,
      totalScore: 100 - i,
      totalTime: 60000 + i * 1000,
      date: '2024-01-01',
    }));
    render(<Leaderboard entries={manyEntries} />);
    const list = screen.getByRole('list', { name: 'Top 10 scores' });
    expect(list.children).toHaveLength(10);
  });

  it('shows loading state when isLoading is true', () => {
    render(<Leaderboard entries={[]} isLoading={true} />);
    expect(screen.getByRole('status', { name: 'Loading leaderboard' })).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no entries and not loading', () => {
    render(<Leaderboard entries={[]} />);
    expect(screen.getByText('No scores yet. Be the first!')).toBeInTheDocument();
  });

  it('applies top styling to first 3 entries', () => {
    render(<Leaderboard entries={mockEntries} />);
    const items = screen.getByRole('list', { name: 'Top 10 scores' }).children;
    expect(items[0]).toHaveClass('leaderboard__entry--top');
    expect(items[1]).toHaveClass('leaderboard__entry--top');
    expect(items[2]).toHaveClass('leaderboard__entry--top');
    expect(items[3]).not.toHaveClass('leaderboard__entry--top');
  });
});
