import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { ListSquads200 } from '@roundup/api'

import { getListSquadsQueryKey, listSquads } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { ISquadCard } from './types'

import { useDeps } from '../di/useDeps'
import { Squads } from '../helpers/squads'
import { useSignedIn } from '../session/useSignedIn'

/** How many squads a page asks for. */
const PAGE_SIZE = 25

/** What the query hands the page request. */
interface IPageContext {
  /** The cursor of the page to load; undefined for the first. */
  pageParam: string | undefined
}

/**
 * Asks for one page of squads.
 * @param context - The query's context, which holds the page's cursor.
 * @returns The squads of that page and the cursor of the next.
 */
const fetchPage = (context: IPageContext): Promise<ListSquads200> =>
  listSquads({
    limit: PAGE_SIZE,
    ...(context.pageParam === undefined ? {} : { cursor: context.pageParam }),
  })

/**
 * Reads where the next page starts.
 * @param last - The most recent answer of the list.
 * @returns The cursor, or undefined at the end of the list.
 */
const nextCursor = (last: ListSquads200): string | undefined => last.data.nextCursor ?? undefined

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
  const signedIn = useSignedIn()

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, refetch } =
    useInfiniteQuery({
      enabled: signedIn,
      getNextPageParam: nextCursor,
      initialPageParam: undefined,
      queryFn: fetchPage,
      queryKey: getListSquadsQueryKey(),
    })

  const squads = useMemo(
    () =>
      data?.pages.flatMap((page) => page.data.squads.map((squad) => Squads.toCard(squad))) ?? [],
    [data],
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'squad')

  return {
    error: message?.key,
    hasMore: hasNextPage,
    loading: signedIn && isPending,
    loadingMore: isFetchingNextPage,
    loadMore,
    refresh,
    requestId: message?.requestId,
    squads,
  }
}
