import { fireEvent, screen } from '@testing-library/react-native'

import { PhoneInput } from '../../src/components/PhoneInput'
import { RenderHelper } from '../helpers/render'

describe('PhoneInput', () => {
  it('is named by its label', async () => {
    await RenderHelper.withTheme(<PhoneInput label="Phone number" />)

    expect(screen.getByLabelText('Phone number')).toBeOnTheScreen()
  })

  it('reports what the person types', async () => {
    const onChangeText = jest.fn()

    await RenderHelper.withTheme(<PhoneInput label="Phone number" onChangeText={onChangeText} />)

    await fireEvent.changeText(screen.getByLabelText('Phone number'), '9876543210')

    expect(onChangeText).toHaveBeenCalledWith('9876543210')
  })

  it('announces an error', async () => {
    await RenderHelper.withTheme(
      <PhoneInput error="Enter a 10-digit number." label="Phone number" />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a 10-digit number.')
  })
})
