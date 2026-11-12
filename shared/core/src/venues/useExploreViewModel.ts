import { keepPreviousData, skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import type { SearchVenues200, SearchVenuesParams } from '@roundup/api'

import { getSearchVenuesQueryKey, searchVenues } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { TLocationPhase } from '../location/useLocation'
import type { IVenueCard, TVenueType } from './types'

import { useDeps } from '../di/useDeps'
import { useLocation } from '../location/useLocation'
import { useSignedIn } from '../session/useSignedIn'
import { useDebounced } from './useDebounced'

/** The radii the person can pick, in kilometers. Google's search reaches 50 km at most. */
const RADIUS_STEPS_KM: readonly number[] = [1, 2, 3, 5, 10, 25, 50]

/** The radius the search starts with, in kilometers. */
const DEFAULT_RADIUS_KM = 3

/** Meters in a kilometer, which the API's radius is in. */
const METERS_PER_KM = 1000

/** How long typing must pause before the search runs, in milliseconds. */
const DEBOUNCE = 400

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
  /** What is typed in the search field. */
  query: string
  /** Types into the search field; the search follows once typing pauses. */
  setQuery: (text: string) => void
  /** The kind of place the chips filter by; undefined for all. */
  filter: TVenueType | undefined
  /** Selects a kind of place, or clears the filter when it is already selected. */
  toggleFilter: (type: TVenueType) => void
  /** The search radius in kilometers; 3 until the person picks another step. */
  radiusKm: number
  /** The radii to pick from, in kilometers. */
  radiusSteps: readonly number[]
  /** Picks the search radius; the search starts again from the first page. */
  setRadiusKm: (km: number) => void
  /** The venues loaded so far, nearest the search's own order. */
  venues: IVenueCard[]
  /** True while the first page loads, including while the typed words settle. */
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

/**
 * The view model of the Explore tab: finds the person, then searches for places within 3 km of
 * them (or within the radius they pick) a page at a time, by what they typed (once typing
 * pauses) and the kind of place they picked.
 * @returns The state and the actions.
 */
export const useExploreViewModel = (): IExploreViewModel => {
  const { helpers } = useDeps()
  const venuesHelper = helpers.venues
  const signedIn = useSignedIn()
  const { coordinates, phase, retry } = useLocation()
  const [query, setQuery] = useState<string>('')
  const [filter, setFilter] = useState<TVenueType | undefined>()
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_KM)
  const words = useDebounced(query.trim(), DEBOUNCE)

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
    })

  const venues = useMemo(
    (): IVenueCard[] =>
      data?.pages.flatMap((page) => page.data.venues.map((venue) => venuesHelper.toCard(venue))) ??
      [],
    [data, venuesHelper],
  )

  const toggleFilter = useCallback((type: TVenueType): void => {
    setFilter((current) => (current === type ? undefined : type))
  }, [])

  const loadMore = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage({ cancelRefetch: false })
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const refresh = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'venue')

  return {
    error: message?.key,
    filter,
    hasMore: hasNextPage,
    loading: signedIn && phase === 'ready' && isPending,
    loadingMore: isFetchingNextPage,
    loadMore,
    phase,
    query,
    radiusKm,
    radiusSteps: RADIUS_STEPS_KM,
    refresh,
    requestId: message?.requestId,
    retryLocation: retry,
    setQuery,
    setRadiusKm,
    toggleFilter,
    venues,
  }
}
