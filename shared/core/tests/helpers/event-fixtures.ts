import type { EventDetail, EventSummary, ListSquadEvents200 } from '@roundup/api'

import { EventStatus, EventType } from '@roundup/api'

import { Fakes } from './fakes'

/** The answers every signed-in test needs: a refreshed session and the person's profile. */
export const SESSION = {
  'GET /api/v1/users/me': Fakes.ok({
    avatarURL: '',
    createdAt: '2026-01-01T00:00:00Z',
    id: 'u1',
    name: 'Asha',
    phone: '+919876543210',
    updatedAt: '2026-01-01T00:00:00Z',
  }),
  'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
}

/**
 * Event data for the event tests. Static methods only.
 */
export class EventFixtures {
  /**
   * Builds a list item.
   * @param id - Which event; the name is built from it.
   * @param overrides - Fields to change.
   * @returns An open draft that the signed-in person has not answered.
   */
  static summary(id: string, overrides: Partial<EventSummary> = {}): EventSummary {
    return {
      closedAt: null,
      goingPreview: [],
      hasVoted: false,
      id,
      myRsvp: null,
      name: `Event ${id}`,
      nominationCount: 0,
      rsvpCounts: { going: 0, maybe: 0, notGoing: 0, pending: 2 },
      squadID: 's1',
      startsAt: '2026-11-14T14:30:00Z',
      status: EventStatus.DRAFT,
      type: EventType.DRINKS,
      votingDeadline: '2026-11-12T15:30:00Z',
      winner: null,
      ...overrides,
    }
  }

  /**
   * Builds the list answer for one page.
   * @param events - The page's items.
   * @param nextCursor - The cursor of the next page; null on the last.
   * @param openCount - How many events are open.
   * @returns The answer's data.
   */
  static page(
    events: EventSummary[],
    nextCursor: null | string = null,
    openCount = events.length,
  ): ListSquadEvents200['data'] {
    return { events, nextCursor, openCount }
  }

  /**
   * Builds an event's detail where u1, the signed-in person, started it.
   * @param id - Which event.
   * @param overrides - Fields to change.
   * @returns A draft with two members and one suggested place.
   */
  static detail(id: string, overrides: Partial<EventDetail> = {}): EventDetail {
    return {
      ...EventFixtures.summary(id),
      createdBy: 'u1',
      createdByName: 'Asha',
      memberCount: 2,
      members: [
        { avatarURL: '', isMe: true, name: 'Asha', rsvp: null, userID: 'u1' },
        { avatarURL: '', isMe: false, name: 'Meera', rsvp: 'GOING', userID: 'u2' },
      ],
      nominations: [
        {
          canRemove: true,
          name: 'Skyline Bar',
          nominatedBy: 'u2',
          nominatedByName: 'Meera',
          placeID: 'p1',
          priceLevel: 2,
          rating: 4.5,
        },
      ],
      permissions: { canRsvp: true, canStartVoting: true },
      votedCount: 0,
      ...overrides,
    }
  }
}
