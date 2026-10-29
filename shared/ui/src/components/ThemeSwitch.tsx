import type { ReactElement } from 'react'

import { Pressable, View } from 'react-native'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

const OPTIONS = [
  { id: 'system', label: 'System', icon: 'device' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
] as const satisfies readonly { icon: IconName; id: string; label: string }[]

export type ThemeChoice = (typeof OPTIONS)[number]['id']

export interface ThemeSwitchProps {
  /** system follows the device; light is Latte, dark is Mocha. */
  value?: ThemeChoice
  onChange?: (value: ThemeChoice) => void
  label?: string
}

// Three radios in one group: exactly one is checked, and the group is named.
export const ThemeSwitch = ({
  label = 'Theme',
  onChange,
  value = 'system',
}: ThemeSwitchProps): ReactElement => (
  <View
    accessibilityLabel={label}
    className="flex-row gap-1 rounded-md bg-bg-sunken p-1"
    role="radiogroup"
  >
    {OPTIONS.map((option) => {
      const checked = option.id === value
      return (
        <Pressable
          accessibilityLabel={option.label}
          accessibilityRole="radio"
          aria-checked={checked}
          className={cn(
            'min-h-tap flex-1 flex-row items-center justify-center gap-2 rounded-sm focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
            checked ? 'border border-border bg-bg-raised' : 'hover:bg-bg-hover',
          )}
          key={option.id}
          onPress={() => onChange?.(option.id)}
        >
          <Icon decorative name={option.icon} size={18} tone={checked ? 'accent' : 'fg-muted'} />
          <Text tone={checked ? 'fg' : 'muted'} variant="label">
            {option.label}
          </Text>
        </Pressable>
      )
    })}
  </View>
)
