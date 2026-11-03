import { useCallback, useState } from 'react'

import { requestOTP } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-helper'

import { useDeps } from '../di/useDeps'
import { useAttempt } from './useAttempt'

/** What the phone screen shows and does. */
export interface IPhoneViewModel {
  /** The national digits typed so far. */
  phone: string
  /** Types into the field; keeps digits only, at most ten. */
  setPhone: (text: string) => void
  /** The message key to show under the field, or undefined. */
  error: TErrorKey | undefined
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
export const usePhoneViewModel = (): IPhoneViewModel => {
  const { helpers } = useDeps()
  const phoneHelper = helpers.phone
  const [digits, setDigits] = useState('')
  const { busy, clear, error, fail, requestId, run } = useAttempt()

  const setPhone = useCallback(
    (text: string) => {
      setDigits(phoneHelper.toNationalDigits(text))
      clear()
    },
    [clear, phoneHelper],
  )

  const submit = useCallback(async (): Promise<string | undefined> => {
    if (!phoneHelper.isValidMobile(digits)) {
      fail('errors.invalidPhone')

      return undefined
    }

    const e164 = phoneHelper.toE164(digits)

    const sent = await run('phone', async () => {
      await requestOTP({ phone: e164 })

      return true
    })

    return sent === true ? e164 : undefined
  }, [digits, fail, phoneHelper, run])

  return { busy, error, phone: digits, requestId, setPhone, submit }
}
