import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MainMenu } from '../../components/MainMenu'
import { Belt } from '../../types'

describe('MainMenu', () => {
  it('renders the title parts', () => {
    render(<MainMenu onNavigate={vi.fn()} />)
    expect(screen.getByText('JUDO')).toBeInTheDocument()
    expect(screen.getByText('MATH')).toBeInTheDocument()
  })

  it('renders Play, Tournament, and Profile buttons', () => {
    render(<MainMenu onNavigate={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tournament' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument()
  })

  it('calls onNavigate with "game" when Play is clicked', () => {
    const onNavigate = vi.fn()
    render(<MainMenu onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onNavigate).toHaveBeenCalledWith('game')
  })

  it('calls onNavigate with "tournament" when Tournament is clicked', () => {
    const onNavigate = vi.fn()
    render(<MainMenu onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Tournament' }))
    expect(onNavigate).toHaveBeenCalledWith('tournament')
  })

  it('calls onNavigate with "profile" when Profile is clicked', () => {
    const onNavigate = vi.fn()
    render(<MainMenu onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Profile' }))
    expect(onNavigate).toHaveBeenCalledWith('profile')
  })

  it('displays White belt by default when no belt is provided', () => {
    render(<MainMenu onNavigate={vi.fn()} />)
    expect(screen.getByText('White Belt')).toBeInTheDocument()
  })

  it('displays the current belt name when provided', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Green} currentStripes={1} />)
    expect(screen.getByText('Green Belt')).toBeInTheDocument()
  })

  it('exposes the stripe count via aria-label', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Yellow} currentStripes={2} />)
    expect(screen.getByLabelText('2 stripes')).toBeInTheDocument()
  })

  it('exposes 0 stripes via aria-label when none earned', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Blue} currentStripes={0} />)
    expect(screen.getByLabelText('0 stripes')).toBeInTheDocument()
  })

  it('has accessible avatar label with belt info', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Orange} />)
    expect(screen.getByLabelText('Player avatar with Orange belt')).toBeInTheDocument()
  })
})
