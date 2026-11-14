import { act, renderHook, waitFor } from '@testing-library/react-native'

import { EventStatus, HttpStatus, RSVPStatus } from '@roundup/api'

import { useEvent } from '../../src/events/useEvent'
import { EventFixtures, SESSION } from '../helpers/event-fixtures'
import { Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'

/**
 * useEvent test helpers. Static methods only.
 */
class VoteFixtures {
  /**
   * Serves voting event e1 with these votes on its two places.
   * @param p1 - Votes on Skyline Bar, none of them the person's.
   * @param p2 - Votes on Brew Cafe.
   * @param mine - Whether one of Brew Cafe's votes is the person's.
   */
  static serve(p1: number, p2: number, mine: boolean): void {
    const [place] = EventFixtures.detail('e1').nominations ?? []

    Fakes.stubNetwork({
      ...SESSION,
      'GET /api/v1/events/e1': Fakes.ok(
        EventFixtures.detail('e1', {
          myVote: mine ? 'p2' : null,
          nominations: [
            { ...place, voteCount: p1, votedByMe: false },
            { ...place, name: 'Brew Cafe', placeID: 'p2', voteCount: p2, votedByMe: mine },
          ],
          status: EventStatus.VOTING,
        }),
      ),
    })
  }
}

describe('useEvent', () => {
  it('maps the detail: who started it, who is going, the places and the permissions', async () => {
    Fakes.stubNetwork({ ...SESSION, 'GET /api/v1/events/e1': Fakes.ok(EventFixtures.detail('e1')) })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.event).toBeDefined()
    })

    expect(result.current.event).toMatchObject({
      createdByMe: true,
      going: [{ id: 'u2', name: 'Meera' }],
      nominations: [{ canRemove: true, id: 'p1', name: 'Skyline Bar', nominatedByName: 'Meera' }],
      permissions: { canRsvp: true, canStartVoting: true },
      rsvpCounts: { going: 1, maybe: 0, notGoing: 0, pending: 1 },
    })
  })

  it('loads the event again on refresh', async () => {
    const network = Fakes.stubNetwork({
      ...SESSION,
      'GET /api/v1/events/e1': Fakes.ok(EventFixtures.detail('e1')),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.event).toBeDefined()
    })

    /**
     * Counts the event's loads so far.
     * @returns How many times the event was asked for.
     */
    const loads = (): number =>
      network.requests.filter((request) => request.path === '/api/v1/events/e1').length

    const before = loads()

    await act(async () => {
      await result.current.refresh()
    })

    expect(loads()).toBe(before + 1)
  })

  it("reports votes and changed votes from the rest of the squad, but not the person's own", async () => {
    VoteFixtures.serve(1, 0, false)

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1', true), { wrapper: core.wrapper })

    /**
     * Loads the event again and waits until the hook shows the new answer.
     * @param check - What holds once the new answer is in.
     */
    const reload = async (check: () => void): Promise<void> => {
      await act(async () => {
        await result.current.refresh()
      })

      await waitFor(check)
    }

    await waitFor(() => {
      expect(result.current.event).toBeDefined()
    })

    // The person votes for Brew Cafe: one more vote, but it is theirs.
    VoteFixtures.serve(1, 1, true)

    await reload(() => {
      expect(result.current.event?.myVote).toBe('p2')
    })

    expect(result.current.freshVotes).toBeUndefined()

    // Someone moves their vote from Skyline Bar to Brew Cafe: no new votes, but the votes changed.
    VoteFixtures.serve(0, 2, true)

    await reload(() => {
      expect(result.current.freshVotes).toEqual({ count: 0, id: 1 })
    })

    // Two more vote for Skyline Bar.
    VoteFixtures.serve(2, 2, true)

    await reload(() => {
      expect(result.current.freshVotes).toEqual({ count: 2, id: 2 })
    })
  })

  it('says not found for an event that is not there', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      'GET /api/v1/events/e1': Fakes.failure(HttpStatus.notFound, 'nope'),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.notFound).toBe(true)
    })
  })

  it('answers, takes a suggestion back and starts voting, each time loading the event again', async () => {
    const network = Fakes.stubNetwork({
      ...SESSION,
      'DELETE /api/v1/events/e1/nominations/p1': Fakes.ok(EventFixtures.detail('e1')),
      'GET /api/v1/events/e1': Fakes.ok(EventFixtures.detail('e1')),
      'POST /api/v1/events/e1/voting/start': Fakes.ok(
        EventFixtures.detail('e1', { status: EventStatus.VOTING }),
      ),
      'PUT /api/v1/events/e1/rsvp': Fakes.ok(EventFixtures.detail('e1')),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.event).toBeDefined()
    })

    await act(async () => {
      await result.current.rsvp(RSVPStatus.GOING)
    })

    await act(async () => {
      await result.current.remove(result.current.event!.nominations[0]!)
    })

    await act(async () => {
      await result.current.start()
    })

    const calls = network.requests.map((request) => `${request.method} ${request.path}`)

    expect(calls).toContain('PUT /api/v1/events/e1/rsvp')
    expect(calls).toContain('DELETE /api/v1/events/e1/nominations/p1')
    expect(calls).toContain('POST /api/v1/events/e1/voting/start')
    expect(calls.filter((call) => call === 'GET /api/v1/events/e1').length).toBeGreaterThan(1)
  })

  it('votes for a place, loading the event again, and sends nothing for the place already voted for', async () => {
    const network = Fakes.stubNetwork({
      ...SESSION,
      'GET /api/v1/events/e1': Fakes.ok(
        EventFixtures.detail('e1', { myVote: 'p1', status: EventStatus.VOTING }),
      ),
      'PUT /api/v1/events/e1/vote': Fakes.ok(
        EventFixtures.detail('e1', { myVote: 'p2', status: EventStatus.VOTING }),
      ),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.event?.myVote).toBe('p1')
    })

    const [skyline] = result.current.event!.nominations
    const other = { ...skyline!, id: 'p2' }
    let same: boolean | undefined

    await act(async () => {
      same = await result.current.vote(skyline!)
    })

    expect(same).toBe(false)
    expect(network.requests.filter((request) => request.path.endsWith('/vote'))).toEqual([])

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.vote(other)
    })

    expect(done).toBe(true)
    expect(result.current.votingId).toBeUndefined()

    expect(network.requests.find((request) => request.path.endsWith('/vote'))?.body).toEqual({
      placeID: 'p2',
    })
  })

  it('shows the place a vote is being sent for while it is sent', async () => {
    const gate = Promise.withResolvers<boolean>()

    Fakes.stubNetwork({
      ...SESSION,
      'GET /api/v1/events/e1': Fakes.ok(EventFixtures.detail('e1')),
      'PUT /api/v1/events/e1/vote': {
        ...Fakes.ok(EventFixtures.detail('e1')),
        gate: gate.promise,
      },
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.event).toBeDefined()
    })

    let sent: Promise<boolean> | undefined

    await act(() => {
      sent = result.current.vote(result.current.event!.nominations[0]!)
    })

    expect(result.current.votingId).toBe('p1')

    await act(async () => {
      gate.resolve(true)
      await sent
    })

    expect(result.current.votingId).toBeUndefined()
  })

  it('maps a conflict on starting voting to its message', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      'GET /api/v1/events/e1': Fakes.ok(EventFixtures.detail('e1')),
      'POST /api/v1/events/e1/voting/start': Fakes.failure(HttpStatus.conflict, 'nope'),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useEvent('e1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.event).toBeDefined()
    })

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.error).toBe('errors.eventChanged')
    expect(result.current.starting).toBe(false)
  })
})
