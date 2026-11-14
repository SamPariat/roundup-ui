import { QueryClient } from '@tanstack/react-query'

import type { EventSummary } from '@roundup/api'

import { EventStatus, RSVPStatus } from '@roundup/api'

import { DateFormatter } from '../../src/helpers/date-formatter'
import { Events } from '../../src/helpers/events'
import { Squads } from '../../src/helpers/squads'

/** The helper under test, on a cache of its own. */
const queryClient = new QueryClient()

const events = new Events(
  queryClient,
  new DateFormatter(),
  new Squads(queryClient, new DateFormatter()),
)

/**
 * Builds a list item.
 * @param overrides - Fields to change.
 * @returns An open event nobody has answered.
 */
const summary = (overrides: Partial<EventSummary> = {}): EventSummary => ({
  closedAt: null,
  goingPreview: [{ avatarURL: '', name: 'Meera', userID: 'u2' }],
  hasVoted: false,
  id: 'e1',
  myRsvp: null,
  name: 'Saturday night out',
  nominationCount: 3,
  rsvpCounts: { going: 5, maybe: 1, notGoing: 0, pending: 6 },
  squadID: 's1',
  startsAt: new Date(2026, 9, 31, 20).toISOString(),
  status: EventStatus.VOTING,
  type: 'DRINKS',
  votingDeadline: new Date(2026, 9, 29, 21).toISOString(),
  winner: null,
  ...overrides,
})

describe('Events.toCard', () => {
  it('writes the moments and keeps the counts and who is going', () => {
    expect(events.toCard(summary())).toMatchObject({
      going: [{ id: 'u2', name: 'Meera' }],
      id: 'e1',
      needsAnswer: true,
      nominationCount: 3,
      rsvpCounts: { going: 5, maybe: 1, notGoing: 0, pending: 6 },
      votingCloses: 'Thu, 9:00 pm',
      when: 'Sat 31st Oct 2026, 8:00 pm',
    })
  })

  it('needs an answer until the person has answered and, while voting, voted', () => {
    expect(events.toCard(summary({ myRsvp: RSVPStatus.GOING })).needsAnswer).toBe(true)

    expect(events.toCard(summary({ hasVoted: true, myRsvp: RSVPStatus.GOING })).needsAnswer).toBe(
      false,
    )

    expect(
      events.toCard(summary({ myRsvp: RSVPStatus.GOING, status: EventStatus.CONFIRMED }))
        .needsAnswer,
    ).toBe(false)

    expect(events.toCard(summary({ status: EventStatus.CLOSED })).needsAnswer).toBe(false)
  })

  it('names the winner and the day a closed event closed', () => {
    const card = events.toCard(
      summary({
        closedAt: new Date(2026, 9, 17, 23).toISOString(),
        status: EventStatus.CLOSED,
        winner: { address: '12th Main', name: 'The Lantern Terrace' },
      }),
    )

    expect(card.winner).toEqual({ address: '12th Main', name: 'The Lantern Terrace' })
    expect(card.closedOn).toBe('17th Oct 2026')
  })
})

describe('Events.mostUrgent', () => {
  it('picks the soonest event that waits for an answer', () => {
    const later = events.toCard(
      summary({ id: 'e2', startsAt: new Date(2026, 10, 6).toISOString() }),
    )

    const sooner = events.toCard(summary({ id: 'e3' }))

    const answered = events.toCard(
      summary({
        hasVoted: true,
        id: 'e4',
        myRsvp: RSVPStatus.GOING,
        startsAt: '2026-01-01T00:00:00Z',
      }),
    )

    expect(events.mostUrgent([later, answered, sooner])?.id).toBe('e3')
    expect(events.mostUrgent([answered])).toBeUndefined()
  })
})

describe('Events.defaultStart', () => {
  it('is tomorrow at 8 pm', () => {
    expect(events.defaultStart(new Date(2026, 10, 11, 12).getTime()).getTime()).toBe(
      new Date(2026, 10, 12, 20).getTime(),
    )
  })
})

describe('Events.changed', () => {
  it('invalidates the squad list and the event', async () => {
    const spy = jest.spyOn(queryClient, 'invalidateQueries')

    await events.changed('s1', 'e1')

    expect(spy).toHaveBeenCalledWith({ queryKey: ['/api/v1/squads/s1/events'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['/api/v1/events/e1'] })
  })
})
