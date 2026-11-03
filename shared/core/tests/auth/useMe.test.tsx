import { renderHook, waitFor } from '@testing-library/react-native'

import type { ITestCore } from '../helpers/wrapper'

import { useMe } from '../../src/auth/useMe'
import { useProfileViewModel } from '../../src/auth/useProfileViewModel'
import { empty, failure, ok, pair, stubNetwork } from '../helpers/fakes'
import { createTestCore } from '../helpers/wrapper'

/**
 * Builds the profile of a signed-in user.
 * @param name - The user's name; empty until they set one.
 * @returns The profile as the API sends it.
 */
const user = (name: string): Record<string, unknown> => ({
  avatarURL: '',
  createdAt: '2026-01-01T00:00:00Z',
  id: 'u1',
  name,
  phone: '+919876543210',
  updatedAt: '2026-01-01T00:00:00Z',
})

/**
 * Starts a core that has a saved refresh token, so it restores into a signed-in session.
 * @returns The fakes behind a provider that will restore a session.
 */
const signedInCore = async (): Promise<ITestCore> => {
  const core = createTestCore()

  await core.store.save('r1')

  return core
}

describe('useMe', () => {
  it('does not load the profile while signed out', async () => {
    const network = stubNetwork({})
    const { result } = await renderHook(() => useMe(), { wrapper: createTestCore().wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.me).toBeUndefined()
    expect(result.current.needsName).toBe(false)
    expect(network.requests).toHaveLength(0)
  })

  it('loads the profile once signed in', async () => {
    stubNetwork({
      'GET /api/v1/users/me': ok(user('Asha')),
      'POST /api/v1/auth/refresh': ok(pair('a2', 'r2')),
    })

    const { wrapper } = await signedInCore()
    const { result } = await renderHook(() => useMe(), { wrapper })

    await waitFor(() => {
      expect(result.current.me?.name).toBe('Asha')
    })

    expect(result.current.needsName).toBe(false)
  })

  it('needs a name when the profile has none', async () => {
    stubNetwork({
      'GET /api/v1/users/me': ok(user('')),
      'POST /api/v1/auth/refresh': ok(pair('a2', 'r2')),
    })

    const { wrapper } = await signedInCore()
    const { result } = await renderHook(() => useMe(), { wrapper })

    await waitFor(() => {
      expect(result.current.needsName).toBe(true)
    })
  })

  it('does not ask for a name when the profile failed to load', async () => {
    stubNetwork({
      'GET /api/v1/users/me': failure(502, 'bad gateway'),
      'POST /api/v1/auth/refresh': ok(pair('a2', 'r2')),
    })

    const { wrapper } = await signedInCore()
    const { result } = await renderHook(() => useMe(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.needsName).toBe(false)
  })
})

describe('useProfileViewModel', () => {
  it('signs out through the session', async () => {
    const network = stubNetwork({
      'GET /api/v1/users/me': ok(user('Asha')),
      'POST /api/v1/auth/logout': empty(204),
      'POST /api/v1/auth/refresh': ok(pair('a2', 'r2')),
    })

    const { wrapper } = await signedInCore()
    const { result } = await renderHook(() => useProfileViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.me?.name).toBe('Asha')
    })

    await result.current.signOut()

    await waitFor(() => {
      expect(result.current.me).toBeUndefined()
    })

    expect(network.requests.map((request) => request.path)).toContain('/api/v1/auth/logout')
  })
})
