import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import type { IContactsSource } from '../contacts/types'
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

/** What opening the picker found: whether access was refused, and the people on Roundup. */
interface IPickerLoad {
  /** True when the person did not allow access to their contacts. */
  denied: boolean
  /** The people on Roundup among the contacts who are not yet in the squad. */
  matches: IContactMatch[]
}

/** Looks up phone numbers on Roundup; resolves undefined when the lookup failed. */
type TFind = (numbers: string[]) => Promise<IContactMatch[] | undefined>

/**
 * Contact picker helpers. Static methods only.
 */
class Picker {
  /**
   * Asks for access to the contacts, reads their phone numbers and looks them up on Roundup.
   * @param contacts - The device's address book.
   * @param find - The lookup on Roundup.
   * @returns Whether access was refused, and the people found.
   */
  static async load(contacts: IContactsSource, find: TFind): Promise<IPickerLoad> {
    if ((await contacts.requestPermission()) === 'denied') return { denied: true, matches: [] }

    const matches = await find(await contacts.phoneNumbers())

    return { denied: false, matches: matches ?? [] }
  }
}

/**
 * The view model of the contact picker. When it opens it asks for access to the contacts, reads
 * the phone numbers, asks Roundup which of them are people on it and not yet in the squad, and
 * lists those. That load is a query that runs once per opening and is dropped when the picker
 * closes (gcTime 0), so no number is kept. Adding goes through the same request as typing a
 * number, once for each person ticked.
 * @param squadId - The squad people are being added to.
 * @returns The state and the actions.
 */
export const useContactPickerViewModel = (squadId: string): IContactPickerViewModel => {
  const { contacts } = useDeps()

  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set())
  const [added, setAdded] = useState<ReadonlySet<string>>(() => new Set())
  const [query, setQuery] = useState<string>('')

  const lookup = useContactLookup(squadId)
  const adding = useAddMemberViewModel(squadId)

  const isPicked = useCallback((userId: string): boolean => picked.has(userId), [picked])

  const toggle = useCallback((userId: string): void => {
    setPicked((current) => {
      const next = new Set(current)

      if (!next.delete(userId)) next.add(userId)

      return next
    })
  }, [])

  const load = useCallback(
    (): Promise<IPickerLoad> => Picker.load(contacts, lookup.lookup),
    [contacts, lookup.lookup],
  )

  const { data, isPending } = useQuery<IPickerLoad>({
    gcTime: 0,
    queryFn: load,
    queryKey: ['contact-picker', squadId],
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  })

  const phase = useMemo((): TPickerPhase => {
    if (isPending) return 'loading'

    return data?.denied === true ? 'denied' : 'ready'
  }, [data, isPending])

  // The people found, less those added while the picker is open.
  const found = useMemo(
    (): IContactMatch[] => (data?.matches ?? []).filter((match) => !added.has(match.id)),
    [added, data],
  )

  const people = useMemo((): IContactMatch[] => {
    const needle = query.trim().toLowerCase()

    return found.filter((person) => person.name.toLowerCase().includes(needle))
  }, [found, query])

  const add = useCallback(async (): Promise<boolean> => {
    for (const person of found.filter((match) => picked.has(match.id))) {
      if (!(await adding.addNumber(person.phone))) return false

      setAdded((current) => new Set(current).add(person.id))

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
