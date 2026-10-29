import type { ReactElement, ReactNode } from 'react'
import type { ViewProps } from 'react-native'

import { GlassView } from 'expo-glass-effect'
import { View } from 'react-native'

import type { RoleName } from '@roundup/tokens'

import { cn } from '../lib/cn.ts'
import { useGlass } from '../lib/use-glass.ts'
import { useTheme } from '../theme/theme.tsx'

const TONES = {
  raised: { className: 'bg-bg-raised', tint: 'bg-raised' },
  sunken: { className: 'bg-bg-sunken', tint: 'bg-sunken' },
} as const satisfies Record<string, { className: string; tint: RoleName }>

export type SurfaceProps = ViewProps & {
  children?: ReactNode
  className?: string
  tone?: keyof typeof TONES
}

// Raw geometry for the glass layer; it is the one place a style object is the right tool.
const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const

/**
 * The one surface primitive. On iOS 26+ it is Liquid Glass tinted with the role colour;
 * everywhere else, and whenever Reduce Transparency is on, it is the solid role colour.
 * Never put opacity on a Surface: glass does not render below opacity 1. Dim its content instead.
 */
export const Surface = ({
  children,
  className,
  tone = 'raised',
  ...props
}: SurfaceProps): ReactElement => {
  const { available, reduced } = useGlass()
  const { name, roles } = useTheme()
  const glass = available && !reduced
  const { className: solid, tint } = TONES[tone]

  return (
    <View className={cn(glass ? 'overflow-hidden' : solid, className)} {...props}>
      {glass ? (
        <GlassView
          colorScheme={name === 'mocha' ? 'dark' : 'light'}
          glassEffectStyle="regular"
          pointerEvents="none"
          style={FILL}
          tintColor={roles[tint]}
        />
      ) : null}
      {children}
    </View>
  )
}
