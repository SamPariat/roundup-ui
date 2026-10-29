import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { RoleName } from '@roundup/tokens'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { ICONS } from '../lib/icons.ts'
import { useTheme } from '../theme/theme.tsx'

interface IconBase {
  name: IconName
  /** Grid size in points. 20 in controls, 22 in the bottom nav, 16 inline with small text. */
  size?: number
  /** Role colour for the strokes. Defaults to fg; React Native has no currentColor to inherit. */
  tone?: RoleName
  className?: string
}

/** An icon says what it is, or says it is decoration. Never neither. */
export type IconProps = IconBase &
  ({ decorative: true; label?: never } | { decorative?: never; label: string })

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
