import { useCallback, useMemo, useState } from 'react'

import { createEvent, EventType } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'

/** An input the view model's own check can turn down. */
export type TCreateEventField = 'name' | 'startsAt' | 'votingCloses'

/** What the New event modal shows and does. */
export interface ICreateEventViewModel {
  /** The name typed so far. */
  name: string
  /** Types into the name field. */
  setName: (text: string) => void
  /** Drinks, dinner or both. */
  type: EventType
  /** Picks drinks, dinner or both. */
  setType: (type: EventType) => void
  /** When the event starts. */
  startsAt: Date
  /** Picks when the event starts. */
  setStartsAt: (date: Date) => void
  /** When voting closes: the pick, or the start when the person has not picked one. */
  votingCloses: Date
  /** Picks when voting closes. */
  setVotingCloses: (date: Date) => void
  /** The earliest moment the pickers offer: now. */
  earliest: Date
  /** The message of each input the check turned down; empty when it passed. Several can show at once. */
  invalid: Partial<Record<TCreateEventField, TErrorKey>>
  /** The message key of a failed request, to show under the form, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the event is being created. */
  busy: boolean
  /** Creates the event. Resolves its ID, or undefined when it failed. */
  submit: () => Promise<string | undefined>
}

/** What the name field says when it is empty. */
const NAME_PROBLEM: TErrorKey = 'errors.invalidEventName'

/** What the start field says when the start is not in the future. */
const START_PROBLEM: TErrorKey = 'errors.invalidEventStart'

/** What the voting field says when voting would close after the event starts. */
const VOTING_PROBLEM: TErrorKey = 'errors.invalidEventVoting'

/**
 * The view model of the New event modal: checks the name and the times, creates the event as a
 * draft and loads the squad's events again.
 * @param squadId - The squad the event is for.
 * @returns The state and the actions.
 */
export const useCreateEventViewModel = (squadId: string): ICreateEventViewModel => {
  const { helpers, now } = useDeps()
  const datesHelper = helpers.dates
  const eventsHelper = helpers.events
  const { busy, clear, error, requestId, run } = useAttempt()
  const [name, setName] = useState<string>('')
  const [type, setType] = useState<EventType>(EventType.DRINKS)
  const [startsAt, setStartsAt] = useState<Date>(() => eventsHelper.defaultStart(now()))
  const [votingCloses, setVotingCloses] = useState<Date | undefined>()
  const [invalid, setInvalid] = useState<Partial<Record<TCreateEventField, TErrorKey>>>({})
  // Read once when the form opens, so the pickers get the same moment on every render; submit
  // still checks the start against the clock at that time.
  const earliest = useMemo((): Date => new Date(now()), [now])

  const submit = useCallback(async (): Promise<string | undefined> => {
    const trimmed = name.trim()

    const problems: Partial<Record<TCreateEventField, TErrorKey>> = {
      ...(trimmed === '' ? { name: NAME_PROBLEM } : {}),
      ...(datesHelper.isAfter(startsAt, now()) ? {} : { startsAt: START_PROBLEM }),
      ...(votingCloses !== undefined && datesHelper.isAfter(votingCloses, startsAt)
        ? { votingCloses: VOTING_PROBLEM }
        : {}),
    }

    setInvalid(problems)

    if (Object.keys(problems).length > 0) return undefined

    clear()

    const created = await run('event', async () => {
      const { data } = await createEvent(squadId, {
        name: trimmed,
        startsAt: datesHelper.toIso(startsAt),
        type,
        ...(votingCloses === undefined ? {} : { votingDeadline: datesHelper.toIso(votingCloses) }),
      })

      await eventsHelper.changed(squadId)

      return data.id ?? ''
    })

    return created
  }, [clear, datesHelper, eventsHelper, name, now, run, squadId, startsAt, type, votingCloses])

  return {
    busy,
    earliest,
    error,
    invalid,
    name,
    requestId,
    setName,
    setStartsAt,
    setType,
    setVotingCloses,
    startsAt,
    submit,
    type,
    votingCloses: votingCloses ?? startsAt,
  }
}
