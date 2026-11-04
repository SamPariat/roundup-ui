import { act, renderHook } from '@testing-library/react-native'

import type { INameViewModel } from '../../src/auth/useNameViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useNameViewModel } from '../../src/auth/useNameViewModel'
import { Fakes } from '../helpers/fakes'
import { TestCore } from '../helpers/wrapper'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: INameViewModel
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/**
 * Name view model test helpers. Static methods only.
 */
class NameTestHelper {
  /**
   * Renders the view model inside a CoreProvider with fakes.
   * @param core - The fakes to render in.
   * @returns The rendered hook.
   */
  static setup(core: ITestCore = TestCore.create()): Promise<IRendered> {
    return renderHook(() => useNameViewModel(), { wrapper: core.wrapper })
  }
}

describe('useNameViewModel', () => {
  it.each(['', ' '.repeat(3), 'x'.repeat(51)])('rejects %j without a request', async (typed) => {
    const network = Fakes.stubNetwork({})
    const { result } = await NameTestHelper.setup()

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
    const network = Fakes.stubNetwork({ 'PATCH /api/v1/users/me': Fakes.ok({ name: 'Asha' }) })
    const core = TestCore.create()
    const invalidate = jest.spyOn(core.queryClient, 'invalidateQueries')
    const { result } = await NameTestHelper.setup(core)

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
    Fakes.stubNetwork({ 'PATCH /api/v1/users/me': Fakes.failure(status, 'nope') })

    const { result } = await NameTestHelper.setup()

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
    Fakes.goOffline()

    const { result } = await NameTestHelper.setup()

    await act(() => {
      result.current.setName('Asha')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.offline')
  })
})
