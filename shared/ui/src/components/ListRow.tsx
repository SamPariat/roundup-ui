import type { ReactElement, ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

export interface ListRowProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  chevron?: boolean
  destructive?: boolean
  onPress?: () => void
  /** Why the row cannot be pressed right now, while a request is in flight. */
  busy?: boolean
}

export const ListRow = ({
  busy = false,
  chevron = false,
  destructive = false,
  leading,
  onPress,
  subtitle,
  title,
  trailing,
}: ListRowProps): ReactElement => {
  const { t } = useT()

  const content = (
    <>
      {leading === undefined ? null : <View className="shrink-0">{leading}</View>}
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} tone={destructive ? 'danger' : 'fg'} variant="body-strong">
          {title}
        </Text>
        {subtitle === undefined ? null : (
          <Text numberOfLines={1} tone="muted" variant="body-sm">
            {subtitle}
          </Text>
        )}
      </View>
      {trailing !== undefined || chevron ? (
        <View className="shrink-0 flex-row items-center gap-2">
          {trailing}
          {chevron ? <Icon decorative name="chevron" tone="fg-muted" /> : null}
        </View>
      ) : null}
    </>
  )

  const layout = 'min-h-[64px] w-full flex-row items-center gap-3 px-4 py-2'

  if (onPress === undefined) return <View className={layout}>{content}</View>

  return (
    <Pressable
      accessibilityLabel={subtitle === undefined ? title : t('listRow.spoken', { subtitle, title })}
      accessibilityRole="button"
      aria-busy={busy}
      className={cn(
        layout,
        'hover:bg-bg-hover focus:outline-2 focus:outline-offset-[-2px] focus:outline-focus-ring active:bg-bg-hover',
      )}
      onPress={onPress}
    >
      {content}
    </Pressable>
  )
}
