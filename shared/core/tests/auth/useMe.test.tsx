import { renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { ITestCore } from '../helpers/wrapper'

import { useMe } from '../../src/auth/useMe'
import { useProfileViewModel } from '../../src/auth/useProfileViewModel'
import { Fakes } from '../helpers/fakes'
import { TestCore } from '../helpers/wrapper'

/**
 * Profile test helpers. Static methods only.
 */
class MeFixtures {
  /**
   * Builds the profile of a signed-in user.
   * @param name - The user's name; empty until they set one.
   * @returns The profile as the API sends it.
   */
  static user(name: string): Record<string, unknown> {
    return {
      avatarURL: '',
      createdAt: '2026-01-01T00:00:00Z',
      id: 'u1',
      name,
      phone: '+919876543210',
      updatedAt: '2026-01-01T00:00:00Z',
    }
  }

  /**
   * Starts a core that has a saved refresh token, so it restores into a signed-in session.
   * @returns The fakes behind a provider that will restore a session.
   */
  static async signedInCore(): Promise<ITestCore> {
    const core = TestCore.create()

    await core.store.save('r1')

    return core
  }
}

describe('useMe', () => {
  it('does not load the profile while signed out', async () => {
    const network = Fakes.stubNetwork({})
    const { result } = await renderHook(() => useMe(), { wrapper: TestCore.create().wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.me).toBeUndefined()
    expect(result.current.needsName).toBe(false)
    expect(network.requests).toHaveLength(0)
  })

  it('loads the profile once signed in', async () => {
    Fakes.stubNetwork({
      'GET /api/v1/users/me': Fakes.ok(MeFixtures.user('Asha')),
      'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
    })

    const { wrapper } = await MeFixtures.signedInCore()
    const { result } = await renderHook(() => useMe(), { wrapper })

    await waitFor(() => {
      expect(result.current.me?.name).toBe('Asha')
    })

    expect(result.current.needsName).toBe(false)
  })

  it('needs a name when the profile has none', async () => {
    Fakes.stubNetwork({
      'GET /api/v1/users/me': Fakes.ok(MeFixtures.user('')),
      'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
    })

    const { wrapper } = await MeFixtures.signedInCore()
    const { result } = await renderHook(() => useMe(), { wrapper })

    await waitFor(() => {
      expect(result.current.needsName).toBe(true)
    })
  })

  it('does not ask for a name when the profile failed to load', async () => {
    Fakes.stubNetwork({
      'GET /api/v1/users/me': Fakes.failure(HttpStatus.badGateway, 'bad gateway'),
      'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
    })

    const { wrapper } = await MeFixtures.signedInCore()
    const { result } = await renderHook(() => useMe(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.needsName).toBe(false)
  })
})

describe('useProfileViewModel', () => {
  it('signs out through the session', async () => {
    const network = Fakes.stubNetwork({
      'GET /api/v1/users/me': Fakes.ok(MeFixtures.user('Asha')),
      'POST /api/v1/auth/logout': Fakes.empty(HttpStatus.noContent),
      'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
    })

    const { wrapper } = await MeFixtures.signedInCore()
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
