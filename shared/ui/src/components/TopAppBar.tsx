import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn.ts'
import { Button } from './Button.tsx'
import { Logo } from './Logo.tsx'
import { SafeArea } from './SafeArea.tsx'
import { Surface } from './Surface.tsx'
import { Text } from './Text.tsx'

/** Props for TopAppBar. */
export interface TopAppBarProps {
  /** The screen title, the page's level-1 heading. */
  title: string
  /** Shows the back button even without an `onBack` handler. */
  back?: boolean
  /** Called when the back button is pressed. Providing it also shows the button. */
  onBack?: () => void
  /** Buttons on the right. */
  actions?: ReactNode
  /** Puts the title on its own large line under the bar. */
  large?: boolean
  /** Show the logo mark; use on the top-level screens (Squads, Explore, Profile). */
  logo?: boolean
}

/**
 * The top bar of a screen on phones: back button or logo, the title, and actions; it pads for the top safe area.
 * @returns A top-safe-area surface holding the bar row.
 */
export const TopAppBar = ({
  actions,
  back = false,
  large = false,
  logo = false,
  onBack,
  title,
}: TopAppBarProps): ReactElement => {
  const { t } = useT()
  const hasBack = back || onBack !== undefined

  // Button sits at the start of the cross axis (self-start) so it never stretches in a column. In
  // this row that would pin it to the top of the bar, so the back button and the actions each sit
  // in a View, which the row centres.
  const leading = (
    <>
      {hasBack ? (
        <View>
          <Button icon="back" label={t('common.back')} onPress={onBack} variant="ghost" />
        </View>
      ) : null}
      {logo ? (
        <Logo className="mr-2 ml-3" label={t('common.appName')} size={28} type="mark" />
      ) : null}
    </>
  )

  const trailing =
    actions === undefined ? null : <View className="flex-row items-center">{actions}</View>

  return (
    <Surface className="border-b border-border" tone="sunken">
      <SafeArea edges={['top', 'left', 'right']}>
        {large ? (
          <View className="pb-2">
            <View className="h-14 flex-row items-center px-1">
              {leading}
              <View className="flex-1" />
              {trailing}
            </View>
            <Text className="px-4" heading={1} variant="title">
              {title}
            </Text>
          </View>
        ) : (
          <View className="h-14 flex-row items-center gap-1 px-1">
            {leading}
            {/* The title starts 12 in from the bar's edge, or right after the back button. */}
            <Text
              className={cn('min-w-0 flex-1 pr-2', hasBack ? 'pl-0' : 'pl-3')}
              heading={1}
              numberOfLines={1}
              variant="body-strong"
            >
              {title}
            </Text>
            {trailing}
          </View>
        )}
      </SafeArea>
    </Surface>
  )
}
