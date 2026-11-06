import { act, renderHook } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

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
class NameFixtures {
  /**
   * Renders the view model inside a CoreProvider with fakes.
   * @param core - The fakes to render in.
   * @param initialName - The name the field starts with.
   * @returns The rendered hook.
   */
  static setup(core: ITestCore = TestCore.create(), initialName?: string): Promise<IRendered> {
    return renderHook(() => useNameViewModel(initialName), { wrapper: core.wrapper })
  }
}

describe('useNameViewModel', () => {
  it.each(['', ' '.repeat(3), 'x'.repeat(51)])('rejects %j without a request', async (typed) => {
    const network = Fakes.stubNetwork({})
    const { result } = await NameFixtures.setup()

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

  it('saves the trimmed name and caches the saved profile without fetching it again', async () => {
    const network = Fakes.stubNetwork({ 'PATCH /api/v1/users/me': Fakes.ok({ name: 'Asha' }) })
    const core = TestCore.create()
    const { result } = await NameFixtures.setup(core)

    await act(() => {
      result.current.setName('  Asha  ')
    })

    let saved: boolean | undefined

    await act(async () => {
      saved = await result.current.submit()
    })

    expect(saved).toBe(true)
    expect(network.requests[0]?.body).toEqual({ name: 'Asha' })
    expect(network.requests).toHaveLength(1)

    expect(core.queryClient.getQueryData(['/api/v1/users/me'])).toEqual({
      data: { name: 'Asha' },
      success: true,
    })
  })

  it('counts an unchanged name as saved without a request', async () => {
    const network = Fakes.stubNetwork({})
    const { result } = await NameFixtures.setup(TestCore.create(), 'Asha')

    await act(() => {
      result.current.setName(' Asha ')
    })

    let saved: boolean | undefined

    await act(async () => {
      saved = await result.current.submit()
    })

    expect(saved).toBe(true)
    expect(network.requests).toHaveLength(0)
  })

  it('starts with an empty name by default', async () => {
    const { result } = await NameFixtures.setup()

    expect(result.current.name).toBe('')
  })

  it('starts with the name it is given, and saves it once changed', async () => {
    const network = Fakes.stubNetwork({ 'PATCH /api/v1/users/me': Fakes.ok({ name: 'Asha Rao' }) })
    const { result } = await NameFixtures.setup(TestCore.create(), 'Asha')

    expect(result.current.name).toBe('Asha')

    await act(() => {
      result.current.setName(' Asha Rao ')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(network.requests[0]?.body).toEqual({ name: 'Asha Rao' })
  })

  it.each([
    [HttpStatus.badRequest, 'errors.invalidName'],
    [HttpStatus.internalServerError, 'errors.genericWithId'],
  ] as const)('maps a %i to %s', async (status, key) => {
    Fakes.stubNetwork({ 'PATCH /api/v1/users/me': Fakes.failure(status, 'nope') })

    const { result } = await NameFixtures.setup()

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

    const { result } = await NameFixtures.setup()

    await act(() => {
      result.current.setName('Asha')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.offline')
  })
})
