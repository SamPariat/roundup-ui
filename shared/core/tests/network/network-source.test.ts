import * as ExpoNetwork from 'expo-network'

import { createNetworkSource } from '../../src/network/network-source'

jest.mock('expo-network')

const mocked = jest.mocked(ExpoNetwork)

describe('network source', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it.each([
    [{ isConnected: true, isInternetReachable: true }, true],
    [{ isConnected: true }, true],
    [{ isConnected: true, isInternetReachable: false }, false],
    [{ isConnected: false, isInternetReachable: false }, false],
    [{ isConnected: false }, false],
    [{}, false],
  ])('reads %j as online=%s', async (state, online) => {
    mocked.getNetworkStateAsync.mockResolvedValue(state)

    await expect(createNetworkSource().getState()).resolves.toEqual({ online })
  })

  it('maps each change to the listener and stops listening', () => {
    const remove = jest.fn()

    mocked.addNetworkStateListener.mockReturnValue({ remove })

    const listener = jest.fn()
    const stop = createNetworkSource().subscribe(listener)

    const emit = mocked.addNetworkStateListener.mock.calls[0]?.[0] as (
      state: ExpoNetwork.NetworkState,
    ) => void

    emit({ isConnected: true, isInternetReachable: false })
    emit({ isConnected: true, isInternetReachable: true })

    expect(listener).toHaveBeenNthCalledWith(1, { online: false })
    expect(listener).toHaveBeenNthCalledWith(2, { online: true })

    stop()

    expect(remove).toHaveBeenCalledTimes(1)
  })
})
