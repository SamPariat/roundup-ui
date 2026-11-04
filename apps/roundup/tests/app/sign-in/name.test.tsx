import { fireEvent, screen, waitFor } from 'expo-router/testing-library'

import type { IBackend } from '../../helpers/fakes'

import NameScreen from '../../../src/app/sign-in/name'
import { RenderHelper } from '../../helpers/render'

/** The backend of the current test. */
let backend: IBackend

/**
 * Name screen test helpers. Static methods only.
 */
class NameTestHelper {
  /**
   * Opens the name screen, signed in.
   * @returns A promise that resolves once it has rendered.
   */
  static open(): Promise<void> {
    return RenderHelper.app(
      { 'sign-in/name': NameScreen },
      { backend, saved: 'r1', url: '/sign-in/name' },
    )
  }
}

describe('name screen', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: '' } }
  })

  it('shows the question, the labeled field with its helper, and Continue without a back button', async () => {
    await NameTestHelper.open()

    expect(
      await screen.findByRole('heading', { name: 'What should your squad call you?' }),
    ).toBeOnTheScreen()

    expect(screen.getByLabelText('Name')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })

  it('asks for a name before saving', async () => {
    await NameTestHelper.open()
    await fireEvent.press(await screen.findByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Enter a name between 1 and 50 characters.')).toBeOnTheScreen()
    expect(backend.paths).not.toContain('PATCH /api/v1/users/me')
  })

  it('saves the name', async () => {
    await NameTestHelper.open()
    await fireEvent.changeText(await screen.findByLabelText('Name'), 'Asha')
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(backend.paths).toContain('PATCH /api/v1/users/me')
    })
  })
})
