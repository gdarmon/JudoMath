import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BeltCeremony, AUTO_DISMISS_MS } from '../../components/BeltCeremony';
import { Belt } from '../../types';

// Mock lottie-react to avoid rendering issues in jsdom
vi.mock('lottie-react', () => ({
  default: ({ onError }: { onError?: () => void }) => (
    <div data-testid="lottie-animation" data-onerror={onError ? 'true' : 'false'}>
      Lottie
    </div>
  ),
}));

describe('BeltCeremony', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a full-screen overlay dialog', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Yellow} onDismiss={onDismiss} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('displays the new belt color prominently', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Green} onDismiss={onDismiss} />);

    expect(screen.getByText('Green Belt')).toBeInTheDocument();
  });

  it('displays congratulatory message', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Blue} onDismiss={onDismiss} />);

    expect(screen.getByText('🎉 Congratulations! 🎉')).toBeInTheDocument();
    expect(screen.getByText('You earned a new belt! Keep up the great work!')).toBeInTheDocument();
  });

  it('displays a dismiss button to continue playing', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Orange} onDismiss={onDismiss} />);

    const button = screen.getByRole('button', { name: 'Continue playing' });
    expect(button).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Yellow} onDismiss={onDismiss} />);

    const button = screen.getByRole('button', { name: 'Continue playing' });
    fireEvent.click(button);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('auto-dismisses after 8 seconds', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Brown} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(AUTO_DISMISS_MS);
    });

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('dismisses on Escape key press', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Black} onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has accessible aria-label with belt name', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Orange} onDismiss={onDismiss} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Belt ceremony: promoted to Orange belt');
  });

  it('renders Lottie animation by default', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Yellow} onDismiss={onDismiss} />);

    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });

  it('displays belt badge with correct belt color', () => {
    const onDismiss = vi.fn();
    render(<BeltCeremony newBelt={Belt.Blue} onDismiss={onDismiss} />);

    // The belt name span should have the belt color as background
    const beltNameEl = screen.getByText('Blue Belt');
    expect(beltNameEl).toHaveStyle({ backgroundColor: '#2196f3' });
  });

  it('renders all belt types correctly', () => {
    const onDismiss = vi.fn();
    const belts: Array<{ belt: Belt; name: string }> = [
      { belt: Belt.White, name: 'White Belt' },
      { belt: Belt.Yellow, name: 'Yellow Belt' },
      { belt: Belt.Orange, name: 'Orange Belt' },
      { belt: Belt.Green, name: 'Green Belt' },
      { belt: Belt.Blue, name: 'Blue Belt' },
      { belt: Belt.Brown, name: 'Brown Belt' },
      { belt: Belt.Black, name: 'Black Belt' },
    ];

    for (const { belt, name } of belts) {
      const { unmount } = render(<BeltCeremony newBelt={belt} onDismiss={onDismiss} />);
      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    }
  });
});
