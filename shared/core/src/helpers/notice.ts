/** Where the connection is: fine, lost, or just regained. */
export type TPhase = 'back' | 'offline' | 'online'

/**
 * Connection notice helpers. Deps creates one; reach it through useDeps().helpers.notice, so a
 * test can pass its own.
 */
export class Notice {
  /**
   * The phase after a new reading. Regaining a connection only says "back online" if it was lost.
   * @param current - The phase so far.
   * @param online - Whether the device is online.
   * @returns The next phase.
   */
  next(current: TPhase, online: boolean): TPhase {
    if (!online) return 'offline'

    return current === 'offline' ? 'back' : current
  }
}
