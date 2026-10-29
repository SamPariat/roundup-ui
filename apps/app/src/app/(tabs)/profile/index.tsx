import type { ReactElement } from 'react'

import { View } from 'react-native'

import { EmptyState, Text, ThemeSwitch, useTheme } from '@roundup/ui'

export default function ProfileScreen(): ReactElement {
  const { preference, setPreference } = useTheme()

  return (
    <View className="flex-1 gap-6 py-6">
      <View className="max-w-reading gap-2">
        <Text variant="heading">Theme</Text>
        <ThemeSwitch onChange={setPreference} value={preference} />
      </View>
      <EmptyState
        art="favorites"
        body="Your name and photo show up here once you sign in."
        title="Your profile is empty"
      />
    </View>
  )
}
