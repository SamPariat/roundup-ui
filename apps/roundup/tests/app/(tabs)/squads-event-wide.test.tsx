import { screen } from 'expo-router/testing-library'

import { EventsFixtures } from '../../helpers/events'

/** The window a test chose. */
const mockWindow = { fontScale: 1, height: 900, scale: 1, width: 1440 }

/**
 * Stand-in for useWindowDimensions that returns the desktop width. A function declaration so the
 * jest.mock factory can reach it before this file's constants are initialized.
 * @returns The mocked window.
 */
function mockUseWindowDimensions(): typeof mockWindow {
  return mockWindow
}

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: mockUseWindowDimensions,
}))

describe('event page while voting, on a wide screen', () => {
  it('adds the answer, a list of who is coming with their answers and the addresses of places', async () => {
    const backend = EventsFixtures.backend([
      EventsFixtures.event('e1', 'Saturday night out', {
        answers: { u1: 'GOING', u2: 'MAYBE' },
        nominations: [EventsFixtures.place('p1', 'Skyline Bar', 'u2')],
        status: 'VOTING',
      }),
    ])

    await EventsFixtures.open(backend, '/squads/event/e1')

    expect(await screen.findByRole('heading', { name: "Who's coming" })).toBeOnTheScreen()
    expect(screen.getByText('Kabir Rao')).toBeOnTheScreen()
    expect(screen.getByText("Hasn't answered")).toBeOnTheScreen()
    expect(screen.getByText('Skyline Bar Road')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Going' })).toBeSelected()
  })
})
