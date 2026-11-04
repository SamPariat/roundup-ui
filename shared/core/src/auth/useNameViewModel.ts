import { useCallback, useState } from 'react'

import { getGetMeQueryKey, updateMe } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useDeps } from '../di/useDeps'
import { useAttempt } from './useAttempt'

/** The longest name the backend accepts. */
const MAX_NAME = 50

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
 * The view model of the name step: validates the name, saves it, and refreshes the profile so the
 * route guard lets the person through.
 * @returns The state and the actions.
 */
export const useNameViewModel = (): INameViewModel => {
  const { queryClient } = useDeps()
  const { busy, clear, error, fail, requestId, run } = useAttempt()
  const [typed, setTyped] = useState('')

  const setName = useCallback(
    (text: string) => {
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

    const saved = await run('name', async () => {
      await updateMe({ name: trimmed })
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })

      return true
    })

    return saved === true
  }, [fail, queryClient, run, typed])

  return { busy, error, name: typed, requestId, setName, submit }
}
