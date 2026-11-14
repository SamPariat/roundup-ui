import type { NativeStackNavigationProp } from 'expo-router'

import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'

import type { TVenueType } from '@roundup/core'

import type { IExploreState } from '@/hooks/explore-params'
import type { IExploreQuery } from '@/navigation/paths'

import { ExploreParams } from '@/hooks/explore-params'

/** How long typing must pause before the words go into the URL, and so into the search, in milliseconds. */
const DEBOUNCE = 400

/** The route params this screen's navigation sets, by route name. */
type TExploreRoutes = Record<string, IExploreQuery>

/** Words typed in the search field, and whether the URL has them yet. */
interface IDraft {
  /** The words exactly as typed, spaces included. */
  text: string
  /** True once the URL holds them (trimmed); until then the field must keep them. */
  written: boolean
}

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
  const navigation = useNavigation<NativeStackNavigationProp<TExploreRoutes>>()
  const { q, radius, type } = params

  // Words typed that the URL does not hold yet, or holds only trimmed.
  const [draft, setDraft] = useState<IDraft | undefined>()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // The words of the write that is waiting, if any.
  const pendingRef = useRef<string | undefined>(undefined)

  const state = useMemo(
    (): IExploreState => ExploreParams.parse({ q, radius, type }),
    [q, radius, type],
  )

  const { filter } = state

  // The field keeps the words as typed until the URL changes to something else, so a space typed
  // at either end is not trimmed away while the person is still typing.
  const keeping =
    draft !== undefined &&
    (!draft.written || ExploreParams.queryOf(draft.text) === ExploreParams.queryOf(state.query))

  const text = keeping ? draft.text : state.query

  // Writes through this screen's own navigation, not the router's, which writes to whichever screen
  // is in front: that is how the words of a blurred screen can still reach their own URL.
  const handleWrite = useCallback(
    (text: string): void => {
      pendingRef.current = undefined
      navigation.setParams({ q: ExploreParams.queryOf(text) })

      // The URL holds the words trimmed, so a field with a space at either end keeps what was typed.
      setDraft(text === text.trim() ? undefined : { text, written: true })
    },
    [navigation],
  )

  // Going to a place, or away, writes the words that are waiting at once, so the field and the
  // results agree when the person comes back, and no write is left to land on another screen.
  const handleFocus = useCallback(
    (): (() => void) => (): void => {
      clearTimeout(timerRef.current)

      if (pendingRef.current !== undefined) handleWrite(pendingRef.current)
    },
    [handleWrite],
  )

  const setText = useCallback(
    (text: string): void => {
      clearTimeout(timerRef.current)
      pendingRef.current = text
      setDraft({ text, written: false })
      timerRef.current = setTimeout(handleWrite, DEBOUNCE, text)
    },
    [handleWrite],
  )

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

  useFocusEffect(handleFocus)

  return { ...state, setRadiusKm, setText, text, toggleFilter }
}
