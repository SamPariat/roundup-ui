import type { ReactElement } from 'react'

import { useCallback } from 'react'
import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn'
import { Text } from './Text'

/** One segment of Tabs. */
export interface ITabItem {
  /** A number shown after the label, such as how many items are in the tab. */
  count?: number
  /** Stable ID passed to `onChange`. */
  id: string
  /** The segment text. */
  label: string
}

/** Props for Tabs. */
export interface ITabsProps {
  /** The segments, in order. */
  items: ITabItem[]
  /** The id of the selected segment. */
  value: string
  /** Called with the id of the segment that was pressed. */
  onChange?: (id: string) => void
}

/** Props for one segment. */
interface ITabButtonProps {
  /** Whether this segment is selected. */
  active: boolean
  /** The segment to draw. */
  item: ITabItem
  /** Called with the segment's id when pressed. */
  onChange?: ((id: string) => void) | undefined
  /** Whether any segment has a count, so the others keep room for one and do not shift when it arrives. */
  reserveCount: boolean
}

/**
 * One segment of the tab bar: label, optional count, selected state.
 * @returns The pressable segment.
 */
const TabButton = ({ active, item, onChange, reserveCount }: ITabButtonProps): ReactElement => {
  const { t } = useT()

  const handlePress = useCallback((): void => {
    onChange?.(item.id)
  }, [item.id, onChange])

  return (
    <Pressable
      accessibilityLabel={
        item.count === undefined
          ? item.label
          : t('tabs.withCount', { label: item.label, total: item.count })
      }
      accessibilityRole="tab"
      aria-selected={active}
      className={cn(
        'min-h-12 flex-1 flex-row items-center justify-center gap-1 rounded-lg focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
        active ? 'border border-border bg-bg-raised' : 'hover:bg-bg-hover',
      )}
      onPress={handlePress}
    >
      <Text tone={active ? 'fg' : 'muted'} variant="label">
        {item.label}
      </Text>
      {reserveCount ? (
        <Text
          aria-hidden
          className={cn('min-w-4', item.count === undefined && 'opacity-0')}
          tone="muted"
          variant="caption"
        >
          {String(item.count ?? 0)}
        </Text>
      ) : null}
    </Pressable>
  )
}

/**
 * A segmented control that switches between views, announced as a tablist whose tabs are selected or not. When any segment has a count, every segment holds room for one, so a count that arrives late moves nothing.
 * @returns The segmented bar.
 */
export const Tabs = ({ items, onChange, value }: ITabsProps): ReactElement => {
  const reserveCount = items.some((item) => item.count !== undefined)

  return (
    <View className="flex-row gap-1 rounded-xl bg-bg-sunken p-1" role="tablist">
      {items.map((item) => (
        <TabButton
          active={item.id === value}
          item={item}
          key={item.id}
          onChange={onChange}
          reserveCount={reserveCount}
        />
      ))}
    </View>
  )
}
