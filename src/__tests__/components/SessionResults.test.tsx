import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SessionResults } from '../../components/SessionResults'
import { Belt } from '../../types'
import { RESULTS, BELT_NAMES } from '../../i18n/he'
import { getSkinById } from '../../logic/skins'

describe('SessionResults', () => {
  const defaultProps = {
    correctCount: 8,
    totalCount: 10,
    score: 80,
    stripeAwarded: false,
    beltPromotion: false,
    onPlayAgain: vi.fn(),
    onMainMenu: vi.fn(),
  }

  it('displays the score as a percentage', () => {
    render(<SessionResults {...defaultProps} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('displays the correct/total count', () => {
    render(<SessionResults {...defaultProps} />)
    expect(screen.getByText(RESULTS.scoreLabel(8, 10))).toBeInTheDocument()
  })

  it('displays an encouraging message for good scores', () => {
    render(<SessionResults {...defaultProps} score={80} />)
    expect(screen.getByText(RESULTS.great)).toBeInTheDocument()
  })

  it('displays a perfect message for 100%', () => {
    render(<SessionResults {...defaultProps} correctCount={10} score={100} />)
    expect(screen.getByText(RESULTS.perfect)).toBeInTheDocument()
  })

  it('displays a keep-going message for low scores', () => {
    render(<SessionResults {...defaultProps} correctCount={3} score={30} />)
    expect(screen.getByText(RESULTS.keepGoing)).toBeInTheDocument()
  })

  it('shows stripe earned indicator when stripeAwarded is true', () => {
    render(<SessionResults {...defaultProps} stripeAwarded={true} />)
    expect(screen.getByText(RESULTS.stripeEarned)).toBeInTheDocument()
    expect(screen.getByRole('status', { name: RESULTS.stripeAriaLabel })).toBeInTheDocument()
  })

  it('does not show stripe indicator when stripeAwarded is false', () => {
    render(<SessionResults {...defaultProps} stripeAwarded={false} />)
    expect(screen.queryByText(RESULTS.stripeEarned)).not.toBeInTheDocument()
  })

  it('shows belt promotion message when beltPromotion is true', () => {
    render(
      <SessionResults
        {...defaultProps}
        stripeAwarded={true}
        beltPromotion={true}
        newBelt={Belt.Yellow}
      />,
    )
    expect(screen.getByText(BELT_NAMES[Belt.Yellow])).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: RESULTS.beltPromotionAria(Belt.Yellow) }),
    ).toBeInTheDocument()
  })

  it('does not show belt promotion when beltPromotion is false', () => {
    render(<SessionResults {...defaultProps} beltPromotion={false} />)
    expect(screen.queryByRole('status', { name: /קודמת/ })).not.toBeInTheDocument()
  })

  it('shows a newly unlocked skin reward', () => {
    const skin = getSkinById('black')
    render(<SessionResults {...defaultProps} newSkinUnlocked={skin} />)
    expect(screen.getByText(RESULTS.skinUnlocked)).toBeInTheDocument()
    expect(screen.getByText(skin.name)).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: RESULTS.skinUnlockedAria(skin.name) }),
    ).toBeInTheDocument()
  })

  it('renders Play Again button and calls onPlayAgain when clicked', () => {
    const onPlayAgain = vi.fn()
    render(<SessionResults {...defaultProps} onPlayAgain={onPlayAgain} />)
    const button = screen.getByRole('button', { name: RESULTS.playAgain })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onPlayAgain).toHaveBeenCalledOnce()
  })

  it('renders Main Menu button and calls onMainMenu when clicked', () => {
    const onMainMenu = vi.fn()
    render(<SessionResults {...defaultProps} onMainMenu={onMainMenu} />)
    const button = screen.getByRole('button', { name: RESULTS.mainMenu })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onMainMenu).toHaveBeenCalledOnce()
  })

  it('has accessible score label', () => {
    render(<SessionResults {...defaultProps} />)
    expect(screen.getByLabelText(RESULTS.scoreAria(80))).toBeInTheDocument()
  })

  it('has accessible correct count label', () => {
    render(<SessionResults {...defaultProps} />)
    expect(screen.getByLabelText(RESULTS.scoreLabelAria(8, 10))).toBeInTheDocument()
  })
})
