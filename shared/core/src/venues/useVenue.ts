import { useMemo } from 'react'

import { ApiError, HttpStatus, useGetVenue } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { IVenueInfo } from './types'

import { useDeps } from '../di/useDeps'
import { useSignedIn } from '../session/useSignedIn'

/** What a venue's page shows. */
export interface IUseVenue {
  /** The venue, once loaded. */
  venue: IVenueInfo | undefined
  /** True while the venue loads. */
  loading: boolean
  /** True when the venue does not exist. */
  notFound: boolean
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/**
 * Loads one venue with its hours, reviews, summary and the squads it is saved in.
 * @param placeId - Which venue to load.
 * @returns The venue and the loading state.
 */
export const useVenue = (placeId: string): IUseVenue => {
  const { helpers, now } = useDeps()
  const venuesHelper = helpers.venues
  const signedIn = useSignedIn()
  const { data, error, isPending } = useGetVenue(placeId, { query: { enabled: signedIn } })
  const detail = data?.data

  const venue = useMemo(
    (): IVenueInfo | undefined => detail && venuesHelper.toInfo(detail, now()),
    [detail, now, venuesHelper],
  )

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'venue')

  return {
    error: message?.key,
    loading: signedIn && isPending,
    notFound: ApiError.is(error) && error.status === HttpStatus.notFound,
    requestId: message?.requestId,
    venue,
  }
}
