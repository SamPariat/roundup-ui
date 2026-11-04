import { fireEvent, screen } from '@testing-library/react-native'

import { PageHeader } from '../../src/components/PageHeader'
import { RenderHelper } from '../helpers/render'

describe('PageHeader', () => {
  it('titles the page with a level 1 heading', async () => {
    await RenderHelper.withTheme(<PageHeader title="Friday crew" />)

    expect(screen.getByRole('heading', { name: 'Friday crew' })).toBeOnTheScreen()
  })

  it('offers a back button named by its text', async () => {
    const onBack = jest.fn()

    await RenderHelper.withTheme(<PageHeader back="Squads" onBack={onBack} title="Friday crew" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Squads' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows the subtitle', async () => {
    await RenderHelper.withTheme(<PageHeader subtitle="12 members" title="Friday crew" />)

    expect(screen.getByText('12 members')).toBeOnTheScreen()
  })
})
