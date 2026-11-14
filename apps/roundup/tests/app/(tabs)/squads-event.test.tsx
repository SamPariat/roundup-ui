import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { EventsFixtures } from '../../helpers/events'

/** The backend of the current test. */
let backend: IBackend

/**
 * Opens an event of squad s1 on its page, once it has loaded.
 * @param id - The event to open.
 * @returns A promise that resolves once the event is showing.
 */
const openEvent = async (id = 'e1'): Promise<void> => {
  await EventsFixtures.open(backend, `/squads/event/${id}`)
  await screen.findByText('Are you in?')
}

describe('event page', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')

    backend = EventsFixtures.backend([
      EventsFixtures.event('e1', 'Saturday night out', {
        answers: { u1: 'GOING', u2: 'GOING', u3: 'MAYBE' },
        nominations: [
          EventsFixtures.place('p1', 'Skyline Bar', 'u2'),
          EventsFixtures.place('p2', 'Brew Cafe', 'u1'),
        ],
      }),
    ])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the draft: its status, date, who started it and who is going', async () => {
    await openEvent()

    expect(screen.getByText('Planning')).toBeOnTheScreen()
    expect(screen.getByText('Drinks · Friday crew')).toBeOnTheScreen()
    expect(screen.getByText('Sat 14th Nov 2026, 8:00 pm')).toBeOnTheScreen()

    expect(
      screen.getByText('Started by you · voting closes Thu 12th Nov 2026, 9:00 pm'),
    ).toBeOnTheScreen()

    expect(screen.getByText("2 going · 1 maybe · 0 haven't answered")).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Going' })).toBeSelected()
  })

  it('lists the places to vote on with who suggested them', async () => {
    await openEvent()

    expect(screen.getByRole('heading', { name: 'Places to vote on' })).toBeOnTheScreen()
    expect(screen.getByText('2 suggested')).toBeOnTheScreen()
    expect(screen.getByText('Suggested by Meera Iyer · 4.5 · ₹₹')).toBeOnTheScreen()
    expect(screen.getByText('Suggested by you · 4.5 · ₹₹')).toBeOnTheScreen()
  })

  it('sends a new answer and selects it', async () => {
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Maybe' }))

    await waitFor(() => {
      expect(backend.paths).toContain('PUT /api/v1/events/e1/rsvp')
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Maybe' })).toBeSelected()
    })

    expect(screen.getByRole('button', { name: 'Going' })).not.toBeSelected()
    expect(screen.getByText("1 going · 2 maybe · 0 haven't answered")).toBeOnTheScreen()
  })

  it('takes a suggestion back', async () => {
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Skyline Bar' }))

    await waitFor(() => {
      expect(backend.paths).toContain('DELETE /api/v1/events/e1/nominations/p1')
    })

    await waitFor(() => {
      expect(screen.queryByText('Skyline Bar')).toBeNull()
    })

    expect(screen.getByText('1 suggested')).toBeOnTheScreen()
  })

  it('starts voting and loads the event again', async () => {
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Start voting' }))

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/events/e1/voting/start')
    })

    expect(await screen.findByText('Voting')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Start voting' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Places to vote on' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Going' })).toBeOnTheScreen()
  })

  it('shows Starting… while voting starts', async () => {
    backend.hangStart = true
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Start voting' }))

    expect(await screen.findByText('Starting…')).toBeOnTheScreen()
  })

  it('leaves out Start voting for someone who did not start the event, and Remove on others places', async () => {
    backend.events = [
      EventsFixtures.event('e1', 'Saturday night out', {
        createdBy: 'u2',
        nominations: [EventsFixtures.place('p1', 'Skyline Bar', 'u2')],
      }),
    ]

    await openEvent()
    await screen.findByText('Skyline Bar')

    expect(screen.queryByRole('button', { name: 'Start voting' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove Skyline Bar' })).toBeNull()

    expect(
      screen.getByText('Started by Meera Iyer · voting closes Thu 12th Nov 2026, 9:00 pm'),
    ).toBeOnTheScreen()
  })

  it('leaves out Start voting while nothing is suggested', async () => {
    backend.events = [EventsFixtures.event('e1', 'Saturday night out')]
    await openEvent()

    expect(screen.queryByRole('button', { name: 'Start voting' })).toBeNull()
    expect(screen.getByText('0 suggested')).toBeOnTheScreen()
  })

  it('shows only the header, the answer and who is going once the draft is over', async () => {
    backend.events = [
      EventsFixtures.event('e1', 'Saturday night out', {
        nominations: [EventsFixtures.place('p1', 'Skyline Bar')],
        status: 'CONFIRMED',
      }),
    ]

    await openEvent()

    expect(screen.getByText('Confirmed')).toBeOnTheScreen()
    expect(screen.queryByRole('heading', { name: 'Places to vote on' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Start voting' })).toBeNull()
  })

  it('shows a way back for an event that is not there', async () => {
    await EventsFixtures.open(backend, '/squads/event/nope')

    expect(await screen.findByText('Event not found')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Go to your squads' })).toBeOnTheScreen()
  })

  it('shows placeholders while the event loads', async () => {
    await EventsFixtures.open(backend, '/squads/event/e1')

    expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)

    await screen.findByText('Are you in?')
  })
})
