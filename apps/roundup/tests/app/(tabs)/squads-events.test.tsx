import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { EventsFixtures } from '../../helpers/events'

/** The backend of the current test. */
let backend: IBackend

/**
 * Opens a squad on its Events tab.
 * @returns A promise that resolves once the tab is showing.
 */
const openEvents = async (): Promise<void> => {
  await EventsFixtures.open(backend, '/squads/s1?tab=events')
  await screen.findByRole('heading', { name: 'Coming up' })
}

describe('squad events', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')

    backend = EventsFixtures.backend([
      EventsFixtures.event('e1', 'Saturday night out', {
        nominations: [EventsFixtures.place('p1', 'Skyline Bar')],
        status: 'VOTING',
      }),
      EventsFixtures.event('e2', 'Birthday dinner', {
        answers: { u1: 'GOING', u2: 'GOING' },
        startsAt: EventsFixtures.at(20, 20),
        status: 'CONFIRMED',
        type: 'DINING',
      }),
      EventsFixtures.event('e3', 'Diwali drinks', {
        answers: { u1: 'GOING', u2: 'GOING', u3: 'GOING' },
        closedAt: EventsFixtures.at(5, 23),
        status: 'CLOSED',
      }),
    ])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows placeholders while the events load', async () => {
    await EventsFixtures.open(backend, '/squads/s1?tab=events')

    expect(screen.getByLabelText('Loading')).toBeBusy()

    await screen.findByRole('heading', { name: 'Coming up' })
  })

  it('lists the open events as cards and the closed ones as rows, and counts the open ones', async () => {
    await openEvents()

    expect(screen.getByRole('button', { name: 'Saturday night out' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Birthday dinner' })).toBeOnTheScreen()
    expect(screen.getByText('Voting')).toBeOnTheScreen()
    expect(screen.getByText('Confirmed')).toBeOnTheScreen()
    expect(screen.getByRole('heading', { name: 'Past' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: /^Diwali drinks/ })).toBeOnTheScreen()
    expect(screen.getByText('5th Nov 2026 · 3 went')).toBeOnTheScreen()
    expect(screen.getByRole('tab', { name: 'Events, 2' })).toBeSelected()
  })

  it('puts the event that needs an answer in a card of its own, with the answer chips', async () => {
    await openEvents()

    expect(screen.getByText('Needs your answer')).toBeOnTheScreen()
    expect(screen.getByText('Are you in?')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Going' })).not.toBeSelected()
    expect(screen.getByRole('button', { name: 'Open and vote' })).toBeOnTheScreen()
  })

  it('sends the answer and takes the card away once the event is answered', async () => {
    backend.events = [
      EventsFixtures.event('e1', 'Saturday night out', {
        hasVoted: true,
        status: 'VOTING',
      }),
    ]

    await openEvents()
    await fireEvent.press(screen.getByRole('button', { name: 'Maybe' }))

    await waitFor(() => {
      expect(backend.paths).toContain('PUT /api/v1/events/e1/rsvp')
    })

    await waitFor(() => {
      expect(screen.queryByText('Needs your answer')).toBeNull()
    })
  })

  it('opens the event from the card', async () => {
    await openEvents()
    await fireEvent.press(screen.getByRole('button', { name: 'Open and vote' }))

    expect(await screen.findByText(/^Started by you/)).toBeOnTheScreen()
    expect(screen).toHavePathname('/squads/event/e1')
  })

  it('shows an empty state with a way to plan the first event', async () => {
    backend.events = []
    await EventsFixtures.open(backend, '/squads/s1?tab=events')

    expect(await screen.findByText('No events yet')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'New event' })).toBeOnTheScreen()
  })

  it('loads older events a page at a time', async () => {
    backend.eventPageSize = 2
    await openEvents()

    expect(screen.queryByRole('button', { name: /^Diwali drinks/ })).toBeNull()

    await fireEvent.press(screen.getByRole('button', { name: 'Show older events' }))

    expect(await screen.findByRole('button', { name: /^Diwali drinks/ })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Show older events' })).toBeNull()
  })

  it('shows a failed answer as an error over the events', async () => {
    backend.rsvpStatus = 500
    await openEvents()
    await fireEvent.press(screen.getByRole('button', { name: 'Going' }))

    expect(await screen.findByRole('alert')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Saturday night out' })).toBeOnTheScreen()
  })

  it('keeps the tab in the URL', async () => {
    await EventsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('tab', { name: /^Events/ }))

    await waitFor(() => {
      expect(screen).toHaveSearchParams({ squadId: 's1', tab: 'events' })
    })
  })
})
