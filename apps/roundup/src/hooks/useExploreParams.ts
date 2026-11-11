import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'

import type { TVenueType } from '@roundup/core'

import type { IExploreState } from '@/hooks/explore-params'
import type { IExploreQuery } from '@/navigation/paths'

import { ExploreParams } from '@/hooks/explore-params'

/** How long typing must pause before the words go into the URL, and so into the search, in milliseconds. */
const DEBOUNCE = 400

/** What Explore's controls read and change. */
export interface IExploreParams extends IExploreState {
  /** What the search field shows: the words as typed, which the URL follows once typing pauses. */
  text: string
  /** Types into the search field; the URL is replaced, not pushed, once typing pauses. */
  setText: (text: string) => void
  /** Selects a kind of place, or clears the filter when it is already selected. */
  toggleFilter: (type: TVenueType) => void
  /** Picks the search radius, in kilometers. */
  setRadiusKm: (km: number) => void
}

/**
 * Explore's search lives in the route's query (`q`, `type`, `radius`), so a reload or a pasted
 * link restores it and Back works as people expect. Every change replaces the parameters instead
 * of pushing a history entry, and typing waits for a pause so it does not write on every key.
 * @returns The search, the text in the field and the changes the controls make.
 */
export const useExploreParams = (): IExploreParams => {
  const params = useLocalSearchParams<IExploreQuery>()
  const router = useRouter()
  const { q, radius, type } = params
  // Words typed that the URL does not hold yet.
  const [draft, setDraft] = useState<string | undefined>()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const state = useMemo(
    (): IExploreState => ExploreParams.parse({ q, radius, type }),
    [q, radius, type],
  )

  // Going to a place, or away, drops a write that is still waiting, so it cannot land on that screen.
  const cancel = useCallback((): void => {
    clearTimeout(timerRef.current)
  }, [])

  useFocusEffect(useCallback((): (() => void) => cancel, [cancel]))

  const write = useCallback(
    (text: string): void => {
      router.setParams({ q: ExploreParams.queryOf(text) })
      setDraft(undefined)
    },
    [router],
  )

  const setText = useCallback(
    (text: string): void => {
      clearTimeout(timerRef.current)
      setDraft(text)
      timerRef.current = setTimeout(write, DEBOUNCE, text)
    },
    [write],
  )

  const { filter } = state

  const toggleFilter = useCallback(
    (next: TVenueType): void => {
      router.setParams({ type: ExploreParams.typeOf(filter === next ? undefined : next) })
    },
    [filter, router],
  )

  const setRadiusKm = useCallback(
    (km: number): void => {
      router.setParams({ radius: ExploreParams.radiusOf(km) })
    },
    [router],
  )

  return { ...state, setRadiusKm, setText, text: draft ?? state.query, toggleFilter }
}
