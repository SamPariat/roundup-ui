import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { Button } from './Button.tsx'
import { Text } from './Text.tsx'

/** Props for PageHeader. */
export interface PageHeaderProps {
  /** The page title, the one level-1 heading of the page. */
  title: string
  /** A muted line under the title. */
  subtitle?: string
  /** Text of a back link above the title, e.g. "Squads". */
  back?: string
  /** Called when the back button is pressed. */
  onBack?: () => void
  /** Content before the title, such as an Avatar. */
  leading?: ReactNode
  /** Buttons on the right of the header. */
  actions?: ReactNode
}

/**
 * The title block at the top of a page from 1024 wide up.
 * @returns The header block.
 */
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
      <View className="min-w-60 flex-1 gap-1">
        <Text heading={1} variant="display">
          {title}
        </Text>
        {subtitle === undefined ? null : <Text tone="muted">{subtitle}</Text>}
      </View>
      {actions === undefined ? null : <View className="flex-row flex-wrap gap-2">{actions}</View>}
    </View>
  </View>
)
