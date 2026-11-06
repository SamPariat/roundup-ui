import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'

import type { TErrorKey } from '../helpers/error-key'
import type { IContactMatch } from './types'

import { useDeps } from '../di/useDeps'
import { useAddMemberViewModel } from './useAddMemberViewModel'
import { useContactLookup } from './useContactLookup'

/** Where the picker is: asking for access, without access, or showing people. */
export type TPickerPhase = 'denied' | 'loading' | 'ready'

/** What the contact picker shows and does. */
export interface IContactPickerViewModel {
  /** Where the picker is. */
  phase: TPickerPhase
  /** The people on Roundup the search matches, in the order the address book gave them. */
  people: IContactMatch[]
  /** What has been typed in the search field. */
  query: string
  /** Types into the search field. */
  setQuery: (text: string) => void
  /** Whether a person is ticked, by user ID. */
  isPicked: (userId: string) => boolean
  /** Ticks a person, or unticks them. */
  toggle: (userId: string) => void
  /** How many people are ticked, including any the search hides. */
  pickedCount: number
  /** True while the numbers are looked up or the ticked people are added. */
  busy: boolean
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** Adds everyone ticked, one at a time. Resolves true when all of them are in the squad. */
  add: () => Promise<boolean>
}

/**
 * The view model of the contact picker. When it opens it asks for access to the contacts, reads
 * the phone numbers, asks Roundup which of them are people on it and not yet in the squad, and
 * lists those. Numbers are looked up once, at that moment, and nothing is kept afterwards. Adding
 * goes through the same request as typing a number, once for each person ticked.
 * @param squadId - The squad people are being added to.
 * @returns The state and the actions.
 */
export const useContactPickerViewModel = (squadId: string): IContactPickerViewModel => {
  const { contacts } = useDeps()
  const lookup = useContactLookup(squadId)
  const adding = useAddMemberViewModel(squadId)
  const [phase, setPhase] = useState<TPickerPhase>('loading')
  const [found, setFound] = useState<IContactMatch[]>([])
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set())
  const [query, setQuery] = useState('')

  const find = useEffectEvent((numbers: string[]) => lookup.lookup(numbers))

  useEffect(() => {
    let active = true

    /**
     * Whether the picker is still open.
     * @returns False once the effect has been cleaned up.
     */
    const open = (): boolean => active

    /** Asks for access, reads the numbers and looks them up, unless the picker has closed. */
    const load = async (): Promise<void> => {
      const permission = await contacts.requestPermission()

      if (!open()) return

      if (permission === 'denied') {
        setPhase('denied')

        return
      }

      const matches = await find(await contacts.phoneNumbers())

      if (!open()) return

      setFound(matches ?? [])
      setPhase('ready')
    }

    void load()

    return () => {
      active = false
    }
  }, [contacts])

  const people = useMemo((): IContactMatch[] => {
    const needle = query.trim().toLowerCase()

    return found.filter((person) => person.name.toLowerCase().includes(needle))
  }, [found, query])

  const isPicked = useCallback((userId: string): boolean => picked.has(userId), [picked])

  const toggle = useCallback((userId: string): void => {
    setPicked((current) => {
      const next = new Set(current)

      if (!next.delete(userId)) next.add(userId)

      return next
    })
  }, [])

  const add = useCallback(async (): Promise<boolean> => {
    for (const person of found.filter((match) => picked.has(match.id))) {
      if (!(await adding.addNumber(person.phone))) return false

      setFound((current) => current.filter((match) => match.id !== person.id))

      setPicked((current) => {
        const next = new Set(current)

        next.delete(person.id)

        return next
      })
    }

    return true
  }, [adding, found, picked])

  return {
    add,
    busy: lookup.busy || adding.busy,
    error: adding.error ?? lookup.error,
    isPicked,
    people,
    phase,
    pickedCount: picked.size,
    query,
    requestId: adding.error === undefined ? lookup.requestId : adding.requestId,
    setQuery,
    toggle,
  }
}
