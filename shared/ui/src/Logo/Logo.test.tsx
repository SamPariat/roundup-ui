import { screen } from '@testing-library/react-native'

import { renderWithTheme } from '../test/render.tsx'
import { Logo } from './Logo.tsx'

describe('Logo', () => {
  it('is announced as Roundup', async () => {
    await renderWithTheme(<Logo />)

    expect(screen.getByRole('image', { name: 'Roundup' })).toBeOnTheScreen()
  })

  it('can carry another name', async () => {
    await renderWithTheme(<Logo label="Roundup home" type="mark" />)

    expect(screen.getByRole('image', { name: 'Roundup home' })).toBeOnTheScreen()
  })

  it.each(['lockup', 'mark', 'wordmark'] as const)('draws the %s', async (type) => {
    await renderWithTheme(<Logo size="lg" tone="mono" type={type} />)

    expect(screen.getByRole('image')).toBeOnTheScreen()
  })
})
