import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { fireEvent, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { DateTimeField } from '../../src/components/DateTimeField'
import { Render } from '../helpers/render'

/** The moment the fields start on. */
const START = new Date(2026, 10, 14, 20)

describe('DateTimeField', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('is named by its label and shows its helper', async () => {
    await Render.withTheme(
      <DateTimeField helper="Pick a time" label="When" onChange={jest.fn()} value={START} />,
    )

    expect(screen.getByRole('button', { name: 'When' })).toBeOnTheScreen()
    expect(screen.getByText('Pick a time')).toBeOnTheScreen()
  })

  it('reports the moment the picker gives on iOS', async () => {
    const onChange = jest.fn()

    await Render.withTheme(<DateTimeField label="When" onChange={onChange} value={START} />)
    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 14, 21))
  })

  it('replaces the helper with the error', async () => {
    await Render.withTheme(
      <DateTimeField
        error="Too early"
        helper="Pick a time"
        label="When"
        onChange={jest.fn()}
        value={START}
      />,
    )

    expect(screen.getByText('Too early')).toBeOnTheScreen()
    expect(screen.queryByText('Pick a time')).toBeNull()
  })

  it('shows its text and opens the date dialog on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android')

    await Render.withTheme(
      <DateTimeField label="When" onChange={jest.fn()} text="Sat 14 Nov, 8:00 pm" value={START} />,
    )

    expect(screen.getByText('Sat 14 Nov, 8:00 pm')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(DateTimePickerAndroid.open).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'date', value: START }),
    )
  })
})
