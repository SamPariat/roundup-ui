import type { ICoordinates, ILocationSource, TLocationPermission } from './types'

/** How long the browser may take to answer, in milliseconds, so a prompt left open does not hang the screen. */
const TIMEOUT = 15_000

/** How old a position the browser may hand back, in milliseconds, so asking twice reads it once. */
const MAX_AGE = 60_000

/**
 * Builds the location source. Static methods only. The native version of this file
 * (location-source.ts) has the same class and API.
 */
export class LocationSource {
  /**
   * The web location source on navigator.geolocation. A browser has no separate permission call
   * that does not also read the position, so asking for access reads it and says granted when it
   * worked. The browser remembers the answer, and a repeat read within a minute reuses the position.
   * @returns A source that reads the browser's position.
   */
  static create(): ILocationSource {
    return {
      /**
       * Reads one position.
       * @returns The browser's latitude and longitude.
       */
      current: (): Promise<ICoordinates> => LocationSource.read(),
      /**
       * Shows the browser's prompt the first time, and reports the saved answer afterwards.
       * @returns Granted when a position was read, otherwise denied.
       */
      requestPermission: async (): Promise<TLocationPermission> => {
        try {
          await LocationSource.read()

          return 'granted'
        } catch {
          return 'denied'
        }
      },
    }
  }

  /**
   * Reads one position from the browser.
   * @returns The latitude and longitude, or a rejection when the person refuses or none is available.
   */
  private static read(): Promise<ICoordinates> {
    return new Promise<ICoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          resolve({ lat: coords.latitude, lng: coords.longitude })
        },
        (failure) => {
          reject(new Error(failure.message))
        },
        { enableHighAccuracy: false, maximumAge: MAX_AGE, timeout: TIMEOUT },
      )
    })
  }
}
