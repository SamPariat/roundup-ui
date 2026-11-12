import type { TVenueType } from '@roundup/core'

import { DEFAULT_RADIUS_KM, RADIUS_STEPS_KM, VenueType } from '@roundup/core'

import type { IExploreQuery } from '@/navigation/paths'

/** What Explore searches with: the words, the kind of place and the radius. */
export interface IExploreState {
  /** The words to search for; empty for none. */
  query: string
  /** The kind of place to search for; undefined for all. */
  filter: TVenueType | undefined
  /** The search radius in kilometers. */
  radiusKm: number
}

/** The kinds of place a link may name. */
const TYPES: readonly string[] = Object.values(VenueType)

/**
 * Explore's search as the route's query parameters `q`, `type` and `radius` spell it, so a reload
 * or a pasted link restores it. This is the one place that reads and writes them: anything missing
 * or invalid falls back to the default, and a default is left out of the URL. Static methods only.
 */
export class ExploreParams {
  /**
   * Reads the search out of the route's parameters.
   * @param params - The raw parameters, as the router gives them.
   * @returns The search; every value that is missing or invalid is its default.
   */
  static parse(
    params: Partial<Record<keyof IExploreQuery, string | string[] | undefined>>,
  ): IExploreState {
    const type = ExploreParams.first(params['type'])
    const radius = Number(ExploreParams.first(params['radius']))

    return {
      filter: TYPES.includes(type ?? '') ? (type as TVenueType) : undefined,
      query: ExploreParams.first(params['q']) ?? '',
      radiusKm: RADIUS_STEPS_KM.includes(radius) ? radius : DEFAULT_RADIUS_KM,
    }
  }

  /**
   * Writes the whole search as parameters, for a link to Explore.
   * @param state - The search; any part may be left out.
   * @returns The parameters, with the defaults left out.
   */
  static serialize(state: Partial<IExploreState>): IExploreQuery {
    return {
      q: ExploreParams.queryOf(state.query ?? ''),
      radius: ExploreParams.radiusOf(state.radiusKm ?? DEFAULT_RADIUS_KM),
      type: ExploreParams.typeOf(state.filter),
    }
  }

  /**
   * The `q` parameter for some typed words.
   * @param text - What is typed.
   * @returns The words trimmed, or undefined when blank, which clears the parameter.
   */
  static queryOf(text: string): string | undefined {
    const words = text.trim()

    return words === '' ? undefined : words
  }

  /**
   * The `type` parameter for a kind of place.
   * @param filter - The kind, or undefined for all.
   * @returns The kind, or undefined for all, which clears the parameter.
   */
  static typeOf(filter: TVenueType | undefined): string | undefined {
    return filter
  }

  /**
   * The `radius` parameter for a radius.
   * @param km - The radius in kilometers.
   * @returns The radius, or undefined for the default, which clears the parameter.
   */
  static radiusOf(km: number): string | undefined {
    return km === DEFAULT_RADIUS_KM ? undefined : String(km)
  }

  /**
   * The first value of a parameter, since a repeated one arrives as a list.
   * @param value - The raw parameter.
   * @returns The value, if there is one.
   */
  private static first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
  }
}
