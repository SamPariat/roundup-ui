import type { ReactElement, ReactNode } from 'react'
import type { ViewProps } from 'react-native'

import { GlassView } from 'expo-glass-effect'
import { View } from 'react-native'

import type { RoleColor } from '../lib/useRoleColor'

import { cn } from '../lib/cn.ts'
import { useGlass } from '../lib/useGlass.ts'
import { useRoleColor } from '../lib/useRoleColor'
import { useTheme } from '../theme/theme.tsx'

/** How one surface tone looks. */
interface ToneStyle {
  /** Solid background class used when glass is off. */
  className: string
  /** Role colour the glass layer is tinted with. */
  tint: RoleColor
}

const TONES = {
  raised: { className: 'bg-bg-raised', tint: 'bg-raised' },
  sunken: { className: 'bg-bg-sunken', tint: 'bg-sunken' },
} as const satisfies Record<string, ToneStyle>

/** Props for Surface: the usual View props plus a tone. */
export type SurfaceProps = ViewProps & {
  /** What to draw on the surface. */
  children?: ReactNode
  /** Extra classes for the wrapper. */
  className?: string
  /** raised (cards, dialogs) or sunken (bars, tracks). Defaults to raised. */
  tone?: keyof typeof TONES
}

// Raw geometry for the glass layer; it is the one place a style object is the right tool.
const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const

/**
 * The one surface primitive. On iOS 26+ it is Liquid Glass tinted with the role colour;
 * everywhere else, and whenever Reduce Transparency is on, it is the solid role colour.
 * Never put opacity on a Surface: glass does not render below opacity 1. Dim its content instead.
 * @returns The surface view, with the glass layer behind its children when available.
 */
export const Surface = ({
  children,
  className,
  tone = 'raised',
  ...props
}: SurfaceProps): ReactElement => {
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
          style={FILL}
          tintColor={tintColor}
        />
      ) : null}
      {children}
    </View>
  )
}
