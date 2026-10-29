import type { ReactElement } from 'react'

import { Pressable } from 'react-native'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

export interface ChipProps {
  selected?: boolean
  icon?: IconName
  onPress?: () => void
  /** The chip's text. It is also its accessible name. */
  children: string
}

// A selected chip always shows a check; otherwise it shows its own icon, if it has one.
const ChipIcon = ({
  icon,
  selected,
}: {
  icon?: IconName | undefined
  selected: boolean
}): null | ReactElement => {
  if (selected) return <Icon decorative name="check" size={16} tone="accent" />

  if (icon === undefined) return null

  return <Icon decorative name={icon} size={16} />
}

export const Chip = ({ children, icon, onPress, selected = false }: ChipProps): ReactElement => (
  <Pressable
    accessibilityRole="button"
    aria-selected={selected}
    className={cn(
      'h-9 flex-row items-center gap-1 self-start rounded-lg border border-border-strong px-3 focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring active:bg-bg-hover',
      selected && 'border-accent bg-accent-soft',
    )}
    hitSlop={6}
    onPress={onPress}
  >
    <ChipIcon icon={icon} selected={selected} />
    <Text variant="label">{children}</Text>
  </Pressable>
)
