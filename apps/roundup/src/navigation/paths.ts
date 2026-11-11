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

/** The parameter the squad screen needs. */
interface ISquadParams extends TQuery {
  /** The squad's ID. */
  squadId: string
  /** The squad's name, which the header shows as the page's title. */
  title?: string
}

/** The parameter the venue screen needs. */
interface IVenueParams extends TQuery {
  /** The venue's Google place ID. */
  placeId: string
  /** The venue's name, which the header shows as the page's title. */
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
   * The Explore tab.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  static tabsExplore<Q extends TQuery | undefined = undefined>(query?: Q): TBuilt<'/explore', Q> {
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
   * @param title - The squad's name, when the caller knows it.
   * @returns The path with its parameters.
   */
  static squad(squadId: string, title?: string): ILink<'/squads/[squadId]', ISquadParams> {
    return {
      params: { squadId, ...(title === undefined ? {} : { title }) },
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
