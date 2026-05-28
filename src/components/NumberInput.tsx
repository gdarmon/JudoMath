import { useState, useCallback, useEffect } from 'react'
import './NumberInput.css'

interface NumberInputProps {
  onSubmit: (answer: number) => void;
  disabled?: boolean;
}

const MAX_ANSWER = 20;

/**
 * Number Input Pad component for children aged 6-7.
 * Provides large touch-friendly buttons (0-9), backspace/clear, and submit.
 * Supports keyboard input (number keys, Enter, Backspace).
 * Disables submit when the entered value is outside [0, 20].
 */
export function NumberInput({ onSubmit, disabled = false }: NumberInputProps) {
  const [display, setDisplay] = useState('')

  const numericValue = display === '' ? null : parseInt(display, 10)
  const isValidAnswer = numericValue !== null && numericValue >= 0 && numericValue <= MAX_ANSWER
  const canSubmit = isValidAnswer && !disabled

  const handleDigit = useCallback((digit: number) => {
    if (disabled) return
    setDisplay(prev => {
      const next = prev + digit.toString()
      // Don't allow more than 2 digits (max is 20)
      if (next.length > 2) return prev
      // Don't allow values greater than 20
      const value = parseInt(next, 10)
      if (value > MAX_ANSWER) return prev
      return next
    })
  }, [disabled])

  const handleBackspace = useCallback(() => {
    if (disabled) return
    setDisplay(prev => prev.slice(0, -1))
  }, [disabled])

  const handleClear = useCallback(() => {
    if (disabled) return
    setDisplay('')
  }, [disabled])

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    onSubmit(numericValue!)
    setDisplay('')
  }, [canSubmit, numericValue, onSubmit])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(parseInt(e.key, 10))
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 'Escape') {
        handleClear()
      } else if (e.key === 'Enter') {
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, handleDigit, handleBackspace, handleClear, handleSubmit])

  return (
    <div className="number-input" aria-label="Number input pad">
      {/* Display area */}
      <div className="number-input__display" aria-live="polite" aria-atomic="true">
        <span className="number-input__value">
          {display || '\u00A0'}
        </span>
      </div>

      {/* Number pad grid */}
      <div className="number-input__pad" role="group" aria-label="Number buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
          <button
            key={digit}
            type="button"
            className="number-input__btn number-input__btn--digit"
            onClick={() => handleDigit(digit)}
            disabled={disabled}
            aria-label={`${digit}`}
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Clear, 0, Backspace */}
        <button
          type="button"
          className="number-input__btn number-input__btn--action"
          onClick={handleClear}
          disabled={disabled}
          aria-label="Clear"
        >
          C
        </button>

        <button
          type="button"
          className="number-input__btn number-input__btn--digit"
          onClick={() => handleDigit(0)}
          disabled={disabled}
          aria-label="0"
        >
          0
        </button>

        <button
          type="button"
          className="number-input__btn number-input__btn--action"
          onClick={handleBackspace}
          disabled={disabled}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* Submit button */}
      <button
        type="button"
        className="number-input__btn number-input__btn--submit"
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Submit answer"
      >
        ✓ Submit
      </button>
    </div>
  )
}

export default NumberInput
