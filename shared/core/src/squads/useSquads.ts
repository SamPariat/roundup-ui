import { useMemo } from 'react'

import type { ListSquads200 } from '@roundup/api'

import { getListSquadsQueryKey, listSquads } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { ISquadCard } from './types'

import { useDeps } from '../di/useDeps'
import { usePages } from '../paging/usePages'
import { useSignedIn } from '../session/useSignedIn'

/** How many squads a page asks for. */
const PAGE_SIZE = 25

/**
 * Asks for one page of squads.
 * @param cursor - The cursor of the page, or undefined for the first.
 * @returns The squads of that page and the cursor of the next.
 */
const fetchPage = (cursor: string | undefined): Promise<ListSquads200> =>
  listSquads({ limit: PAGE_SIZE, ...(cursor === undefined ? {} : { cursor }) })

/** What the squads list shows and does. */
export interface IUseSquads {
  /** The squads loaded so far, newest first. */
  squads: ISquadCard[]
  /** True while the first page loads. */
  loading: boolean
  /** True while a later page loads. */
  loadingMore: boolean
  /** True when there are more pages to load. */
  hasMore: boolean
  /** Loads the next page; does nothing when there is none or one is loading. */
  loadMore: () => void
  /** Loads the list again from the start. */
  refresh: () => Promise<void>
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * Loads the signed-in person's squads a page at a time.
 * @returns The squads, the paging state and the actions.
 */
export const useSquads = (): IUseSquads => {
  const { helpers } = useDeps()
  const squadsHelper = helpers.squads

  const signedIn = useSignedIn()

  const { error, hasMore, loading, loadingMore, loadMore, pages, refresh } = usePages({
    fetchPage: signedIn ? fetchPage : undefined,
    queryKey: getListSquadsQueryKey(),
  })

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'squad')

  const squads = useMemo(
    (): ISquadCard[] =>
      pages?.flatMap((page) => page.data.squads.map((squad) => squadsHelper.toCard(squad))) ?? [],
    [pages, squadsHelper],
  )

  return {
    error: message?.key,
    hasMore,
    loading: signedIn && loading,
    loadingMore,
    loadMore,
    refresh,
    requestId: message?.requestId,
    squads,
  }
}
