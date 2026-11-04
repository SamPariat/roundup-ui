import * as SecureStore from 'expo-secure-store'

import { SessionStore } from '../../src/session/session-store.native'

/** The options every call must carry, so a background refresh works after the first unlock. */
const OPTIONS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }

describe('native session store', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('saves the refresh token to the Keychain and keeps it in memory', async () => {
    const set = jest.spyOn(SecureStore, 'setItemAsync').mockResolvedValue()
    const store = SessionStore.create()

    expect(store.cookie).toBe(false)

    await store.save('r1')

    expect(set).toHaveBeenCalledWith('roundup.refresh', 'r1', OPTIONS)
    expect(store.refreshToken()).toBe('r1')
  })

  it('restores what an earlier launch saved', async () => {
    const get = jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue('r9')
    const store = SessionStore.create()

    await store.restore()

    expect(get).toHaveBeenCalledWith('roundup.refresh', OPTIONS)
    expect(store.refreshToken()).toBe('r9')
  })

  it('restores nothing when the Keychain has no entry', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(null)

    const store = SessionStore.create()

    await store.restore()

    expect(store.refreshToken()).toBeUndefined()
  })

  it('deletes the entry and forgets the token on clear', async () => {
    jest.spyOn(SecureStore, 'setItemAsync').mockResolvedValue()

    const remove = jest.spyOn(SecureStore, 'deleteItemAsync').mockResolvedValue()
    const store = SessionStore.create()

    await store.save('r1')
    await store.clear()

    expect(remove).toHaveBeenCalledWith('roundup.refresh', OPTIONS)
    expect(store.refreshToken()).toBeUndefined()
  })
})
