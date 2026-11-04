import type { ReactElement } from 'react'

import { Slot } from 'expo-router'
import { fireEvent, screen } from 'expo-router/testing-library'

import type { IBackend } from '../../helpers/fakes'

import ProfileScreen from '../../../src/app/(tabs)/profile/index'
import WelcomeScreen from '../../../src/app/index'
import { RenderHelper } from '../../helpers/render'

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
    await RenderHelper.app({ profile: ProfileScreen }, { backend, saved: 'r1', url: '/profile' })

    expect(await screen.findByText('Asha Rao')).toBeOnTheScreen()
    expect(screen.getByText('+91 98765 43210')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeOnTheScreen()
  })

  it('still offers the theme choice', async () => {
    await RenderHelper.app({ profile: ProfileScreen }, { backend, saved: 'r1', url: '/profile' })

    expect(await screen.findByText('Theme')).toBeOnTheScreen()
  })

  it('logs out and returns to Welcome', async () => {
    await RenderHelper.app(
      { '(tabs)/_layout': TabsLayout, '(tabs)/profile': ProfileScreen, index: WelcomeScreen },
      { backend, guarded: true, saved: 'r1', url: '/profile' },
    )

    await fireEvent.press(await screen.findByRole('button', { name: 'Log out' }))

    expect(await screen.findByRole('button', { name: 'Continue with phone' })).toBeOnTheScreen()
    expect(backend.paths).toContain('POST /api/v1/auth/logout')
  })
})
