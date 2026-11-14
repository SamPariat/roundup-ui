import type { QueryClient } from '@tanstack/react-query'

import type {
  EventDetail,
  EventMember,
  EventPlace,
  EventSummary,
  GetEvent200,
  Nomination,
  RSVPCounts,
} from '@roundup/api'

import {
  EventStatus,
  EventType,
  getGetEventQueryKey,
  getListSquadEventsQueryKey,
  RSVPStatus,
} from '@roundup/api'

import type {
  IEventCard,
  IEventInfo,
  IEventMember,
  IEventNomination,
  IEventWinner,
  IRsvpCounts,
} from '../events/types'
import type { TPriceLevel } from '../venues/types'
import type { DateFormatter } from './date-formatter'
import type { Squads } from './squads'

/** The price levels the API can send, indexed by level, so a number is checked instead of cast. */
const PRICE_LEVELS: readonly TPriceLevel[] = [0, 1, 2, 3, 4]

/** The hour a new event starts at by default, on a 24-hour clock. */
const DEFAULT_START_HOUR = 20

/**
 * Event mapping and cache helpers, on the query client they refresh. Deps creates one; reach it
 * through useDeps().helpers.events. After a write the cached list and detail are invalidated
 * rather than edited by hand, so counts, previews and permissions always come from the server.
 */
export class Events {
  /** The cache the events live in. */
  private readonly queryClient: QueryClient

  /** Writes and reads the moments an event has. */
  private readonly dates: DateFormatter

  /** Maps the members of an event onto avatars. */
  private readonly squads: Squads

  /**
   * Builds the helpers on the cache they refresh.
   * @param queryClient - The TanStack Query cache.
   * @param dates - The date wording.
   * @param squads - The squad helpers, which map members onto avatars.
   */
  constructor(queryClient: QueryClient, dates: DateFormatter, squads: Squads) {
    this.queryClient = queryClient
    this.dates = dates
    this.squads = squads
  }

  /**
   * Maps a list item onto the card the Events tab draws.
   * @param summary - The list item.
   * @returns The card, with its moments written out.
   */
  toCard(summary: EventSummary): IEventCard {
    const status = summary.status ?? EventStatus.DRAFT
    const open = status !== EventStatus.CLOSED
    const myRsvp = summary.myRsvp ?? undefined
    const hasVoted = summary.hasVoted ?? false
    const winner = this.winnerOf(summary.winner ?? undefined)
    const startsAt = summary.startsAt ?? ''
    const closedAt = summary.closedAt ?? undefined

    return {
      going: (summary.goingPreview ?? []).map((member) => this.squads.toPerson(member)),
      hasVoted,
      id: summary.id ?? '',
      name: summary.name ?? '',
      needsAnswer: open && (myRsvp === undefined || (status === EventStatus.VOTING && !hasVoted)),
      nominationCount: summary.nominationCount ?? 0,
      rsvpCounts: this.toCounts(summary.rsvpCounts),
      squadId: summary.squadID ?? '',
      startsAt,
      status,
      type: summary.type ?? EventType.DRINKS,
      votingCloses: this.dates.deadline(summary.votingDeadline ?? startsAt),
      when: this.dates.eventWhen(startsAt),
      ...(closedAt === undefined ? {} : { closedOn: this.dates.day(closedAt) }),
      ...(myRsvp === undefined ? {} : { myRsvp }),
      ...(winner === undefined ? {} : { winner }),
    }
  }

  /**
   * Maps an event's detail answer onto what its page shows.
   * @param detail - The detail answer.
   * @param meId - The signed-in person's user ID; undefined while unknown.
   * @returns The event with its members counted and its places listed.
   */
  toInfo(detail: EventDetail, meId: string | undefined): IEventInfo {
    const members = (detail.members ?? []).map((member) => this.toMember(member))
    const startsAt = detail.startsAt ?? ''
    const myRsvp = detail.myRsvp ?? undefined
    const permissions = detail.permissions
    const createdByName = detail.createdByName ?? undefined
    const myVote = detail.myVote ?? undefined
    const votingDeadline = detail.votingDeadline ?? startsAt

    return {
      createdByMe: detail.createdBy !== undefined && detail.createdBy === meId,
      going: members.filter((member) => member.rsvp === RSVPStatus.GOING),
      id: detail.id ?? '',
      memberCount: detail.memberCount ?? members.length,
      members,
      name: detail.name ?? '',
      nominations: (detail.nominations ?? []).map((nomination) =>
        this.toNomination(nomination, meId),
      ),
      permissions: {
        canNominate: permissions?.canNominate ?? false,
        canRsvp: permissions?.canRsvp ?? false,
        canStartVoting: permissions?.canStartVoting ?? false,
        canVote: permissions?.canVote ?? false,
      },
      rsvpCounts: this.countMembers(members),
      squadId: detail.squadID ?? '',
      status: detail.status ?? EventStatus.DRAFT,
      type: detail.type ?? EventType.DRINKS,
      votedCount: detail.votedCount ?? 0,
      votingCloses: this.dates.eventWhen(votingDeadline),
      votingDeadline,
      when: this.dates.eventWhen(startsAt),
      ...(createdByName === undefined ? {} : { createdByName }),
      ...(myRsvp === undefined ? {} : { myRsvp }),
      ...(myVote === undefined ? {} : { myVote }),
    }
  }

