import { useCallback, useEffect, useState } from 'react'

import { requestOTP, verifyOTP } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-helper'

import { useDeps } from '../di/useDeps'
import { useSession } from '../session/useSession'
import { useAttempt } from './useAttempt'

/** How many digits the code has. */
const CODE_LENGTH = 6

/** How many seconds before another code may be asked for. */
const RESEND_SECONDS = 30

/** Milliseconds in a second. */
const SECOND = 1000

/** What the code screen shows and does. */
export interface ICodeViewModel {
  /** The digits typed so far. */
  code: string
  /** Types into the field; keeps digits only. The sixth digit sends the code. */
  setCode: (text: string) => void
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the code is being checked or sent again. */
  busy: boolean
  /** Seconds until Resend works; 0 when it does. */
  resendIn: number
  /** Asks for a new code and restarts the countdown. */
  resend: () => Promise<void>
  /** Checks the code and signs in. Resolves whether this is a new user, or undefined on failure. */
  submit: () => Promise<boolean | undefined>
}

/**
 * Keeps only digits, at most the code length.
 * @param text - Whatever the field now holds.
 * @returns Up to six digits.
 */
const toCodeDigits = (text: string): string => text.replaceAll(/\D/g, '').slice(0, CODE_LENGTH)

/**
 * The view model of the code step: collects six digits, checks them, signs in, and runs the
 * resend countdown.
 * @param phone - The E.164 number the code was sent to.
 * @returns The state and the actions.
 */
export const useCodeViewModel = (phone: string): ICodeViewModel => {
  const { now } = useDeps()
  const { signIn } = useSession()
  const { busy, clear, error, fail, requestId, run } = useAttempt()
  const [typed, setTyped] = useState('')
  const [sentAt, setSentAt] = useState(now)
  const [current, setCurrent] = useState(now)
  const resendIn = Math.max(0, RESEND_SECONDS - Math.floor((current - sentAt) / SECOND))

  const expired = resendIn === 0

  // Ticks once a second while the countdown runs, and stops at zero.
  useEffect(() => {
    const timer = expired
      ? undefined
      : setInterval(() => {
          setCurrent(now())
        }, SECOND)

    return () => {
      if (timer !== undefined) clearInterval(timer)
    }
  }, [expired, now])

  const verify = useCallback(
    (digits: string): Promise<boolean | undefined> =>
      run('code', async () => {
        const { data } = await verifyOTP({ code: digits, phone })

        await signIn(data)

        return data.isNewUser
      }),
    [phone, run, signIn],
  )

  const setCode = useCallback(
    (text: string) => {
      const digits = toCodeDigits(text)

      setTyped(digits)
      clear()

      if (digits.length === CODE_LENGTH) void verify(digits)
    },
    [clear, verify],
  )

  const submit = useCallback((): Promise<boolean | undefined> => {
    if (typed.length === CODE_LENGTH) return verify(typed)

    fail('errors.wrongCode')

    return Promise.resolve(undefined)
  }, [fail, typed, verify])

  const resend = useCallback(async (): Promise<void> => {
    const sent = await run('phone', async () => {
      await requestOTP({ phone })

      return true
    })

    if (sent === true) {
      const restarted = now()

      setTyped('')
      setSentAt(restarted)
      setCurrent(restarted)
    }
  }, [now, phone, run])

  return { busy, code: typed, error, requestId, resend, resendIn, setCode, submit }
}
