import { fireEvent, screen } from '@testing-library/react-native'

import { renderWithTheme } from '../test/render.tsx'
import { ListRow } from './ListRow.tsx'

describe('ListRow', () => {
  it('is plain content without onPress', async () => {
    await renderWithTheme(<ListRow subtitle="Admin" title="Meera Krishnan" />)

    expect(screen.getByText('Meera Krishnan')).toBeOnTheScreen()
    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
  })

  it('is a button named by title and subtitle when pressable', async () => {
    await renderWithTheme(<ListRow onPress={jest.fn()} subtitle="Admin" title="Meera Krishnan" />)

    expect(screen.getByRole('button', { name: 'Meera Krishnan, Admin' })).toBeOnTheScreen()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()
    await renderWithTheme(<ListRow chevron onPress={onPress} title="Leave squad" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Leave squad' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('reports busy while a request is in flight', async () => {
    await renderWithTheme(<ListRow busy onPress={jest.fn()} title="Remove Meera" />)

    expect(screen.getByRole('button', { name: 'Remove Meera' })).toBeBusy()
  })
})
