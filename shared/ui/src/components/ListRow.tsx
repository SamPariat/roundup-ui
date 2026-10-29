import type { ReactElement, ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

/** Props for ListRow. */
export interface ListRowProps {
  /** The row's main text. */
  title: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Content before the text, such as an Avatar or Icon. */
  leading?: ReactNode
  /** Content after the text, such as a Badge or a value. */
  trailing?: ReactNode
  /** Shows a chevron to say the row opens something. */
  chevron?: boolean
  /** Draws the title in the danger colour (sign out, delete). */
  destructive?: boolean
  /** Makes the row a button. Without it the row is plain content. */
  onPress?: () => void
  /** Why the row cannot be pressed right now, while a request is in flight. */
  busy?: boolean
}

/**
 * A row of a List: leading content, a title with optional subtitle, and trailing content; a button when it has an `onPress`.
 * @returns A full-width line, pressable when it has a handler.
 */
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

  const layout = 'min-h-16 w-full flex-row items-center gap-3 px-4 py-2'

  if (onPress === undefined) return <View className={layout}>{content}</View>

  return (
    <Pressable
      accessibilityLabel={subtitle === undefined ? title : t('listRow.spoken', { subtitle, title })}
      accessibilityRole="button"
      aria-busy={busy}
      className={cn(
        layout,
        'hover:bg-bg-hover focus:outline-2 focus:-outline-offset-2 focus:outline-focus-ring active:bg-bg-hover',
      )}
      onPress={onPress}
    >
      {content}
    </Pressable>
  )
}
