import type { FC, ReactElement } from 'react'
import type { SvgProps } from 'react-native-svg'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { TStyled } from '../lib/svg'
import type { ITheme } from '../theme/theme'

import LockupDark from '../../../../assets/svg/logo/lockup-dark.svg'
import LockupLight from '../../../../assets/svg/logo/lockup-light.svg'
import LockupMono from '../../../../assets/svg/logo/lockup-mono.svg'
import MarkDark from '../../../../assets/svg/logo/mark-dark.svg'
import MarkLight from '../../../../assets/svg/logo/mark-light.svg'
import MarkMono from '../../../../assets/svg/logo/mark-mono.svg'
import WordmarkDark from '../../../../assets/svg/logo/wordmark-dark.svg'
import WordmarkLight from '../../../../assets/svg/logo/wordmark-light.svg'
import WordmarkMono from '../../../../assets/svg/logo/wordmark-mono.svg'
import { cn } from '../lib/cn'
import { styleSvg } from '../lib/svg'
import { useTheme } from '../theme/theme'

const SIZES = { sm: 24, md: 32, lg: 48, xl: 96 } as const

/** Props for Logo. */
export interface ILogoProps {
  /** lockup = mark + wordmark (default). */
  type?: 'lockup' | 'mark' | 'wordmark'
  /** sm 24 · md 32 · lg 48 · xl 96, or a pixel size for the mark. */
  size?: keyof typeof SIZES | number
  /** brand uses the logo-* token colors of the current theme; mono draws everything in the text color. */
  tone?: 'brand' | 'mono'
  /** Accessible name. Defaults to the app name. */
  label?: string
  /** Extra classes for placement. */
  className?: string
}

/** Which file of each artwork set to draw: Mocha colors, Latte colors, or currentColor. */
type TVariant = 'dark' | 'light' | 'mono'

/** One kind of logo artwork (mark, wordmark or lockup) in its three color variants. */
interface IArtwork {
  /** The SVG component for each color variant. */
  files: Record<TVariant, FC<TStyled<SvgProps>>>
  /** Width over height of the file's viewBox. */
  aspect: number
  /** Height as a share of the mark size the caller asked for. */
  height: number
}

// The viewBox sizes below are those of the files in assets/svg/logo; Logo.test.tsx checks them.
// A lockup is as tall as the mark. The wordmark file is cropped to its glyphs, so it is drawn at
// the height that keeps its letters the size they have inside the lockup (65.16 of 96 units).
const ARTWORK: Record<NonNullable<ILogoProps['type']>, IArtwork> = {
  lockup: {
    files: {
      dark: styleSvg(LockupDark),
      light: styleSvg(LockupLight),
      mono: styleSvg(LockupMono),
    },
    aspect: 417.26 / 96,
    height: 1,
  },
  mark: {
    files: {
      dark: styleSvg(MarkDark),
      light: styleSvg(MarkLight),
      mono: styleSvg(MarkMono),
    },
    aspect: 1,
    height: 1,
  },
  wordmark: {
    files: {
      dark: styleSvg(WordmarkDark),
      light: styleSvg(WordmarkLight),
      mono: styleSvg(WordmarkMono),
    },
    aspect: 288.86 / 65.16,
    height: 65.16 / 96,
  },
}

/**
 * Logo helpers. Static methods only.
 */
class LogoVariant {
  /**
   * Chooses the artwork variant from the tone and the active theme. Mocha is the dark theme and
   * Latte the light one; the files carry that theme's logo-* colors.
   * @param tone - Brand colors or one color.
   * @param themeName - The active theme.
   * @returns dark for Mocha, light for Latte, mono when the tone says so.
   */
  static variantFor(tone: NonNullable<ILogoProps['tone']>, themeName: ITheme['name']): TVariant {
    if (tone === 'mono') return 'mono'

    return themeName === 'mocha' ? 'dark' : 'light'
  }
}

/**
 * The Roundup logo, drawn from the SVG files in assets/svg/logo (outlined paths, no font). It is
 * one image to assistive tech, named by `label` or the app name; the artwork itself is hidden.
 * @returns The logo, one image to assistive technology.
 */
export const Logo = ({
  className,
  label,
  size = 'md',
  tone = 'brand',
  type = 'lockup',
}: ILogoProps): ReactElement => {
  const { t } = useT()
  const { name } = useTheme()
  const mark = typeof size === 'number' ? size : SIZES[size]
  const { aspect, files, height: share } = ARTWORK[type]
  const Artwork = files[LogoVariant.variantFor(tone, name)]
  const height = mark * share

  return (
    <View
      accessibilityLabel={label ?? t('common.appName')}
      accessible
      className={cn('shrink-0 flex-row items-center', className)}
      role="img"
    >
      <Artwork aria-hidden className="text-fg" height={height} width={height * aspect} />
    </View>
  )
}
