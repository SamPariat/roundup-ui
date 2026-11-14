import type { IEventNomination } from '@roundup/core'

/** The most a bar's width is, as a percentage. */
const FULL = 100

/**
 * The arithmetic of a ballot's bars. Static methods only.
 */
export class Ballot {
  /**
   * Adds up the votes for every place.
   * @param nominations - The places voted on.
   * @returns How many votes were cast.
   */
  static total(nominations: readonly IEventNomination[]): number {
    return nominations.reduce((sum, nomination) => sum + nomination.voteCount, 0)
  }

  /**
   * Finds the most votes any place has, which the leader's bar is drawn in the accent for.
   * @param nominations - The places voted on.
   * @returns The highest vote count, 0 when there are none.
   */
  static top(nominations: readonly IEventNomination[]): number {
    return Math.max(0, ...nominations.map((nomination) => nomination.voteCount))
  }

  /**
   * How full a place's bar is.
   * @param votes - The votes the place has.
   * @param total - The votes cast in all.
   * @returns A whole percentage from 0 to 100; 0 while nobody has voted.
   */
  static percent(votes: number, total: number): number {
    return total === 0 ? 0 : Math.round((votes / total) * FULL)
  }
}
