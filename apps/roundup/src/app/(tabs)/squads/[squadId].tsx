import type { NativeStackHeaderItem, NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import type { ISquadMember } from '@roundup/core'
import type { IMenuHandle, IMenuItem } from '@roundup/ui'

import { useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'
import {
  Button,
  EmptyState,
  FloatingActionButton,
  IdentityHeader,
  List,
  Menu,
  Skeleton,
  Text,
} from '@roundup/ui'

import type { TSheet } from '@/components/squads/SquadSheets'

import { MemberActions } from '@/components/squads/MemberActionsModal'
import { MemberRow } from '@/components/squads/MemberRow'
import { SquadSheets } from '@/components/squads/SquadSheets'
import { TabPage } from '@/components/TabPage'
import { useErrorText } from '@/hooks/useErrorText'
import { useLayout } from '@/hooks/useLayout'
import { Paths } from '@/navigation/paths'

/**
 * One squad: its avatar, name and member count, then the members with an Admin badge on admins.
 * What a person can do comes from the server's permissions: admins open a member's actions and get
 * Add people as a floating button, and everyone has the options Menu in the header, with Rename
 * squad (when allowed) and Leave squad. A squad that does not exist, or that the person is not in,
 * shows a not-found state with a way back.
 * @returns The squad, a placeholder while it loads, or the not-found state.
 */
export default function SquadScreen(): ReactElement {
  const { squadId } = useLocalSearchParams<'/squads/[squadId]'>()
  const { t } = useT()
  const router = useRouter()
  const [sheet, setSheet] = useState<TSheet | undefined>()
  const menuRef = useRef<IMenuHandle>(null)
  const { systemChrome } = useLayout()

  const { error, loading, members, notFound, permissions, requestId, squad } = useSquad(squadId)

  const errorText = useErrorText(error, requestId)

  const handleGoToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  const handleOpenRename = useCallback((): void => {
    setSheet({ kind: 'rename' })
  }, [])

  const handleOpenLeave = useCallback((): void => {
    setSheet({ kind: 'leave' })
  }, [])

  // Rename squad for people the server lets edit it, then Leave squad, which the Menu puts last.
  const options = useMemo((): IMenuItem[] => {
    const leave: IMenuItem = {
      destructive: true,
      icon: 'logout',
      label: t('screens.squad.leaveRow'),
      onPress: handleOpenLeave,
    }

    if (permissions?.canEditSquad !== true) return [leave]

    return [{ icon: 'edit', label: t('screens.squad.renameRow'), onPress: handleOpenRename }, leave]
  }, [handleOpenLeave, handleOpenRename, permissions, t])

  const handleOpenAdd = useCallback((): void => {
    setSheet({ kind: 'add' })
  }, [])

  const openMember = useCallback((member: ISquadMember): void => {
    setSheet({ kind: 'member', memberId: member.id })
  }, [])

  // Web and Android draw headerRight, the Menu with its own ⋯, in their own bar. iOS draws a native
  // ⋯ in the same glass as the back button, which opens the same Menu, anchored under it.
  const renderHeaderRight = useCallback(
    (): ReactElement => <Menu items={options} label={t('screens.squad.options')} />,
    [options, t],
  )

  const handleOpenOptions = useCallback((): void => {
    menuRef.current?.open()
  }, [])

  const renderHeaderItems = useCallback(
    (): NativeStackHeaderItem[] => [
      {
        icon: { name: 'ellipsis', type: 'sfSymbol' },
        label: t('screens.squad.options'),
        onPress: handleOpenOptions,
        type: 'button',
      },
    ],
    [handleOpenOptions, t],
  )

  const headerOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      headerRight: renderHeaderRight,
      unstable_headerRightItems: renderHeaderItems,
    }),
    [renderHeaderItems, renderHeaderRight],
  )

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

  const addPeople = permissions.canAddMembers ? (
    <FloatingActionButton icon="plus" onPress={handleOpenAdd}>
      {t('addPeople.title')}
    </FloatingActionButton>
  ) : undefined

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <TabPage fab={addPeople}>
        <View className="max-w-160 gap-6">
          <IdentityHeader
            avatar={{
              id: squad.id,
              name: squad.name,
              ...(squad.avatarURL === undefined ? {} : { src: squad.avatarURL }),
            }}
            subtitle={t('common.members', { count: squad.memberCount })}
            title={squad.name}
          />
          <View className="gap-3">
            <Text heading={2} variant="heading">
              {t('screens.squad.members')}
            </Text>
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
      {systemChrome ? (
        <Menu anchor="header" items={options} label={t('screens.squad.options')} ref={menuRef} />
      ) : null}
      <SquadSheets
        members={members}
        onLeft={handleGoToSquads}
        onSheet={setSheet}
        permissions={permissions}
        sheet={sheet}
        squad={squad}
      />
    </>
  )
}
