/** Extra query parameters a path may carry, such as ?ref=invite. */
export type Query = Record<string, string | undefined>

/** A path together with its query parameters, the object form expo-router takes. */
interface Link<P extends string, Q> {
  /** The query parameters. */
  params: Q
  /** The path of the route. */
  pathname: P
}

/** What a builder returns: the plain path, or the path with its parameters when it was given some. */
type Built<P extends string, Q> = Q extends Query ? Link<P, Q> : P

/** The parameters the code screen needs, plus any extra query. */
interface CodeQuery extends Query {
  /** The E.164 number the code was sent to. */
  phone: string
}

/**
 * Makes a builder for one route. Without a query it returns the plain path; with one it returns
 * the `{ pathname, params }` form expo-router takes. The result is checked against the typed
 * routes wherever it is used, so a path that does not exist fails to compile.
 * @param pathname - The path of the route, as expo-router spells it.
 * @returns A function from an optional query to an `Href`.
 */
const route =
  <P extends string>(pathname: P) =>
  <Q extends Query | undefined = undefined>(query?: Q): Built<P, Q> =>
    (query === undefined ? pathname : { params: query, pathname }) as Built<P, Q>

/**
 * Every path the app navigates to. Screens never write a path string themselves: they call a
 * builder from here, so renaming a route is one edit and a typo is a compile error.
 */
export const paths = {
  /**
   * The signed-out landing page.
   * @param query - Extra query parameters, if any.
   * @returns The path, or the path with its parameters.
   */
  welcome: route('/'),
  signIn: {
    /**
     * Sign-in step one: the phone number.
     * @param query - Extra query parameters, if any.
     * @returns The path, or the path with its parameters.
     */
    phone: route('/sign-in'),
    /**
     * Sign-in step two: the six-digit code. Needs the number the code was sent to.
     * @param query - The phone number, plus any extra query parameters.
     * @returns The path with its parameters.
     */
    code: route('/sign-in/code') as (query: CodeQuery) => Link<'/sign-in/code', CodeQuery>,
  },
  tabs: {
    /**
     * The Squads tab.
     * @param query - Extra query parameters, if any.
     * @returns The path, or the path with its parameters.
     */
    squads: route('/squads'),
    /**
     * The Explore tab.
     * @param query - Extra query parameters, if any.
     * @returns The path, or the path with its parameters.
     */
    explore: route('/explore'),
    /**
     * The Profile tab.
     * @param query - Extra query parameters, if any.
     * @returns The path, or the path with its parameters.
     */
    profile: route('/profile'),
  },
}
