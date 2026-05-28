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
      <img
        className="judo-avatar__image"
        src={skin.avatarSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </div>
  )
}

export default JudoAvatar
