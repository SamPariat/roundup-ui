import { keepPreviousData, skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { SearchVenues200, SearchVenuesParams } from '@roundup/api'

import { getSearchVenuesQueryKey, searchVenues } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { TLocationPhase } from '../location/useLocation'
import type { IVenueCard, TVenueType } from './types'

import { useDeps } from '../di/useDeps'
import { useLocation } from '../location/useLocation'
import { useSignedIn } from '../session/useSignedIn'

/** Meters in a kilometer, which the API's radius is in. */
const METERS_PER_KM = 1000

/** What the query hands the page request. */
interface IPageContext {
  /** The cursor of the page to load; undefined for the first. */
  pageParam: string | undefined
}

/**
 * Builds the function that asks for one page of a search.
 * @param params - What to search for.
 * @returns The function the query calls with each page's cursor.
 */
const pageFetcher =
  (params: SearchVenuesParams) =>
  (context: IPageContext): Promise<SearchVenues200> =>
    searchVenues({
      ...params,
      ...(context.pageParam === undefined ? {} : { cursor: context.pageParam }),
    })

/**
 * Reads where the next page starts.
 * @param last - The most recent answer of the search.
 * @returns The cursor, or undefined at the end of the results.
 */
const nextCursor = (last: SearchVenues200): string | undefined => last.data.nextCursor ?? undefined

/** What the Explore screen shows and does. */
export interface IExploreViewModel {
  /** Finding the person, refused, or ready to search. */
  phase: TLocationPhase
  /** Asks for the position again, for the person who allowed it since. */
  retryLocation: () => void
  /** The venues loaded so far, nearest the search's own order. */
  venues: IVenueCard[]
  /** True while the first page loads. */
  loading: boolean
  /** True while a later page loads. */
  loadingMore: boolean
  /** True when there are more pages to load. */
  hasMore: boolean
  /** Loads the next page; does nothing when there is none or one is loading. */
  loadMore: () => void
  /** Loads the results again from the start. */
  refresh: () => Promise<void>
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/** What the search is for, which the screen keeps (in its route's query) and hands to the view model. */
export interface IExploreInputs {
  /** The words to search for; blank for none. */
  query: string
  /** The kind of place to search for; undefined for all. */
  filter: TVenueType | undefined
  /** The search radius in kilometers. */
  radiusKm: number
}

/**
 * The view model of the Explore tab: finds the person, then searches for places within the radius
 * they chose a page at a time, by the words they typed and the kind of place they picked. The
 * screen owns those three values, so they survive a reload and travel in a link; this only follows
 * them.
 * @param inputs - What to search for.
 * @param inputs.filter - The kind of place to search for; undefined for all.
 * @param inputs.query - The words to search for; blank for none.
 * @param inputs.radiusKm - The search radius in kilometers.
 * @returns The state and the actions.
 */
export const useExploreViewModel = ({
  filter,
  query,
  radiusKm,
}: IExploreInputs): IExploreViewModel => {
  const { helpers } = useDeps()
  const venuesHelper = helpers.venues
  const signedIn = useSignedIn()
  const { coordinates, phase, retry } = useLocation()
  const words = query.trim()

  const params = useMemo(
    (): SearchVenuesParams | undefined =>
      coordinates && {
        ...coordinates,
        radius: radiusKm * METERS_PER_KM,
        ...(words === '' ? {} : { query: words }),
        ...(filter === undefined ? {} : { type: filter }),
      },
    [coordinates, filter, radiusKm, words],
  )

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, refetch } =
    useInfiniteQuery({
      getNextPageParam: nextCursor,
      initialPageParam: undefined,
      // Keeps the last results on screen while a new search loads, so typing does not flash.
      placeholderData: keepPreviousData,
      queryFn: signedIn && params !== undefined ? pageFetcher(params) : skipToken,
      queryKey: getSearchVenuesQueryKey(params),
      // Every loaded page would be asked for again (paid Places calls); a pull reloads instead.
      refetchOnWindowFocus: false,
    })

  const venues = useMemo(
    (): IVenueCard[] =>
      data?.pages.flatMap((page) => page.data.venues.map((venue) => venuesHelper.toCard(venue))) ??
      [],
    [data, venuesHelper],
  )

  const loadMore = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage({ cancelRefetch: false })
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const refresh = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'venue')

  return {
    error: message?.key,
    hasMore: hasNextPage,
    loading: signedIn && phase === 'ready' && isPending,
    loadingMore: isFetchingNextPage,
    loadMore,
    phase,
    refresh,
    requestId: message?.requestId,
    retryLocation: retry,
    venues,
  }
}
