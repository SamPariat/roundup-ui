import type { NativeStackHeaderItem, NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import type { ISquadMember } from '@roundup/core'
import type { IMenuHandle, IMenuItem, ITabItem } from '@roundup/ui'

import { useSquad, useSquadEvents, useSquadFavorites } from '@roundup/core'
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

import { EventsBlock } from '@/components/events/SquadEvents'
import { MemberActions } from '@/components/squads/MemberActionsModal'
import { MemberRow } from '@/components/squads/MemberRow'
import { PhoneSquad } from '@/components/squads/SquadFavorites'
import { SquadSheets } from '@/components/squads/SquadSheets'
import { WideSquad } from '@/components/squads/WideSquad'
import { TabPage } from '@/components/TabPage'
import { useErrorText } from '@/hooks/useErrorText'
import { useLayout } from '@/hooks/useLayout'
import { Paths } from '@/navigation/paths'
import { SquadTab } from '@/navigation/squad-tab'

/**
 * One squad: its avatar, name and member count, then the members with an Admin badge on admins. On a phone Tabs switch between the members, the
 * squad's events and the favorites it has saved; from 1024 wide the favorites sit in an aside beside the members, and the
 * Events tab shows its events with the card that needs an answer in an aside.
 * What a person can do comes from the server's permissions: admins open a member's actions and get
 * Add people as a floating button, and everyone has the options Menu in the header, with Rename
 * squad (when allowed) and Leave squad. A squad that does not exist, or that the person is not in,
 * shows a not-found state with a way back.
 * @returns The squad, a placeholder while it loads, or the not-found state.
 */
export default function SquadScreen(): ReactElement {
  const { squadId, tab: tabParam } = useLocalSearchParams<'/squads/[squadId]'>()
  const { t } = useT()
  const router = useRouter()
  const [sheet, setSheet] = useState<TSheet | undefined>()
  const menuRef = useRef<IMenuHandle>(null)
  const { nav, pageHeader, systemChrome } = useLayout()
  const tab = SquadTab.parse(tabParam)
  const wide = nav === 'side'

  const { error, loading, members, notFound, permissions, requestId, squad } = useSquad(squadId)

  const errorText = useErrorText(error, requestId)
  const favorites = useSquadFavorites(squadId)
  const events = useSquadEvents(squadId)

  const handleGoToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  const handleOpenRename = useCallback((): void => {
    setSheet({ kind: 'rename' })
  }, [])

  const handleOpenNewEvent = useCallback((): void => {
    setSheet({ kind: 'event' })
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

  const handleSelectTab = useCallback(
    (id: string): void => {
      router.setParams({ tab: SquadTab.serialize(SquadTab.parse(id)) })
    },
    [router],
  )

  const tabs = useMemo(
    (): ITabItem[] => [
      {
        id: 'members',
        label: t('screens.squad.tabs.members'),
        ...(squad === undefined ? {} : { count: squad.memberCount }),
      },
      {
        id: 'events',
        label: t('screens.squad.tabs.events'),
        ...(events.openCount === undefined ? {} : { count: events.openCount }),
      },
      {
        id: 'favorites',
        label: t('screens.squad.tabs.favorites'),
        ...(favorites.complete ? { count: favorites.favorites.length } : {}),
      },
    ],
    [events.openCount, favorites.complete, favorites.favorites.length, squad, t],
  )

  const handleOpenAdd = useCallback((): void => {
    setSheet({ kind: 'add' })
  }, [])

  const openMember = useCallback((member: ISquadMember): void => {
    setSheet({ kind: 'member', memberId: member.id })
  }, [])

  // Web and Android draw headerRight, the Menu with its own ⋯, in their own bar. iOS draws a native
  // ⋯ in the same glass as the back button, which opens the same Menu, anchored under it.
  const newEventInHeader = pageHeader && tab === 'events'

  const renderHeaderRight = useCallback(
    (): ReactElement => (
      <>
        {newEventInHeader ? (
          <Button icon="plus" onPress={handleOpenNewEvent}>
            {t('screens.events.newEvent')}
          </Button>
        ) : null}
        <Menu items={options} label={t('screens.squad.options')} />
      </>
    ),
    [handleOpenNewEvent, newEventInHeader, options, t],
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
        <Skeleton variant="squad" />
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

  const wideTabs = tabs.filter((item) => item.id !== 'favorites')

  const eventsBlock = (
    <EventsBlock newInRow={!pageHeader} onNew={handleOpenNewEvent} state={events} wide={wide} />
  )

  const phoneHeader = (
    <View className="gap-4">
      {identity}
      <Tabs items={tabs} onChange={handleSelectTab} value={tab} />
    </View>
  )

  const content = wide ? (
    <TabPage fab={tab === 'events' ? undefined : addPeople}>
      <WideSquad
        events={eventsBlock}
        eventsState={events}
        favoritesState={favorites}
        identity={identity}
        members={memberList}
        onSelectTab={handleSelectTab}
        tab={tab}
        tabs={wideTabs}
      />
    </TabPage>
  ) : (
    <PhoneSquad
      events={eventsBlock}
      fab={addPeople}
      header={phoneHeader}
      members={memberList}
      refreshEvents={events.refresh}
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
