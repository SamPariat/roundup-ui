import { useCallback, useState } from 'react'

import { requestOTP } from '@roundup/api'

import type { ErrorKey } from './errors.ts'

import { isValidMobile, toE164, toNationalDigits } from './phone.ts'
import { useAttempt } from './useAttempt.ts'

/** What the phone screen shows and does. */
export interface PhoneViewModel {
  /** The national digits typed so far. */
  phone: string
  /** Types into the field; keeps digits only, at most ten. */
  setPhone: (text: string) => void
  /** The message key to show under the field, or undefined. */
  error: ErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the code is being sent. */
  busy: boolean
  /** Checks the number and sends the code. Resolves the E.164 number to go on with, or undefined. */
  submit: () => Promise<string | undefined>
}

/**
 * The view model of the phone step: validates an Indian mobile number and asks for a code.
 * @returns The state and the actions.
 */
export const usePhoneViewModel = (): PhoneViewModel => {
  const [digits, setDigits] = useState('')
  const { busy, clear, error, fail, requestId, run } = useAttempt()

  const setPhone = useCallback(
    (text: string) => {
      setDigits(toNationalDigits(text))
      clear()
    },
    [clear],
  )

  const submit = useCallback(async (): Promise<string | undefined> => {
    if (!isValidMobile(digits)) {
      fail('errors.invalidPhone')

      return undefined
    }

    const e164 = toE164(digits)

    const sent = await run('phone', async () => {
      await requestOTP({ phone: e164 })

      return true
    })

    return sent === true ? e164 : undefined
  }, [digits, fail, run])

  return { busy, error, phone: digits, requestId, setPhone, submit }
}
