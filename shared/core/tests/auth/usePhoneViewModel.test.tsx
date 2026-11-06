import { act, renderHook } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { IPhoneViewModel } from '../../src/auth/usePhoneViewModel'

import { usePhoneViewModel } from '../../src/auth/usePhoneViewModel'
import { Fakes } from '../helpers/fakes'
import { TestCore } from '../helpers/wrapper'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: IPhoneViewModel
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/**
 * Phone view model test helpers. Static methods only.
 */
class PhoneFixtures {
  /**
   * Renders the view model inside a CoreProvider with fakes.
   * @returns The rendered hook.
   */
  static setup(): Promise<IRendered> {
    return renderHook(() => usePhoneViewModel(), { wrapper: TestCore.create().wrapper })
  }
}

describe('usePhoneViewModel', () => {
  it('keeps digits only, at most ten', async () => {
    const { result } = await PhoneFixtures.setup()

    await act(() => {
      result.current.setPhone('98a76-54 3210999')
    })

    expect(result.current.phone).toBe('9876543210')
  })

  it('drops a pasted country code', async () => {
    const { result } = await PhoneFixtures.setup()

    await act(() => {
      result.current.setPhone('+91 98765 43210')
    })

    expect(result.current.phone).toBe('9876543210')
  })

  it.each(['', '12345', '5876543210', '98765432'])(
    'rejects %j without a request',
    async (typed) => {
      const network = Fakes.stubNetwork({})
      const { result } = await PhoneFixtures.setup()

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
    const network = Fakes.stubNetwork({
      'POST /api/v1/auth/otp/request': Fakes.empty(HttpStatus.accepted),
    })

    const { result } = await PhoneFixtures.setup()

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

    Fakes.stubNetwork({
      'POST /api/v1/auth/otp/request': { ...Fakes.empty(HttpStatus.accepted), gate: gate.promise },
    })

    const { result } = await PhoneFixtures.setup()

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
    [HttpStatus.badRequest, 'errors.invalidPhone'],
    [HttpStatus.tooManyRequests, 'errors.tooManyRequests'],
    [HttpStatus.internalServerError, 'errors.genericWithId'],
  ] as const)('maps a %i to %s', async (status, key) => {
    Fakes.stubNetwork({ 'POST /api/v1/auth/otp/request': Fakes.failure(status, 'nope') })

    const { result } = await PhoneFixtures.setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe(key)
  })

  it('shows the request id of an unexpected failure', async () => {
    Fakes.stubNetwork({
      'POST /api/v1/auth/otp/request': Fakes.failure(HttpStatus.internalServerError, 'boom'),
    })

    const { result } = await PhoneFixtures.setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.requestId).toBe('req-1')
  })

  it('says offline when there is no connection', async () => {
    Fakes.goOffline()

    const { result } = await PhoneFixtures.setup()

    await act(() => {
      result.current.setPhone('9876543210')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('errors.offline')
  })

  it('clears the message when the number is edited', async () => {
    const { result } = await PhoneFixtures.setup()

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
