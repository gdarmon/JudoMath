import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NumberInput } from '../../components/NumberInput'
import { NUMPAD } from '../../i18n/he'

describe('NumberInput', () => {
  function getDisplay() {
    // Use querySelector since multiple elements share the pad's aria-label.
    return document.querySelector('.number-input__value')!
  }

  it('renders the number pad with digits 0-9', () => {
    render(<NumberInput onSubmit={() => {}} />)
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: NUMPAD.digitAria(i) })).toBeInTheDocument()
    }
  })

  it('renders clear, backspace, and submit buttons', () => {
    render(<NumberInput onSubmit={() => {}} />)
    expect(screen.getByRole('button', { name: NUMPAD.clearAria })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: NUMPAD.backspaceAria })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: NUMPAD.submitAria })).toBeInTheDocument()
  })

  it('displays entered digits', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(1) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(5) }))
    expect(getDisplay().textContent).toBe('15')
  })

  it('does not allow values greater than 20', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(2) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(5) }))
    expect(getDisplay().textContent).toBe('2')
  })

  it('does not allow more than 2 digits', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(1) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(2) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(3) }))
    expect(getDisplay().textContent).toBe('12')
  })

  it('backspace removes the last digit', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(1) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(8) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.backspaceAria }))
    expect(getDisplay().textContent).toBe('1')
  })

  it('clear removes all digits', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(1) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(9) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.clearAria }))
    expect(getDisplay().textContent).toBe('\u00A0')
  })

  it('submit button is disabled when display is empty', () => {
    render(<NumberInput onSubmit={() => {}} />)
    expect(screen.getByRole('button', { name: NUMPAD.submitAria })).toBeDisabled()
  })

  it('submit button is enabled for valid answers (0-20)', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(7) }))
    expect(screen.getByRole('button', { name: NUMPAD.submitAria })).toBeEnabled()
  })

  it('calls onSubmit with the entered number and clears display', () => {
    const onSubmit = vi.fn()
    render(<NumberInput onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(1) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(2) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.submitAria }))
    expect(onSubmit).toHaveBeenCalledWith(12)
    expect(getDisplay().textContent).toBe('\u00A0')
  })

  it('submitting 0 is valid', () => {
    const onSubmit = vi.fn()
    render(<NumberInput onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(0) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.submitAria }))
    expect(onSubmit).toHaveBeenCalledWith(0)
  })

  it('submitting 20 is valid', () => {
    const onSubmit = vi.fn()
    render(<NumberInput onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(2) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.digitAria(0) }))
    fireEvent.click(screen.getByRole('button', { name: NUMPAD.submitAria }))
    expect(onSubmit).toHaveBeenCalledWith(20)
  })

  it('all buttons are disabled when disabled prop is true', () => {
    render(<NumberInput onSubmit={() => {}} disabled={true} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('supports keyboard number input', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.keyDown(window, { key: '9' })
    expect(getDisplay().textContent).toBe('9')
  })

  it('supports keyboard Backspace', () => {
    render(<NumberInput onSubmit={() => {}} />)
    fireEvent.keyDown(window, { key: '1' })
    fireEvent.keyDown(window, { key: '5' })
    fireEvent.keyDown(window, { key: 'Backspace' })
    expect(getDisplay().textContent).toBe('1')
  })

  it('supports keyboard Enter to submit', () => {
    const onSubmit = vi.fn()
    render(<NumberInput onSubmit={onSubmit} />)
    fireEvent.keyDown(window, { key: '8' })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith(8)
  })

  it('keyboard Enter does nothing when display is empty', () => {
    const onSubmit = vi.fn()
    render(<NumberInput onSubmit={onSubmit} />)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('ignores keyboard input when disabled', () => {
    const onSubmit = vi.fn()
    render(<NumberInput onSubmit={onSubmit} disabled={true} />)
    fireEvent.keyDown(window, { key: '5' })
    expect(getDisplay().textContent).toBe('\u00A0')
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
