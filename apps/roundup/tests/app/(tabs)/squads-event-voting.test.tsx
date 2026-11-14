import { act, fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { EventsFixtures } from '../../helpers/events'

/** The backend of the current test. */
let backend: IBackend

/**
 * Opens the voting event of squad s1, once it has loaded.
 * @returns A promise that resolves once the ballot is showing.
 */
const openEvent = async (): Promise<void> => {
  await EventsFixtures.open(backend, '/squads/event/e1')
  await screen.findByText('Pick one. You can change it until voting closes.')
}

/**
 * Counts how many times the event was loaded so far.
 * @returns The number of requests for event e1.
 */
const loads = (): number => backend.paths.filter((path) => path === 'GET /api/v1/events/e1').length

/**
 * Voting page test helpers. Static methods only.
 */
class VotingFixtures {
  /**
   * Pulls the page down, as a person does to see the latest: calls the refresh control of the view
   * the page scrolls in.
   */
  static async pull(): Promise<void> {
    let node = screen.getByText('Pick one. You can change it until voting closes.').parent

    while (node !== null && node.props['refreshControl'] === undefined) node = node.parent

    const control = node?.props['refreshControl'] as
      | undefined
      | {
          /** The control's props, with what a pull calls. */
          props: {
            /** Loads the page again. */
            onRefresh: () => Promise<void>
          }
        }

    await control?.props.onRefresh()
  }
}

describe('event page while voting', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')

    backend = EventsFixtures.backend([
      EventsFixtures.event('e1', 'Saturday night out', {
        nominations: [
          EventsFixtures.place('p1', 'Skyline Bar', 'u2'),
          EventsFixtures.place('p2', 'Brew Cafe', 'u1'),
        ],
        status: 'VOTING',
        votes: { u1: 'p2', u2: 'p1', u3: 'p1' },
      }),
    ])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the countdown, the turnout and each place with its votes and who suggested it', async () => {
    await openEvent()

    expect(screen.getByText('Voting')).toBeOnTheScreen()
    expect(screen.getByText('Sat 14th Nov 2026, 8:00 pm · Drinks')).toBeOnTheScreen()
    expect(screen.getByText('Closes in 1 day 9 hours')).toBeOnTheScreen()
    expect(screen.getByText('Thu 12th Nov 2026, 9:00 pm · 3 of 3 voted')).toBeOnTheScreen()
    expect(screen.getByText('Suggested by Meera Iyer · 4.5 · ₹₹')).toBeOnTheScreen()
    expect(screen.getByText('2 votes')).toBeOnTheScreen()
    expect(screen.getByText('1 vote')).toBeOnTheScreen()

    expect(
      screen.getByText('The most votes wins. A tie goes to the first place suggested.'),
    ).toBeOnTheScreen()
  })

  it('says to pull down for the latest votes, and loads the event again when pulled', async () => {
    await openEvent()

    expect(screen.getByText('Updates every 45 seconds · pull down to update now')).toBeOnTheScreen()

    const before = loads()

    await act(async () => {
      await VotingFixtures.pull()
    })

    await waitFor(() => {
      expect(loads()).toBe(before + 1)
    })
  })

  it('says when votes from the rest of the squad come in', async () => {
    const [event] = backend.events ?? []

    if (event === undefined) throw new Error('No event')

    // Only the person has voted when the page opens.
    event.votes = { u1: 'p2' }

    await openEvent()

    expect(screen.queryByText(/new votes? came in/)).toBeNull()

    // Two others vote while the page is open.
    event.votes = { u1: 'p2', u2: 'p1', u3: 'p1' }

    await act(async () => {
      await VotingFixtures.pull()
    })

    expect(await screen.findByText('2 new votes came in')).toBeOnTheScreen()
  })

  it('says the votes changed when someone else moves their vote', async () => {
    const [event] = backend.events ?? []

    if (event === undefined) throw new Error('No event')

    await openEvent()

    // Meera moves her vote from Skyline Bar to Brew Cafe.
    event.votes = { u1: 'p2', u2: 'p2', u3: 'p1' }

    await act(async () => {
      await VotingFixtures.pull()
    })

    expect(await screen.findByText('The votes changed')).toBeOnTheScreen()
  })

  it('marks the place the person voted for as their vote and selected', async () => {
    await openEvent()

    expect(screen.getAllByText('Your vote')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Brew Cafe, 1 vote, your vote' })).toBeSelected()
    expect(screen.getByRole('button', { name: 'Skyline Bar, 2 votes' })).not.toBeSelected()
  })

  it('leaves out Close voting now, and the draft sections', async () => {
    await openEvent()

    expect(screen.queryByRole('button', { name: 'Close voting now' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Start voting' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Suggest a place' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Places to vote on' })).toBeNull()
  })

  it('moves the vote to the place pressed and counts it', async () => {
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Skyline Bar, 2 votes' }))

    await waitFor(() => {
      expect(backend.paths).toContain('PUT /api/v1/events/e1/vote')
    })

    expect(
      await screen.findByRole('button', { name: 'Skyline Bar, 3 votes, your vote' }),
    ).toBeSelected()

    expect(screen.getByRole('button', { name: 'Brew Cafe, 0 votes' })).not.toBeSelected()
    expect(screen.getAllByText('Your vote')).toHaveLength(1)
  })

  it('sends nothing when the place already chosen is pressed', async () => {
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Brew Cafe, 1 vote, your vote' }))

    expect(backend.paths).not.toContain('PUT /api/v1/events/e1/vote')
  })

  it('says Sending… on the card while its vote is on its way', async () => {
    backend.hangVote = true
    await openEvent()
    await fireEvent.press(screen.getByRole('button', { name: 'Skyline Bar, 2 votes' }))

    expect(await screen.findByText('Sending…')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Skyline Bar, 2 votes, your vote' })).toBeBusy()
  })
})
