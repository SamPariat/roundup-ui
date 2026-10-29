import type { ReactElement } from 'react'

import { View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

import type { RoleName } from '@roundup/tokens'

import type { IconName } from './icons.ts'

import { cn } from '../lib/cn.ts'
import { useTheme } from '../theme/theme.tsx'
import { ICONS } from './icons.ts'

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
  const color = roles[tone]

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole={decorative === true ? undefined : 'image'}
      accessible={decorative !== true}
      aria-hidden={decorative}
      className={cn('shrink-0', className)}
      importantForAccessibility={decorative === true ? 'no-hide-descendants' : 'auto'}
    >
      <Svg
        fill="none"
        height={size}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        width={size}
      >
        {ICONS[name].map((shape, index) => {
          const fill = shape.filled === true ? color : 'none'
          const key = `${name}-${String(index)}`
          if (shape.tag === 'circle') {
            return <Circle fill={fill} key={key} {...shape.attributes} />
          }
          if (shape.tag === 'rect') {
            return <Rect key={key} {...shape.attributes} />
          }
          return <Path d={String(shape.attributes['d'])} fill={fill} key={key} />
        })}
      </Svg>
    </View>
  )
}
