/** What the device can reach right now. */
export interface INetworkState {
  /** True when the device is connected and the internet is not known to be unreachable. */
  online: boolean
}

/**
 * Where core learns whether the device has internet. The real source reads expo-network; tests
 * pass a fake through CoreProvider.
 */
export interface INetworkSource {
  /** Reads the current state. */
  getState: () => Promise<INetworkState>
  /** Calls the listener on every change. Returns the function that stops listening. */
  subscribe: (listener: (state: INetworkState) => void) => () => void
}
