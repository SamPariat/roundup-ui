import { router } from 'expo-router'
import { act, fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { SquadsFixtures } from '../../helpers/squads'
import { VenuesFixtures } from '../../helpers/venues'

/** The backend of the current test. */
let backend: IBackend

/**
 * Opens a squad on its Favorites tab.
 * @returns A promise that resolves once the tab is showing.
 */
const openFavorites = async (): Promise<void> => {
  await VenuesFixtures.openWithSquads(backend, '/squads/s1')
  await screen.findByRole('heading', { name: 'Members' })
  await fireEvent.press(await screen.findByRole('tab', { name: /^Favorites/ }))
}

describe('squad favorites', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')

    backend = VenuesFixtures.backend(
      [
        VenuesFixtures.venue('v1', 'Skyline Bar'),
        VenuesFixtures.venue('v2', 'Brew Cafe', ['cafe']),
      ],
      [SquadsFixtures.squad('s1', 'Friday crew')],
    )

    backend.saved = { v1: ['s1'], v2: ['s1'] }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('lists what the squad saved with who saved it and when, and counts it in the tab', async () => {
    await openFavorites()

    expect(await screen.findByRole('button', { name: /^Skyline Bar/ })).toBeOnTheScreen()
    expect(screen.getAllByText('Saved by you and Meera · 18 Oct')).toHaveLength(2)
    expect(screen.getByRole('tab', { name: 'Favorites, 2' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Members, 3' })).toBeOnTheScreen()
  })

  it('opens the place when its row is pressed', async () => {
    await openFavorites()
    await fireEvent.press(await screen.findByRole('button', { name: /^Brew Cafe/ }))

    expect(await screen.findByRole('heading', { name: 'Brew Cafe' })).toBeOnTheScreen()
  })

  it('shows an empty state with a way to Explore when nothing is saved', async () => {
    backend.saved = {}
    await openFavorites()

    expect(await screen.findByText('Nothing saved yet')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Find places' }))

    expect(await screen.findByRole('button', { name: 'Search radius, 3 km' })).toBeOnTheScreen()
  })

  it('removes your save from the row and loads the favorites again', async () => {
    await openFavorites()
    await screen.findByRole('button', { name: /^Skyline Bar/ })
    await fireEvent.press(screen.getByRole('button', { name: 'Options for Skyline Bar' }))
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Remove from favorites' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^Skyline Bar/ })).toBeNull()
    })

    expect(backend.paths).toContain('DELETE /api/v1/squads/s1/favorites/v1')
    expect(screen.getByRole('button', { name: /^Brew Cafe/ })).toBeOnTheScreen()
  })

  it('shows a failed removal as an error toast over the rows that are still there', async () => {
    backend.unsaveStatus = 500
    await openFavorites()
    await screen.findByRole('button', { name: /^Skyline Bar/ })
    await fireEvent.press(screen.getByRole('button', { name: 'Options for Skyline Bar' }))
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Remove from favorites' }))

    expect(await screen.findByRole('alert')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: /^Skyline Bar/ })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: /^Brew Cafe/ })).toBeOnTheScreen()
    expect(screen.queryByText('Nothing saved yet')).toBeNull()
  })

  it('follows a save or unsave made on the place page', async () => {
    await openFavorites()
    await fireEvent.press(await screen.findByRole('button', { name: /^Skyline Bar/ }))
    await VenuesFixtures.pressSave()
    await fireEvent.press(await screen.findByRole('button', { name: /^Friday crew, / }))

    await waitFor(() => {
      expect(backend.saved?.['v1']).toEqual([])
    })

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))

    await act(() => {
      router.navigate('/squads/s1')
    })

    await fireEvent.press(await screen.findByRole('tab', { name: /^Favorites/ }))

    expect(await screen.findByRole('button', { name: /^Brew Cafe/ })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /^Skyline Bar/ })).toBeNull()
  })

  it('keeps the selected tab in the URL, and leaves the default tab out', async () => {
    await VenuesFixtures.openWithSquads(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('tab', { name: /^Favorites/ }))

    await waitFor(() => {
      expect(screen).toHaveSearchParams({ squadId: 's1', tab: 'favorites' })
    })

    await fireEvent.press(screen.getByRole('tab', { name: /^Members/ }))

    await waitFor(() => {
      expect(screen).toHaveSearchParams({ squadId: 's1' })
    })

    expect(await screen.findByRole('heading', { name: 'Members' })).toBeOnTheScreen()
  })

  it('opens on the tab the link names', async () => {
    await VenuesFixtures.openWithSquads(backend, '/squads/s1?tab=favorites')

    expect(await screen.findByRole('button', { name: /^Skyline Bar/ })).toBeOnTheScreen()
    expect(screen.getByRole('tab', { name: /^Favorites/ })).toBeSelected()
  })

  it('opens on the members for a tab it does not know', async () => {
    await VenuesFixtures.openWithSquads(backend, '/squads/s1?tab=photos')

    expect(await screen.findByRole('heading', { name: 'Members' })).toBeOnTheScreen()
    expect(screen.getByRole('tab', { name: /^Members/ })).toBeSelected()
  })
})
