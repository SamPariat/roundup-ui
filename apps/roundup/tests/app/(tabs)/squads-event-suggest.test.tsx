import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { EventsFixtures } from '../../helpers/events'
import { VenuesFixtures } from '../../helpers/venues'

/** The backend of the current test. */
let backend: IBackend

/**
 * Opens a draft event of squad s1 and its Suggest a place sheet.
 * @param permission - What the person answers when asked for their location.
 * @returns A promise that resolves once the sheet is showing.
 */
const openSheet = async (permission: 'denied' | 'granted' = 'granted'): Promise<void> => {
  await EventsFixtures.open(backend, '/squads/event/e1', VenuesFixtures.location(permission))

  await fireEvent.press(await screen.findByRole('button', { name: 'Suggest a place' }))
  await screen.findByText('Saturday night out')
}

describe('Suggest a place sheet', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')

    backend = EventsFixtures.backend([EventsFixtures.event('e1', 'Saturday night out')])

    backend.venues = [
      VenuesFixtures.venue('v1', 'Skyline Bar'),
      VenuesFixtures.venue('v2', 'Brew Cafe', ['cafe']),
    ]

    backend.saved = { v1: ['s1'] }
    backend.visited = ['v2']
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('opens from the draft page with the squad favorites and counts in its tabs', async () => {
    await openSheet()

    expect(await screen.findByText('Saved by you and Meera · 4.5')).toBeOnTheScreen()
    expect(screen.getByRole('tab', { name: 'Squad favorites, 1' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Been before, 1' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Suggest Skyline Bar' })).toBeOnTheScreen()
  })

  it('leaves out the link for someone who may not suggest', async () => {
    backend.events = [EventsFixtures.event('e1', 'Saturday night out', { status: 'CONFIRMED' })]
    await EventsFixtures.open(backend, '/squads/event/e1')
    await screen.findByText('Are you in?')

    expect(screen.queryByRole('button', { name: 'Suggest a place' })).toBeNull()
  })

  it('suggests a place, swaps its button for Suggested and shows it on the page', async () => {
    await openSheet()
    await fireEvent.press(await screen.findByRole('button', { name: 'Suggest Skyline Bar' }))

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/events/e1/nominations')
    })

    expect(await screen.findByText('Suggested')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Suggest Skyline Bar' })).toBeNull()

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()
    })

    expect(screen.getByText('1 suggested')).toBeOnTheScreen()
  })

  it('says Suggesting… on the button while the suggestion is sent', async () => {
    backend.hangNominate = true
    await openSheet()
    await fireEvent.press(await screen.findByRole('button', { name: 'Suggest Skyline Bar' }))

    expect(await screen.findByText('Suggesting…')).toBeOnTheScreen()
  })

  it('lists the places the squad has been to on the second tab', async () => {
    await openSheet()
    await fireEvent.press(await screen.findByRole('tab', { name: /^Been before/ }))

    expect(await screen.findByText('Brew Cafe')).toBeOnTheScreen()
    expect(screen.getByText('Been 2 times · last 18th Oct 2026')).toBeOnTheScreen()
    expect(screen.queryByText('Skyline Bar')).toBeNull()
  })

  it('lists the places the typed words find, near the person', async () => {
    await openSheet()
    await fireEvent.changeText(screen.getByLabelText('Search places'), 'brew')

    expect(await screen.findByRole('button', { name: 'Suggest Brew Cafe' })).toBeOnTheScreen()
    expect(screen.queryByRole('tab', { name: /^Squad favorites/ })).toBeNull()
  })

  it('asks for the location only once words are typed, and says search needs it when refused', async () => {
    await openSheet('denied')

    expect(screen.queryByText('Allow access to your location')).toBeNull()

    await fireEvent.changeText(screen.getByLabelText('Search places'), 'sky')

    expect(await screen.findByText('Allow access to your location')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Open Settings' })).toBeOnTheScreen()

    // The tabs keep working.
    expect(screen.getByRole('tab', { name: /^Squad favorites/ })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Suggest Skyline Bar' })).toBeOnTheScreen()
  })
})
