import { useCallback, useState } from 'react'

import { getGetMeQueryKey, updateMe } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useDeps } from '../di/useDeps'
import { useAttempt } from './useAttempt'

/** The longest name the backend accepts. */
export const MAX_NAME = 50

/** What the name screen shows and does. */
export interface INameViewModel {
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
 * The view model of the name step and of Edit profile: validates the name, saves it, and puts the
 * saved profile in the cache, so the route guard lets a new person through and an existing name
 * updates everywhere. An unchanged name counts as saved without a request.
 * @param initialName - The name the field starts with; empty on the name step, the current name when editing.
 * @returns The state and the actions.
 */
export const useNameViewModel = (initialName = ''): INameViewModel => {
  const { queryClient } = useDeps()

  const [typed, setTyped] = useState<string>(initialName)

  const { busy, clear, error, fail, requestId, run } = useAttempt()

  const setName = useCallback(
    (text: string): void => {
      setTyped(text)
      clear()
    },
    [clear],
  )

  const submit = useCallback(async (): Promise<boolean> => {
    const trimmed = typed.trim()

    if (trimmed === '' || trimmed.length > MAX_NAME) {
      fail('errors.invalidName')

      return false
    }

    if (trimmed === initialName) return true

    const saved = await run('name', async () => {
      queryClient.setQueryData(getGetMeQueryKey(), await updateMe({ name: trimmed }))

      return true
    })

    return saved === true
  }, [fail, initialName, queryClient, run, typed])

  return { busy, error, name: typed, requestId, setName, submit }
}
