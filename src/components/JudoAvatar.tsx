import type { JudoSkin } from '../types'
import './JudoAvatar.css'

export interface JudoAvatarProps {
  skin: JudoSkin
  label: string
  className?: string
}

export function JudoAvatar({ skin, label, className = '' }: JudoAvatarProps) {
  return (
    <div
      className={`judo-avatar ${className}`}
      role="img"
      aria-label={label}
      style={{
        ['--avatar-gi' as never]: skin.giColor,
        ['--avatar-gi-accent' as never]: skin.giAccent,
        ['--avatar-theme' as never]: skin.themeAccent,
      }}
    >
      <span className="judo-avatar__glow" aria-hidden="true" />
      <span className="judo-avatar__body" aria-hidden="true">
        <span className="judo-avatar__head" />
        <span className="judo-avatar__torso">
          <span className="judo-avatar__lapel judo-avatar__lapel--left" />
          <span className="judo-avatar__lapel judo-avatar__lapel--right" />
          <span className="judo-avatar__belt" />
        </span>
        <span className="judo-avatar__arm judo-avatar__arm--left" />
        <span className="judo-avatar__arm judo-avatar__arm--right" />
        <span className="judo-avatar__leg judo-avatar__leg--left" />
        <span className="judo-avatar__leg judo-avatar__leg--right" />
      </span>
    </div>
  )
}

export default JudoAvatar
