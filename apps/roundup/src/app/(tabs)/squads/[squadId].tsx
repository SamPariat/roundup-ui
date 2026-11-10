import type { NativeStackHeaderItem, NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useHeaderHeight } from 'expo-router/react-navigation'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import type { ISquadMember } from '@roundup/core'
import type { IMenuItem } from '@roundup/ui'

import { useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'
import {
  Button,
  cn,
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

/** How far below the header the options Menu sits, in points. */
const MENU_GAP = 8

/**
 * One squad: its avatar, name and member count, then the members with an Admin badge on admins. What a
 * person can do comes from the server's permissions: admins open a member's actions and get Add
 * people as a floating button, and everyone has the options button in the header, whose Menu
 * holds Rename squad (when allowed) and Leave squad. A squad that does not exist, or that the person is not in, shows a not-found
 * state with a way back.
 * @returns The squad, a placeholder while it loads, or the not-found state.
 */
export default function SquadScreen(): ReactElement {
  const { squadId } = useLocalSearchParams<'/squads/[squadId]'>()
  const { t } = useT()
  const router = useRouter()
  const [sheet, setSheet] = useState<TSheet | undefined>()
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const { gutterClass, systemChrome } = useLayout()
  const headerHeight = useHeaderHeight()
  // The Menu lines up with the content column, whose right edge the ⋯ button sits on, 8 below the
  // header. iOS lays the screen out under its glass header; web and Android start below their bar.
  const column = cn('max-w-content', gutterClass)
  const menuTop = (systemChrome ? headerHeight : 0) + MENU_GAP

  const { error, loading, members, notFound, permissions, requestId, squad } = useSquad(squadId)

  const errorText = useErrorText(error, requestId)

  const handleGoToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  const handleOpenOptions = useCallback((): void => {
    setMenuOpen(true)
  }, [])

  const handleCloseOptions = useCallback((): void => {
    setMenuOpen(false)
  }, [])

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

  // iOS draws the options button natively, in the same glass as the back button; web and Android
  // draw headerRight in their own bar. Both open the same Menu.
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
      <Menu
        column={column}
        items={options}
        label={t('screens.squad.options')}
        onClose={handleCloseOptions}
        top={menuTop}
        visible={menuOpen}
      />
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
