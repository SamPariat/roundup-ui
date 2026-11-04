import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { TIconName } from '../lib/icons'

import { ClassHelper } from '../lib/class-helper'
import { ICONS } from '../lib/icons'

/** Tailwind needs each class spelled out, so a tone is looked up rather than built. */
const TONE_CLASS = {
  accent: 'text-accent',
  danger: 'text-danger',
  fg: 'text-fg',
  'fg-muted': 'text-fg-muted',
  'fg-subtle': 'text-fg-subtle',
  highlight: 'text-highlight',
  info: 'text-info',
  'on-accent': 'text-on-accent',
  'on-highlight': 'text-on-highlight',
  success: 'text-success',
  warning: 'text-warning',
} as const

/** Props every icon has. */
interface IIconBase {
  /** Which icon of the set to draw. */
  name: TIconName
  /** Grid size in points. 20 in controls, 22 in the bottom nav, 16 inline with small text. */
  size?: number
  /** Role color for the strokes. Defaults to fg; React Native has no currentColor to inherit. */
  tone?: keyof typeof TONE_CLASS
  /** Extra classes for placement. */
  className?: string
}

/** A purely decorative icon: hidden from screen readers. */
interface IDecorative {
  /** Marks the icon as decoration. */
  decorative: true
  /** Decorative icons are not announced, so they have no label. */
  label?: undefined
}

/** An icon that carries meaning: announced as an image with this label. */
interface ILabeled {
  /** A labeled icon is not decoration. */
  decorative?: undefined
  /** What the icon means, such as "Back". */
  label: string
}

/** An icon says what it is, or says it is decoration. Never neither. */
export type TIconProps = IIconBase &
  /** Either decorative (hidden from screen readers) or labeled (announced as an image). */
  (IDecorative | ILabeled)

/**
 * Draws one icon of the set from its SVG file, tinted with a role color through `color`/currentColor.
 * @returns A square view holding the tinted artwork.
 */
export const Icon = ({
  className,
  decorative,
  label,
  name,
  size = 20,
  tone = 'fg',
}: TIconProps): ReactElement => {
  const Glyph = ICONS[name]

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole={decorative === true ? undefined : 'image'}
      accessible={decorative !== true}
      aria-hidden={decorative}
      className={ClassHelper.cn('shrink-0', className)}
      importantForAccessibility={decorative === true ? 'no-hide-descendants' : 'auto'}
    >
      <Glyph aria-hidden className={TONE_CLASS[tone]} height={size} width={size} />
    </View>
  )
}
