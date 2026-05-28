import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BeltCeremony, AUTO_DISMISS_MS } from '../../components/BeltCeremony'
import { Belt } from '../../types'
import { CEREMONY, BELT_NAMES, beltLabel } from '../../i18n/he'

vi.mock('lottie-react', () => ({
  default: ({ onError }: { onError?: () => void }) => (
    <div data-testid="lottie-animation" data-onerror={onError ? 'true' : 'false'}>
      Lottie
    </div>
  ),
}))

describe('BeltCeremony', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a full-screen overlay dialog', () => {
    render(<BeltCeremony newBelt={Belt.Yellow} onDismiss={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('displays the new belt name in Hebrew', () => {
    render(<BeltCeremony newBelt={Belt.Green} onDismiss={vi.fn()} />)
    expect(screen.getByText(beltLabel(Belt.Green))).toBeInTheDocument()
  })

  it('displays congratulatory message and subtitle', () => {
    render(<BeltCeremony newBelt={Belt.Blue} onDismiss={vi.fn()} />)
    expect(screen.getByText(CEREMONY.title)).toBeInTheDocument()
    expect(screen.getByText(CEREMONY.subtitle)).toBeInTheDocument()
  })

  it('displays a dismiss button to continue playing', () => {
    render(<BeltCeremony newBelt={Belt.Orange} onDismiss={vi.fn()} />)
    expect(screen.getByRole('button', { name: CEREMONY.continue })).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<BeltCeremony newBelt={Belt.Yellow} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: CEREMONY.continue }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after 8 seconds', () => {
    const onDismiss = vi.fn()
    render(<BeltCeremony newBelt={Belt.Brown} onDismiss={onDismiss} />)

    expect(onDismiss).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(AUTO_DISMISS_MS)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses on Escape key press', () => {
    const onDismiss = vi.fn()
    render(<BeltCeremony newBelt={Belt.Black} onDismiss={onDismiss} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('has accessible aria-label with belt name', () => {
    render(<BeltCeremony newBelt={Belt.Orange} onDismiss={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', CEREMONY.dialogAria(Belt.Orange))
  })

  it('renders Lottie animation by default', () => {
    render(<BeltCeremony newBelt={Belt.Yellow} onDismiss={vi.fn()} />)
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument()
  })

  it('displays belt badge with correct belt color', () => {
    render(<BeltCeremony newBelt={Belt.Blue} onDismiss={vi.fn()} />)
    const beltNameEl = screen.getByText(beltLabel(Belt.Blue))
    expect(beltNameEl).toHaveStyle({ backgroundColor: '#2196f3' })
  })

  it('renders all belt types with their Hebrew names', () => {
    const onDismiss = vi.fn()
    const allBelts: Belt[] = [
      Belt.White,
      Belt.Yellow,
      Belt.Orange,
      Belt.Green,
      Belt.Blue,
      Belt.Brown,
      Belt.Black,
    ]

    for (const belt of allBelts) {
      const { unmount } = render(<BeltCeremony newBelt={belt} onDismiss={onDismiss} />)
      expect(screen.getByText(beltLabel(belt))).toBeInTheDocument()
      // Sanity: the screen-reader hint contains the belt name too.
      expect(screen.getByText(BELT_NAMES[belt], { selector: '.sr-only' })).toBeInTheDocument()
      unmount()
    }
  })
})
