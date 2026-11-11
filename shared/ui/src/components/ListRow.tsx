import type { ReactElement, ReactNode } from 'react'

import { useCallback } from 'react'
import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn'
import { Icon } from './Icon'
import { Spinner } from './Spinner'
import { Text } from './Text'

/** Props for ListRow. */
export interface IListRowProps {
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
  /** Draws the title in the danger color (sign out, delete). */
  destructive?: boolean
  /** Makes the row a button. Without it the row is plain content. */
  onPress?: () => void
  /** Why the row cannot be pressed right now, while a request is in flight. */
  busy?: boolean
  /**
   * What the row says while its own request runs, such as "Saving…": a spinner and this text take
   * the place of the trailing content, and the row counts as busy. They are plain content, not a
   * button, because a button cannot sit inside the row's own.
   */
  working?: string
  /** Whether the row is picked, for a row that ticks like a checkbox. Leave it out for other rows. */
  selected?: boolean
  /** Whether the content the row opens is showing, for a row that expands in place. Leave it out for other rows. */
  expanded?: boolean
}

/**
 * The spinner and live label a row shows while its own request runs.
 * @returns The spinner beside the label.
 */
const Working = ({
  label,
}: {
  /** What the row says while it works. */
  label: string
}): ReactElement => (
  <View className="flex-row items-center gap-2">
    <Spinner tone="fg-subtle" />
    <Text accessibilityLiveRegion="polite" aria-live="polite" tone="subtle" variant="label">
      {label}
    </Text>
  </View>
)

/**
 * A row of a List: leading content, a title with optional subtitle, and trailing content; a button when it has an `onPress`.
 * @returns A full-width line, pressable when it has a handler.
 */
export const ListRow = ({
  busy = false,
  chevron = false,
  destructive = false,
  expanded,
  leading,
  onPress,
  selected,
  subtitle,
  title,
  trailing,
  working,
}: IListRowProps): ReactElement => {
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
      {trailing !== undefined || chevron || working !== undefined ? (
        <View className="shrink-0 flex-row items-center gap-2">
          {working === undefined ? trailing : <Working label={working} />}
          {chevron ? <Icon decorative name="chevron" tone="fg-muted" /> : null}
        </View>
      ) : null}
    </>
  )

  const layout = 'min-h-16 w-full flex-row items-center gap-3 px-4 py-2'

  // A press only starts the handler; an async handler's promise is not handed back to the Pressable.
  const handlePress = useCallback((): void => {
    onPress?.()
  }, [onPress])

  if (onPress === undefined) return <View className={layout}>{content}</View>

  return (
    <Pressable
      accessibilityLabel={subtitle === undefined ? title : t('listRow.spoken', { subtitle, title })}
      accessibilityRole="button"
      aria-busy={busy || working !== undefined}
      aria-expanded={expanded}
      aria-selected={selected}
      className={cn(
        layout,
        'hover:bg-bg-hover focus:outline-2 focus:-outline-offset-2 focus:outline-focus-ring active:bg-bg-hover',
      )}
      onPress={handlePress}
    >
      {content}
    </Pressable>
  )
}
