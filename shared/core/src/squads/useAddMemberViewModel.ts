import { useCallback, useState } from 'react'

import { addSquadMember } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'
import { Squads } from '../helpers/squads'

/** What adding someone to a squad shows and does. */
export interface IAddMemberViewModel {
  /** The national digits typed so far. */
  phone: string
  /** Types into the field; keeps digits only, at most ten. */
  setPhone: (text: string) => void
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while someone is being added. */
  busy: boolean
  /** Adds the person whose number is typed. Resolves true when they are added. */
  submit: () => Promise<boolean>
  /** Adds a person picked from contacts, by any form of their number. Resolves true when they are added. */
  addNumber: (number: string) => Promise<boolean>
}

/**
 * The view model of adding someone to a squad by phone number: turns the input into E.164, adds
 * them and loads the squad and the list again.
 * @param squadId - The squad people are added to.
 * @returns The state and the actions.
 */
export const useAddMemberViewModel = (squadId: string): IAddMemberViewModel => {
  const { helpers, queryClient } = useDeps()
  const phoneHelper = helpers.phone
  const [digits, setDigits] = useState('')
  const { busy, clear, error, fail, requestId, run } = useAttempt()

  const setPhone = useCallback(
    (text: string): void => {
      setDigits(phoneHelper.toNationalDigits(text))
      clear()
    },
    [clear, phoneHelper],
  )

  const add = useCallback(
    async (national: string): Promise<boolean> => {
      if (!phoneHelper.isValidMobile(national)) {
        fail('errors.invalidPhone')

        return false
      }

      const added = await run('addMember', async () => {
        await addSquadMember(squadId, { phone: phoneHelper.toE164(national) })
        await Squads.changed(queryClient, squadId)

        return true
      })

      return added === true
    },
    [fail, phoneHelper, queryClient, run, squadId],
  )

  const submit = useCallback((): Promise<boolean> => add(digits), [add, digits])

  const addNumber = useCallback(
    (number: string): Promise<boolean> => add(phoneHelper.toNationalDigits(number)),
    [add, phoneHelper],
  )

  return { addNumber, busy, error, phone: digits, requestId, setPhone, submit }
}
