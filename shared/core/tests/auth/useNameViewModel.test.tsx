import { act, renderHook } from '@testing-library/react-native'

import type { NameViewModel } from '../../src/auth/useNameViewModel.ts'
import type { TestCore } from '../helpers/wrapper.tsx'

import { useNameViewModel } from '../../src/auth/useNameViewModel.ts'
import { failure, goOffline, ok, stubNetwork } from '../helpers/fakes.ts'
import { createTestCore } from '../helpers/wrapper.tsx'

/** The latest value of a hook under test. */
interface Current {
  /** The view model as of the last render. */
  current: NameViewModel
}

/** What renderHook hands back for this view model. */
interface Rendered {
  /** Holds the latest view model. */
  result: Current
}

/**
 * Renders the view model inside a CoreProvider with fakes.
 * @param core - The fakes to render in.
 * @returns The rendered hook.
 */
const setup = (core: TestCore = createTestCore()): Promise<Rendered> =>
  renderHook(() => useNameViewModel(), { wrapper: core.wrapper })

describe('useNameViewModel', () => {
  it.each(['', ' '.repeat(3), 'x'.repeat(51)])('rejects %j without a request', async (typed) => {
    const network = stubNetwork({})
    const { result } = await setup()

    await act(() => {
      result.current.setName(typed)
    })

    let saved: boolean | undefined

    await act(async () => {
      saved = await result.current.submit()
    })

    expect(saved).toBe(false)
    expect(result.current.error).toBe('errors.invalidName')
    expect(network.requests).toHaveLength(0)
  })

  it('saves the trimmed name and refreshes the profile', async () => {
    const network = stubNetwork({ 'PATCH /api/v1/users/me': ok({ name: 'Asha' }) })
    const core = createTestCore()
    const invalidate = jest.spyOn(core.queryClient, 'invalidateQueries')
    const { result } = await setup(core)

    await act(() => {
      result.current.setName('  Asha  ')
    })

    let saved: boolean | undefined

    await act(async () => {
      saved = await result.current.submit()
    })

    expect(saved).toBe(true)
    expect(network.requests[0]?.body).toEqual({ name: 'Asha' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['/api/v1/users/me'] })
  })

  it.each([
    [400, 'errors.invalidName'],
    [500, 'errors.genericWithId'],
  ] as const)('maps a %i to %s', async (status, key) => {
    stubNetwork({ 'PATCH /api/v1/users/me': failure(status, 'nope') })

    const { result } = await setup()

    await act(() => {
      result.current.setName('Asha')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe(key)
    expect(result.current.busy).toBe(false)
  })

  it('says offline when there is no connection', async () => {
    goOffline()

    const { result } = await setup()

    await act(() => {
      result.current.setName('Asha')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.offline')
  })
})
