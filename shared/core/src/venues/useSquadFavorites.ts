import { useCallback, useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'

import type { ListFavorites200, PhotoWidthParameter } from '@roundup/api'

import { getListFavoritesQueryKey, listFavorites, removeFavorite } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { IFavoriteRow } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useMe } from '../auth/useMe'
import { useDeps } from '../di/useDeps'
import { usePages } from '../paging/usePages'
import { useSignedIn } from '../session/useSignedIn'

/** How many favorites a page asks for. */
const PAGE_SIZE = 25

/**
 * Builds the function that asks for one page of a squad's favorites.
 * @param squadId - The ID of the squad whose list is asked for.
 * @param photoWidth - How wide the rows' thumbnails are asked for.
 * @returns The function that takes a page's cursor.
 */
const pageFetcher =
  (squadId: string, photoWidth: PhotoWidthParameter) =>
  (cursor: string | undefined): Promise<ListFavorites200> =>
    listFavorites(squadId, {
      limit: PAGE_SIZE,
      photoWidth,
      ...(cursor === undefined ? {} : { cursor }),
    })

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

  const [removingId, setRemovingId] = useState<string | undefined>()

  const signedIn = useSignedIn()
  const { me } = useMe()
  const { busy, error: removeError, requestId: removeRequestId, run } = useAttempt()

  const { error, hasMore, loading, loadingMore, loadMore, pages, refresh } = usePages({
    fetchPage: signedIn
      ? pageFetcher(squadId, venuesHelper.photoWidth('thumb', windowWidth))
      : undefined,
    queryKey: getListFavoritesQueryKey(squadId),
  })

  const meId = me?.id
  const message = error === null ? undefined : helpers.errors.toMessage(error, 'squad')

  const favorites = useMemo(
    (): IFavoriteRow[] =>
      pages?.flatMap((page) =>
        page.data.favorites.map((favorite) => venuesHelper.toFavorite(favorite, meId)),
      ) ?? [],
    [meId, pages, venuesHelper],
  )

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

  return {
    complete: !hasMore && pages !== undefined,
    error: removeError ?? message?.key,
    favorites,
    hasMore,
    loading: signedIn && loading,
    loadingMore,
    loadMore,
    refresh,
    remove,
    removingId: busy ? removingId : undefined,
    requestId: removeRequestId ?? message?.requestId,
  }
}
