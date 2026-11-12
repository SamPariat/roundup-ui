import type { Query } from '@tanstack/react-query'

import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { ICoordinates } from './types'

import { useDeps } from '../di/useDeps'

/** The cache key of the device's position: one for the whole app, read once and kept. */
const LOCATION_KEY: readonly string[] = ['location']

/**
 * When the position is read again on its own. Static methods only.
 */
class LocationRefetch {
  /**
   * Whether coming back to the app reads the position again: after a refusal, or after a failed
   * read (as with Location Services off), since a known position never goes stale.
   * @param query - The cached position, or null after a refusal, with its state.
   * @returns 'always' after a refusal or an error, so it runs despite the infinite stale time;
   * false otherwise.
   */
  static readonly onReturn = (query: Query<ICoordinates | null>): 'always' | false =>
    query.state.status === 'error' || query.state.data === null ? 'always' : false
}

/** Where the device is in the lifecycle of finding out. */
export type TLocationPhase = 'denied' | 'locating' | 'ready'

/** What a screen that needs the device's position shows and does. */
export interface IUseLocation {
  /** Whether the position is being read, was refused or is known. */
  phase: TLocationPhase
  /** The device's position; undefined until the phase is ready. */
  coordinates: ICoordinates | undefined
  /** Asks again, for the person who allowed access in Settings or in the browser. */
  retry: () => void
}

/**
 * Reads the device's position once, as a query: it asks for access, then reads the position. A
 * refusal, or no position being available, is the denied phase. A known position stays the same
 * until retry is called; a refusal or a failed read is asked again when the app comes back to the foreground, as
 * it does after the person allowed access in Settings or in the browser.
 * @returns The phase, the position and the retry action.
 */
export const useLocation = (): IUseLocation => {
  const { location } = useDeps()

  const { data, isFetching, isPending, refetch } = useQuery({
    /**
     * Asks for access, then reads the position.
     * @returns The position, or null when access was refused.
     */
    queryFn: async (): Promise<ICoordinates | null> => {
      if ((await location.requestPermission()) === 'denied') return null

      return location.current()
    },
    queryKey: LOCATION_KEY,
    refetchOnWindowFocus: LocationRefetch.onReturn,
    retry: false,
    staleTime: Infinity,
  })

  const retry = useCallback((): void => {
    void refetch()
  }, [refetch])

  // Asking again counts as locating too, so a retry shows progress instead of the old refusal.
  if (!data && (isPending || isFetching))
    return { coordinates: undefined, phase: 'locating', retry }

  return data
    ? { coordinates: data, phase: 'ready', retry }
    : { coordinates: undefined, phase: 'denied', retry }
}
