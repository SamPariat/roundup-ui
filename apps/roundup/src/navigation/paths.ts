import type { TSquadTab } from '@/navigation/squad-tab'

import { SquadTab } from '@/navigation/squad-tab'

/** Extra query parameters a path may carry, such as ?ref=invite. */
export type TQuery = Record<string, string | undefined>

/** A path together with its query parameters, the object form expo-router takes. */
interface ILink<P extends string, Q> {
  /** The query parameters. */
  params: Q
  /** The path of the route. */
  pathname: P
}

/** What a builder returns: the plain path, or the path with its parameters when it was given some. */
type TBuilt<P extends string, Q> = Q extends TQuery ? ILink<P, Q> : P

/** The parameters the code screen needs, plus any extra query. */
interface ICodeQuery extends TQuery {
  /** The E.164 number the code was sent to. */
  phone: string
}

/** What Explore keeps in its query: the search words, the kind of place and the radius in km. */
export interface IExploreQuery extends TQuery {
  /** The words to search for. */
  q?: string | undefined
  /** The radius in kilometers; left out for the default. */
  radius?: string | undefined
  /** The kind of place: bar, restaurant, cafe or night_club. */
  type?: string | undefined
}

/** The parameters the squad screen takes. */
interface ISquadParams extends TQuery {
  /** The squad's ID. */
  squadId: string
  /** The squad's name, which the header shows as the page's title. */
  title?: string
  /** The tab: members (left out), events or favorites. */
  tab?: string
}

/** What a link to a squad may carry besides its ID. */
export interface ISquadOptions {
  /** The squad's name, when the caller knows it. */
  title?: string
  /** The tab to open; members when left out. */
  tab?: TSquadTab
}

/** The parameter the venue screen needs. */
interface IVenueParams extends TQuery {
  /** The venue's Google place ID. */
  placeId: string
  /** The venue's name, which the header shows as the page's title. */
  title?: string
}

/** The parameter the event screen needs. */
interface IEventParams extends TQuery {
  /** The event's ID. */
  eventId: string
  /** The event's name, which the header shows as the page's title. */
  title?: string
}

/**
 * Every path the app navigates to. Screens never write a path string themselves: they call a
 * static method from here, so renaming a route is one edit and a typo is a compile error. Without
 * a query a method returns the plain path; with one it returns the `{ pathname, params }` form
 * expo-router takes. Results are checked against the typed routes wherever they are used.
 */
export class Paths {
  /**
   * The signed-out landing page.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static welcome<Q extends TQuery | undefined = undefined>(query?: Q): TBuilt<'/', Q> {
    return Paths.build('/', query)
  }

  /**
   * Sign-in step one: the phone number.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static signInPhone<Q extends TQuery | undefined = undefined>(query?: Q): TBuilt<'/sign-in', Q> {
    return Paths.build('/sign-in', query)
  }

  /**
   * Sign-in step two: the six-digit code. Needs the number the code was sent to.
   * @param query - The phone number, plus any extra query parameters.
   * @returns The path with its parameters.
   */
  static signInCode(query: ICodeQuery): ILink<'/sign-in/code', ICodeQuery> {
    return { params: query, pathname: '/sign-in/code' }
  }

  /**
   * Sign-in step three, for a first sign-in: the name.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static signInName<Q extends TQuery | undefined = undefined>(
    query?: Q,
  ): TBuilt<'/sign-in/name', Q> {
    return Paths.build('/sign-in/name', query)
  }

  /**
   * The Squads tab.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static tabsSquads<Q extends TQuery | undefined = undefined>(query?: Q): TBuilt<'/squads', Q> {
    return Paths.build('/squads', query)
  }

  /**
   * The Explore tab, optionally with a search, spelled as ExploreParams.parse reads it.
   * @param query - The search words, kind of place and radius, if any.
   * @returns The path, or the path with its parameters.
   */
  static tabsExplore<Q extends IExploreQuery | undefined = undefined>(
    query?: Q,
  ): TBuilt<'/explore', Q> {
    return Paths.build('/explore', query)
  }

  /**
   * The Profile tab.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static tabsProfile<Q extends TQuery | undefined = undefined>(query?: Q): TBuilt<'/profile', Q> {
    return Paths.build('/profile', query)
  }

  /**
   * One squad, under the Squads tab. Needs the squad's ID; its name rides along as the title
   * query parameter, so the page's header shows it at once, before the squad loads.
   * @param squadId - The squad to open.
   * @param options - The squad's name, when the caller knows it, and the tab to open.
   * @returns The path with its parameters.
   */
  static squad(
    squadId: string,
    options: ISquadOptions = {},
  ): ILink<'/squads/[squadId]', ISquadParams> {
    const tab = SquadTab.serialize(options.tab ?? SquadTab.defaultTab)

    return {
      params: {
        squadId,
        ...(options.title === undefined ? {} : { title: options.title }),
        ...(tab === undefined ? {} : { tab }),
      },
      pathname: '/squads/[squadId]',
    }
  }

  /**
   * One venue, under the Explore tab. Needs the place ID; its name rides along as the title query
   * parameter, so the page's header shows it at once, before the venue loads.
   * @param placeId - The venue to open.
   * @param title - The venue's name, when the caller knows it.
   * @returns The path with its parameters.
   */
  static venue(placeId: string, title?: string): ILink<'/explore/[placeId]', IVenueParams> {
    return {
      params: { placeId, ...(title === undefined ? {} : { title }) },
      pathname: '/explore/[placeId]',
    }
  }

  /**
   * One venue, under the Squads tab, for a venue opened from a squad's favorites: it lives in the
   * Squads stack, so Back returns to the squad. Needs the place ID; its name rides along as the
   * title query parameter.
   * @param placeId - The venue to open.
   * @param title - The venue's name, when the caller knows it.
   * @returns The path with its parameters.
   */
  static squadVenue(
    placeId: string,
    title?: string,
  ): ILink<'/squads/venue/[placeId]', IVenueParams> {
    return {
      params: { placeId, ...(title === undefined ? {} : { title }) },
      pathname: '/squads/venue/[placeId]',
    }
  }

  /**
   * One event, under the Squads tab, so Back returns to the squad. Needs the event's ID; its name
   * rides along as the title query parameter.
   * @param eventId - The event to open.
   * @param title - The event's name, when the caller knows it.
   * @returns The path with its parameters.
   */
  static squadEvent(
    eventId: string,
    title?: string,
  ): ILink<'/squads/event/[eventId]', IEventParams> {
    return {
      params: { eventId, ...(title === undefined ? {} : { title }) },
      pathname: '/squads/event/[eventId]',
    }
  }

  /**
   * Edit profile, under the Profile tab.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static profileEdit<Q extends TQuery | undefined = undefined>(
    query?: Q,
  ): TBuilt<'/profile/edit', Q> {
    return Paths.build('/profile/edit', query)
  }

  /**
   * Preferences, under the Profile tab.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static profilePreferences<Q extends TQuery | undefined = undefined>(
    query?: Q,
  ): TBuilt<'/profile/preferences', Q> {
    return Paths.build('/profile/preferences', query)
  }

  /**
   * Builds the plain path or the path with parameters.
   * @param pathname - The path of the route.
   * @param query - The query, if any.
   * @returns The path, or the path with its parameters.
   */
  private static build<P extends string, Q extends TQuery | undefined>(
    pathname: P,
    query: Q | undefined,
  ): TBuilt<P, Q> {
    return (query === undefined ? pathname : { params: query, pathname }) as TBuilt<P, Q>
  }
}
