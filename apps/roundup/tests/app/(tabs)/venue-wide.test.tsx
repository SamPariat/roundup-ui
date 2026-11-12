import { screen } from 'expo-router/testing-library'

import { SquadsFixtures } from '../../helpers/squads'
import { VenuesFixtures } from '../../helpers/venues'

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

describe('venue page on a wide screen', () => {
  it('shows About, every review with its time, and the facts in a card', async () => {
    const backend = VenuesFixtures.backend(
      [VenuesFixtures.venue('v1', 'Skyline Bar')],
      [SquadsFixtures.squad('s1', 'Friday crew')],
    )

    await VenuesFixtures.open(backend, '/explore/v1')

    expect(await screen.findByRole('heading', { name: 'About' })).toBeOnTheScreen()
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeOnTheScreen()
    expect(screen.getByText('Meera')).toBeOnTheScreen()
    expect(screen.getByText('a month ago')).toBeOnTheScreen()
    expect(screen.getByText('Open now')).toBeOnTheScreen()
    expect(screen.getByText('Not saved in any squad yet')).toBeOnTheScreen()

    // The tests run as iOS, whose system header has no Save button, so the floating one stays.
    expect(screen.getByRole('button', { name: 'Save to squad' })).toBeOnTheScreen()
  })
})
