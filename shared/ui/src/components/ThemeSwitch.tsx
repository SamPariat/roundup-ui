import type { ReactElement } from 'react'

import { useCallback } from 'react'
import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

const OPTIONS = [
  { id: 'system', icon: 'device' },
  { id: 'light', icon: 'sun' },
  { id: 'dark', icon: 'moon' },
] as const satisfies readonly { icon: IconName; id: string }[]

export type ThemeChoice = (typeof OPTIONS)[number]['id']

export interface ThemeSwitchProps {
  /** system follows the device; light is Latte, dark is Mocha. */
  value?: ThemeChoice
  onChange?: (value: ThemeChoice) => void
  label?: string
}

const ThemeOption = ({
  checked,
  onChange,
  option,
}: {
  checked: boolean
  onChange?: ((id: ThemeChoice) => void) | undefined
  option: (typeof OPTIONS)[number]
}): ReactElement => {
  const { t } = useT()
  const label = t(`themeSwitch.${option.id}`)

  const press = useCallback(() => {
    onChange?.(option.id)
  }, [onChange, option.id])

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      aria-checked={checked}
      className={cn(
        'min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
        checked ? 'border border-border bg-bg-raised' : 'hover:bg-bg-hover',
      )}
      onPress={press}
    >
      <Icon decorative name={option.icon} size={18} tone={checked ? 'accent' : 'fg-muted'} />
      <Text tone={checked ? 'fg' : 'muted'} variant="label">
        {label}
      </Text>
    </Pressable>
  )
}

// Three radios in one group: exactly one is checked, and the group is named.
export const ThemeSwitch = ({
  label,
  onChange,
  value = 'system',
}: ThemeSwitchProps): ReactElement => {
  const { t } = useT()

  return (
    <View
      accessibilityLabel={label ?? t('themeSwitch.label')}
      className="flex-row gap-1 rounded-xl bg-bg-sunken p-1"
      role="radiogroup"
    >
      {OPTIONS.map((option) => (
        <ThemeOption
          checked={option.id === value}
          key={option.id}
          onChange={onChange}
          option={option}
        />
      ))}
    </View>
  )
}
