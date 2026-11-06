import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'

import type { ISquadMember } from '@roundup/core'

import { useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Button, EmptyState, List, Skeleton, Text } from '@roundup/ui'

import { LeaveSquadModal } from '../../../components/squads/LeaveSquadModal'
import { MemberActions, MemberActionsModal } from '../../../components/squads/MemberActionsModal'
import { MemberRow } from '../../../components/squads/MemberRow'
import { RenameSquadModal } from '../../../components/squads/RenameSquadModal'
import { SquadOptionsModal } from '../../../components/squads/SquadOptionsModal'
import { TabPage } from '../../../components/TabPage'
import { useErrorText } from '../../../hooks/useErrorText'
import { Paths } from '../../../navigation/paths'

/** Which dialog is open on the squad's page. */
type TSheet =
  | {
      /**
       *
       */
      kind: 'leave' | 'options' | 'rename'
    }
  | {
      /** A member's actions are open. */
      kind: 'member'
      /** Who they are for. */
      memberId: string
    }

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
  const router = useRouter()
  const [sheet, setSheet] = useState<TSheet | undefined>()

  const { error, loading, members, myRole, notFound, permissions, requestId, squad } =
    useSquad(squadId)

  const errorText = useErrorText(error, requestId)

  const goToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  const closeSheet = useCallback((): void => {
    setSheet(undefined)
  }, [])

  const openOptions = useCallback((): void => {
    setSheet({ kind: 'options' })
  }, [])

  const openRename = useCallback((): void => {
    setSheet({ kind: 'rename' })
  }, [])

  const openLeave = useCallback((): void => {
    setSheet({ kind: 'leave' })
  }, [])

  const openMember = useCallback((member: ISquadMember): void => {
    setSheet({ kind: 'member', memberId: member.id })
  }, [])

  const optionsButton = useMemo(
    (): ReactElement => (
      <Button
        icon="more"
        label={t('screens.squad.options')}
        onPress={openOptions}
        variant="ghost"
      />
    ),
    [openOptions, t],
  )

  const renderHeaderRight = useCallback((): ReactElement => optionsButton, [optionsButton])

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

  if (loading || squad === undefined || permissions === undefined) {
    return (
      <TabPage>
        <Skeleton count={5} />
      </TabPage>
    )
  }

  const ios = Platform.OS === 'ios'
  const picked = sheet?.kind === 'member' ? members.find((m) => m.id === sheet.memberId) : undefined

  return (
    <>
      <Stack.Screen
        options={{ title: squad.name, ...(ios ? { headerRight: renderHeaderRight } : {}) }}
      />
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
              {ios ? null : optionsButton}
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
      {sheet?.kind === 'options' ? (
        <SquadOptionsModal
          myRole={myRole}
          onClose={closeSheet}
          onLeave={openLeave}
          onRename={openRename}
          permissions={permissions}
          squad={squad}
        />
      ) : null}
      {sheet?.kind === 'rename' ? (
        <RenameSquadModal currentName={squad.name} onClose={closeSheet} squadId={squad.id} />
      ) : null}
      {sheet?.kind === 'leave' ? (
        <LeaveSquadModal
          name={squad.name}
          onClose={closeSheet}
          onLeft={goToSquads}
          squadId={squad.id}
        />
      ) : null}
      {picked === undefined ? null : (
        <MemberActionsModal
          member={picked}
          onClose={closeSheet}
          permissions={permissions}
          squadId={squad.id}
        />
      )}
    </>
  )
}
