import { fireEvent, screen, waitFor } from 'expo-router/testing-library'

import { HttpStatus } from '@roundup/core'

import type { IBackend } from '../../helpers/fakes'

import { Render } from '../../helpers/render'
import EditProfileScreen from '@/app/(tabs)/profile/edit'
import ProfileScreen from '@/app/(tabs)/profile/index'

/** The backend of the current test. */
let backend: IBackend

/**
 * Edit profile test helpers. Static methods only.
 */
class EditFixtures {
  /**
   * Opens Edit profile, signed in, with Profile behind it as the place to go back to.
   * @returns A promise that resolves once it has rendered.
   */
  static open(): Promise<void> {
    return Render.app(
      { 'profile/edit': EditProfileScreen, 'profile/index': ProfileScreen },
      { backend, saved: 'r1', url: '/profile/edit' },
    )
  }
}

describe('edit profile screen', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: 'Asha Rao' } }
  })

  it('prefills the labeled name field and offers Save, with no photo button', async () => {
    await EditFixtures.open()

    expect(await screen.findByDisplayValue('Asha Rao')).toBeOnTheScreen()
    expect(screen.getByLabelText('Name')).toBeOnTheScreen()
    expect(screen.getByText('Your squads see this name.')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Save' })).toBeOnTheScreen()
    expect(screen.queryByText(/photo/i)).toBeNull()
  })

  it('saves the new name and goes back', async () => {
    await EditFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Name'), 'Asha')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(backend.paths).toContain('PATCH /api/v1/users/me')
    })

    expect(await screen.findByRole('button', { name: 'Log out' })).toBeOnTheScreen()
    expect(screen).toHavePathname('/profile')
  })

  it('goes back without a request when the name is unchanged', async () => {
    await EditFixtures.open()
    await fireEvent.press(await screen.findByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: 'Log out' })).toBeOnTheScreen()
    expect(screen).toHavePathname('/profile')
    expect(backend.paths).not.toContain('PATCH /api/v1/users/me')
  })

  it('asks for a name before saving', async () => {
    await EditFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Name'), ' '.repeat(3))
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Enter a name between 1 and 50 characters.')).toBeOnTheScreen()
    expect(backend.paths).not.toContain('PATCH /api/v1/users/me')
  })

  it('shows the message for a failed save and stays on the screen', async () => {
    backend.patch = HttpStatus.internalServerError
    await EditFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Name'), 'Asha')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText(/req-7/)).toBeOnTheScreen()
    expect(screen).toHavePathname('/profile/edit')
  })
})
