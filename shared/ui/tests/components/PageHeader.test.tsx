import { fireEvent, screen } from '@testing-library/react-native'

import { PageHeader } from '../../src/components/PageHeader.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

describe('PageHeader', () => {
  it('titles the page with a level 1 heading', async () => {
    await renderWithTheme(<PageHeader title="Friday crew" />)

    expect(screen.getByRole('heading', { name: 'Friday crew' })).toBeOnTheScreen()
  })

  it('offers a back button named by its text', async () => {
    const onBack = jest.fn()
    await renderWithTheme(<PageHeader back="Squads" onBack={onBack} title="Friday crew" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Squads' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows the subtitle', async () => {
    await renderWithTheme(<PageHeader subtitle="12 members" title="Friday crew" />)

    expect(screen.getByText('12 members')).toBeOnTheScreen()
  })
})
