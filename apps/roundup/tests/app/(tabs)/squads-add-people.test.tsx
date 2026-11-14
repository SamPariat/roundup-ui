import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Linking, Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { Render } from '../../helpers/render'
import { SquadsFixtures } from '../../helpers/squads'

/** Zoya, who is on Roundup and in the address book. */
const ZOYA = { id: 'u9', name: 'Zoya Khan', phone: '+919876543210' }

/** Dev, who is on Roundup and in the address book. */
const DEV = { id: 'u8', name: 'Dev Menon', phone: '+919876543211' }

/** The backend of the current test. */
let backend: IBackend

/**
 * Add people test helpers. Static methods only.
 */
class AddFixtures {
  /**
   * Opens the squad page and its Add people dialog.
   * @param contacts - The fake address book.
   * @returns A promise that resolves once the dialog is open.
   */
  static async openDialog(contacts: ReturnType<typeof SquadsFixtures.contacts>): Promise<void> {
    await SquadsFixtures.open(backend, '/squads/s1', contacts)
    await fireEvent.press(await screen.findByRole('button', { name: 'Add people' }))
  }

  /**
   * Renders the web Add people dialog on its own, signed in.
   * @param onClose - Called when the dialog asks to close.
   * @returns A promise that resolves once it has rendered.
   */
  static openWeb(onClose: () => void): Promise<void> {
    return Render.app(
      { index: SquadsFixtures.webAddPeople(onClose) },
      { backend, saved: 'r1', url: '/' },
    )
  }
}

describe('add people with contacts', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')
    backend = SquadsFixtures.backend([SquadsFixtures.squad('s1', 'Friday crew')])
    backend.lookup = [ZOYA, DEV]
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('lists the contacts on Roundup, with a disabled invite row below', async () => {
    const contacts = SquadsFixtures.contacts('granted', ['98765 43210', '98765 43211'])

    await AddFixtures.openDialog(contacts)

    expect(await screen.findByRole('button', { name: /^Zoya Khan/ })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: /^Dev Menon/ })).toBeOnTheScreen()
    expect(screen.getByText('Invite someone not on Roundup')).toBeOnTheScreen()
    expect(screen.getByText('Coming later')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /^Invite someone/ })).toBeNull()
    expect(contacts.requestPermission).toHaveBeenCalledTimes(1)
  })

  it('ticks people, says they are selected, and adds them', async () => {
    await AddFixtures.openDialog(SquadsFixtures.contacts('granted', ['98765 43210']))

    const zoya = await screen.findByRole('button', { name: /^Zoya Khan/ })

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await fireEvent.press(zoya)

    expect(screen.getByRole('button', { name: /^Zoya Khan/ })).toBeSelected()

    await fireEvent.press(screen.getByRole('button', { name: 'Add 1 person' }))

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/squads/s1/members')
    })

    expect(await screen.findByText('Zoya Khan')).toBeOnTheScreen()
    expect(screen.queryByText('Your contacts on Roundup')).toBeNull()
    expect(await screen.findByText('Added 1 person')).toBeOnTheScreen()
  })

  it('narrows the list by the search text', async () => {
    await AddFixtures.openDialog(SquadsFixtures.contacts('granted', ['98765 43210', '98765 43211']))
    await fireEvent.changeText(await screen.findByLabelText('Search contacts'), 'dev')

    expect(screen.getByRole('button', { name: /^Dev Menon/ })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /^Zoya Khan/ })).toBeNull()
  })

  it('explains the request when contacts are denied, and links to Settings', async () => {
    const settings = jest.spyOn(Linking, 'openSettings').mockResolvedValue()

    await AddFixtures.openDialog(SquadsFixtures.contacts('denied'))

    expect(await screen.findByText('Allow access to contacts')).toBeOnTheScreen()

    expect(
      screen.getByText(/Roundup reads only phone numbers, to find which of your contacts/),
    ).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Open Settings' }))

    expect(settings).toHaveBeenCalledTimes(1)
    expect(backend.paths).not.toContain('POST /api/v1/users/lookup')
  })

  it('falls back to typing a number when contacts are denied', async () => {
    await AddFixtures.openDialog(SquadsFixtures.contacts('denied'))
    await fireEvent.press(await screen.findByRole('button', { name: 'Type a number instead' }))
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '98765 43210')
    await fireEvent.press(screen.getByRole('button', { name: 'Add to squad' }))

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/squads/s1/members')
    })

    expect(await screen.findByText('Zoya Khan')).toBeOnTheScreen()
  })
})

describe('add people on web', () => {
  beforeEach(() => {
    backend = SquadsFixtures.backend([SquadsFixtures.squad('s1', 'Friday crew')])
    backend.lookup = [ZOYA]
  })

  it('shows the phone field only, and adds the typed number', async () => {
    const onClose = jest.fn()

    await AddFixtures.openWeb(onClose)

    expect(await screen.findByText('Add by phone number')).toBeOnTheScreen()
    expect(screen.getByText('Friday crew')).toBeOnTheScreen()
    expect(screen.queryByLabelText('Search contacts')).toBeNull()

    await fireEvent.changeText(screen.getByLabelText('Phone number'), '98765 43210')
    await fireEvent.press(screen.getByRole('button', { name: 'Add to squad' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    expect(backend.paths).toContain('POST /api/v1/squads/s1/members')
    expect(await screen.findByText('Added 1 person')).toBeOnTheScreen()
  })

  it('shows the message when the number is not on Roundup', async () => {
    await AddFixtures.openWeb(jest.fn())
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '98765 43219')
    await fireEvent.press(screen.getByRole('button', { name: 'Add to squad' }))

    expect(await screen.findByText("That number isn't on Roundup yet.")).toBeOnTheScreen()
  })
})
