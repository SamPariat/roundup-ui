import type { ReactElement } from 'react'

import { Pressable } from 'react-native'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

/** Props for Chip. */
export interface ChipProps {
  /** Whether the chip is chosen. A chosen chip is filled and shows a check. */
  selected?: boolean
  /** Leading icon shown while the chip is not selected. */
  icon?: IconName
  /** Called when the chip is pressed. */
  onPress?: () => void
  /** The chip's text. It is also its accessible name. */
  children: string
}

/**
 * Picks the chip's leading icon: a check when selected, otherwise its own icon if it has one.
 * @returns The icon, or null when there is none.
 */
const ChipIcon = ({
  icon,
  selected,
}: {
  /** The chip's own icon. */
  icon?: IconName | undefined
  /** Whether the chip is selected. */
  selected: boolean
}): null | ReactElement => {
  if (selected) return <Icon decorative name="check" size={16} tone="accent" />

  if (icon === undefined) return null

  return <Icon decorative name={icon} size={16} />
}

/**
 * A pill-shaped toggle for filters and choices, announced as a button that is selected or not.
 * @returns A pressable pill, selected or not.
 */
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
