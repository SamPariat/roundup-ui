import { fireEvent, screen } from '@testing-library/react-native'

import { Chip } from '../../src/components/Chip'
import { Render } from '../helpers/render'

describe('Chip', () => {
  it('is a button named by its text', async () => {
    await Render.withTheme(<Chip>Bars</Chip>)

    expect(screen.getByRole('button', { name: 'Bars' })).toBeOnTheScreen()
  })

  it('tells assistive tech when it is selected', async () => {
    await Render.withTheme(<Chip selected>Bars</Chip>)

    expect(screen.getByRole('button', { name: 'Bars' })).toBeSelected()
  })

  it('is not selected by default', async () => {
    await Render.withTheme(<Chip>Bars</Chip>)

    expect(screen.getByRole('button', { name: 'Bars' })).not.toBeSelected()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()

    await Render.withTheme(<Chip onPress={onPress}>Bars</Chip>)

    await fireEvent.press(screen.getByRole('button', { name: 'Bars' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
