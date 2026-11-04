import { fireEvent, screen, waitFor } from 'expo-router/testing-library'

import type { IBackend } from '../../helpers/fakes'

import CodeScreen from '../../../src/app/sign-in/code'
import PhoneScreen from '../../../src/app/sign-in/index'
import { RenderHelper } from '../../helpers/render'

/** The backend of the current test. */
let backend: IBackend

/**
 * Code screen test helpers. Static methods only.
 */
class CodeTestHelper {
  /**
   * Opens the code screen at a url.
   * @param url - The url to open, such as the code route with a phone parameter.
   * @returns A promise that resolves once it has rendered.
   */
  static open(url: string): Promise<void> {
    return RenderHelper.app(
      { 'sign-in/code': CodeScreen, 'sign-in/index': PhoneScreen },
      { backend, url },
    )
  }
}

describe('code screen', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: 'Asha' } }
  })

  it('shows the heading, the formatted number, the labeled field and both buttons', async () => {
    await CodeTestHelper.open('/sign-in/code?phone=%2B919876543210')

    expect(await screen.findByRole('heading', { name: 'Enter the code' })).toBeOnTheScreen()
    expect(screen.getByText('We sent it to +91 98765 43210.')).toBeOnTheScreen()
    expect(screen.getByLabelText('6-digit code')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Verify' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Change number' })).toBeOnTheScreen()
  })

  it('counts down to the next code', async () => {
    await CodeTestHelper.open('/sign-in/code?phone=%2B919876543210')

    expect(await screen.findByText('Resend code in')).toBeOnTheScreen()
    expect(screen.getByText('0:30')).toBeOnTheScreen()
  })

  it('goes back to the phone screen for a number that is not valid', async () => {
    await CodeTestHelper.open('/sign-in/code?phone=12345')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeOnTheScreen()
  })

  it('goes back to the phone screen when there is no number', async () => {
    await CodeTestHelper.open('/sign-in/code')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeOnTheScreen()
  })

  it('checks the code by itself on the sixth digit', async () => {
    await CodeTestHelper.open('/sign-in/code?phone=%2B919876543210')
    await fireEvent.changeText(await screen.findByLabelText('6-digit code'), '123456')

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/auth/otp/verify')
    })
  })

  it('shows that the code is wrong and leaves the field editable', async () => {
    backend.verify = 'wrong'
    await CodeTestHelper.open('/sign-in/code?phone=%2B919876543210')
    await fireEvent.changeText(await screen.findByLabelText('6-digit code'), '123456')

    expect(
      await screen.findByText("That code isn't right. Check it and try again."),
    ).toBeOnTheScreen()
  })

  it('names the busy Verify button "Checking code…" while the code is checked', async () => {
    backend.hangVerify = true
    await CodeTestHelper.open('/sign-in/code?phone=%2B919876543210')
    await fireEvent.changeText(await screen.findByLabelText('6-digit code'), '123456')

    expect(await screen.findByRole('button', { busy: true })).toBeOnTheScreen()
  })

  it('goes back to the phone screen from Change number', async () => {
    await CodeTestHelper.open('/sign-in')
    await fireEvent.changeText(await screen.findByLabelText('Phone number'), '9876543210')
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Change number' }))

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeOnTheScreen()
  })
})
