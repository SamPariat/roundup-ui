import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { Button } from '../Button/Button.tsx'
import { Text } from '../Text/Text.tsx'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Text of a back link above the title, e.g. "Squads". */
  back?: string
  onBack?: () => void
  leading?: ReactNode
  actions?: ReactNode
}

/** The title block at the top of a page from 1024 wide up. */
export const PageHeader = ({
  actions,
  back,
  leading,
  onBack,
  subtitle,
  title,
}: PageHeaderProps): ReactElement => (
  <View className="gap-2">
    {back === undefined ? null : (
      <Button icon="back" onPress={onBack} size="sm" variant="ghost">
        {back}
      </Button>
    )}
    <View className="flex-row flex-wrap items-center gap-4">
      {leading}
      <View className="min-w-[240px] flex-1 gap-1">
        <Text heading={1} variant="display">
          {title}
        </Text>
        {subtitle === undefined ? null : <Text tone="muted">{subtitle}</Text>}
      </View>
      {actions === undefined ? null : <View className="flex-row flex-wrap gap-2">{actions}</View>}
    </View>
  </View>
)
