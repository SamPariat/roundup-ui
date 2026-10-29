import type { ReactElement } from 'react'

import { Pressable, View } from 'react-native'

import { cn } from '../lib/cn.ts'
import { Text } from '../Text/Text.tsx'

export interface TabsProps {
  items: { count?: number; id: string; label: string }[]
  value: string
  onChange?: (id: string) => void
}

export const Tabs = ({ items, onChange, value }: TabsProps): ReactElement => (
  <View className="flex-row gap-1 rounded-md bg-bg-sunken p-1" role="tablist">
    {items.map((item) => {
      const active = item.id === value
      return (
        <Pressable
          accessibilityLabel={
            item.count === undefined ? item.label : `${item.label}, ${String(item.count)}`
          }
          accessibilityRole="tab"
          aria-selected={active}
          className={cn(
            'min-h-tap flex-1 flex-row items-center justify-center gap-1 rounded-sm focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
            active ? 'border border-border bg-bg-raised' : 'hover:bg-bg-hover',
          )}
          key={item.id}
          onPress={() => onChange?.(item.id)}
        >
          <Text tone={active ? 'fg' : 'muted'} variant="label">
            {item.label}
          </Text>
          {item.count === undefined ? null : (
            <Text tone="muted" variant="caption">
              {String(item.count)}
            </Text>
          )}
        </Pressable>
      )
    })}
  </View>
)
