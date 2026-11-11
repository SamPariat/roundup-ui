import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { ICoordinates } from './types'

import { useDeps } from '../di/useDeps'

/** The cache key of the device's position: one for the whole app, read once and kept. */
const LOCATION_KEY: readonly string[] = ['location']

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
 * refusal, or no position being available, is the denied phase. Nothing refetches on its own, so
 * the position stays the same until retry is called.
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
