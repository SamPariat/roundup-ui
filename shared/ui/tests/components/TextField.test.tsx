import { fireEvent, screen } from '@testing-library/react-native'

import { TextField } from '../../src/components/TextField.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

describe('TextField', () => {
  it('is named by its label', async () => {
    await renderWithTheme(<TextField label="Squad name" />)

    expect(screen.getByLabelText('Squad name')).toBeOnTheScreen()
  })

  it('reports what the person types', async () => {
    const onChangeText = jest.fn()

    await renderWithTheme(<TextField label="Squad name" onChangeText={onChangeText} />)

    await fireEvent.changeText(screen.getByLabelText('Squad name'), 'Friday crew')

    expect(onChangeText).toHaveBeenCalledWith('Friday crew')
  })

  it('announces the error as an alert and replaces the helper', async () => {
    await renderWithTheme(
      <TextField
        error="That name is taken. Try another."
        helper="Pick a name"
        label="Squad name"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('That name is taken. Try another.')
    expect(screen.queryByText('Pick a name')).not.toBeOnTheScreen()
  })

  it('cannot be edited when disabled', async () => {
    await renderWithTheme(<TextField disabled label="Squad name" />)

    expect(screen.getByLabelText('Squad name')).toBeDisabled()
  })
})
