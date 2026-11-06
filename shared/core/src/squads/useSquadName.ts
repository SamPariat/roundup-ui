import { useCallback, useState } from 'react'

import type { IAttempt } from '../auth/useAttempt'

import { useAttempt } from '../auth/useAttempt'
import { MAX_NAME } from '../auth/useNameViewModel'

/** A squad name field with the request state it shares with its screen. */
export interface ISquadNameField {
  /** The name typed so far. */
  name: string
  /** Types into the field and hides the old message. */
  setName: (text: string) => void
  /** The busy flag, message and runner of the screen's request. */
  attempt: IAttempt
  /** Trims the name. Shows errors.invalidSquadName and resolves undefined when it is blank or too long. */
  validName: () => string | undefined
}

/**
 * The name field of creating and renaming a squad: what is typed and the check before any request.
 * @param initialName - What the field starts with; empty when creating, the current name when renaming.
 * @returns The field and its request state.
 */
export const useSquadName = (initialName: string): ISquadNameField => {
  const attempt = useAttempt()
  const { clear, fail } = attempt
  const [typed, setTyped] = useState(initialName)

  const setName = useCallback(
    (text: string) => {
      setTyped(text)
      clear()
    },
    [clear],
  )

  const validName = useCallback((): string | undefined => {
    const trimmed = typed.trim()

    if (trimmed === '' || trimmed.length > MAX_NAME) {
      fail('errors.invalidSquadName')

      return undefined
    }

    return trimmed
  }, [fail, typed])

  return { attempt, name: typed, setName, validName }
}
