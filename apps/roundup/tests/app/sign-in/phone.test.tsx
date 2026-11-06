import { fireEvent, screen } from 'expo-router/testing-library'

import { HttpStatus } from '@roundup/core'

import type { IBackend } from '../../helpers/fakes'

import CodeScreen from '../../../src/app/sign-in/code'
import PhoneScreen from '../../../src/app/sign-in/index'
import { Render } from '../../helpers/render'

/** The backend of the current test. */
let backend: IBackend

/**
 * Phone screen test helpers. Static methods only.
 */
class PhoneFixtures {
  /**
   * Opens the phone screen.
   * @returns A promise that resolves once it has rendered.
   */
  static open(): Promise<void> {
    return Render.app(
      { 'sign-in/code': CodeScreen, 'sign-in/index': PhoneScreen },
      { backend, url: '/sign-in' },
    )
  }
}

describe('phone screen', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: 'Asha' } }
  })

  it('shows the heading, the labeled field with its helper, and the button', async () => {
    await PhoneFixtures.open()

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeOnTheScreen()
    expect(screen.getByLabelText('Phone number')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Send code' })).toBeOnTheScreen()
    expect(screen.getByText('New here? The same code creates your account.')).toBeOnTheScreen()
  })

  it('sends the code and opens the code screen with the formatted number', async () => {
    await PhoneFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '9876543210')
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }))

    expect(await screen.findByText('We sent it to +91 98765 43210.')).toBeOnTheScreen()
    expect(backend.paths).toContain('POST /api/v1/auth/otp/request')
  })

  it('shows an error for a number that is too short, without a request', async () => {
    await PhoneFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '12345')
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }))

    expect(
      await screen.findByText('Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.'),
    ).toBeOnTheScreen()

    expect(backend.paths).not.toContain('POST /api/v1/auth/otp/request')
  })

  it('names the busy button "Sending code…" while the request is in flight', async () => {
    backend.hangOtp = true
    await PhoneFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '9876543210')
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }))

    expect(await screen.findByText('Sending code…')).toBeOnTheScreen()
    expect(screen.getByRole('button', { busy: true })).toBeOnTheScreen()
  })

  it('quotes the request id when something unexpected fails', async () => {
    backend.otp = HttpStatus.internalServerError
    await PhoneFixtures.open()
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '9876543210')
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }))

    expect(await screen.findByText(/quote this reference: req-7/)).toBeOnTheScreen()
  })
})
