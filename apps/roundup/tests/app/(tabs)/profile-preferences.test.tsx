import { fireEvent, screen } from 'expo-router/testing-library'

import { Render } from '../../helpers/render'
import PreferencesScreen from '@/app/(tabs)/profile/preferences'

/**
 * Preferences test helpers. Static methods only.
 */
class PreferencesFixtures {
  /**
   * Opens Preferences, signed in.
   * @returns A promise that resolves once it has rendered.
   */
  static open(): Promise<void> {
    return Render.app(
      { 'profile/preferences': PreferencesScreen },
      {
        backend: { paths: [], user: { name: 'Asha Rao' } },
        saved: 'r1',
        url: '/profile/preferences',
      },
    )
  }
}

describe('preferences screen', () => {
  it('has Appearance and Language sections with their captions', async () => {
    await PreferencesFixtures.open()

    expect(await screen.findByRole('heading', { name: 'Appearance' })).toBeOnTheScreen()
    expect(screen.getByRole('heading', { name: 'Language' })).toBeOnTheScreen()

    expect(
      screen.getByText("System follows your device's light or dark setting."),
    ).toBeOnTheScreen()

    expect(screen.getByText('More languages are on the way.')).toBeOnTheScreen()
  })

  it('changes the theme', async () => {
    await PreferencesFixtures.open()

    expect(await screen.findByRole('radio', { name: 'System' })).toBeChecked()

    await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked()
  })

  it('shows English on a Language row that is not a button', async () => {
    await PreferencesFixtures.open()

    expect(await screen.findByText('English')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /Language/ })).toBeNull()
  })
})
