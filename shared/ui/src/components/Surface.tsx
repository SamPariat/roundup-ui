import type { ReactElement, ReactNode } from 'react'
import type { ViewProps } from 'react-native'

import { GlassView } from 'expo-glass-effect'
import { View } from 'react-native'

import type { TRoleColor } from '../lib/useRoleColor'

import { cn } from '../lib/cn'
import { ABSOLUTE_FILL } from '../lib/fill'
import { GlassTint } from '../lib/glass-tint'
import { useGlass } from '../lib/useGlass'
import { useRoleColor } from '../lib/useRoleColor'
import { useTheme } from '../theme/theme'

/** How one surface tone looks. */
interface IToneStyle {
  /** Solid background class used when glass is off. */
  className: string
  /** Role color the glass layer is tinted with. */
  tint: TRoleColor
  /** How strongly the glass takes the tint, from 0 to 1: lower shows more of what is behind. */
  strength: number
}

const TONES = {
  // An action has to read as the accent at a glance, so it keeps more of its color than a panel.
  accent: { className: 'bg-accent', strength: 0.8, tint: 'accent' },
  raised: { className: 'bg-bg-raised', strength: GlassTint.panelStrength, tint: 'bg-raised' },
  sunken: { className: 'bg-bg-sunken', strength: GlassTint.panelStrength, tint: 'bg-sunken' },
} as const satisfies Record<string, IToneStyle>

/** Props for Surface: the usual View props plus a tone. */
export type TSurfaceProps = ViewProps & {
  /** What to draw on the surface. */
  children?: ReactNode
  /** Extra classes for the wrapper. */
  className?: string
  /** raised (cards, dialogs), sunken (bars, tracks) or accent (a floating action). Defaults to raised. */
  tone?: keyof typeof TONES
}

/**
 * The one surface primitive. On iOS 26+ it is Liquid Glass tinted with the role color at part
 * strength (half for panels, more for an accent action), so what is behind shows through; everywhere else, and whenever Reduce Transparency is
 * on, it is the solid role color (callers add the web's translucent fill and backdrop blur).
 * Never put opacity on a Surface: glass does not render below opacity 1. Dim its content instead.
 * @returns The surface view, with the glass layer behind its children when available.
 */
export const Surface = ({
  children,
  className,
  tone = 'raised',
  ...props
}: TSurfaceProps): ReactElement => {
  const { name } = useTheme()
  const { className: solid, strength, tint } = TONES[tone]
  const tintColor = useRoleColor(tint)

  const { available, reduced } = useGlass()
  const glass = available && !reduced

  return (
    <View className={cn(glass ? 'overflow-hidden' : solid, className)} {...props}>
      {glass ? (
        <GlassView
          colorScheme={name === 'mocha' ? 'dark' : 'light'}
          glassEffectStyle="regular"
          pointerEvents="none"
          style={ABSOLUTE_FILL}
          tintColor={GlassTint.of(tintColor, strength)}
        />
      ) : null}
      {children}
    </View>
  )
}
