import { act, renderHook } from '@testing-library/react-native'

import { EventType, HttpStatus } from '@roundup/api'

import { useCreateEventViewModel } from '../../src/events/useCreateEventViewModel'
import { Fakes } from '../helpers/fakes'
import { TestCore } from '../helpers/wrapper'

/** The clock of the tests: Wednesday, 11 November 2026, at noon. */
const NOW = new Date(2026, 10, 11, 12).getTime()

/**
 * Reads the test clock.
 * @returns The fixed time, in milliseconds since the epoch.
 */
const clock = (): number => NOW

/**
 * Renders the view model inside a CoreProvider with fakes and the test clock.
 * @returns The view hook.
 */
const setup = (): ReturnType<
  typeof renderHook<ReturnType<typeof useCreateEventViewModel>, unknown>
> => {
  const core = TestCore.create({ now: clock })

  return renderHook(() => useCreateEventViewModel('s1'), { wrapper: core.wrapper })
}

describe('useCreateEventViewModel', () => {
  it('starts as drinks, tomorrow at 8 pm, with voting closing when it starts', async () => {
    const { result } = await setup()

    expect(result.current.type).toBe(EventType.DRINKS)
    expect(result.current.startsAt.getTime()).toBe(new Date(2026, 10, 12, 20).getTime())
    expect(result.current.votingCloses).toBe(result.current.startsAt)
  })

  it('rejects a blank name without a request', async () => {
    const network = Fakes.stubNetwork({})
    const { result } = await setup()

    await act(async () => {
      expect(await result.current.submit()).toBeUndefined()
    })

    expect(result.current.error).toBe('errors.invalidEventName')
    expect(result.current.invalid).toBe('name')
    expect(network.requests).toHaveLength(0)
  })

  it('rejects a start in the past and a deadline after the start', async () => {
    const network = Fakes.stubNetwork({})
    const { result } = await setup()

    await act(() => {
      result.current.setName('Drinks')
      result.current.setStartsAt(new Date(2026, 10, 10, 20))
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.invalid).toBe('times')
    expect(result.current.error).toBe('errors.invalidEventTimes')

    await act(() => {
      result.current.setStartsAt(new Date(2026, 10, 14, 20))
      result.current.setVotingCloses(new Date(2026, 10, 15, 20))
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.invalid).toBe('times')
    expect(network.requests).toHaveLength(0)
  })

  it('creates the event with the trimmed name and only the deadline the person picked', async () => {
    const network = Fakes.stubNetwork({
      'POST /api/v1/squads/s1/events': {
        body: { data: { id: 'e9' }, success: true },
        status: HttpStatus.created,
      },
    })

    const { result } = await setup()

    await act(() => {
      result.current.setName('  Saturday night out ')
      result.current.setType(EventType.BOTH)
    })

    let id: string | undefined

    await act(async () => {
      id = await result.current.submit()
    })

    expect(id).toBe('e9')

    expect(network.requests[0]?.body).toEqual({
      name: 'Saturday night out',
      startsAt: expect.stringMatching(/^2026-11-12T20:00:00[+-]/) as string,
      type: 'BOTH',
    })
  })

  it('maps a 400 from the server to its message', async () => {
    Fakes.stubNetwork({
      'POST /api/v1/squads/s1/events': Fakes.failure(HttpStatus.badRequest, 'no'),
    })

    const { result } = await setup()

    await act(() => {
      result.current.setName('Drinks')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.invalidEvent')
    expect(result.current.invalid).toBeUndefined()
  })
})
