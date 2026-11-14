import { useCallback, useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'

import type { GetVisitHistory200, PhotoWidthParameter, SearchVenuesParams } from '@roundup/api'

import {
  getGetVisitHistoryQueryKey,
  getSearchVenuesQueryKey,
  getVisitHistory,
  nominate as sendNomination,
  useGetEvent,
} from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { TLocationPhase } from '../location/useLocation'
import type { IFavoriteRow, IVenueCard, IVisitRow } from '../venues/types'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'
import { useLocation } from '../location/useLocation'
import { usePages } from '../paging/usePages'
import { useSignedIn } from '../session/useSignedIn'
import { DEFAULT_RADIUS_KM } from '../venues/types'
import { useSquadFavorites } from '../venues/useSquadFavorites'
import { METERS_PER_KM, searchPageFetcher } from '../venues/venue-search'

/** How many visited venues the sheet asks for; the first page is all it shows. */
const HISTORY_SIZE = 25

/**
 * Builds the function that asks for the first page of a squad's visit history.
 * @param squadId - The squad whose history is asked for.
 * @param photoWidth - How wide the rows' thumbnails are asked for.
 * @returns The function that takes a page's cursor.
 */
const historyFetcher =
  (squadId: string, photoWidth: PhotoWidthParameter) =>
  (cursor: string | undefined): Promise<GetVisitHistory200> =>
    getVisitHistory(squadId, {
      limit: HISTORY_SIZE,
      photoWidth,
      ...(cursor === undefined ? {} : { cursor }),
    })

/** What the "Suggest a place" sheet shows and does. */
export interface INominateViewModel {
  /** The squad's favorites, the most recently saved first: the "Squad favorites" tab. */
  favorites: IFavoriteRow[]
  /** True while the favorites load. */
  favoritesLoading: boolean
  /** The venues the squad has been to, the most recent first: the "Been before" tab. */
  history: IVisitRow[]
  /** True while the history loads. */
  historyLoading: boolean
  /** Venues near the person that match the words; empty while there are no words. */
  results: IVenueCard[]
  /** True while a search for the words loads. */
  searching: boolean
  /** Finding the person, refused, or ready; search needs 'ready', the tabs work in any phase. */
  phase: TLocationPhase
  /** Asks for the position again, for the person who allowed it since. */
  retryLocation: () => void
  /** The place IDs already suggested for the event, so a row shows "Suggested" in place of its button. */
  suggestedIds: ReadonlySet<string>
  /** The place being suggested; undefined when idle. */
  suggestingId: string | undefined
  /**
   * Suggests a place for the event, after which the event and the squad's list show it. Resolves
   * true when it worked, and false when it failed, when another suggestion is being sent or when
   * the place is already suggested (no request is sent then).
   */
  nominate: (placeId: string) => Promise<boolean>
  /** The message key to show, from the suggestion or the first list that failed, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * The view model of the "Suggest a place" sheet: the squad's favorites, the venues it has been to
 * and a search near the person, plus suggesting one of them for the event. The screen owns the
 * words, as Explore does, so it can debounce them before they reach the search; this only follows
 * them, and searches only when they are not blank.
 * @param eventId - The event the place is suggested for.
 * @param squadId - The squad the event belongs to, whose favorites and history are listed.
 * @param query - The words to search for, already debounced; blank for no search.
 * @returns The three lists, the suggested places and the action.
 */
export const useNominateViewModel = (
  eventId: string,
  squadId: string,
  query: string,
): INominateViewModel => {
  const { helpers } = useDeps()
  const eventsHelper = helpers.events
  const venuesHelper = helpers.venues
  const { width: windowWidth } = useWindowDimensions()

  const [suggestingId, setSuggestingId] = useState<string | undefined>()

  const signedIn = useSignedIn()
  // Only typing needs the position, so opening the sheet does not ask for location.
  const words = query.trim()
  const { coordinates, phase, retry } = useLocation(words !== '')
  const { busy, error: nominateError, requestId: nominateRequestId, run } = useAttempt()
  const favoriteList = useSquadFavorites(squadId)
  const { data } = useGetEvent(eventId, undefined, { query: { enabled: signedIn } })
  const nominations = data?.data.nominations

  const thumbWidth = useMemo(
    (): PhotoWidthParameter => venuesHelper.photoWidth('thumb', windowWidth),
    [venuesHelper, windowWidth],
  )

  const visits = usePages({
    fetchPage: signedIn ? historyFetcher(squadId, thumbWidth) : undefined,
    queryKey: getGetVisitHistoryQueryKey(squadId),
  })

  const visitPages = visits.pages

  const visitMessage =
    visits.error === null ? undefined : helpers.errors.toMessage(visits.error, 'venue')

  const params = useMemo(
    (): SearchVenuesParams | undefined =>
      coordinates === undefined || words === ''
        ? undefined
        : {
            ...coordinates,
            radius: DEFAULT_RADIUS_KM * METERS_PER_KM,
            photoWidth: thumbWidth,
            query: words,
          },
    [coordinates, thumbWidth, words],
  )

  const search = usePages({
    fetchPage: signedIn && params !== undefined ? searchPageFetcher(params) : undefined,
    // Every loaded page would be asked for again (paid Places calls).
    refetchOnFocus: false,
    // Keeps the last results on screen while a new search loads, so typing does not flash.
    keepPrevious: true,
    queryKey: getSearchVenuesQueryKey(params),
  })

  const searchPages = search.pages

  const searchMessage =
    search.error === null ? undefined : helpers.errors.toMessage(search.error, 'venue')

  const history = useMemo(
    (): IVisitRow[] =>
      visitPages?.flatMap((page) =>
        page.data.history.map((visit) => venuesHelper.toVisit(visit)),
      ) ?? [],
    [venuesHelper, visitPages],
  )

  const results = useMemo(
    (): IVenueCard[] =>
      words === ''
        ? []
        : (searchPages?.flatMap((page) =>
            page.data.venues.map((venue) => venuesHelper.toCard(venue)),
          ) ?? []),
    [searchPages, venuesHelper, words],
  )

  const suggestedIds = useMemo(
    (): ReadonlySet<string> =>
      new Set((nominations ?? []).map((nomination) => nomination.placeID ?? '')),
    [nominations],
  )

  const nominate = useCallback(
    async (placeId: string): Promise<boolean> => {
      if (busy || suggestedIds.has(placeId)) return false

      setSuggestingId(placeId)

      const done = await run('event', async () => {
        const answer = await sendNomination(eventId, { placeID: placeId })

        await eventsHelper.written(squadId, eventId, answer)

        return true
      })

      setSuggestingId(undefined)

      return done === true
    },
    [busy, eventId, eventsHelper, run, squadId, suggestedIds],
  )

  const failure = nominateError ?? favoriteList.error ?? visitMessage?.key ?? searchMessage?.key

  return {
    error: failure,
    favorites: favoriteList.favorites,
    favoritesLoading: favoriteList.loading,
    history,
    historyLoading: signedIn && visits.loading,
    nominate,
    phase,
    requestId:
      nominateRequestId ??
      favoriteList.requestId ??
      visitMessage?.requestId ??
      searchMessage?.requestId,
    results,
    retryLocation: retry,
    searching: signedIn && phase === 'ready' && words !== '' && search.loading,
    suggestedIds,
    suggestingId: busy ? suggestingId : undefined,
  }
}
