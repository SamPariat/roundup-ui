import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'

import { useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Button, EmptyState, List, Skeleton, Text } from '@roundup/ui'

import { MemberRow } from '../../../components/squads/MemberRow'
import { TabPage } from '../../../components/TabPage'
import { useErrorText } from '../../../hooks/useErrorText'
import { Paths } from '../../../navigation/paths'

/**
 * One squad: its avatar and member count, then the members with an Admin badge on admins. A squad
 * that does not exist, or that the person is not in, shows a not-found state with a way back. On
 * iOS the header carries the squad's name.
 * @returns The squad, a placeholder while it loads, or the not-found state.
 */
export default function SquadScreen(): ReactElement {
  const { squadId } = useLocalSearchParams<'/squads/[squadId]'>()
  const { t } = useT()
  const router = useRouter()
  const { error, loading, members, notFound, requestId, squad } = useSquad(squadId)
  const errorText = useErrorText(error, requestId)

  const goToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  if (notFound || (squad === undefined && error !== undefined)) {
    return (
      <TabPage centered>
        <EmptyState
          action={<Button onPress={goToSquads}>{t('screens.squad.notFoundAction')}</Button>}
          art="search"
          title={notFound ? t('screens.squad.notFoundTitle') : t('screens.squad.errorTitle')}
          {...(errorText === undefined ? {} : { body: errorText })}
        />
      </TabPage>
    )
  }

  if (loading || squad === undefined) {
    return (
      <TabPage>
        <Skeleton count={5} />
      </TabPage>
    )
  }

  return (
    <TabPage>
      <Stack.Screen options={{ title: squad.name }} />
      <View className="max-w-160 gap-6">
        <View className="flex-row items-center gap-4">
          <Avatar
            id={squad.id}
            name={squad.name}
            size={64}
            {...(squad.avatarURL === undefined ? {} : { src: squad.avatarURL })}
          />
          <Text variant="body-strong">{t('common.members', { count: squad.memberCount })}</Text>
        </View>
        <View className="gap-3">
          <Text heading={2} variant="heading">
            {t('screens.squad.members')}
          </Text>
          <List>
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </List>
        </View>
      </View>
    </TabPage>
  )
}
