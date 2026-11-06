import { useCallback } from 'react'

import { lookupUsers } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { IContactMatch } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'
import { Squads } from '../helpers/squads'
import { useSquad } from './useSquad'

/** The most numbers one lookup request takes. */
const MAX_LOOKUP = 500

/** What the contact picker shows and does. */
export interface IContactLookup {
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** True while the numbers are being looked up. */
  busy: boolean
  /**
   * Finds which of the numbers are on Roundup and not yet in the squad. Invalid and repeated
   * numbers are dropped. Resolves the matches, or undefined when the lookup failed.
   */
  lookup: (numbers: string[]) => Promise<IContactMatch[] | undefined>
}

/**
 * The view model of the contact picker: normalizes the numbers it is given, asks which are on
 * Roundup in batches of 500, and leaves out people already in the squad. It does not read contacts.
 * @param squadId - The squad people are being added to.
 * @returns The state and the lookup.
 */
export const useContactLookup = (squadId: string): IContactLookup => {
  const { helpers } = useDeps()
  const phoneHelper = helpers.phone
  const { members } = useSquad(squadId)
  const { busy, error, requestId, run } = useAttempt()

  const lookup = useCallback(
    (numbers: string[]): Promise<IContactMatch[] | undefined> => {
      const phones = new Set<string>()

      for (const number of numbers) {
        const digits = phoneHelper.toNationalDigits(number)

        if (phoneHelper.isValidMobile(digits)) phones.add(phoneHelper.toE164(digits))
      }

      const unique = [...phones]
      const inSquad = new Set(members.map((member) => member.id))

      return run('squad', async () => {
        const matches: IContactMatch[] = []

        for (let start = 0; start < unique.length; start += MAX_LOOKUP) {
          const { data } = await lookupUsers({ phones: unique.slice(start, start + MAX_LOOKUP) })

          for (const user of data.users) {
            if (!inSquad.has(user.id)) {
              matches.push(Squads.toMatch(user))
            }
          }
        }

        return matches
      })
    },
    [members, phoneHelper, run],
  )

  return { busy, error, lookup, requestId }
}
