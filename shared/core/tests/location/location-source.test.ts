import { Accuracy, getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'

import { LocationSource } from '../../src/location/location-source'

/** What the permission request answers. */
type TPermission = Awaited<ReturnType<typeof requestForegroundPermissionsAsync>>

/** What reading the position answers. */
type TPosition = Awaited<ReturnType<typeof getCurrentPositionAsync>>

describe('native location source', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it.each([
    [true, 'granted'],
    [false, 'denied'],
  ] as const)('reads a permission of granted=%s as %s', async (granted, expected) => {
    jest.mocked(requestForegroundPermissionsAsync).mockResolvedValue({ granted } as TPermission)

    await expect(LocationSource.create().requestPermission()).resolves.toBe(expected)
  })

  it('reads one position at balanced accuracy', async () => {
    const read = jest.mocked(getCurrentPositionAsync)

    read.mockResolvedValue({ coords: { latitude: 12.9716, longitude: 77.5946 } } as TPosition)

    await expect(LocationSource.create().current()).resolves.toEqual({ lat: 12.9716, lng: 77.5946 })
    expect(read).toHaveBeenCalledWith({ accuracy: Accuracy.Balanced })
  })

  it('rejects when no position is available', async () => {
    jest.mocked(getCurrentPositionAsync).mockRejectedValue(new Error('Location is unavailable'))

    await expect(LocationSource.create().current()).rejects.toThrow('Location is unavailable')
  })
})

describe('web location source', () => {
  // Jest resolves the extensionless import to the native file, so the web one is loaded by its full name.
  const web = jest.requireActual<{
    /** The web class. */
    LocationSource: typeof LocationSource
  }>('../../src/location/location-source.web.ts').LocationSource

  /** The geolocation stub the tests drive. */
  const getCurrentPosition = jest.fn()

  beforeEach(() => {
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
  })

  afterEach(() => {
    getCurrentPosition.mockReset()
  })

  it('reads the position from the browser', async () => {
    getCurrentPosition.mockImplementation((success: (position: unknown) => void) => {
      success({ coords: { latitude: 12.9716, longitude: 77.5946 } })
    })

    await expect(web.create().current()).resolves.toEqual({ lat: 12.9716, lng: 77.5946 })
  })

  it('says granted when the browser gave a position', async () => {
    getCurrentPosition.mockImplementation((success: (position: unknown) => void) => {
      success({ coords: { latitude: 1, longitude: 2 } })
    })

    await expect(web.create().requestPermission()).resolves.toBe('granted')
  })

  it('says denied when the person blocks it, and rejects reading', async () => {
    getCurrentPosition.mockImplementation(
      (
        _success: unknown,
        failure: (error: {
          /**
           *
           */
          message: string
        }) => void,
      ) => {
        failure({ message: 'User denied Geolocation' })
      },
    )

    await expect(web.create().requestPermission()).resolves.toBe('denied')
    await expect(web.create().current()).rejects.toThrow('User denied Geolocation')
  })
})
