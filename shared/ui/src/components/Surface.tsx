import type { ReactElement, ReactNode } from 'react'
import type { ViewProps } from 'react-native'

import { GlassView } from 'expo-glass-effect'
import { View } from 'react-native'

import type { TRoleColor } from '../lib/useRoleColor'

import { cn } from '../lib/cn'
import { ABSOLUTE_FILL } from '../lib/fill'
import { useGlass } from '../lib/useGlass'
import { useRoleColor } from '../lib/useRoleColor'
import { useTheme } from '../theme/theme'

/** How one surface tone looks. */
interface IToneStyle {
  /** Solid background class used when glass is off. */
  className: string
  /** Role color the glass layer is tinted with. */
  tint: TRoleColor
}

const TONES = {
  raised: { className: 'bg-bg-raised', tint: 'bg-raised' },
  sunken: { className: 'bg-bg-sunken', tint: 'bg-sunken' },
} as const satisfies Record<string, IToneStyle>

/** Props for Surface: the usual View props plus a tone. */
export type TSurfaceProps = ViewProps & {
  /** What to draw on the surface. */
  children?: ReactNode
  /** Extra classes for the wrapper. */
  className?: string
  /** raised (cards, dialogs) or sunken (bars, tracks). Defaults to raised. */
  tone?: keyof typeof TONES
}

/**
 * The one surface primitive. On iOS 26+ it is Liquid Glass tinted with the role color;
 * everywhere else, and whenever Reduce Transparency is on, it is the solid role color.
 * Never put opacity on a Surface: glass does not render below opacity 1. Dim its content instead.
 * @returns The surface view, with the glass layer behind its children when available.
 */
export const Surface = ({
  children,
  className,
  tone = 'raised',
  ...props
}: TSurfaceProps): ReactElement => {
  const { available, reduced } = useGlass()
  const { name } = useTheme()
  const glass = available && !reduced
  const { className: solid, tint } = TONES[tone]
  const tintColor = useRoleColor(tint)

  return (
    <View className={cn(glass ? 'overflow-hidden' : solid, className)} {...props}>
      {glass ? (
        <GlassView
          colorScheme={name === 'mocha' ? 'dark' : 'light'}
          glassEffectStyle="regular"
          pointerEvents="none"
          style={ABSOLUTE_FILL}
          tintColor={tintColor}
        />
      ) : null}
      {children}
    </View>
  )
}
