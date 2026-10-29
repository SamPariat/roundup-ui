import { fireEvent, screen } from '@testing-library/react-native'

import { TopAppBar } from '../../src/components/TopAppBar.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

describe('TopAppBar', () => {
  it('titles the screen with a heading', async () => {
    await renderWithTheme(<TopAppBar title="Squads" />)

    expect(screen.getByRole('heading', { name: 'Squads' })).toBeOnTheScreen()
  })

  it('has a Back button that reports the press', async () => {
    const onBack = jest.fn()

    await renderWithTheme(<TopAppBar onBack={onBack} title="Friday crew" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('has no Back button on top-level screens', async () => {
    await renderWithTheme(<TopAppBar logo title="Squads" />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen()
    expect(screen.getByRole('image', { name: 'Roundup' })).toBeOnTheScreen()
  })

  it('draws the large variant with the same heading', async () => {
    await renderWithTheme(<TopAppBar large title="Your squads" />)

    expect(screen.getByRole('heading', { name: 'Your squads' })).toBeOnTheScreen()
  })
})
