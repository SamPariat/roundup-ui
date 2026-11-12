import { Accuracy, getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'

import type { ICoordinates, ILocationSource, TLocationPermission } from './types'

/**
 * Builds the location source. Static methods only. The web version of this file
 * (location-source.web.ts) has the same class and API.
 */
export class LocationSource {
  /**
   * The native location source on expo-location. It asks for access while the app is open only,
   * and reads one position at balanced accuracy (city-block precision, which is enough to find
   * places within a few kilometers and uses little battery).
   * @returns A source that reads the device's position.
   */
  static create(): ILocationSource {
    return {
      /**
       * Reads one position.
       * @returns The device's latitude and longitude.
       */
      current: async (): Promise<ICoordinates> => {
        const { coords } = await getCurrentPositionAsync({ accuracy: Accuracy.Balanced })

        return { lat: coords.latitude, lng: coords.longitude }
      },
      /**
       * Shows the system prompt the first time, and reports the saved answer afterwards.
       * @returns Whether access was granted.
       */
      requestPermission: async (): Promise<TLocationPermission> => {
        const { granted } = await requestForegroundPermissionsAsync()

        return granted ? 'granted' : 'denied'
      },
    }
  }
}
