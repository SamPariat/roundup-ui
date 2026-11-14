import type { SearchVenues200, SearchVenuesParams } from '@roundup/api'

import { searchVenues } from '@roundup/api'

/** Meters in a kilometer, which the API's radius is in. */
export const METERS_PER_KM = 1000

/**
 * Builds the function that asks for one page of a venue search; the Explore tab and the suggest-a-place
 * sheet share it.
 * @param params - What to search for.
 * @returns The function that takes a page's cursor.
 */
export const searchPageFetcher =
  (params: SearchVenuesParams) =>
  (cursor: string | undefined): Promise<SearchVenues200> =>
    searchVenues({ ...params, ...(cursor === undefined ? {} : { cursor }) })
