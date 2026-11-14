import { useCallback } from 'react'

import { updateSquad } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useDeps } from '../di/useDeps'
import { useSquadName } from './useSquadName'

/** What the Rename squad modal shows and does. */
export interface IRenameSquadViewModel {
  /** The name typed so far. */
  name: string
  /** Types into the field. */
  setName: (text: string) => void
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the name is being saved. */
  busy: boolean
  /** Saves the trimmed name (1 to 50 characters). Resolves true when it is saved. */
  submit: () => Promise<boolean>
}

/**
 * The view model of the Rename squad modal: validates the name, saves it and loads the squad
 * and the list again. An unchanged name counts as saved without a request.
 * @param squadId - The squad to rename.
 * @param currentName - The squad's name now, which the field starts with.
 * @returns The state and the actions.
 */
export const useRenameSquadViewModel = (
  squadId: string,
  currentName: string,
): IRenameSquadViewModel => {
  const { helpers } = useDeps()
  const squadsHelper = helpers.squads

  const { attempt, name, setName, validName } = useSquadName(currentName)
  const { busy, error, requestId, run } = attempt

  const submit = useCallback(async (): Promise<boolean> => {
    const trimmed = validName()

    if (trimmed === undefined) return false

    if (trimmed === currentName) return true

    const saved = await run('squadName', async () => {
      await updateSquad(squadId, { name: trimmed })
      await squadsHelper.changed(squadId)

      return true
    })

    return saved === true
  }, [currentName, run, squadId, squadsHelper, validName])

  return { busy, error, name, requestId, setName, submit }
}
