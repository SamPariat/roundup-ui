import type { ReactElement } from 'react'
import type { AppStateStatus } from 'react-native'

import { Stack } from 'expo-router'
import { fireEvent, screen } from 'expo-router/testing-library'
import { AppState } from 'react-native'

import type { ILocationSource, TLocationPermission } from '@roundup/core'

import type { IBackend } from './fakes'
import type { IStubSquad } from './squad-backend'
import type { IStubVenue } from './venue-backend'

import { Render } from './render'
import VenueScreen from '@/app/(tabs)/explore/[placeId]'
import ExploreScreen from '@/app/(tabs)/explore/index'
import SquadScreen from '@/app/(tabs)/squads/[squadId]'
import SquadsScreen from '@/app/(tabs)/squads/index'
import SquadVenueScreen from '@/app/(tabs)/squads/venue/[placeId]'

/**
 * The explore stack of a test: the same screens as the app, in a Stack so going back and
 * dismissing to the search work as they do there, without headers.
 * @returns A headerless stack.
 */
const ExploreStack = (): ReactElement => <Stack screenOptions={{ headerShown: false }} />

/**
 * Explore test helpers. Static methods only.
 */
export class VenuesFixtures {
  /**
   * A venue with the types of a bar.
   * @param id - Goes in the venue's path.
   * @param name - Shown on its card and page.
   * @param types - Its Google types.
   * @returns The stubbed venue.
   */
  static venue(id: string, name: string, types: string[] = ['bar']): IStubVenue {
    return { id, name, types }
  }

  /**
   * A backend signed in as Asha Rao with the venues and squads given, and nothing saved.
   * @param venues - The venues on the "server".
   * @param squads - The squads the person is in.
   * @returns A backend that answers the venue and favorite routes.
   */
  static backend(venues: IStubVenue[], squads: IStubSquad[] = []): IBackend {
    return { paths: [], saved: {}, squads, user: { name: 'Asha Rao' }, venues }
  }

  /**
   * A location source whose answer the test chooses, in Bengaluru.
   * @param permission - What the person answers when asked for access.
   * @returns The source, whose calls Jest records.
   */
  static location(permission: TLocationPermission = 'granted'): ILocationSource {
    return {
      current: jest.fn(() => Promise.resolve({ lat: 12.9716, lng: 77.5946 })),
      requestPermission: jest.fn(() => Promise.resolve(permission)),
    }
  }

  /**
   * Captures what the app listens to for app state changes, so a test can bring it to the
   * foreground. Restore the spy with jest.restoreAllMocks.
   * @returns A function that tells every listener the app went to the background and came back.
   */
  static foreground(): () => void {
    const listeners: ((state: AppStateStatus) => void)[] = []

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      listeners.push(listener)

      return { remove: jest.fn() }
    })

    return (): void => {
      for (const listener of listeners) {
        listener('background')
        listener('active')
      }
    }
  }

  /**
   * The paths of the venue searches the app made, in order.
   * @param backend - The backend that recorded the requests.
   * @returns The path of each search.
   */
  static searches(backend: IBackend): string[] {
    return backend.paths
      .filter((path) => path.startsWith('GET /api/v1/venues?'))
      .map((path) => path.replace('GET ', ''))
  }

  /**
   * Presses the floating Save to squad button.
   * @returns A promise that resolves once the press is handled.
   */
  static async pressSave(): Promise<void> {
    await fireEvent.press(await screen.findByRole('button', { name: 'Save to squad' }))
  }

  /**
   * Opens the app at an explore route, signed in.
   * @param backend - What the stubbed backend answers.
   * @param url - Where the app opens.
   * @param location - The fake location source; granted in Bengaluru by default.
   * @returns A promise that resolves once it has rendered.
   */
  static open(
    backend: IBackend,
    url: string,
    location: ILocationSource = VenuesFixtures.location(),
  ): Promise<void> {
    return Render.app(
      {
        'explore/[placeId]': VenueScreen,
        'explore/_layout': ExploreStack,
        'explore/index': ExploreScreen,
      },
      { backend, location, saved: 'r1', url },
    )
  }

  /**
   * Opens the app at a route of either the squads or the explore stack, signed in, for a flow that
   * goes from a squad's favorites to a place and back.
   * @param backend - What the stubbed backend answers.
   * @param url - Where the app opens.
   * @returns A promise that resolves once it has rendered.
   */
  static openWithSquads(backend: IBackend, url: string): Promise<void> {
    return Render.app(
      {
        'explore/[placeId]': VenueScreen,
        'explore/_layout': ExploreStack,
        'explore/index': ExploreScreen,
        'squads/[squadId]': SquadScreen,
        'squads/_layout': ExploreStack,
        'squads/index': SquadsScreen,
        'squads/venue/[placeId]': SquadVenueScreen,
      },
      { backend, location: VenuesFixtures.location(), saved: 'r1', url },
    )
  }
}
