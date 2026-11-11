import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import type { ISquadCard } from '@roundup/core'

import { useSquads } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { EmptyState, FloatingActionButton } from '@roundup/ui'

import { CreateSquadModal } from '@/components/squads/CreateSquadModal'
import { SquadListCard } from '@/components/squads/SquadListCard'
import { TabList } from '@/components/TabList'

/**
 * The Squads tab: the person's squads as cards, with New squad as a floating button on every
 * platform, also over the empty state. It loads more squads as the end of the list comes into view
 * and reloads on a pull.
 * @returns The list, or its placeholders or empty state, and the New squad modal when it is open.
 */
export default function SquadsScreen(): ReactElement {
  const { t } = useT()
  const { hasMore, loading, loadingMore, loadMore, refresh, squads } = useSquads()
  const [creating, setCreating] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

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

  return (
    <>
      <TabList
        data={squads}
        empty={
          <EmptyState
            art="squads"
            body={t('screens.squads.emptyBody')}
            title={t('screens.squads.emptyTitle')}
          />
        }
        fab={
          <FloatingActionButton icon="plus" onPress={handleOpenCreate}>
            {t('screens.squads.newSquad')}
          </FloatingActionButton>
        }
        keyExtractor={keyOf}
        loading={loading}
        loadingMore={loadingMore}
        onEndReached={handleLoadNext}
        onRefresh={handleReload}
        refreshing={refreshing}
        renderItem={renderCard}
      />
      {creating ? <CreateSquadModal onClose={handleCloseCreate} /> : null}
    </>
  )
}
