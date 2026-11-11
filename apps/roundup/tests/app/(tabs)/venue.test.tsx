import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Linking } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { SquadsFixtures } from '../../helpers/squads'
import { VenuesFixtures } from '../../helpers/venues'

/** The backend of the current test. */
let backend: IBackend

describe('venue page', () => {
  beforeEach(() => {
    backend = VenuesFixtures.backend(
      [VenuesFixtures.venue('v1', 'Skyline Bar')],
      [SquadsFixtures.squad('s1', 'Friday crew'), SquadsFixtures.squad('s2', 'Goa trip')],
    )

    backend.saved = { v1: ['s1'] }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the facts, the summary, the review and the squads it is saved in', async () => {
    await VenuesFixtures.open(backend, '/explore/v1')

    expect(await screen.findByRole('heading', { name: 'Skyline Bar' })).toBeOnTheScreen()
    expect(screen.getByRole('img', { name: '4.5 out of 5, 120 reviews' })).toBeOnTheScreen()
    expect(screen.getByRole('img', { name: 'Price level 2 of 4' })).toBeOnTheScreen()
    expect(screen.getByText('Open now')).toBeOnTheScreen()
    expect(screen.getByText('A place with a view.')).toBeOnTheScreen()
    expect(screen.getByText('Skyline Bar Road')).toBeOnTheScreen()
    expect(screen.getByText('Great views.')).toBeOnTheScreen()
    expect(screen.getByText('Meera, a month ago')).toBeOnTheScreen()
    expect(screen.getByText('Friday crew')).toBeOnTheScreen()
  })

  it('expands the opening hours to the whole week', async () => {
    await VenuesFixtures.open(backend, '/explore/v1')

    const hours = await screen.findByRole('button', { name: /^Hours/ })

    expect(hours).not.toBeExpanded()
    expect(screen.queryByText('Monday: 5:00 PM – 11:00 PM')).toBeNull()

    await fireEvent.press(hours)

    expect(screen.getByRole('button', { name: /^Hours/ })).toBeExpanded()
    expect(screen.getByText('Monday: 5:00 PM – 11:00 PM')).toBeOnTheScreen()
  })

  it('dials the phone and opens the website', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue()

    await VenuesFixtures.open(backend, '/explore/v1')
    await fireEvent.press(await screen.findByRole('button', { name: /^Phone/ }))
    await fireEvent.press(screen.getByRole('button', { name: /^Website/ }))

    expect(open).toHaveBeenNthCalledWith(1, 'tel:+918012345678')
    expect(open).toHaveBeenNthCalledWith(2, 'https://venue.example')
  })

  it('saves the place in a squad and takes it out again', async () => {
    await VenuesFixtures.open(backend, '/explore/v1')
    await VenuesFixtures.pressSave()

    expect(await screen.findByText('Save to which squad?')).toBeOnTheScreen()

    expect(await screen.findByRole('button', { name: 'Friday crew' })).toBeSelected()
    expect(screen.getByRole('button', { name: 'Goa trip' })).not.toBeSelected()

    await fireEvent.press(screen.getByRole('button', { name: 'Goa trip' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Goa trip' })).toBeSelected()
    })

    expect(backend.paths).toContain('POST /api/v1/squads/s2/favorites')
    expect(backend.saved?.['v1']).toEqual(['s1', 's2'])

    await fireEvent.press(screen.getByRole('button', { name: 'Friday crew' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Friday crew' })).not.toBeSelected()
    })

    expect(backend.paths).toContain('DELETE /api/v1/squads/s1/favorites/v1')
    expect(backend.saved?.['v1']).toEqual(['s2'])

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.queryByText('Save to which squad?')).toBeNull()
    })

    // The page's Saved in row follows the change.
    expect(screen.getByText('Goa trip')).toBeOnTheScreen()
  })

  it('says so when the person is in no squad', async () => {
    backend.squads = []
    await VenuesFixtures.open(backend, '/explore/v1')
    await VenuesFixtures.pressSave()

    expect(
      await screen.findByText('Join or make a squad first, then save places for it.'),
    ).toBeOnTheScreen()
  })

  it('shows a not-found state for a place that does not exist', async () => {
    await VenuesFixtures.open(backend, '/explore/nope')

    expect(await screen.findByRole('heading', { name: 'Place not found' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Back to Explore' })).toBeOnTheScreen()
  })
})
