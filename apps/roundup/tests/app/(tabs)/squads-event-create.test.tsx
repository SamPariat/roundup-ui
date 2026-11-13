import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { EventsFixtures } from '../../helpers/events'

/** The backend of the current test. */
let backend: IBackend

/**
 * Opens the New event modal of squad s1.
 * @returns A promise that resolves once the modal is showing.
 */
const openModal = async (): Promise<void> => {
  await EventsFixtures.open(backend, '/squads/s1?tab=events')
  await fireEvent.press(await screen.findByRole('button', { name: 'New event' }))
  await screen.findByText('Everyone in Friday crew is invited')
}

describe('New event modal', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')
    backend = EventsFixtures.backend([])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('asks for a name, the kind of night and two moments', async () => {
    await openModal()

    expect(screen.getByLabelText('Name')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Drinks' })).toBeSelected()
    expect(screen.getByRole('button', { name: 'Dinner' })).not.toBeSelected()
    expect(screen.getByRole('button', { name: 'Both' })).not.toBeSelected()
    expect(screen.getByRole('button', { name: 'When' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Voting closes' })).toBeOnTheScreen()
    expect(screen.getByText('People can suggest places until you start voting')).toBeOnTheScreen()
  })

  it('starts tomorrow at 8 pm, which the voting deadline follows', async () => {
    await openModal()

    expect(screen.getAllByText('Thu 12 Nov, 8:00 pm')).toHaveLength(2)
  })

  it('refuses a blank name and sends nothing', async () => {
    await openModal()
    await fireEvent.press(screen.getByRole('button', { name: 'Create event' }))

    expect(await screen.findByText('Enter a name for the event.')).toBeOnTheScreen()
    expect(backend.paths).not.toContain('POST /api/v1/squads/s1/events')
  })

  it('puts a deadline after the start under Voting closes, not under When', async () => {
    await openModal()
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Saturday night out')
    await fireEvent.press(screen.getByRole('button', { name: 'Voting closes' }))

    // The picker opens in a second modal on top of the form: pick the day after the start.
    await fireEvent.press(await screen.findByRole('button', { name: 'Friday 13 November' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()
    })

    await fireEvent.press(screen.getByRole('button', { name: 'Create event' }))

    expect(await screen.findByText('Close voting before the event starts.')).toBeOnTheScreen()
    expect(screen.queryByText("Pick a time that hasn't passed yet.")).toBeNull()
    expect(backend.paths).not.toContain('POST /api/v1/squads/s1/events')
  })

  it('opens a picker over the form, which keeps its value until Done', async () => {
    await openModal()
    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(await screen.findByRole('button', { name: 'Done' })).toBeOnTheScreen()
    // The form is still under it, and the days before now are off.
    expect(screen.getByText('Everyone in Friday crew is invited')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Tuesday 10 November' })).toBeDisabled()

    await fireEvent.press(screen.getByRole('button', { name: 'Friday 13 November' }))

    expect(screen.getByText('Fri 13 Nov, 8:00 pm')).toBeOnTheScreen()
    expect(screen.getAllByText('Thu 12 Nov, 8:00 pm')).toHaveLength(2)

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()
    })

    // Voting closes follows the start until it is picked itself.
    expect(screen.getAllByText('Fri 13 Nov, 8:00 pm')).toHaveLength(2)
  })

  it('drops what was picked when the picker is cancelled', async () => {
    await openModal()
    await fireEvent.press(screen.getByRole('button', { name: 'When' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Friday 13 November' }))

    // The picker's Cancel comes before the form's own, which is in the form's footer.
    await fireEvent.press(screen.getAllByRole('button', { name: 'Cancel' })[0]!)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()
    })

    expect(screen.getAllByText('Thu 12 Nov, 8:00 pm')).toHaveLength(2)
    expect(screen.getByText('Everyone in Friday crew is invited')).toBeOnTheScreen()
  })

  it('creates the event and opens it', async () => {
    await openModal()
    await fireEvent.changeText(screen.getByLabelText('Name'), '  Saturday night out ')
    await fireEvent.press(screen.getByRole('button', { name: 'Dinner' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Create event' }))

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/squads/s1/events')
    })

    expect(backend.events?.[0]).toMatchObject({ name: 'Saturday night out', type: 'DINING' })
    expect(await screen.findByText(/^Started by you/)).toBeOnTheScreen()
    expect(screen).toHavePathname('/squads/event/new-1')
  })

  it('shows Creating event… and stays open while the request runs', async () => {
    backend.hangCreate = true
    await openModal()
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Saturday night out')
    await fireEvent.press(screen.getByRole('button', { name: 'Create event' }))

    expect(await screen.findByText('Creating event…')).toBeOnTheScreen()
    expect(screen.getByText('Everyone in Friday crew is invited')).toBeOnTheScreen()
  })

  it('closes on Cancel without creating anything', async () => {
    await openModal()
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('Everyone in Friday crew is invited')).toBeNull()
    })

    expect(backend.paths).not.toContain('POST /api/v1/squads/s1/events')
  })
})
