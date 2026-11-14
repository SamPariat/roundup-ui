import { useCallback, useMemo, useState } from 'react'

import type { ListSquadEvents200, RSVPStatus } from '@roundup/api'

import { EventStatus, getListSquadEventsQueryKey, listSquadEvents, setRSVP } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { IEventCard } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'
import { usePages } from '../paging/usePages'
import { useSignedIn } from '../session/useSignedIn'

/** How many events a page asks for. */
const PAGE_SIZE = 25

/**
 * Builds the function that asks for one page of a squad's events.
 * @param squadId - The ID of the squad whose list is asked for.
 * @returns The function that takes a page's cursor.
 */
const pageFetcher =
  (squadId: string) =>
  (cursor: string | undefined): Promise<ListSquadEvents200> =>
    listSquadEvents(squadId, { limit: PAGE_SIZE, ...(cursor === undefined ? {} : { cursor }) })

/** The answer being sent, and the event it is for. */
interface IAnswering {
  /** The event being answered. */
  eventId: string
  /** The answer being sent. */
  status: RSVPStatus
}

/** What a squad's Events tab shows and does. */
export interface IUseSquadEvents {
  /** The open events loaded so far, the one that starts first on top. */
  upcoming: IEventCard[]
  /** The closed events loaded so far, the most recent first. */
  past: IEventCard[]
  /** The open event that most needs the person's answer; undefined when none does. */
  needsAnswer: IEventCard | undefined
  /** How many events are open, for the tab; undefined until the first page arrives. */
  openCount: number | undefined
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
  /** The answer being sent; undefined when idle. */
  answering: IAnswering | undefined
  /** Sends the signed-in person's answer to an event. Resolves true when it worked. */
  rsvp: (event: IEventCard, status: RSVPStatus) => Promise<boolean>
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * Loads a squad's events a page at a time, and answers one of them, after which the list and the
 * event's page load again.
 * @param squadId - The squad whose events to load.
 * @returns The events, the paging state and the actions.
 */
export const useSquadEvents = (squadId: string): IUseSquadEvents => {
  const { helpers } = useDeps()
  const eventsHelper = helpers.events

  const [answering, setAnswering] = useState<IAnswering | undefined>()

  const signedIn = useSignedIn()
  const { busy, error: answerError, requestId: answerRequestId, run } = useAttempt()

  const { error, hasMore, loading, loadingMore, loadMore, pages, refresh } = usePages({
    fetchPage: signedIn ? pageFetcher(squadId) : undefined,
    queryKey: getListSquadEventsQueryKey(squadId),
  })

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'event')

  const events = useMemo(
    (): IEventCard[] =>
      pages?.flatMap((page) =>
        (page.data.events ?? []).map((event) => eventsHelper.toCard(event)),
      ) ?? [],
    [eventsHelper, pages],
  )

  const upcoming = useMemo(
    (): IEventCard[] => events.filter((event) => event.status !== EventStatus.CLOSED),
    [events],
  )

  const past = useMemo(
    (): IEventCard[] => events.filter((event) => event.status === EventStatus.CLOSED),
    [events],
  )

  const rsvp = useCallback(
    async (event: IEventCard, status: RSVPStatus): Promise<boolean> => {
      if (busy) return false

      setAnswering({ eventId: event.id, status })

      const done = await run('event', async () => {
        await setRSVP(event.id, { status })
        await eventsHelper.changed(squadId, event.id)

        return true
      })

      setAnswering(undefined)

      return done === true
    },
    [busy, eventsHelper, run, squadId],
  )

  return {
    answering: busy ? answering : undefined,
    error: answerError ?? message?.key,
    hasMore,
    loading: signedIn && loading,
    loadingMore,
    loadMore,
    needsAnswer: eventsHelper.mostUrgent(upcoming),
    openCount: pages?.[0]?.data.openCount,
    past,
    refresh,
    requestId: answerRequestId ?? message?.requestId,
    rsvp,
    upcoming,
  }
}
