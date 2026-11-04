import type { NetworkState } from 'expo-network'

import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network'

import type { INetworkSource, INetworkState } from './types'

/**
 * Maps expo-network's state to ours: online means connected, and not known to lack internet.
 * iOS and the web report no separate reachability, so there it is the same as connected.
 * @param state - What expo-network reported.
 * @returns The state core uses.
 */
const toState = (state: NetworkState): INetworkState => ({
  online: state.isConnected === true && state.isInternetReachable !== false,
})

/**
 * The network source built on expo-network, which also works on the web through the browser's
 * online and offline events.
 * @returns A source that reads the device.
 */
export const createNetworkSource = (): INetworkSource => ({
  /**
   * Reads the current state.
   * @returns Whether the device is online.
   */
  getState: async () => toState(await getNetworkStateAsync()),
  /**
   * Listens for changes.
   * @param listener - Told about every change.
   * @returns The function that stops listening.
   */
  subscribe: (listener) => {
    const subscription = addNetworkStateListener((state) => {
      listener(toState(state))
    })

    return () => {
      subscription.remove()
    }
  },
})
