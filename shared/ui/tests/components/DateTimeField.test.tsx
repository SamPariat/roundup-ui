import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { fireEvent, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

import type { IDateTimeFormat } from '../../src/components/DateTimeField'

import { DateTimeField } from '../../src/components/DateTimeField'
import { Render } from '../helpers/render'

/**
 * Writes every moment the same way, so the tests need no date library.
 * @returns A fixed text.
 */
const display = (): string => 'Sat 14 Nov, 8:00 pm'

/**
 * Writes every moment the same way for the browser's input.
 * @returns A fixed datetime-local value.
 */
const toInput = (): string => '2026-11-14T20:00'

/**
 * Reads an input's value as a moment.
 * @param text - The input's value.
 * @returns The moment, or undefined while the input is empty.
 */
const fromInput = (text: string): Date | undefined => (text === '' ? undefined : new Date(text))

/** A format that writes a moment in a fixed way and reads it back. */
const FORMAT: IDateTimeFormat = { display, fromInput, toInput }

/** The moment the fields start on. */
const START = new Date(2026, 10, 14, 20)

describe('DateTimeField', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('is named by its label and shows its helper', async () => {
    await Render.withTheme(
      <DateTimeField
        format={FORMAT}
        helper="Pick a time"
        label="When"
        onChange={jest.fn()}
        value={START}
      />,
    )

    expect(screen.getByRole('button', { name: 'When' })).toBeOnTheScreen()
    expect(screen.getByText('Pick a time')).toBeOnTheScreen()
  })

  it('reports the moment the picker gives on iOS', async () => {
    const onChange = jest.fn()

    await Render.withTheme(
      <DateTimeField format={FORMAT} label="When" onChange={onChange} value={START} />,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 14, 21))
  })

  it('replaces the helper with the error', async () => {
    await Render.withTheme(
      <DateTimeField
        error="Too early"
        format={FORMAT}
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
      <DateTimeField format={FORMAT} label="When" onChange={jest.fn()} value={START} />,
    )

    expect(screen.getByText('Sat 14 Nov, 8:00 pm')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(DateTimePickerAndroid.open).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'date', value: START }),
    )
  })
})
