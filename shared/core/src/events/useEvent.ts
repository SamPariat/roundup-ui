import { useCallback, useMemo, useState } from 'react'

import type { RSVPStatus } from '@roundup/api'

import {
  ApiError,
  HttpStatus,
  removeNomination,
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
      /** Voting is being started. */
      kind: 'start'
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
  /** True while voting is being started. */
  starting: boolean
  /** Sends the signed-in person's answer. Resolves true when it worked. */
  rsvp: (status: RSVPStatus) => Promise<boolean>
  /** Takes a suggestion back. Resolves true when it worked. */
  remove: (nomination: IEventNomination) => Promise<boolean>
  /** Opens voting, which closes the suggestions. Resolves true when it worked. */
  start: () => Promise<boolean>
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * Loads one event with its members, suggestions and what the signed-in person may do, and runs
 * those actions, after which the event and the squad's list load again.
 * @param eventId - Which event to load.
 * @returns The event, the loading state and the actions.
 */
export const useEvent = (eventId: string): IUseEvent => {
  const { helpers } = useDeps()
  const eventsHelper = helpers.events

  const [action, setAction] = useState<TAction | undefined>()

  const signedIn = useSignedIn()
  const { me } = useMe()
  const { busy, error: actionError, requestId: actionRequestId, run } = useAttempt()

  const { data, error, isPending } = useGetEvent(eventId, undefined, {
    query: { enabled: signedIn },
  })

  const detail = data?.data
  const meId = me?.id
  const message = error === null ? undefined : helpers.errors.toMessage(error, 'event')
  const running = busy ? action : undefined

  const event = useMemo(
    (): IEventInfo | undefined => detail && eventsHelper.toInfo(detail, meId),
    [detail, eventsHelper, meId],
  )

  const squadId = event?.squadId

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

  const start = useCallback(
    (): Promise<boolean> => act({ kind: 'start' }, () => startVoting(eventId)),
    [act, eventId],
  )

  return {
    answering: running?.kind === 'rsvp' ? running.status : undefined,
    error: actionError ?? message?.key,
    event,
    loading: signedIn && isPending,
    notFound: ApiError.is(error) && error.status === HttpStatus.notFound,
    remove,
    removingId: running?.kind === 'remove' ? running.placeId : undefined,
    requestId: actionRequestId ?? message?.requestId,
    rsvp,
    start,
    starting: running?.kind === 'start',
  }
}
