import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { EmptyState, Text, ThemeSwitch, useTheme } from '@roundup/ui'

/**
 * The Profile tab: the theme choice, and an empty state until sign-in exists.
 * @returns The theme switch above an empty state.
 */
export default function ProfileScreen(): ReactElement {
  const { preference, setPreference } = useTheme()
  const { t } = useT()

  return (
    <View className="flex-1 gap-6 py-6">
      <View className="max-w-160 gap-2">
        <Text variant="heading">{t('screens.profile.themeHeading')}</Text>
        <ThemeSwitch onChange={setPreference} value={preference} />
      </View>
      <EmptyState
        art="favorites"
        body={t('screens.profile.emptyBody')}
        title={t('screens.profile.emptyTitle')}
      />
    </View>
  )
}
