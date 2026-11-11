import { fireEvent, screen } from '@testing-library/react-native'

import { ListRow } from '../../src/components/ListRow'
import { Render } from '../helpers/render'

describe('ListRow', () => {
  it('is plain content without onPress', async () => {
    await Render.withTheme(<ListRow subtitle="Admin" title="Meera Krishnan" />)

    expect(screen.getByText('Meera Krishnan')).toBeOnTheScreen()
    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
  })

  it('is a button named by title and subtitle when pressable', async () => {
    await Render.withTheme(<ListRow onPress={jest.fn()} subtitle="Admin" title="Meera Krishnan" />)

    expect(screen.getByRole('button', { name: 'Meera Krishnan, Admin' })).toBeOnTheScreen()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()

    await Render.withTheme(<ListRow chevron onPress={onPress} title="Leave squad" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Leave squad' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('reports busy while a request is in flight', async () => {
    await Render.withTheme(<ListRow busy onPress={jest.fn()} title="Remove Meera" />)

    expect(screen.getByRole('button', { name: 'Remove Meera' })).toBeBusy()
  })

  it('reports whether it is selected', async () => {
    await Render.withTheme(<ListRow onPress={jest.fn()} selected title="Meera Krishnan" />)

    expect(screen.getByRole('button', { name: 'Meera Krishnan' })).toBeSelected()
  })

  it('reports whether the content it opens is showing', async () => {
    await Render.withTheme(<ListRow expanded onPress={jest.fn()} title="Hours" />)

    expect(screen.getByRole('button', { name: 'Hours' })).toBeExpanded()
  })
})
