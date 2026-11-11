/** Whether the person let the app read where they are. */
export type TLocationPermission = 'denied' | 'granted'

/** A point on the map, in degrees. */
export interface ICoordinates {
  /** Degrees north of the equator, -90 to 90. */
  lat: number
  /** Degrees east of Greenwich, -180 to 180. */
  lng: number
}

/**
 * Where core reads the device's position from. The real source reads expo-location on iOS and
 * Android and the browser's geolocation on web; tests pass a fake through CoreProvider. The
 * position is read once on demand and is never tracked or stored.
 */
export interface ILocationSource {
  /** Asks for access to the location while the app is open, or reports the answer already given. */
  requestPermission: () => Promise<TLocationPermission>
  /** Reads where the device is now. Needs access first; rejects when no position is available. */
  current: () => Promise<ICoordinates>
}
