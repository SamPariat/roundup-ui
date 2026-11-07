import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { useCallback, useState } from 'react'

import type { ISquadCard } from '@roundup/core'

import { useSquads } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, EmptyState, Skeleton } from '@roundup/ui'

import { CreateSquadModal } from '../../../components/squads/CreateSquadModal'
import { SquadListCard } from '../../../components/squads/SquadListCard'
import { TabList } from '../../../components/TabList'
import { useLayout } from '../../../hooks/useLayout'

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
  const [creating, setCreating] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { systemChrome } = useLayout()

  const handleOpenCreate = useCallback((): void => {
    setCreating(true)
  }, [])

  const handleCloseCreate = useCallback((): void => {
    setCreating(false)
  }, [])

  const handleReload = useCallback(async (): Promise<void> => {
    setRefreshing(true)

    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }, [refresh])

  const handleLoadNext = useCallback((): void => {
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
        onPress={handleOpenCreate}
        variant="ghost"
      />
    ),
    [handleOpenCreate, t],
  )

  const newSquad = (
    <Button icon="plus" onPress={handleOpenCreate}>
      {t('screens.squads.newSquad')}
    </Button>
  )

  // In the system chrome New squad sits in the header; AppShell has no room there, so it leads the
  // list instead.
  const showListAction = !systemChrome && squads.length > 0

  return (
    <>
      <Stack.Screen options={{ headerRight: renderHeaderRight }} />
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
        header={showListAction ? newSquad : undefined}
        keyExtractor={keyOf}
        loading={loading}
        onEndReached={handleLoadNext}
        onRefresh={handleReload}
        refreshing={refreshing}
        renderItem={renderCard}
      />
      {creating ? <CreateSquadModal onClose={handleCloseCreate} /> : null}
    </>
  )
}
