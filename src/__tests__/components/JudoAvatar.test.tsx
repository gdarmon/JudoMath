import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JudoAvatar } from '../../components/JudoAvatar'
import { getSkinById } from '../../logic/skins'

describe('JudoAvatar', () => {
  it('renders the selected 3D judoka image inside the accessible avatar', () => {
    const skin = getSkinById('blue')
    const { container } = render(<JudoAvatar skin={skin} label="אווטאר כחול" />)

    expect(screen.getByRole('img', { name: 'אווטאר כחול' })).toBeInTheDocument()
    expect(container.querySelector('.judo-avatar__image')).toHaveAttribute('src', skin.avatarSrc)
  })
})
