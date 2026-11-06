import type { ReactElement } from 'react'

import { Slot } from 'expo-router'
import { fireEvent, screen } from 'expo-router/testing-library'

import type { IBackend } from '../../helpers/fakes'

import EditProfileScreen from '../../../src/app/(tabs)/profile/edit'
import ProfileScreen from '../../../src/app/(tabs)/profile/index'
import PreferencesScreen from '../../../src/app/(tabs)/profile/preferences'
import WelcomeScreen from '../../../src/app/index'
import { Render } from '../../helpers/render'

/**
 * Stand-in for the tabs layout: renders the active tab.
 * @returns The slot.
 */
const TabsLayout = (): ReactElement => <Slot />

/** The backend of the current test. */
let backend: IBackend

describe('profile screen', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: 'Asha Rao' } }
  })

  it('shows the signed-in person and the log out row', async () => {
    await Render.app({ profile: ProfileScreen }, { backend, saved: 'r1', url: '/profile' })

    expect(await screen.findByText('Asha Rao')).toBeOnTheScreen()
    expect(screen.getByText('+91 98765 43210')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeOnTheScreen()
  })

  it('lists Edit profile and Preferences with their hints', async () => {
    await Render.app({ profile: ProfileScreen }, { backend, saved: 'r1', url: '/profile' })

    expect(
      await screen.findByRole('button', { name: 'Edit profile, Photo and name' }),
    ).toBeOnTheScreen()

    expect(
      screen.getByRole('button', { name: 'Preferences, Appearance and language' }),
    ).toBeOnTheScreen()
  })

  it('opens Edit profile from its row', async () => {
    await Render.app(
      { 'profile/edit': EditProfileScreen, 'profile/index': ProfileScreen },
      { backend, saved: 'r1', url: '/profile' },
    )

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Edit profile, Photo and name' }),
    )

    expect(await screen.findByLabelText('Name')).toBeOnTheScreen()
    expect(screen).toHavePathname('/profile/edit')
  })

  it('opens Preferences from its row', async () => {
    await Render.app(
      { 'profile/index': ProfileScreen, 'profile/preferences': PreferencesScreen },
      { backend, saved: 'r1', url: '/profile' },
    )

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Preferences, Appearance and language' }),
    )

    expect(await screen.findByRole('heading', { name: 'Appearance' })).toBeOnTheScreen()
    expect(screen).toHavePathname('/profile/preferences')
  })

  it('logs out and returns to Welcome', async () => {
    await Render.app(
      { '(tabs)/_layout': TabsLayout, '(tabs)/profile': ProfileScreen, index: WelcomeScreen },
      { backend, guarded: true, saved: 'r1', url: '/profile' },
    )

    await fireEvent.press(await screen.findByRole('button', { name: 'Log out' }))

    expect(await screen.findByRole('button', { name: 'Continue with phone' })).toBeOnTheScreen()
    expect(backend.paths).toContain('POST /api/v1/auth/logout')
  })
})
