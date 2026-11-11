import { useCallback, useState } from 'react'

/** What a list with pull to refresh needs. */
export interface IPullRefresh {
  /** True while the pull's reload runs, which keeps the spinner turning. */
  refreshing: boolean
  /** Runs the reload and clears `refreshing` once it settles, even when it fails. */
  handleReload: () => Promise<void>
}

/**
 * The state of a pull to refresh: a list's reload, wrapped so the spinner shows for exactly as
 * long as the reload takes.
 * @param refresh - Loads the list again from the start.
 * @returns Whether it is refreshing, and the handler for the list's onRefresh.
 */
export const usePullRefresh = (refresh: () => Promise<void>): IPullRefresh => {
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const handleReload = useCallback(async (): Promise<void> => {
    setRefreshing(true)

    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }, [refresh])

  return { handleReload, refreshing }
}
