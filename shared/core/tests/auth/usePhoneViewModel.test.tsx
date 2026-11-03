import { act, renderHook } from '@testing-library/react-native'

import type { PhoneViewModel } from '../../src/auth/usePhoneViewModel.ts'

import { usePhoneViewModel } from '../../src/auth/usePhoneViewModel.ts'
import { empty, failure, goOffline, stubNetwork } from '../helpers/fakes.ts'
import { createTestCore } from '../helpers/wrapper.tsx'

/** The latest value of a hook under test. */
interface Current {
  /** The view model as of the last render. */
  current: PhoneViewModel
}

/** What renderHook hands back for this view model. */
interface Rendered {
  /** Holds the latest view model. */
  result: Current
}

/**
 * Renders the view model inside a CoreProvider with fakes.
 * @returns The rendered hook.
 */
const setup = (): Promise<Rendered> =>
  renderHook(() => usePhoneViewModel(), { wrapper: createTestCore().wrapper })

describe('usePhoneViewModel', () => {
  it('keeps digits only, at most ten', async () => {
    const { result } = await setup()

    await act(() => {
      result.current.setPhone('98a76-54 3210999')
    })

    expect(result.current.phone).toBe('9876543210')
  })

  it('drops a pasted country code', async () => {
    const { result } = await setup()

    await act(() => {
      result.current.setPhone('+91 98765 43210')
    })

    expect(result.current.phone).toBe('9876543210')
  })

  it.each(['', '12345', '5876543210', '98765432'])(
    'rejects %j without a request',
    async (typed) => {
      const network = stubNetwork({})
      const { result } = await setup()

      await act(() => {
        result.current.setPhone(typed)
      })

      let sent: string | undefined = 'unset'

      await act(async () => {
        sent = await result.current.submit()
      })

      expect(sent).toBeUndefined()
      expect(result.current.error).toBe('errors.invalidPhone')
      expect(network.requests).toHaveLength(0)
    },
  )

  it('sends the code to the E.164 number and returns it', async () => {
    const network = stubNetwork({ 'POST /api/v1/auth/otp/request': empty(202) })
    const { result } = await setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    let sent: string | undefined

    await act(async () => {
      sent = await result.current.submit()
    })

    expect(sent).toBe('+919876543210')
    expect(result.current.error).toBeUndefined()
    expect(result.current.busy).toBe(false)
    expect(network.requests[0]?.body).toEqual({ phone: '+919876543210' })
  })

  it('is busy while the request is in flight', async () => {
    const gate = Promise.withResolvers<boolean>()

    stubNetwork({ 'POST /api/v1/auth/otp/request': { ...empty(202), gate: gate.promise } })

    const { result } = await setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    let pending: Promise<string | undefined> = Promise.resolve('unset')

    await act(() => {
      pending = result.current.submit()
    })

    expect(result.current.busy).toBe(true)

    await act(async () => {
      gate.resolve(true)
      await pending
    })

    expect(result.current.busy).toBe(false)
  })

  it.each([
    [400, 'errors.invalidPhone'],
    [429, 'errors.tooManyRequests'],
    [500, 'errors.genericWithId'],
  ] as const)('maps a %i to %s', async (status, key) => {
    stubNetwork({ 'POST /api/v1/auth/otp/request': failure(status, 'nope') })

    const { result } = await setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe(key)
  })

  it('shows the request id of an unexpected failure', async () => {
    stubNetwork({ 'POST /api/v1/auth/otp/request': failure(500, 'boom') })

    const { result } = await setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.requestId).toBe('req-1')
  })

  it('says offline when there is no connection', async () => {
    goOffline()

    const { result } = await setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.offline')
  })

  it('clears the message when the number is edited', async () => {
    const { result } = await setup()

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.invalidPhone')

    await act(() => {
      result.current.setPhone('9')
    })

    expect(result.current.error).toBeUndefined()
  })
})
