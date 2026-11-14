import type {
  IEventCard,
  IEventInfo,
  IEventNomination,
  IFavoriteRow,
  IRsvpCounts,
  IVenueCard,
  IVisitRow,
} from '@roundup/core'
import type { useT } from '@roundup/i18n'
import type { TBadgeProps, TIconName } from '@roundup/ui'

import { EventStatus, EventType, RSVPStatus } from '@roundup/core'

import { SavedBy } from '@/components/squads/saved-by'

/** The translator `useT` gives, with its keys checked. */
type TTranslate = ReturnType<typeof useT>['t']

/** The answers a member can give, in the order the chips show them. */
const ANSWERS: readonly RSVPStatus[] = [RSVPStatus.GOING, RSVPStatus.MAYBE, RSVPStatus.NOT_GOING]

/** The badge color of each status. */
const TONES: Record<EventStatus, NonNullable<TBadgeProps['tone']>> = {
  [EventStatus.ACTIVE]: 'highlight',
  [EventStatus.CLOSED]: 'neutral',
  [EventStatus.CONFIRMED]: 'success',
  [EventStatus.DRAFT]: 'neutral',
  [EventStatus.VOTING]: 'info',
}

/**
 * The words and looks of an event: its type, its status, the line under its name and who is
 * coming. Static methods only.
 */
export class EventText {
  /** The answers a member can give, in the order the chips show them. */
  static readonly answers: readonly RSVPStatus[] = ANSWERS

  /**
   * Names an answer for its chip.
   * @param t - The translator.
   * @param status - Going, maybe or not going.
   * @returns "Going", "Maybe" or "Can't make it".
   */
  static answer(t: TTranslate, status: RSVPStatus): string {
    switch (status) {
      case RSVPStatus.GOING: {
        return t('screens.events.rsvp.going')
      }

      case RSVPStatus.MAYBE: {
        return t('screens.events.rsvp.maybe')
      }

      case RSVPStatus.NOT_GOING: {
        return t('screens.events.rsvp.notGoing')
      }
    }
  }

  /**
   * Names the kind of night.
   * @param t - The translator.
   * @param type - Drinks, dining or both.
   * @returns "Drinks", "Dining" or "Drinks and dinner".
   */
  static type(t: TTranslate, type: EventType): string {
    switch (type) {
      case EventType.BOTH: {
        return t('screens.events.type.both')
      }

      case EventType.DINING: {
        return t('screens.events.type.dining')
      }

      case EventType.DRINKS: {
        return t('screens.events.type.drinks')
      }
    }
  }

  /**
   * Names where an event is in its life.
   * @param t - The translator.
   * @param status - Where the event is in its life.
   * @returns "Planning", "Voting", "Confirmed", "Tonight" or "Closed".
   */
  static status(t: TTranslate, status: EventStatus): string {
    switch (status) {
      case EventStatus.ACTIVE: {
        return t('screens.events.status.active')
      }

      case EventStatus.CLOSED: {
        return t('screens.events.status.closed')
      }

      case EventStatus.CONFIRMED: {
        return t('screens.events.status.confirmed')
      }

      case EventStatus.DRAFT: {
        return t('screens.events.status.draft')
      }

      case EventStatus.VOTING: {
        return t('screens.events.status.voting')
      }
    }
  }

  /**
   * The color of a status badge.
   * @param status - Where the event is in its life.
   * @returns The badge tone.
   */
  static tone(status: EventStatus): NonNullable<TBadgeProps['tone']> {
    return TONES[status]
  }

  /**
   * The icon in front of an event card's detail line: a pin once there is a place, a clock before.
   * @param status - Where the event is in its life.
   * @returns The icon name.
   */
  static icon(status: EventStatus): TIconName {
    return status === EventStatus.CONFIRMED || status === EventStatus.ACTIVE ? 'pin' : 'clock'
  }

  /**
   * Says when and what kind of night: "Sat 31 Oct, 8:00 pm · Drinks".
   * @param t - The translator.
   * @param card - The event whose line it is.
   * @returns The line under the event's name.
   */
  static whenLine(t: TTranslate, card: Pick<IEventCard, 'type' | 'when'>): string {
    return t('screens.events.line.when', {
      type: EventText.type(t, card.type),
      when: card.when,
    })
  }

  /**
   * The line that says what the event is up to: when voting closes, where it is, or how many places
   * are suggested.
   * @param t - The translator.
   * @param card - The event whose line it is.
   * @returns The detail line.
   */
  static detail(t: TTranslate, card: IEventCard): string {
    const count = card.nominationCount

    if (card.status === EventStatus.ACTIVE || card.status === EventStatus.CONFIRMED) {
      return EventText.where(t, card)
    }

    if (card.status === EventStatus.VOTING) {
      return t('screens.events.line.voting', { count, when: card.votingCloses })
    }

    return t('screens.events.line.draft', { count })
  }

  /**
   * The line of the card that asks for an answer: the places to vote on, and that the person has
   * not voted, or what the event is up to.
   * @param t - The translator.
   * @param card - The event whose line it is.
   * @returns The line.
   */
  static pending(t: TTranslate, card: IEventCard): string {
    if (card.status === EventStatus.VOTING && !card.hasVoted) {
      return t('screens.events.line.voted', { count: card.nominationCount })
    }

    return EventText.detail(t, card)
  }

