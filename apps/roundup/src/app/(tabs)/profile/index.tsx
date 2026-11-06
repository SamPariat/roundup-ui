import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'

import { useDeps, useProfileViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Icon, List, ListRow, Skeleton, Text } from '@roundup/ui'

import { TabPage } from '../../../components/TabPage'
import { Paths } from '../../../navigation/paths'

/**
 * The Profile tab: who is signed in, the way to Edit profile and Preferences, and Log out. Logging out ends the session,
 * and the route guard then returns to Welcome, so this screen navigates nowhere itself.
 * @returns The signed-in person, the two settings rows and the log out row.
 */
export default function ProfileScreen(): ReactElement {
  const router = useRouter()
  const { t } = useT()
  const { helpers } = useDeps()
  const { loading, me, signOut } = useProfileViewModel()

  const editProfile = useCallback((): void => {
    router.push(Paths.profileEdit())
  }, [router])

  const openPreferences = useCallback((): void => {
    router.push(Paths.profilePreferences())
  }, [router])

  const logOut = useCallback((): void => {
    void signOut()
  }, [signOut])

  return (
    <TabPage>
      <View className="gap-6">
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
                {helpers.phone.isE164(me.phone) ? helpers.phone.format(me.phone) : me.phone}
              </Text>
            </View>
          </View>
        )}
        <View className="max-w-160 gap-6">
          <List>
            <ListRow
              chevron
              leading={<Icon decorative name="edit" />}
              onPress={editProfile}
              subtitle={t('screens.profile.editProfileHint')}
              title={t('screens.profile.editProfile')}
            />
            <ListRow
              chevron
              leading={<Icon decorative name="device" />}
              onPress={openPreferences}
              subtitle={t('screens.profile.preferencesHint')}
              title={t('screens.profile.preferences')}
            />
          </List>
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
    </TabPage>
  )
}
