import { useCallback, useState } from 'react'

import type { TErrorContext, TErrorKey } from '../helpers/error-key'

import { useDeps } from '../di/useDeps'

/** The state and runner every sign-in step shares. */
export interface IAttempt {
  /** True while a request is in flight. */
  busy: boolean
  /** The message to show, or undefined when there is none. */
  error: TErrorKey | undefined
  /** The request ID to quote in the generic message, when there is one. */
  requestId: string | undefined
  /** Shows a message without a request having failed, such as an invalid phone number. */
  fail: (key: TErrorKey) => void
  /** Hides the message. */
  clear: () => void
  /**
   * Runs a request: sets busy, clears the old message, and turns a failure into a message.
   * Resolves the request's value, or undefined when it failed or one is already running.
   */
  run: <T>(context: TErrorContext, request: () => Promise<T>) => Promise<T | undefined>
}

/**
 * Tracks one request at a time with its busy flag and error message.
 * @returns The state and the runner.
 */
export const useAttempt = (): IAttempt => {
  const { helpers } = useDeps()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<TErrorKey | undefined>()
  const [requestId, setRequestId] = useState<string | undefined>()

  const clear = useCallback(() => {
    setError(undefined)
    setRequestId(undefined)
  }, [])

  const fail = useCallback((key: TErrorKey) => {
    setError(key)
    setRequestId(undefined)
  }, [])

  const run = useCallback(
    async <T>(context: TErrorContext, request: () => Promise<T>): Promise<T | undefined> => {
      if (busy) return undefined

      setBusy(true)
      clear()

      try {
        return await request()
      } catch (error_) {
        const message = helpers.errors.toMessage(error_, context)

        setError(message.key)
        setRequestId(message.requestId)

        return undefined
      } finally {
        setBusy(false)
      }
    },
    [busy, clear, helpers],
  )

  return { busy, clear, error, fail, requestId, run }
}
