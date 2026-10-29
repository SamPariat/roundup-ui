import type { ReactElement } from 'react'

import { Pressable } from 'react-native'

import type { IconName } from '../Icon/icons.ts'

import { Icon } from '../Icon/Icon.tsx'
import { cn } from '../lib/cn.ts'
import { Text } from '../Text/Text.tsx'

export interface ChipProps {
  selected?: boolean
  icon?: IconName
  onPress?: () => void
  /** The chip's text. It is also its accessible name. */
  children: string
}

export const Chip = ({ children, icon, onPress, selected = false }: ChipProps): ReactElement => (
  <Pressable
    accessibilityRole="button"
    aria-selected={selected}
    className={cn(
      'h-[36px] flex-row items-center gap-1 self-start rounded-sm border border-border-strong px-3 focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring active:bg-bg-hover',
      selected && 'border-accent bg-accent-soft',
    )}
    hitSlop={6}
    onPress={onPress}
  >
    {selected ? (
      <Icon decorative name="check" size={16} tone="accent" />
    ) : icon === undefined ? null : (
      <Icon decorative name={icon} size={16} />
    )}
    <Text variant="label">{children}</Text>
  </Pressable>
)
