import type { ReactElement } from 'react'

import { View } from 'react-native'
import Svg, { Circle, Rect } from 'react-native-svg'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn.ts'
import { useTheme } from '../theme/theme.tsx'
import { Text } from './Text.tsx'

const SIZES = { sm: 24, md: 32, lg: 48, xl: 96 } as const

export interface LogoProps {
  /** lockup = mark + wordmark (default). */
  type?: 'lockup' | 'mark' | 'wordmark'
  /** sm 24 · md 32 · lg 48 · xl 96, or a pixel size for the mark. */
  size?: keyof typeof SIZES | number
  /** brand uses the logo-* tokens; mono draws everything in the text colour. */
  tone?: 'brand' | 'mono'
  label?: string
  className?: string
}

// The mark: three rounded shapes gathered into an R (stem, bowl, leg) on a 32-unit grid.
const LogoMark = ({
  size,
  tone = 'brand',
}: {
  size: number
  tone?: 'brand' | 'mono'
}): ReactElement => {
  const { roles } = useTheme()
  const mono = tone === 'mono'

  return (
    <Svg aria-hidden height={size} viewBox="0 0 32 32" width={size}>
      <Rect
        fill={mono ? roles.fg : roles['logo-stem']}
        height={28}
        rx={5.5}
        width={11}
        x={2}
        y={2}
      />
      <Circle cx={21} cy={10} fill={mono ? roles.fg : roles['logo-bowl']} r={8} />
      <Circle cx={24} cy={25} fill={mono ? roles.fg : roles['logo-leg']} r={5} />
    </Svg>
  )
}

// Wordmark text is sized from the mark: three fixed steps cover every pixel size we use.
const wordClass = (pixels: number): string => {
  if (pixels <= 24) return 'type-heading'
  if (pixels <= 32) return 'type-title'

  return 'type-display'
}

export const Logo = ({
  className,
  label,
  size = 'md',
  tone = 'brand',
  type = 'lockup',
}: LogoProps): ReactElement => {
  const { t } = useT()
  const pixels = typeof size === 'number' ? size : SIZES[size]

  return (
    <View
      accessibilityLabel={label ?? t('common.appName')}
      accessible
      className={cn('shrink-0 flex-row items-center gap-2', className)}
      role="img"
    >
      {type === 'wordmark' ? null : <LogoMark size={pixels} tone={tone} />}
      {type === 'mark' ? null : (
        <Text aria-hidden className={wordClass(pixels)} maxFontSizeMultiplier={1.2}>
          {t('common.appName')}
        </Text>
      )}
    </View>
  )
}
