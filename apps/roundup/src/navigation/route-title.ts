/** What a screen's options function is given: here, only its route and that route's params. */
export interface IScreenProps {
  /** The screen's route. */
  route: {
    /** The route's params: the path segments and the query. */
    params?: object | undefined
  }
}

/**
 * Reads the title a link carries in its query, such as Paths.squad(id, { title }) and
 * Paths.venue(id, name). Static methods only.
 */
export class RouteTitle {
  /**
   * Reads the title out of a screen's route params.
   * @param params - The path segments and query the router parsed for the screen.
   * @returns The title, or undefined when the link carried none.
   */
  static of(params: object | undefined): string | undefined {
    const value: unknown = params !== undefined && 'title' in params ? params.title : undefined

    return typeof value === 'string' && value !== '' ? value : undefined
  }
}
