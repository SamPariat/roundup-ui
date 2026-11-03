import { act, renderHook } from '@testing-library/react-native'

import { useCodeViewModel } from '../../src/auth/useCodeViewModel'
import { useSession } from '../../src/session/useSession'
import { empty, failure, goOffline, login, stubNetwork } from '../helpers/fakes'
import { createTestCore } from '../helpers/wrapper'

/** The number the code was sent to. */
const PHONE = '+919876543210'

/** The view model and the session beside it, so a test can see sign-in happen. */
interface IBoth {
  /** The session. */
  session: ReturnType<typeof useSession>
  /** The code view model. */
  vm: ReturnType<typeof useCodeViewModel>
}

/**
 * Calls the view model and the session in one hook.
 * @returns The session status and the code screen's state.
 */
const useBoth = (): IBoth => ({ session: useSession(), vm: useCodeViewModel(PHONE) })

describe('useCodeViewModel', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps digits only, at most six', async () => {
    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      result.current.vm.setCode('12-34')
    })

    expect(result.current.vm.code).toBe('1234')
  })

  it('submits by itself on the sixth digit and signs in', async () => {
    const network = stubNetwork({ 'POST /api/v1/auth/otp/verify': login(false) })
    const core = createTestCore()
    const { result } = await renderHook(useBoth, { wrapper: core.wrapper })

    await act(() => {
      result.current.vm.setCode('12345')
    })

    expect(network.requests).toHaveLength(0)

    await act(() => {
      result.current.vm.setCode('123456')
    })

    expect(network.requests[0]?.body).toEqual({ code: '123456', phone: PHONE })
    expect(result.current.session.status).toBe('signedIn')
    expect(core.store.saved).toEqual(['r1'])
  })

  it('resolves whether the user is new', async () => {
    const network = stubNetwork({
      'POST /api/v1/auth/otp/verify': failure(401, 'invalid or expired code'),
    })

    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      result.current.vm.setCode('123456')
    })

    network.routes['POST /api/v1/auth/otp/verify'] = login(true)

    let isNewUser: boolean | undefined

    await act(async () => {
      isNewUser = await result.current.vm.submit()
    })

    expect(isNewUser).toBe(true)
  })

  it('does not submit an incomplete code', async () => {
    const network = stubNetwork({})
    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      result.current.vm.setCode('123')
    })

    await act(async () => {
      await result.current.vm.submit()
    })

    expect(result.current.vm.error).toBe('errors.wrongCode')
    expect(network.requests).toHaveLength(0)
  })

  it.each([
    [401, 'errors.wrongCode'],
    [400, 'errors.wrongCode'],
    [429, 'errors.codeExpired'],
    [500, 'errors.genericWithId'],
  ] as const)('maps a %i to %s', async (status, key) => {
    stubNetwork({ 'POST /api/v1/auth/otp/verify': failure(status, 'nope') })

    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      result.current.vm.setCode('123456')
    })

    expect(result.current.vm.error).toBe(key)
    expect(result.current.session.status).not.toBe('signedIn')
  })

  it('says offline when there is no connection', async () => {
    goOffline()

    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      result.current.vm.setCode('123456')
    })

    expect(result.current.vm.error).toBe('errors.offline')
  })

  it('clears the message when the code is edited', async () => {
    stubNetwork({ 'POST /api/v1/auth/otp/verify': failure(401, 'invalid or expired code') })

    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      result.current.vm.setCode('123456')
    })

    await act(() => {
      result.current.vm.setCode('12345')
    })

    expect(result.current.vm.error).toBeUndefined()
  })

  it('counts down 30 seconds before a code can be asked for again', async () => {
    jest.useFakeTimers()

    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    expect(result.current.vm.resendIn).toBe(30)

    await act(() => {
      jest.advanceTimersByTime(10_000)
    })

    expect(result.current.vm.resendIn).toBe(20)

    await act(() => {
      jest.advanceTimersByTime(25_000)
    })

    expect(result.current.vm.resendIn).toBe(0)
  })

  it('sends a new code and restarts the countdown', async () => {
    jest.useFakeTimers()

    const network = stubNetwork({ 'POST /api/v1/auth/otp/request': empty(202) })
    const { result } = await renderHook(useBoth, { wrapper: createTestCore().wrapper })

    await act(() => {
      jest.advanceTimersByTime(31_000)
    })

    expect(result.current.vm.resendIn).toBe(0)

    await act(async () => {
      await result.current.vm.resend()
    })

    expect(network.requests[0]?.body).toEqual({ phone: PHONE })
    expect(result.current.vm.resendIn).toBe(30)
  })
})
