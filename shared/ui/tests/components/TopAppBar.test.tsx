import { fireEvent, screen } from '@testing-library/react-native'

import { TopAppBar } from '../../src/components/TopAppBar'
import { Render } from '../helpers/render'

describe('TopAppBar', () => {
  it('titles the screen with a heading', async () => {
    await Render.withTheme(<TopAppBar title="Squads" />)

    expect(screen.getByRole('heading', { name: 'Squads' })).toBeOnTheScreen()
  })

  it('has a Back button that reports the press', async () => {
    const onBack = jest.fn()

    await Render.withTheme(<TopAppBar onBack={onBack} title="Friday crew" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('has no Back button on top-level screens', async () => {
    await Render.withTheme(<TopAppBar logo title="Squads" />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen()
    expect(screen.getByRole('image', { name: 'Roundup' })).toBeOnTheScreen()
  })
})
