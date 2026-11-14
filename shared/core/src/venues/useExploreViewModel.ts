import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

import type { SearchVenues200, SearchVenuesParams } from '@roundup/api'

import { getSearchVenuesQueryKey, searchVenues } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { TLocationPhase } from '../location/useLocation'
import type { IVenueCard, TVenueType } from './types'

import { useDeps } from '../di/useDeps'
import { useLocation } from '../location/useLocation'
import { usePages } from '../paging/usePages'
import { useSignedIn } from '../session/useSignedIn'

/** Meters in a kilometer, which the API's radius is in. */
const METERS_PER_KM = 1000

/**
 * Builds the function that asks for one page of a search.
 * @param params - What to search for.
 * @returns The function that takes a page's cursor.
 */
const pageFetcher =
  (params: SearchVenuesParams) =>
  (cursor: string | undefined): Promise<SearchVenues200> =>
    searchVenues({ ...params, ...(cursor === undefined ? {} : { cursor }) })

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
  const { width: windowWidth } = useWindowDimensions()

  const signedIn = useSignedIn()
  const { coordinates, phase, retry } = useLocation()
  const words = query.trim()

  const params = useMemo(
    (): SearchVenuesParams | undefined =>
      coordinates && {
        ...coordinates,
        radius: radiusKm * METERS_PER_KM,
        photoWidth: venuesHelper.photoWidth('card', windowWidth),
        ...(words === '' ? {} : { query: words }),
        ...(filter === undefined ? {} : { type: filter }),
      },
    [coordinates, filter, radiusKm, venuesHelper, windowWidth, words],
  )

  const { error, hasMore, loading, loadingMore, loadMore, pages, refresh } = usePages({
    fetchPage: signedIn && params !== undefined ? pageFetcher(params) : undefined,
    // Every loaded page would be asked for again (paid Places calls); a pull reloads instead.
    refetchOnFocus: false,
    // Keeps the last results on screen while a new search loads, so typing does not flash.
    keepPrevious: true,
    queryKey: getSearchVenuesQueryKey(params),
  })

  const venues = useMemo(
    (): IVenueCard[] =>
      pages?.flatMap((page) => page.data.venues.map((venue) => venuesHelper.toCard(venue))) ?? [],
    [pages, venuesHelper],
  )

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'venue')

  return {
    error: message?.key,
    hasMore,
    loading: signedIn && phase === 'ready' && loading,
    loadingMore,
    loadMore,
    phase,
    refresh,
    requestId: message?.requestId,
    retryLocation: retry,
    venues,
  }
}
