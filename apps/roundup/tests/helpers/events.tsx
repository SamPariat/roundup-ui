import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import type { ILocationSource } from '@roundup/core'

import type { IStubEvent, IStubNomination } from './event-backend'
import type { IBackend } from './fakes'
import type { IStubSquad } from './squad-backend'

import { Render } from './render'
import { SquadsFixtures } from './squads'
import SquadScreen from '@/app/(tabs)/squads/[squadId]'
import EventScreen from '@/app/(tabs)/squads/event/[eventId]'
import SquadsScreen from '@/app/(tabs)/squads/index'

/**
 * The squads stack of a test: the same screens as the app, in a Stack so going back works as it
 * does there, without headers.
 * @returns A headerless stack.
 */
const SquadsStack = (): ReactElement => <Stack screenOptions={{ headerShown: false }} />

/**
 * Event test helpers. Static methods only.
 */
export class EventsFixtures {
  /**
   * A moment in local time, as the API would send it. The test clock is Wednesday, 11 November
   * 2026, so the day is in the future when it is on or after the 12th.
   * @param day - The day of November 2026.
   * @param hour - The hour of the day.
   * @returns The ISO string.
   */
  static at(day: number, hour: number): string {
    return new Date(2026, 10, day, hour).toISOString()
  }

  /**
   * A draft event in squad s1, started by Asha (u1), that nobody has answered.
   * @param id - Goes in the event's path.
   * @param name - Shown on its card and page.
   * @param overrides - Fields to change.
   * @returns The stubbed event, starting Saturday 14 November at 8 pm.
   */
  static event(id: string, name: string, overrides: Partial<IStubEvent> = {}): IStubEvent {
    return {
      answers: {},
      createdBy: 'u1',
      id,
      name,
      nominations: [],
      squadId: 's1',
      startsAt: EventsFixtures.at(14, 20),
      status: 'DRAFT',
      type: 'DRINKS',
      votingDeadline: EventsFixtures.at(12, 21),
      ...overrides,
    }
  }

  /**
   * A suggested place.
   * @param id - Goes in the suggestion.
   * @param name - Shown in the list of places.
   * @param by - The user who suggested it.
   * @returns The stubbed suggestion.
   */
  static place(id: string, name: string, by = 'u2'): IStubNomination {
    return { by, id, name }
  }

  /**
   * A backend signed in as Asha Rao with the squads and events given.
   * @param events - The events on the "server".
   * @param squads - The squads the person is in; Friday crew by default.
   * @returns A backend that answers the squad and event routes.
   */
  static backend(
    events: IStubEvent[],
    squads: IStubSquad[] = [SquadsFixtures.squad('s1', 'Friday crew')],
  ): IBackend {
    return { events, paths: [], squads, user: { name: 'Asha Rao' } }
  }

  /**
   * Opens the app at a route of the squads stack, signed in.
   * @param backend - What the stubbed backend answers.
   * @param url - Where the app opens.
   * @param location - The fake location source, for a screen that asks where the person is.
   * @returns A promise that resolves once it has rendered.
   */
  static open(backend: IBackend, url: string, location?: ILocationSource): Promise<void> {
    return Render.app(
      {
        'squads/[squadId]': SquadScreen,
        'squads/_layout': SquadsStack,
        'squads/event/[eventId]': EventScreen,
        'squads/index': SquadsScreen,
      },
      { backend, saved: 'r1', url, ...(location === undefined ? {} : { location }) },
    )
  }
}
