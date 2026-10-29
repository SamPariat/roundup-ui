import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { Button } from './Button.tsx'
import { Logo } from './Logo.tsx'
import { SafeArea } from './SafeArea.tsx'
import { Surface } from './Surface.tsx'
import { Text } from './Text.tsx'

export interface TopAppBarProps {
  title: string
  back?: boolean
  onBack?: () => void
  actions?: ReactNode
  large?: boolean
  /** Show the logo mark; use on the top-level screens (Squads, Explore, Profile). */
  logo?: boolean
}

export const TopAppBar = ({
  actions,
  back = false,
  large = false,
  logo = false,
  onBack,
  title,
}: TopAppBarProps): ReactElement => {
  const leading = (
    <>
      {back || onBack !== undefined ? (
        <Button icon="back" label="Back" onPress={onBack} variant="ghost" />
      ) : null}
      {logo ? <Logo className="mx-3" label="Roundup" size={28} type="mark" /> : null}
    </>
  )

  return (
    <Surface className="border-b border-border" tone="sunken">
      <SafeArea edges={['top', 'left', 'right']}>
        {large ? (
          <View className="pb-2">
            <View className="h-appbar flex-row items-center px-1">
              {leading}
              <View className="flex-1" />
              {actions}
            </View>
            <Text className="px-4" heading={1} variant="title">
              {title}
            </Text>
          </View>
        ) : (
          <View className="h-appbar flex-row items-center gap-1 px-1">
            {leading}
            <Text
              className="min-w-0 flex-1 px-2"
              heading={1}
              numberOfLines={1}
              variant="body-strong"
            >
              {title}
            </Text>
            {actions}
          </View>
        )}
      </SafeArea>
    </Surface>
  )
}