  /**
   * Picks the event to put in front of the person: of the events that wait for an answer, the one
   * that starts first.
   * @param cards - The events loaded so far.
   * @returns The most urgent event, or undefined when nothing waits for the person.
   */
  mostUrgent(cards: readonly IEventCard[]): IEventCard | undefined {
    return cards
      .filter((card) => card.needsAnswer)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]
  }

  /**
   * The moment a new event starts at unless the person picks one: tomorrow at 8 pm.
   * @param now - The current time in milliseconds.
   * @returns The moment, in the device's time zone.
   */
  defaultStart(now: number): Date {
    return this.dates.tomorrowAt(now, DEFAULT_START_HOUR)
  }

  /**
   * Marks the squad's event list, and one event's detail when given, as out of date. Whatever is
   * on screen loads again, and this waits for it, so a screen shows the new state; the rest loads
   * when next shown.
   * @param squadId - The squad whose events changed.
   * @param eventId - The event whose detail changed; leave out when only the list did.
   */
  async changed(squadId: string, eventId?: string): Promise<void> {
    const detail =
      eventId === undefined
        ? []
        : [this.queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) })]

    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: getListSquadEventsQueryKey(squadId) }),
      ...detail,
    ])
  }

  /**
   * Puts a write's answer, the event's new detail, in the cache in place of the old, and marks the
   * squad's event list as out of date, so the list's counts load again.
   * @param squadId - The squad whose events changed.
   * @param eventId - The event the answer is for.
   * @param answer - The answer of a write that returns the event's detail, such as a suggestion.
   */
  async written(squadId: string, eventId: string, answer: GetEvent200): Promise<void> {
    this.queryClient.setQueryData(getGetEventQueryKey(eventId), answer)

    await this.queryClient.invalidateQueries({ queryKey: getListSquadEventsQueryKey(squadId) })
  }

  /**
   * Maps the place an event ended up at.
   * @param winner - The winner the API sent, if the event has one.
   * @returns The place's name and address, or undefined before there is one.
   */
  private winnerOf(winner: EventPlace | undefined): IEventWinner | undefined {
    if (winner?.name === undefined) return undefined

    return {
      name: winner.name,
      ...(winner.address === undefined || winner.address === '' ? {} : { address: winner.address }),
    }
  }

  /**
   * Maps the counts of a list item, with a missing count as none.
   * @param counts - The counts the API sent.
   * @returns The four counts.
   */
  private toCounts(counts: RSVPCounts | undefined): IRsvpCounts {
    return {
      going: counts?.going ?? 0,
      maybe: counts?.maybe ?? 0,
      notGoing: counts?.notGoing ?? 0,
      pending: counts?.pending ?? 0,
    }
  }

  /**
   * Counts the members of an event by their answer.
   * @param members - The members, each with their answer if they gave one.
   * @returns The four counts.
   */
  private countMembers(members: readonly IEventMember[]): IRsvpCounts {
    return {
      going: this.countOf(members, RSVPStatus.GOING),
      maybe: this.countOf(members, RSVPStatus.MAYBE),
      notGoing: this.countOf(members, RSVPStatus.NOT_GOING),
      pending: members.filter((member) => member.rsvp === undefined).length,
    }
  }

  /**
   * Counts the members who gave an answer.
   * @param members - The members, each with their answer if they gave one.
   * @param status - The answer to count.
   * @returns How many gave it.
   */
  private countOf(members: readonly IEventMember[], status: RSVPStatus): number {
    return members.filter((member) => member.rsvp === status).length
  }

  /**
   * Maps a member of an event.
   * @param member - The member the API sent.
   * @returns The person with their answer.
   */
  private toMember(member: EventMember): IEventMember {
    const rsvp = member.rsvp ?? undefined

    return {
      ...this.squads.toPerson(member),
      isMe: member.isMe ?? false,
      ...(rsvp === undefined ? {} : { rsvp }),
    }
  }

  /**
   * Maps one suggested place.
   * @param nomination - The place the API sent.
   * @param meId - The signed-in person's user ID.
   * @returns The place with who suggested it.
   */
  private toNomination(nomination: Nomination, meId: string | undefined): IEventNomination {
    const rating = nomination.rating ?? 0
    const nominatedByName = nomination.nominatedByName ?? undefined
    const address = nomination.address ?? ''

    return {
      canRemove: nomination.canRemove ?? false,
      id: nomination.placeID ?? '',
      name: nomination.name ?? '',
      nominatedByMe: nomination.nominatedBy !== undefined && nomination.nominatedBy === meId,
      priceLevel: PRICE_LEVELS[nomination.priceLevel ?? 0] ?? 0,
      votedByMe: nomination.votedByMe ?? false,
      voteCount: nomination.voteCount ?? 0,
      voters: (nomination.voters ?? []).map((voter) => this.squads.toPerson(voter)),
      ...(address === '' ? {} : { address }),
      ...(nominatedByName === undefined ? {} : { nominatedByName }),
      ...(rating > 0 ? { rating } : {}),
    }
  }
}
