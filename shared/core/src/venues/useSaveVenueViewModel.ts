import { useCallback, useState } from 'react'

import { addFavorite, removeFavorite } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { ISavedIn } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'
import { useVenue } from './useVenue'

/** What the Save to squad sheet shows and does. */
export interface ISaveVenueViewModel {
  /** Every squad the person is in, each with whether the venue is saved there. */
  squads: ISavedIn[]
  /** True while the venue's squads load. */
  loading: boolean
  /** The squad being saved to or removed from; undefined when idle. */
  busySquadId: string | undefined
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** Saves the venue in a squad that does not have it, or removes it from one that does. Resolves true when it worked. */
  toggle: (squad: ISavedIn) => Promise<boolean>
}

/**
 * The view model of the Save to squad sheet: the person's squads with a tick on those the venue
 * is saved in, and the save or unsave of one squad, after which the venue and the squad's
 * favorites load again.
 * @param placeId - The venue being saved.
 * @returns The state and the action.
 */
export const useSaveVenueViewModel = (placeId: string): ISaveVenueViewModel => {
  const { helpers } = useDeps()
  const venuesHelper = helpers.venues

  const [busySquadId, setBusySquadId] = useState<string | undefined>()

  const { loading, venue } = useVenue(placeId)
  const { busy, error, requestId, run } = useAttempt()

  const toggle = useCallback(
    async (squad: ISavedIn): Promise<boolean> => {
      if (busy) return false

      setBusySquadId(squad.squadId)

      const done = await run('favorite', async () => {
        await (squad.saved
          ? removeFavorite(squad.squadId, placeId)
          : addFavorite(squad.squadId, { placeID: placeId }))

        await venuesHelper.saved(placeId, squad.squadId)

        return true
      })

      setBusySquadId(undefined)

      return done === true
    },
    [busy, placeId, run, venuesHelper],
  )

  return {
    busySquadId: busy ? busySquadId : undefined,
    error,
    loading,
    requestId,
    squads: venue?.savedIn ?? [],
    toggle,
  }
}
