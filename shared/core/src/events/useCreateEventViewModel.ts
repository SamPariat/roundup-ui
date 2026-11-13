import { useCallback, useState } from 'react'

import { createEvent, EventType } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'

/** Which input the view model's own check turned down. */
export type TCreateEventField = 'name' | 'times'

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
  /** The input the check turned down; undefined when it passed, or when the server answered with the error. */
  invalid: TCreateEventField | undefined
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the event is being created. */
  busy: boolean
  /** Creates the event. Resolves its ID, or undefined when it failed. */
  submit: () => Promise<string | undefined>
}

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
  const { busy, clear, error, fail, requestId, run } = useAttempt()
  const [name, setName] = useState<string>('')
  const [type, setType] = useState<EventType>(EventType.DRINKS)
  const [startsAt, setStartsAt] = useState<Date>(() => eventsHelper.defaultStart(now()))
  const [votingCloses, setVotingCloses] = useState<Date | undefined>()
  const [invalid, setInvalid] = useState<TCreateEventField | undefined>()

  const submit = useCallback(async (): Promise<string | undefined> => {
    const trimmed = name.trim()

    if (trimmed === '') {
      setInvalid('name')
      fail('errors.invalidEventName')

      return undefined
    }

    if (
      !datesHelper.isAfter(startsAt, now()) ||
      (votingCloses !== undefined && datesHelper.isAfter(votingCloses, startsAt))
    ) {
      setInvalid('times')
      fail('errors.invalidEventTimes')

      return undefined
    }

    setInvalid(undefined)
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
  }, [
    clear,
    datesHelper,
    eventsHelper,
    fail,
    name,
    now,
    run,
    squadId,
    startsAt,
    type,
    votingCloses,
  ])

  return {
    busy,
    earliest: new Date(now()),
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
