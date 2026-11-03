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
