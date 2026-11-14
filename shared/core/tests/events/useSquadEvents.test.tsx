import { act, renderHook, waitFor } from '@testing-library/react-native'

import { EventStatus, HttpStatus, RSVPStatus } from '@roundup/api'

import { useSquadEvents } from '../../src/events/useSquadEvents'
import { EventFixtures, SESSION } from '../helpers/event-fixtures'
import { Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'

/** The first page of a squad's events. */
const FIRST = '/api/v1/squads/s1/events?limit=25'

describe('useSquadEvents', () => {
  it('splits open and closed events, counts the open ones and picks the one that needs an answer', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(
        EventFixtures.page(
          [
            EventFixtures.summary('e1', { myRsvp: RSVPStatus.GOING }),
            EventFixtures.summary('e2'),
            EventFixtures.summary('e3', {
              closedAt: '2026-10-17T10:00:00Z',
              status: EventStatus.CLOSED,
            }),
          ],
          null,
          2,
        ),
      ),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadEvents('s1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.upcoming).toHaveLength(2)
    })

    expect(result.current.past.map((event) => event.id)).toEqual(['e3'])
    expect(result.current.openCount).toBe(2)
    expect(result.current.needsAnswer?.id).toBe('e2')
    expect(result.current.past[0]?.closedOn).toBe('17th Oct 2026')
  })

  it('loads the next page on loadMore', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(EventFixtures.page([EventFixtures.summary('e1')], 'c2', 1)),
      [`GET ${FIRST}&cursor=c2`]: Fakes.ok(
        EventFixtures.page([EventFixtures.summary('e2')], null, 1),
      ),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadEvents('s1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true)
    })

    await act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.upcoming).toHaveLength(2)
    })

    expect(result.current.hasMore).toBe(false)
  })

  it('sends an answer and loads the list again', async () => {
    const network = Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(EventFixtures.page([EventFixtures.summary('e1')])),
      'PUT /api/v1/events/e1/rsvp': Fakes.ok(EventFixtures.detail('e1')),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadEvents('s1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.upcoming).toHaveLength(1)
    })

    let done = false

    await act(async () => {
      done = await result.current.rsvp(result.current.upcoming[0]!, RSVPStatus.MAYBE)
    })

    expect(done).toBe(true)

    expect(network.requests.find((request) => request.method === 'PUT')?.body).toEqual({
      status: 'MAYBE',
    })

    await waitFor(() => {
      expect(network.requests.filter((request) => request.path === FIRST)).toHaveLength(2)
    })
  })

  it('reports a failed answer', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(EventFixtures.page([EventFixtures.summary('e1')])),
      'PUT /api/v1/events/e1/rsvp': Fakes.failure(HttpStatus.internalServerError, 'nope'),
    })

    const core = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadEvents('s1'), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.upcoming).toHaveLength(1)
    })

    await act(async () => {
      await result.current.rsvp(result.current.upcoming[0]!, RSVPStatus.GOING)
    })

    expect(result.current.error).toBe('errors.genericWithId')
    expect(result.current.answering).toBeUndefined()
  })
})
