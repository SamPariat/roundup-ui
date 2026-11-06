import { useCallback } from 'react'

import { createSquad } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useDeps } from '../di/useDeps'
import { Squads } from '../helpers/squads'
import { useSquadName } from './useSquadName'

/** What the New squad modal shows and does. */
export interface ICreateSquadViewModel {
  /** The name typed so far. */
  name: string
  /** Types into the field. */
  setName: (text: string) => void
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the squad is being created. */
  busy: boolean
  /** Creates the squad (1 to 50 characters). Resolves its ID, or undefined when it failed. */
  submit: () => Promise<string | undefined>
}

/**
 * The view model of the New squad modal: validates the name, creates the squad and loads the
 * squad list again.
 * @returns The state and the actions.
 */
export const useCreateSquadViewModel = (): ICreateSquadViewModel => {
  const { queryClient } = useDeps()
  const { attempt, name, setName, validName } = useSquadName('')
  const { busy, error, requestId, run } = attempt

  const submit = useCallback(async (): Promise<string | undefined> => {
    const trimmed = validName()

    if (trimmed === undefined) return undefined

    const created = await run('squadName', async () => {
      const { data } = await createSquad({ name: trimmed })

      await Squads.changed(queryClient)

      return data.id
    })

    return created
  }, [queryClient, run, validName])

  return { busy, error, name, requestId, setName, submit }
}
