import { useCallback, useMemo, useState } from 'react'

import type { RSVPStatus } from '@roundup/api'

import {
  ApiError,
  EventStatus,
  HttpStatus,
  removeNomination,
  vote as sendVote,
  setRSVP,
  startVoting,
  useGetEvent,
} from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { IEventInfo, IEventNomination } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useMe } from '../auth/useMe'
import { useDeps } from '../di/useDeps'
import { useSignedIn } from '../session/useSignedIn'

/** What an event's page is doing for the person right now. */
type TAction =
  | {
      /** An answer is being sent. */
      kind: 'rsvp'
      /** The answer being sent. */
      status: RSVPStatus
    }
  | {
      /** A suggestion is being taken back. */
      kind: 'remove'
      /** The place being removed. */
      placeId: string
    }
  | {
      /** A vote is being sent. */
      kind: 'vote'
      /** The place being voted for. */
      placeId: string
    }
  | {
      /** Voting is being started. */
      kind: 'start'
    }

/** How often a live event loads again while voting is open, in milliseconds. */
const LIVE_MS = 45_000

/** Votes that came in from the rest of the squad since the page last looked. */
export interface IFreshVotes {
  /** Grows by one each time, so the same count coming twice is still a new arrival. */
  id: number
  /** How many came in. */
  count: number
}

/** What an event's page shows and does. */
export interface IUseEvent {
  /** The event, once loaded. */
  event: IEventInfo | undefined
  /** True while the event loads. */
  loading: boolean
  /** True when the event does not exist or the person is not in its squad. */
  notFound: boolean
  /** The answer being sent; undefined when idle. */
  answering: RSVPStatus | undefined
  /** The place being taken back; undefined when idle. */
  removingId: string | undefined
  /** The place a vote is being sent for; undefined when idle. */
  votingId: string | undefined
  /** True while voting is being started. */
  starting: boolean
  /** Sends the signed-in person's answer. Resolves true when it worked. */
  rsvp: (status: RSVPStatus) => Promise<boolean>
  /** Takes a suggestion back. Resolves true when it worked. */
  remove: (nomination: IEventNomination) => Promise<boolean>
  /**
   * Votes for a place, moving the person's vote from the one they gave before. Resolves false
   * without a request when the person already voted for this place.
   */
  vote: (nomination: IEventNomination) => Promise<boolean>
  /** Opens voting, which closes the suggestions. Resolves true when it worked. */
  start: () => Promise<boolean>
  /** Loads the event again, for pull to refresh and for coming back to the page. */
  refresh: () => Promise<void>
  /** Votes from the rest of the squad that came in since the last load; undefined until some do. */
  freshVotes: IFreshVotes | undefined
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * Loads one event with its members, suggestions and what the signed-in person may do, and runs
 * those actions, after which the event and the squad's list load again. While the page is live and
 * voting is open, it loads again every 45 seconds and reports votes from the rest of the squad.
 * @param eventId - Which event to load.
 * @param live - Whether the page is in front of the person, so a voting event keeps itself current.
 * @returns The event, the loading state and the actions.
 */
export const useEvent = (eventId: string, live = false): IUseEvent => {
  const { helpers } = useDeps()
  const eventsHelper = helpers.events

  const [action, setAction] = useState<TAction | undefined>()
  // The rest of the squad's votes at the last load, and what came in since.
  const [othersSeen, setOthersSeen] = useState<number | undefined>()
  const [freshVotes, setFreshVotes] = useState<IFreshVotes | undefined>()

  const signedIn = useSignedIn()
  const { me } = useMe()
  const { busy, error: actionError, requestId: actionRequestId, run } = useAttempt()

  // Votes and answers change while the person is away, so coming back to the app or the browser
  // tab always loads the event again, however fresh it was.
  const { data, error, isPending, refetch } = useGetEvent(eventId, undefined, {
    query: {
      enabled: signedIn,
      /**
       * Loads again every 45 seconds while the page is live and voting is open.
       * @param query - The event's query, with its latest answer.
       * @returns The interval in milliseconds, or false to stay put.
       */
      refetchInterval: (query) =>
        live && query.state.data?.data.status === EventStatus.VOTING ? LIVE_MS : false,
      refetchOnWindowFocus: 'always',
    },
  })

  const detail = data?.data
  // Votes cast by everyone but the person: their own first vote, or a change of mind, is not news.
  const ownVote = detail?.myVote === undefined || detail.myVote === null ? 0 : 1
  const others = detail === undefined ? undefined : (detail.totalVotes ?? 0) - ownVote

  // Kept as state from the previous load rather than an effect, as React advises for a value that
  // follows another: the arrival is noticed during the render that brings it.
  if (others !== undefined && others !== othersSeen) {
    setOthersSeen(others)

    if (othersSeen !== undefined && others > othersSeen) {
      setFreshVotes({ count: others - othersSeen, id: (freshVotes?.id ?? 0) + 1 })
    }
  }

  const meId = me?.id
  const message = error === null ? undefined : helpers.errors.toMessage(error, 'event')
  const running = busy ? action : undefined

  const event = useMemo(
    (): IEventInfo | undefined => detail && eventsHelper.toInfo(detail, meId),
    [detail, eventsHelper, meId],
  )

  const squadId = event?.squadId
  const myVote = event?.myVote

  const act = useCallback(
    async (next: TAction, request: () => Promise<unknown>): Promise<boolean> => {
      if (busy || squadId === undefined) return false

      setAction(next)

      const done = await run('event', async () => {
        await request()
        await eventsHelper.changed(squadId, eventId)

        return true
      })

      setAction(undefined)

      return done === true
    },
    [busy, eventId, eventsHelper, run, squadId],
  )

  const rsvp = useCallback(
    (status: RSVPStatus): Promise<boolean> =>
      act({ kind: 'rsvp', status }, () => setRSVP(eventId, { status })),
    [act, eventId],
  )

  const remove = useCallback(
    (nomination: IEventNomination): Promise<boolean> =>
      act({ kind: 'remove', placeId: nomination.id }, () =>
        removeNomination(eventId, nomination.id),
      ),
    [act, eventId],
  )

  const vote = useCallback(
    (nomination: IEventNomination): Promise<boolean> =>
      nomination.id === myVote
        ? Promise.resolve(false)
        : act({ kind: 'vote', placeId: nomination.id }, () =>
            sendVote(eventId, { placeID: nomination.id }),
          ),
    [act, eventId, myVote],
  )

  const start = useCallback(
    (): Promise<boolean> => act({ kind: 'start' }, () => startVoting(eventId)),
    [act, eventId],
  )

  const refresh = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  return {
    answering: running?.kind === 'rsvp' ? running.status : undefined,
    error: actionError ?? message?.key,
    event,
    freshVotes,
    loading: signedIn && isPending,
    notFound: ApiError.is(error) && error.status === HttpStatus.notFound,
    refresh,
    remove,
    removingId: running?.kind === 'remove' ? running.placeId : undefined,
    requestId: actionRequestId ?? message?.requestId,
    rsvp,
    start,
    starting: running?.kind === 'start',
    vote,
    votingId: running?.kind === 'vote' ? running.placeId : undefined,
  }
}
