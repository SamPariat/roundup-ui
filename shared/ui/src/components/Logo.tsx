import type { FC, ReactElement } from 'react'
import type { SvgProps } from 'react-native-svg'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { Theme } from '../theme/theme.tsx'

import LockupDark from '../../../../assets/svg/logo/lockup-dark.svg'
import LockupLight from '../../../../assets/svg/logo/lockup-light.svg'
import LockupMono from '../../../../assets/svg/logo/lockup-mono.svg'
import MarkDark from '../../../../assets/svg/logo/mark-dark.svg'
import MarkLight from '../../../../assets/svg/logo/mark-light.svg'
import MarkMono from '../../../../assets/svg/logo/mark-mono.svg'
import WordmarkDark from '../../../../assets/svg/logo/wordmark-dark.svg'
import WordmarkLight from '../../../../assets/svg/logo/wordmark-light.svg'
import WordmarkMono from '../../../../assets/svg/logo/wordmark-mono.svg'
import { cn } from '../lib/cn.ts'
import { useTheme } from '../theme/theme.tsx'

const SIZES = { sm: 24, md: 32, lg: 48, xl: 96 } as const

export interface LogoProps {
  /** lockup = mark + wordmark (default). */
  type?: 'lockup' | 'mark' | 'wordmark'
  /** sm 24 · md 32 · lg 48 · xl 96, or a pixel size for the mark. */
  size?: keyof typeof SIZES | number
  /** brand uses the logo-* token colours of the current theme; mono draws everything in the text colour. */
  tone?: 'brand' | 'mono'
  label?: string
  className?: string
}

type Variant = 'dark' | 'light' | 'mono'

interface Artwork {
  files: Record<Variant, FC<SvgProps>>
  /** Width over height of the file's viewBox. */
  aspect: number
  /** Height as a share of the mark size the caller asked for. */
  height: number
}

// The viewBox sizes below are those of the files in assets/svg/logo; Logo.test.tsx checks them.
// A lockup is as tall as the mark. The wordmark file is cropped to its glyphs, so it is drawn at
// the height that keeps its letters the size they have inside the lockup (65.16 of 96 units).
const ARTWORK: Record<NonNullable<LogoProps['type']>, Artwork> = {
  lockup: {
    files: { dark: LockupDark, light: LockupLight, mono: LockupMono },
    aspect: 417.26 / 96,
    height: 1,
  },
  mark: { files: { dark: MarkDark, light: MarkLight, mono: MarkMono }, aspect: 1, height: 1 },
  wordmark: {
    files: { dark: WordmarkDark, light: WordmarkLight, mono: WordmarkMono },
    aspect: 288.86 / 65.16,
    height: 65.16 / 96,
  },
}

// Mocha is the dark theme and Latte the light one; the files carry that theme's logo-* colours.
const variantFor = (tone: NonNullable<LogoProps['tone']>, themeName: Theme['name']): Variant => {
  if (tone === 'mono') return 'mono'

  return themeName === 'mocha' ? 'dark' : 'light'
}

/**
 * The Roundup logo, drawn from the SVG files in assets/svg/logo (outlined paths, no font). It is
 * one image to assistive tech, named by `label` or the app name; the artwork itself is hidden.
 */
export const Logo = ({
  className,
  label,
  size = 'md',
  tone = 'brand',
  type = 'lockup',
}: LogoProps): ReactElement => {
  const { t } = useT()
  const { name, roles } = useTheme()
  const mark = typeof size === 'number' ? size : SIZES[size]
  const { aspect, files, height: share } = ARTWORK[type]
  const Artwork = files[variantFor(tone, name)]
  const height = mark * share

  return (
    <View
      accessibilityLabel={label ?? t('common.appName')}
      accessible
      className={cn('shrink-0 flex-row items-center', className)}
      role="img"
    >
      <Artwork aria-hidden color={roles.fg} height={height} width={height * aspect} />
    </View>
  )
}
