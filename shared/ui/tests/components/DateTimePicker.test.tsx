import { fireEvent, screen, within } from '@testing-library/react-native'

import type { IDateTimeFormat } from '../../src/components/DateTimePicker'

import { DateTimePicker } from '../../src/components/DateTimePicker'
import { DateFixtures } from '../helpers/dates'
import { Render } from '../helpers/render'

/** Saturday 14 November 2026, 8 pm: today, in the stand-in format's calendar. */
const EVENING = new Date(2026, 10, 14, 20)

/** The spy for the moment a test's picker or field reports. */
const onChange: jest.Mock = jest.fn()

/**
 * Renders the picker with a spy for the moment it reports.
 * @param value - The moment it shows.
 * @param extra - More props, such as a minimum.
 * @param extra.format - A format other than the 12-hour stand-in.
 * @param extra.min - The earliest moment.
 * @param extra.minuteStep - The step of the minutes.
 * @returns A promise that resolves once it is on the screen.
 */
const renderPicker = async (
  value: Date = EVENING,
  extra?: {
    /** A format other than the 12-hour stand-in. */
    format?: IDateTimeFormat
    /** The earliest moment. */
    min?: Date
    /** The step of the minutes. */
    minuteStep?: number
  },
): Promise<void> => {
  await Render.withTheme(
    <DateTimePicker format={DateFixtures.format} onChange={onChange} value={value} {...extra} />,
  )
}

describe('DateTimePicker', () => {
  beforeEach(() => {
    onChange.mockClear()
  })

  it('shows the month, the days and the summary of the value', async () => {
    await renderPicker()

    expect(screen.getByText('November 2026')).toBeOnTheScreen()
    expect(screen.getByLabelText('November 2026')).toBeOnTheScreen()
    expect(screen.getAllByText('T')).toHaveLength(2)
    expect(screen.getByText('Sat 14 Nov, 8:00 pm')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Sunday 1 November' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Monday 30 November' })).toBeOnTheScreen()
  })

  it('leaves the days of other months blank', async () => {
    await renderPicker()

    expect(screen.queryByRole('button', { name: 'Saturday 31 October' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Tuesday 1 December' })).toBeNull()
  })

  it('marks today and the chosen day', async () => {
    await renderPicker(new Date(2026, 10, 17, 20))

    expect(screen.getByRole('button', { name: 'Saturday 14 November, today' })).not.toBeSelected()
    expect(screen.getByRole('button', { name: 'Tuesday 17 November' })).toBeSelected()
  })

  it('reports the picked day at the same time', async () => {
    await renderPicker()

    await fireEvent.press(screen.getByRole('button', { name: 'Tuesday 17 November' }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 17, 20))
  })

  it('turns off the days before the minimum and the month before it', async () => {
    await renderPicker(EVENING, { min: DateFixtures.now })

    expect(screen.getByRole('button', { name: 'Friday 13 November' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Saturday 14 November, today' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()

    await fireEvent.press(screen.getByRole('button', { name: 'Friday 13 November' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('moves between months, and back only as far as the minimum', async () => {
    await renderPicker(EVENING, { min: DateFixtures.now })
    await fireEvent.press(screen.getByRole('button', { name: 'Next month' }))

    expect(screen.getByText('December 2026')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Tuesday 1 December' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeEnabled()

    await fireEvent.press(screen.getByRole('button', { name: 'Previous month' }))

    expect(screen.getByText('November 2026')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
  })

  it('opens on the month of its value', async () => {
    await renderPicker(new Date(2027, 1, 3, 20))

    expect(screen.getByText('February 2027')).toBeOnTheScreen()
  })

  it('steps the hour by an hour, past midnight into the next day', async () => {
    await renderPicker(new Date(2026, 10, 14, 23, 15))

    expect(screen.getByLabelText('Hour')).toBeOnTheScreen()
    expect(within(screen.getByLabelText('Hour')).getByText('11')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Later hour' }))

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 15, 0, 15))

    await fireEvent.press(screen.getByRole('button', { name: 'Earlier hour' }))

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 14, 22, 15))
  })

  it('steps the minutes by fifteen, rolling over into the next hour and day', async () => {
    await renderPicker(new Date(2026, 10, 14, 23, 45))

    expect(screen.getByLabelText('Minutes')).toBeOnTheScreen()
    expect(within(screen.getByLabelText('Minutes')).getByText('45')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Later by 15 minutes' }))

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 15, 0, 0))

    await fireEvent.press(screen.getByRole('button', { name: 'Earlier by 15 minutes' }))

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 14, 23, 30))
  })

  it('steps the minutes by the step it is given', async () => {
    await renderPicker(EVENING, { minuteStep: 5 })

    await fireEvent.press(screen.getByRole('button', { name: 'Later by 5 minutes' }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 14, 20, 5))
  })

  it('switches between am and pm by twelve hours', async () => {
    await renderPicker()

    expect(screen.getByLabelText('Morning or evening')).toBeOnTheScreen()
    expect(screen.getByRole('radio', { name: 'pm' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'am' })).not.toBeChecked()

    await fireEvent.press(screen.getByRole('radio', { name: 'am' }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 14, 8))
  })

  it('does nothing when the half that is chosen is pressed again', async () => {
    await renderPicker()

    await fireEvent.press(screen.getByRole('radio', { name: 'pm' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('leaves out am and pm on a 24-hour clock', async () => {
    await Render.withTheme(
      <DateTimePicker format={DateFixtures.format24} onChange={onChange} value={EVENING} />,
    )

    expect(screen.queryByRole('radio', { name: 'pm' })).toBeNull()
    expect(within(screen.getByLabelText('Hour')).getByText('20')).toBeOnTheScreen()
  })
})
