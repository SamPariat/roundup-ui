/**
 * Reads the title a link carries in its query, such as Paths.squad(id, name) and
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
