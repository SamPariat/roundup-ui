import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import type { ISquadMember } from '@roundup/core'

import { useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Button, EmptyState, List, Skeleton, Text } from '@roundup/ui'

import type { TSheet } from '@/components/squads/SquadSheets'

import { MemberActions } from '@/components/squads/MemberActionsModal'
import { MemberRow } from '@/components/squads/MemberRow'
import { SquadSheets } from '@/components/squads/SquadSheets'
import { TabPage } from '@/components/TabPage'
import { useErrorText } from '@/hooks/useErrorText'
import { useLayout } from '@/hooks/useLayout'
import { Paths } from '@/navigation/paths'

/**
 * One squad: its avatar and member count, then the members with an Admin badge on admins. What a
 * person can do comes from the server's permissions: admins open a member's actions, and everyone
 * has the options menu for Rename squad and Leave squad. A squad that does not exist, or that the
 * person is not in, shows a not-found state with a way back. On iOS the header carries the squad's
 * name and the options button; elsewhere the options button sits beside the Members heading.
 * @returns The squad, a placeholder while it loads, or the not-found state.
 */
export default function SquadScreen(): ReactElement {
  const { squadId } = useLocalSearchParams<'/squads/[squadId]'>()
  const { t } = useT()
  const { systemChrome } = useLayout()
  const router = useRouter()
  const [sheet, setSheet] = useState<TSheet | undefined>()

  const { error, loading, members, myRole, notFound, permissions, requestId, squad } =
    useSquad(squadId)

  const errorText = useErrorText(error, requestId)

  const handleGoToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  const handleOpenOptions = useCallback((): void => {
    setSheet({ kind: 'options' })
  }, [])

  const handleOpenAdd = useCallback((): void => {
    setSheet({ kind: 'add' })
  }, [])

  const openMember = useCallback((member: ISquadMember): void => {
    setSheet({ kind: 'member', memberId: member.id })
  }, [])

  const optionsButton = useMemo(
    (): ReactElement => (
      <Button
        icon="more"
        label={t('screens.squad.options')}
        onPress={handleOpenOptions}
        variant="ghost"
      />
    ),
    [handleOpenOptions, t],
  )

  const renderHeaderRight = useCallback((): ReactElement => optionsButton, [optionsButton])

  if (notFound || (squad === undefined && error !== undefined)) {
    return (
      <TabPage centered>
        <EmptyState
          action={<Button onPress={handleGoToSquads}>{t('screens.squad.notFoundAction')}</Button>}
          art="search"
          title={notFound ? t('screens.squad.notFoundTitle') : t('screens.squad.errorTitle')}
          {...(errorText === undefined ? {} : { body: errorText })}
        />
      </TabPage>
    )
  }

  if (loading || squad === undefined || permissions === undefined) {
    return (
      <TabPage>
        <Skeleton count={5} />
      </TabPage>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerRight: renderHeaderRight, title: squad.name }} />
      <TabPage>
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
            <View className="flex-row items-center justify-between gap-3">
              <Text heading={2} variant="heading">
                {t('screens.squad.members')}
              </Text>
              <View className="flex-row items-center gap-2">
                {permissions.canAddMembers ? (
                  <Button icon="plus" onPress={handleOpenAdd} size="sm" variant="secondary">
                    {t('addPeople.title')}
                  </Button>
                ) : null}
                {systemChrome ? null : optionsButton}
              </View>
            </View>
            <List>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onSelect={
                    MemberActions.available(member, permissions).length > 0 ? openMember : undefined
                  }
                />
              ))}
            </List>
          </View>
        </View>
      </TabPage>
      <SquadSheets
        members={members}
        myRole={myRole}
        onLeft={handleGoToSquads}
        onSheet={setSheet}
        permissions={permissions}
        sheet={sheet}
        squad={squad}
      />
    </>
  )
}
