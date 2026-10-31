import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { RoleName } from '@roundup/tokens'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { ICONS } from '../lib/icons.ts'
import { useTheme } from '../theme/theme.tsx'

/** Props every icon has. */
interface IconBase {
  /** Which icon of the set to draw. */
  name: IconName
  /** Grid size in points. 20 in controls, 22 in the bottom nav, 16 inline with small text. */
  size?: number
  /** Role colour for the strokes. Defaults to fg; React Native has no currentColor to inherit. */
  tone?: RoleName
  /** Extra classes for placement. */
  className?: string
}

/** A purely decorative icon: hidden from screen readers. */
interface Decorative {
  /** Marks the icon as decoration. */
  decorative: true
  /** Decorative icons are not announced, so they have no label. */
  label?: undefined
}

/** An icon that carries meaning: announced as an image with this label. */
interface Labelled {
  /** A labelled icon is not decoration. */
  decorative?: undefined
  /** What the icon means, such as "Back". */
  label: string
}

/** An icon says what it is, or says it is decoration. Never neither. */
export type IconProps = IconBase &
  /** Either decorative (hidden from screen readers) or labelled (announced as an image). */
  (Decorative | Labelled)

/**
 * Draws one icon of the set from its SVG file, tinted with a role colour through `color`/currentColor.
 * @returns A square view holding the tinted artwork.
 */
export const Icon = ({
  className,
  decorative,
  label,
  name,
  size = 20,
  tone = 'fg',
}: IconProps): ReactElement => {
  const { roles } = useTheme()
  const Glyph = ICONS[name]

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole={decorative === true ? undefined : 'image'}
      accessible={decorative !== true}
      aria-hidden={decorative}
      className={cn('shrink-0', className)}
      importantForAccessibility={decorative === true ? 'no-hide-descendants' : 'auto'}
    >
      <Glyph aria-hidden color={roles[tone]} height={size} width={size} />
    </View>
  )
}
