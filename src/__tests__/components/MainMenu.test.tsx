import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MainMenu } from '../../components/MainMenu'
import { Belt } from '../../types'
import { APP_TITLE, MENU, beltLabel, BELT_NAMES } from '../../i18n/he'

describe('MainMenu', () => {
  it('renders the Hebrew app title', () => {
    render(<MainMenu onNavigate={vi.fn()} />)
    expect(screen.getByText(APP_TITLE)).toBeInTheDocument()
  })

  it('renders Play, Tournament, and Profile buttons in Hebrew', () => {
    render(<MainMenu onNavigate={vi.fn()} />)
    expect(screen.getByRole('button', { name: MENU.play })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: MENU.tournament })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: MENU.profile })).toBeInTheDocument()
  })

  it('calls onNavigate with "game" when the Play button is clicked', () => {
    const onNavigate = vi.fn()
    render(<MainMenu onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: MENU.play }))
    expect(onNavigate).toHaveBeenCalledWith('game')
  })

  it('calls onNavigate with "tournament" when the Tournament button is clicked', () => {
    const onNavigate = vi.fn()
    render(<MainMenu onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: MENU.tournament }))
    expect(onNavigate).toHaveBeenCalledWith('tournament')
  })

  it('calls onNavigate with "profile" when the Profile button is clicked', () => {
    const onNavigate = vi.fn()
    render(<MainMenu onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: MENU.profile }))
    expect(onNavigate).toHaveBeenCalledWith('profile')
  })

  it('displays White belt by default when no belt is provided', () => {
    render(<MainMenu onNavigate={vi.fn()} />)
    expect(screen.getByText(beltLabel(Belt.White))).toBeInTheDocument()
  })

  it('displays the current belt name when provided', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Green} currentStripes={1} />)
    expect(screen.getByText(beltLabel(Belt.Green))).toBeInTheDocument()
  })

  it('exposes the stripe count via aria-label', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Yellow} currentStripes={2} />)
    expect(screen.getByLabelText('2 פסים')).toBeInTheDocument()
  })

  it('exposes 0 stripes via aria-label when none earned', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Blue} currentStripes={0} />)
    expect(screen.getByLabelText('0 פסים')).toBeInTheDocument()
  })

  it('has accessible avatar label with belt info', () => {
    render(<MainMenu onNavigate={vi.fn()} currentBelt={Belt.Orange} />)
    // Avatar is labelled with the i18n avatar text.
    expect(screen.getByLabelText(`אווטאר עם חגורה ${BELT_NAMES[Belt.Orange]}`)).toBeInTheDocument()
  })
})
