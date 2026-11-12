import { skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'

import type { ListFavorites200, PhotoWidthParameter } from '@roundup/api'

import { getListFavoritesQueryKey, listFavorites, removeFavorite } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { IFavoriteRow } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useMe } from '../auth/useMe'
import { useDeps } from '../di/useDeps'
import { useSignedIn } from '../session/useSignedIn'

/** How many favorites a page asks for. */
const PAGE_SIZE = 25

/** What the query hands the page request. */
interface IPageContext {
  /** The cursor of the page to load; undefined for the first. */
  pageParam: string | undefined
}

/**
 * Builds the function that asks for one page of a squad's favorites.
 * @param squadId - The ID of the squad whose list is asked for.
 * @param photoWidth - How wide the rows' thumbnails are asked for.
 * @returns The function the query calls with each page's cursor.
 */
const pageFetcher =
  (squadId: string, photoWidth: PhotoWidthParameter) =>
  (context: IPageContext): Promise<ListFavorites200> =>
    listFavorites(squadId, {
      limit: PAGE_SIZE,
      photoWidth,
      ...(context.pageParam === undefined ? {} : { cursor: context.pageParam }),
    })

/**
 * Reads where the next page starts.
 * @param last - The most recent answer of the list.
 * @returns The cursor, or undefined at the end of the list.
 */
const nextCursor = (last: ListFavorites200): string | undefined => last.data.nextCursor ?? undefined

/** What a squad's favorites show and do. */
export interface IUseSquadFavorites {
  /** The favorites loaded so far, the most recently saved first. */
  favorites: IFavoriteRow[]
  /** True while the first page loads. */
  loading: boolean
  /** True while a later page loads. */
  loadingMore: boolean
  /** True when there are more pages to load. */
  hasMore: boolean
  /**
   * True once every page is loaded, so the number of favorites is known; the API sends no total.
   */
  complete: boolean
  /** Loads the next page; does nothing when there is none or one is loading. */
  loadMore: () => void
  /** Loads the list again from the start. */
  refresh: () => Promise<void>
  /** The venue being removed; undefined when idle. */
  removingId: string | undefined
  /** Takes the signed-in person's save out of the squad's favorites. Resolves true when it worked. */
  remove: (favorite: IFavoriteRow) => Promise<boolean>
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * Loads a squad's favorites a page at a time, and removes the signed-in person's save of one, after
 * which the favorites and the venue's page load again.
 * @param squadId - The squad whose favorites to load.
 * @returns The favorites, the paging state and the actions.
 */
export const useSquadFavorites = (squadId: string): IUseSquadFavorites => {
  const { helpers } = useDeps()
  const venuesHelper = helpers.venues
  const { width: windowWidth } = useWindowDimensions()
  const signedIn = useSignedIn()
  const { me } = useMe()
  const { busy, error: removeError, requestId: removeRequestId, run } = useAttempt()
  const [removingId, setRemovingId] = useState<string | undefined>()

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, refetch } =
    useInfiniteQuery({
      getNextPageParam: nextCursor,
      initialPageParam: undefined,
      queryFn: signedIn
        ? pageFetcher(squadId, venuesHelper.photoWidth('thumb', windowWidth))
        : skipToken,
      queryKey: getListFavoritesQueryKey(squadId),
    })

  const meId = me?.id

  const favorites = useMemo(
    (): IFavoriteRow[] =>
      data?.pages.flatMap((page) =>
        page.data.favorites.map((favorite) => venuesHelper.toFavorite(favorite, meId)),
      ) ?? [],
    [data, meId, venuesHelper],
  )

  const loadMore = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage({ cancelRefetch: false })
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const refresh = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  const remove = useCallback(
    async (favorite: IFavoriteRow): Promise<boolean> => {
      if (busy) return false

      setRemovingId(favorite.id)

      const done = await run('favorite', async () => {
        await removeFavorite(squadId, favorite.id)
        await venuesHelper.saved(favorite.id, squadId)

        return true
      })

      setRemovingId(undefined)

      return done === true
    },
    [busy, run, squadId, venuesHelper],
  )

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'squad')

  return {
    complete: !hasNextPage && data !== undefined,
    error: removeError ?? message?.key,
    favorites,
    hasMore: hasNextPage,
    loading: signedIn && isPending,
    loadingMore: isFetchingNextPage,
    loadMore,
    refresh,
    remove,
    removingId: busy ? removingId : undefined,
    requestId: removeRequestId ?? message?.requestId,
  }
}
