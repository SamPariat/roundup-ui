import type { NativeStackHeaderItem, NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import type { ISquadMember } from '@roundup/core'
import type { IMenuHandle, IMenuItem, ITabItem } from '@roundup/ui'

import { useSquad, useSquadFavorites } from '@roundup/core'
import { useT } from '@roundup/i18n'
import {
  Button,
  EmptyState,
  FloatingActionButton,
  IdentityHeader,
  List,
  Menu,
  Skeleton,
  Tabs,
  Text,
} from '@roundup/ui'

import type { TSheet } from '@/components/squads/SquadSheets'
import type { TSquadTab } from '@/navigation/squad-tab'

import { MemberActions } from '@/components/squads/MemberActionsModal'
import { MemberRow } from '@/components/squads/MemberRow'
import { FavoritesAside, PhoneSquad } from '@/components/squads/SquadFavorites'
import { SquadSheets } from '@/components/squads/SquadSheets'
import { TabPage } from '@/components/TabPage'
import { useErrorText } from '@/hooks/useErrorText'
import { useLayout } from '@/hooks/useLayout'
import { Paths } from '@/navigation/paths'

/**
 * One squad: its avatar, name and member count, then the members with an Admin badge on admins. On a phone Tabs switch between the members and the
 * favorites the squad has saved; from 1024 wide the favorites sit in an aside beside the members.
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
  const { nav, systemChrome } = useLayout()
  const [tab, setTab] = useState<TSquadTab>('members')
  const wide = nav === 'side'

  const { error, loading, members, notFound, permissions, requestId, squad } = useSquad(squadId)

  const errorText = useErrorText(error, requestId)
  const favorites = useSquadFavorites(squadId)

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

  const handleSelectTab = useCallback((id: string): void => {
    setTab(id === 'favorites' ? 'favorites' : 'members')
  }, [])

  const tabs = useMemo(
    (): ITabItem[] => [
      {
        id: 'members',
        label: t('screens.squad.tabs.members'),
        ...(squad === undefined ? {} : { count: squad.memberCount }),
      },
      {
        id: 'favorites',
        label: t('screens.squad.tabs.favorites'),
        ...(favorites.complete ? { count: favorites.favorites.length } : {}),
      },
    ],
    [favorites.complete, favorites.favorites.length, squad, t],
  )

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

  const identity = (
    <IdentityHeader
      avatar={{
        id: squad.id,
        name: squad.name,
        ...(squad.avatarURL === undefined ? {} : { src: squad.avatarURL }),
      }}
      subtitle={t('common.members', { count: squad.memberCount })}
      title={squad.name}
    />
  )

  const memberList = (
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
  )

  const phoneHeader = (
    <View className="gap-4">
      {identity}
      <Tabs items={tabs} onChange={handleSelectTab} value={tab} />
    </View>
  )

  const content = wide ? (
    <TabPage fab={addPeople}>
      <View className="gap-6">
        {identity}
        <View className="flex-row items-start gap-8">
          <View className="max-w-160 min-w-0 flex-1">{memberList}</View>
          <View className="w-90 shrink-0">
            <FavoritesAside state={favorites} />
          </View>
        </View>
      </View>
    </TabPage>
  ) : (
    <PhoneSquad
      fab={addPeople}
      header={phoneHeader}
      members={memberList}
      state={favorites}
      tab={tab}
    />
  )

  return (
    <>
      <Stack.Screen options={headerOptions} />
      {content}
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
