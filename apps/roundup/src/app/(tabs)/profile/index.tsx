import type { ReactElement } from 'react'

import { useCallback } from 'react'
import { View } from 'react-native'

import { formatPhone, isE164, useProfileViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Icon, List, ListRow, Skeleton, Text, ThemeSwitch, useTheme } from '@roundup/ui'

/**
 * The Profile tab: who is signed in, the theme choice, and Log out. Logging out ends the session,
 * and the route guard then returns to Welcome, so this screen navigates nowhere itself.
 * @returns The signed-in person, the theme switch and the log out row.
 */
export default function ProfileScreen(): ReactElement {
  const { preference, setPreference } = useTheme()
  const { t } = useT()
  const { loading, me, signOut } = useProfileViewModel()

  const logOut = useCallback(() => {
    void signOut()
  }, [signOut])

  return (
    <View className="flex-1 gap-6 py-6">
      {loading || me === undefined ? (
        <Skeleton variant="row" />
      ) : (
        <View className="flex-row items-center gap-4">
          <Avatar id={me.id} name={me.name} size={64} />
          <View className="min-w-0 flex-1">
            <Text heading={1} numberOfLines={1} variant="heading">
              {me.name}
            </Text>
            <Text numberOfLines={1} tone="muted" variant="body">
              {isE164(me.phone) ? formatPhone(me.phone) : me.phone}
            </Text>
          </View>
        </View>
      )}
      <View className="max-w-160 gap-2">
        <Text variant="heading">{t('screens.profile.themeHeading')}</Text>
        <ThemeSwitch onChange={setPreference} value={preference} />
      </View>
      <View className="max-w-160">
        <List>
          <ListRow
            destructive
            leading={<Icon decorative name="logout" tone="danger" />}
            onPress={logOut}
            title={t('screens.profile.logOut')}
          />
        </List>
      </View>
    </View>
  )
}
