/** Where the connection is: fine, lost, or just regained. */
export type TPhase = 'back' | 'offline' | 'online'

/**
 * Connection notice helpers. Static methods only; the dependency container holds the class, so a
 * test can swap it.
 */
export class Notice {
  /**
   * The phase after a new reading. Regaining a connection only says "back online" if it was lost.
   * @param current - The phase so far.
   * @param online - Whether the device is online.
   * @returns The next phase.
   */
  static next(current: TPhase, online: boolean): TPhase {
    if (!online) return 'offline'

    return current === 'offline' ? 'back' : current
  }
}
