import { act, fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Linking } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { VenuesFixtures } from '../../helpers/venues'

/** The first page's path: 3 km around Bengaluru. */
const BASE = '/api/v1/venues?lat=12.9716&lng=77.5946&radius=3000'

/** The backend of the current test. */
let backend: IBackend

describe('explore', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('searches within 3 km of the person and shows each place as a card with a count', async () => {
    backend = VenuesFixtures.backend([
      VenuesFixtures.venue('v1', 'Skyline Bar'),
      VenuesFixtures.venue('v2', 'Brew Cafe', ['cafe']),
    ])

    await VenuesFixtures.open(backend, '/explore')

    expect(await screen.findByRole('button', { name: 'Skyline Bar' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Brew Cafe' })).toBeOnTheScreen()
    expect(screen.getByText('Within 3 km · 2 places')).toBeOnTheScreen()
    expect(VenuesFixtures.searches(backend)).toEqual([BASE])
  })

  it('searches again within the radius picked from the menu, and names the control by it', async () => {
    backend = VenuesFixtures.backend([VenuesFixtures.venue('v1', 'Skyline Bar')])

    await VenuesFixtures.open(backend, '/explore')
    await screen.findByRole('button', { name: 'Skyline Bar' })
    await fireEvent.press(screen.getByRole('button', { name: 'Search radius, 3 km' }))

    expect(screen.getByRole('menuitem', { name: '3 km', selected: true })).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('menuitem', { name: '25 km' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Search radius, 25 km' })).toBeOnTheScreen()
    })

    expect(screen.getByText(/^Within 25 km · /)).toBeOnTheScreen()
    expect(VenuesFixtures.searches(backend)).toContain(BASE.replace('radius=3000', 'radius=25000'))
  })

  it('filters by the chosen kind of place and clears the filter on a second press', async () => {
    backend = VenuesFixtures.backend([
      VenuesFixtures.venue('v1', 'Skyline Bar'),
      VenuesFixtures.venue('v2', 'Brew Cafe', ['cafe']),
    ])

    await VenuesFixtures.open(backend, '/explore')
    await screen.findByRole('button', { name: 'Skyline Bar' })

    await fireEvent.press(screen.getByRole('button', { name: 'Cafes' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Skyline Bar' })).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Cafes' })).toBeSelected()
    expect(screen.getByRole('button', { name: 'Brew Cafe' })).toBeOnTheScreen()
    expect(screen.getByText('Within 3 km · 1 place')).toBeOnTheScreen()
    expect(VenuesFixtures.searches(backend)).toContain(`${BASE}&type=cafe`)

    await fireEvent.press(screen.getByRole('button', { name: 'Cafes' }))

    expect(await screen.findByRole('button', { name: 'Skyline Bar' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Cafes' })).not.toBeSelected()
  })

  it('searches for the typed words once typing pauses', async () => {
    backend = VenuesFixtures.backend([
      VenuesFixtures.venue('v1', 'Skyline Bar'),
      VenuesFixtures.venue('v2', 'Brew Cafe', ['cafe']),
    ])

    await VenuesFixtures.open(backend, '/explore')
    await screen.findByRole('button', { name: 'Skyline Bar' })
    await fireEvent.changeText(screen.getByLabelText('Search places'), 'brew')

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Skyline Bar' })).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Brew Cafe' })).toBeOnTheScreen()
    expect(VenuesFixtures.searches(backend)).toContain(`${BASE}&query=brew`)
  })

  it('shows an empty state when nothing matches', async () => {
    backend = VenuesFixtures.backend([])
    await VenuesFixtures.open(backend, '/explore')

    expect(await screen.findByRole('heading', { name: 'No places found' })).toBeOnTheScreen()
    expect(screen.getByText('Within 3 km · 0 places')).toBeOnTheScreen()
  })

  it('loads the next page when the end of the list comes into view', async () => {
    backend = VenuesFixtures.backend([
      VenuesFixtures.venue('v1', 'Venue One'),
      VenuesFixtures.venue('v2', 'Venue Two'),
      VenuesFixtures.venue('v3', 'Venue Three'),
    ])

    backend.pageSize = 2
    await VenuesFixtures.open(backend, '/explore')

    await fireEvent(await screen.findByRole('button', { name: 'Venue One' }), 'endReached')

    expect(await screen.findByRole('button', { name: 'Venue Three' })).toBeOnTheScreen()
    expect(VenuesFixtures.searches(backend)).toContain(`${BASE}&cursor=2`)
  })

  it('explains the location request and offers Settings when access is denied', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue()

    backend = VenuesFixtures.backend([VenuesFixtures.venue('v1', 'Skyline Bar')])
    await VenuesFixtures.open(backend, '/explore', VenuesFixtures.location('denied'))

    expect(
      await screen.findByRole('heading', { name: 'Allow access to your location' }),
    ).toBeOnTheScreen()

    expect(screen.queryByRole('button', { name: 'Skyline Bar' })).toBeNull()
    expect(VenuesFixtures.searches(backend)).toEqual([])

    await fireEvent.press(screen.getByRole('button', { name: 'Open Settings' }))

    expect(openSettings).toHaveBeenCalledTimes(1)
  })

  it('tries the location again when the app comes back to the foreground', async () => {
    const location = VenuesFixtures.location('denied')
    const requestPermission = jest.mocked(location.requestPermission)
    const comeBack = VenuesFixtures.foreground()

    backend = VenuesFixtures.backend([VenuesFixtures.venue('v1', 'Skyline Bar')])
    await VenuesFixtures.open(backend, '/explore', location)
    await screen.findByRole('heading', { name: 'Allow access to your location' })

    requestPermission.mockResolvedValue('granted')

    await act(() => {
      comeBack()
    })

    expect(await screen.findByRole('button', { name: 'Skyline Bar' })).toBeOnTheScreen()
    expect(requestPermission).toHaveBeenCalledTimes(2)
  })

  it('opens a place from its card', async () => {
    backend = VenuesFixtures.backend([VenuesFixtures.venue('v1', 'Skyline Bar')])
    await VenuesFixtures.open(backend, '/explore')

    await fireEvent.press(await screen.findByRole('button', { name: 'Skyline Bar' }))

    expect(await screen.findByRole('heading', { name: 'Skyline Bar' })).toBeOnTheScreen()
    expect(screen).toHavePathname('/explore/v1')
  })
})