  /**
   * Counts who is coming: "5 going · 7 to answer".
   * @param t - The translator.
   * @param counts - How many answered each way.
   * @returns The counts, joined with dots.
   */
  static rsvpSummary(t: TTranslate, counts: IRsvpCounts): string {
    const parts = [t('screens.events.counts.going', { count: counts.going })]

    if (counts.maybe > 0) parts.push(t('screens.events.counts.maybe', { count: counts.maybe }))

    if (counts.pending > 0) {
      parts.push(t('screens.events.counts.toAnswer', { count: counts.pending }))
    }

    return EventText.join(t, parts)
  }

  /**
   * Describes a past event for its row: "The Lantern Terrace · 17 Oct · 8 went".
   * @param t - The translator.
   * @param card - The closed event.
   * @returns The subtitle.
   */
  static pastLine(t: TTranslate, card: IEventCard): string {
    const parts = [
      ...(card.winner === undefined ? [] : [card.winner.name]),
      ...(card.closedOn === undefined ? [] : [card.closedOn]),
      t('screens.events.counts.went', { count: card.rsvpCounts.going }),
    ]

    return EventText.join(t, parts)
  }

  /**
   * Describes a suggested place for its row: "Suggested by Meera · 4.5 · ₹₹".
   * @param t - The translator.
   * @param nomination - The place.
   * @returns The subtitle.
   */
  static nominationLine(t: TTranslate, nomination: IEventNomination): string {
    const parts = [EventText.suggestedBy(t, nomination)]

    if (nomination.rating !== undefined) parts.push(nomination.rating.toFixed(1))

    if (nomination.priceLevel > 0) {
      parts.push(t('price.mark').repeat(nomination.priceLevel))
    }

    return EventText.join(t, parts)
  }

  /**
   * Describes a favorite for the Suggest a place sheet: "Saved by Meera and 2 others · 4.5".
   * @param t - The translator.
   * @param row - The favorite place, whose savers and rating the line reads.
   * @returns The subtitle.
   */
  static favoriteLine(t: TTranslate, row: IFavoriteRow): string {
    const parts = [SavedBy.sentence(t, row.savers)]

    if (row.rating !== undefined) parts.push(row.rating.toFixed(1))

    return EventText.join(
      t,
      parts.filter((part) => part !== ''),
    )
  }

  /**
   * Describes a place the squad has been to for the Suggest a place sheet: "Been 3 times · last 18th Oct 2026".
   * @param t - The translator.
   * @param row - The visited place.
   * @returns The subtitle.
   */
  static visitLine(t: TTranslate, row: IVisitRow): string {
    return t('screens.event.suggest.visits', { count: row.visitCount, date: row.lastVisitedOn })
  }

  /**
   * Describes a search result for the Suggest a place sheet: "4.5 · ₹₹ · 100 Feet Rd".
   * @param t - The translator.
   * @param venue - The place found.
   * @returns The subtitle, or undefined when nothing is known of it.
   */
  static venueLine(t: TTranslate, venue: IVenueCard): string | undefined {
    const parts = [
      ...(venue.rating === undefined ? [] : [venue.rating.toFixed(1)]),
      ...(venue.priceLevel > 0 ? [t('price.mark').repeat(venue.priceLevel)] : []),
      ...(venue.address === undefined ? [] : [venue.address]),
    ]

    return parts.length === 0 ? undefined : EventText.join(t, parts)
  }

  /**
   * Says what a member answered, for the "Who's coming" list.
   * @param t - The translator.
   * @param answer - Their answer; undefined while they have not answered.
   * @returns "Going", "Maybe", "Can't make it" or "Hasn't answered".
   */
  static memberLine(t: TTranslate, answer: RSVPStatus | undefined): string {
    return answer === undefined ? t('screens.event.noAnswer') : EventText.answer(t, answer)
  }

  /**
   * Says who started an event and when voting closes.
   * @param t - The translator.
   * @param event - The event whose starter it names.
   * @returns "Started by you · voting closes Thu 29 Oct, 9:00 pm", or the deadline alone when the starter has left.
   */
  static startedBy(t: TTranslate, event: IEventInfo): string {
    const when = event.votingCloses

    if (event.createdByMe) return t('screens.event.startedByYou', { when })

    if (event.createdByName === undefined) return t('screens.event.votingCloses', { when })

    return t('screens.event.startedBy', { name: event.createdByName, when })
  }

  /**
   * Says who suggested a place.
   * @param t - The translator.
   * @param nomination - The place.
   * @returns "Suggested by you", "Suggested by Meera" or a line for someone who has left.
   */
  private static suggestedBy(t: TTranslate, nomination: IEventNomination): string {
    if (nomination.nominatedByMe) return t('screens.event.suggestedByYou')

    if (nomination.nominatedByName === undefined) return t('screens.event.suggestedBySomeone')

    return t('screens.event.suggestedBy', { name: nomination.nominatedByName })
  }

  /**
   * Names where a confirmed event is: "Bombay Tiffin Co. · 12th Main, Indiranagar".
   * @param t - The translator.
   * @param card - The event that has a place.
   * @returns The place, or when it starts while no place is chosen.
   */
  private static where(t: TTranslate, card: IEventCard): string {
    if (card.winner === undefined) return t('screens.events.line.tonight', { when: card.when })

    return EventText.join(
      t,
      card.winner.address === undefined
        ? [card.winner.name]
        : [card.winner.name, card.winner.address],
    )
  }

  /**
   * Joins the parts of a line with a dot.
   * @param t - The translator.
   * @param parts - The parts, at least one.
   * @returns The line.
   */
  private static join(t: TTranslate, parts: readonly string[]): string {
    return parts.reduce((line, part) => t('screens.events.join', { first: line, second: part }))
  }
}
