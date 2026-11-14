import { fireEvent, screen, waitFor } from '@testing-library/react-native'

import { DateTimeField } from '../../src/components/DateTimeField'
import { DateFixtures } from '../helpers/dates'
import { Render } from '../helpers/render'

/** The spy for the moment a test's picker or field reports. */
const onChange: jest.Mock = jest.fn()

/** The moment the fields start on: Saturday 14 November 2026, 8 pm. */
const START = new Date(2026, 10, 14, 20)

/**
 * Renders a field with a spy for the moment it reports.
 * @param extra - More props, such as a helper or an error.
 * @param extra.disabled - Whether the field is inert.
 * @param extra.error - The error text.
 * @param extra.helper - The helper text.
 * @param extra.value - The chosen moment, which starts as the field's start.
 * @returns A promise that resolves once it is on the screen.
 */
const renderField = async (
  extra: {
    /** Whether the field is inert. */
    disabled?: boolean
    /** The error text. */
    error?: string
    /** The helper text. */
    helper?: string
    /** The chosen moment. */
    value?: Date
  } = {},
): Promise<void> => {
  await Render.withTheme(
    <DateTimeField
      format={DateFixtures.format}
      label="When"
      onChange={onChange}
      value={START}
      {...extra}
    />,
  )
}

describe('DateTimeField', () => {
  beforeEach(() => {
    onChange.mockClear()
  })

  it('is one button named by its label that shows the moment', async () => {
    await renderField()

    expect(screen.getByRole('button', { name: 'When' })).toBeOnTheScreen()
    expect(screen.getByText('Sat 14 Nov, 8:00 pm')).toBeOnTheScreen()
  })

  it('shows its placeholder while it has no value', async () => {
    await Render.withTheme(
      <DateTimeField format={DateFixtures.format} label="When" onChange={onChange} />,
    )

    expect(screen.getByText('Pick a day and time')).toBeOnTheScreen()
  })

  it('shows its helper, which the error replaces', async () => {
    await renderField({ helper: 'Pick a time' })

    expect(screen.getByText('Pick a time')).toBeOnTheScreen()

    await renderField({ error: 'Too early', helper: 'Pick a time', value: START })

    expect(screen.getByText('Too early')).toBeOnTheScreen()
  })

  it('opens the picker in a modal titled with its label', async () => {
    await renderField()

    expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(screen.getByRole('button', { name: 'When' })).toBeExpanded()
    expect(screen.getByRole('button', { name: 'Done' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen()
    expect(screen.getByText('November 2026')).toBeOnTheScreen()
  })

  it('keeps the value until Done, then reports what was picked', async () => {
    await renderField()

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Tuesday 17 November' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Later hour' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getAllByText('Sat 14 Nov, 8:00 pm')).toHaveLength(1)

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 17, 21))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()
    })
  })

  it('drops what was picked on Cancel, and opens fresh next time', async () => {
    await renderField()

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Tuesday 17 November' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    })

    expect(onChange).not.toHaveBeenCalled()

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(screen.getByRole('button', { name: 'Saturday 14 November, today' })).toBeSelected()
  })

  it('offers the picker the earliest moment it was given', async () => {
    await Render.withTheme(
      <DateTimeField
        format={DateFixtures.format}
        label="When"
        min={DateFixtures.now}
        onChange={onChange}
        value={START}
      />,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(screen.getByRole('button', { name: 'Friday 13 November' })).toBeDisabled()
  })

  it('does not open while it is disabled', async () => {
    await renderField({ disabled: true, value: START })
    await fireEvent.press(screen.getByRole('button', { name: 'When' }))

    expect(screen.queryByRole('button', { name: 'Done' })).toBeNull()
  })
})
