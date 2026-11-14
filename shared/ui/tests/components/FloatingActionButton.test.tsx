import { fireEvent, screen } from '@testing-library/react-native'

import { FloatingActionButton } from '../../src/components/FloatingActionButton'
import { Render } from '../helpers/render'

describe('FloatingActionButton', () => {
  it('is a button named by its text', async () => {
    await Render.withTheme(<FloatingActionButton icon="plus">New squad</FloatingActionButton>)

    expect(screen.getByRole('button', { name: 'New squad' })).toBeOnTheScreen()
  })

  it('takes a label over its text', async () => {
    await Render.withTheme(
      <FloatingActionButton icon="plus" label="Create a squad">
        New squad
      </FloatingActionButton>,
    )

    expect(screen.getByRole('button', { name: 'Create a squad' })).toBeOnTheScreen()
  })

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn()

    await Render.withTheme(
      <FloatingActionButton icon="plus" onPress={onPress}>
        New squad
      </FloatingActionButton>,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'New squad' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is a solid accent button with a shadow and no glass', async () => {
    await Render.withTheme(<FloatingActionButton icon="plus">New squad</FloatingActionButton>)

    const button = screen.getByRole('button', { name: 'New squad' })

    expect(button).toHaveProp('className', expect.stringContaining('bg-accent'))
    expect(button).toHaveProp('className', expect.stringContaining('shadow-toast'))
    expect(button).toHaveProp('className', expect.not.stringContaining('/75'))
    expect(button).toHaveProp('className', expect.not.stringContaining('blur'))
  })
})
