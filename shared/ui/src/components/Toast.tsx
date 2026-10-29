import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '../lib/icons.ts'

import { cn } from '../lib/cn.ts'
import { useTheme } from '../theme/theme.tsx'
import { Button } from './Button.tsx'
import { Icon } from './Icon.tsx'
import { Surface } from './Surface.tsx'
import { Text } from './Text.tsx'

const TONES = {
  success: { icon: 'check', fill: 'bg-success-soft', color: 'success' },
  error: { icon: 'alert', fill: 'bg-danger-soft', color: 'danger' },
  info: { icon: 'info', fill: 'bg-info-soft', color: 'info' },
} as const satisfies Record<
  string,
  { color: 'danger' | 'info' | 'success'; fill: string; icon: IconName }
>

export interface ToastProps {
  tone?: keyof typeof TONES
  action?: string
  onAction?: () => void
  children?: ReactNode
}

// A toast is a live region: errors interrupt, the rest wait for a pause.
export const Toast = ({ action, children, onAction, tone = 'info' }: ToastProps): ReactElement => {
  const { shadow } = useTheme()
  const { color, fill, icon } = TONES[tone]
  const urgent = tone === 'error'

  return (
    <Surface
      accessibilityLiveRegion={urgent ? 'assertive' : 'polite'}
      accessible
      aria-live={urgent ? 'assertive' : 'polite'}
      className="rounded-xl border border-border"
      role={urgent ? 'alert' : 'status'}
      style={{ boxShadow: shadow['shadow-toast'] ?? '' }}
    >
      <View className={cn('min-h-13 flex-row items-center gap-3 rounded-xl py-2 pr-2 pl-4', fill)}>
        <Icon decorative name={icon} tone={color} />
        <Text className="min-w-0 flex-1" variant="body-sm">
          {children}
        </Text>
        {action === undefined ? null : (
          <Button onPress={onAction} size="sm" variant="ghost">
            {action}
          </Button>
        )}
      </View>
    </Surface>
  )
}
