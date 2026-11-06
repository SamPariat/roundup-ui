import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { useCallback, useState } from 'react'
import { Platform } from 'react-native'

import type { ISquadCard } from '@roundup/core'

import { useSquads } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, EmptyState, Skeleton } from '@roundup/ui'

import { CreateSquadModal } from '../../../components/squads/CreateSquadModal'
import { SquadListCard } from '../../../components/squads/SquadListCard'
import { TabList } from '../../../components/TabList'

/**
 * The Squads tab: the person's squads as cards, a New squad action, and an empty state that
 * offers the same. It loads more squads as the end of the list comes into view and reloads on a
 * pull. On iOS the action sits in the header; on web and Android, which draw their own bar, it is
 * the first line of the list.
 * @returns The list, or its placeholders or empty state, and the New squad modal when it is open.
 */
export default function SquadsScreen(): ReactElement {
  const { t } = useT()
  const { hasMore, loading, loadingMore, loadMore, refresh, squads } = useSquads()
  const [creating, setCreating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const ios = Platform.OS === 'ios'

  const openCreate = useCallback((): void => {
    setCreating(true)
  }, [])

  const closeCreate = useCallback((): void => {
    setCreating(false)
  }, [])

  const reload = useCallback((): void => {
    setRefreshing(true)

    void refresh().finally(() => {
      setRefreshing(false)
    })
  }, [refresh])

  const loadNext = useCallback((): void => {
    if (hasMore) loadMore()
  }, [hasMore, loadMore])

  const renderCard = useCallback(
    (squad: ISquadCard): ReactElement => <SquadListCard squad={squad} />,
    [],
  )

  const keyOf = useCallback((squad: ISquadCard): string => squad.id, [])

  const renderHeaderRight = useCallback(
    (): ReactElement => (
      <Button
        icon="plus"
        label={t('screens.squads.newSquad')}
        onPress={openCreate}
        variant="ghost"
      />
    ),
    [openCreate, t],
  )

  const newSquad = (
    <Button icon="plus" onPress={openCreate}>
      {t('screens.squads.newSquad')}
    </Button>
  )

  const showHeaderAction = !ios && squads.length > 0

  return (
    <>
      {ios ? <Stack.Screen options={{ headerRight: renderHeaderRight }} /> : null}
      <TabList
        data={squads}
        empty={
          <EmptyState
            action={newSquad}
            art="squads"
            body={t('screens.squads.emptyBody')}
            title={t('screens.squads.emptyTitle')}
          />
        }
        footer={loadingMore ? <Skeleton /> : undefined}
        header={showHeaderAction ? newSquad : undefined}
        keyExtractor={keyOf}
        loading={loading}
        onEndReached={loadNext}
        onRefresh={reload}
        refreshing={refreshing}
        renderItem={renderCard}
      />
      {creating ? <CreateSquadModal onClose={closeCreate} /> : null}
    </>
  )
}
