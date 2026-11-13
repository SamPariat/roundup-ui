import type { ReactElement } from 'react'

import { createElement } from 'react'
import { Pressable } from 'react-native'

/** One hour in milliseconds. */
const HOUR = 3_600_000

/** What the stand-in picker reads. */
interface IPickerProps {
  /** The picker's accessible name. */
  accessibilityLabel: string
  /** Called with the picker's event and the moment picked. */
  onValueChange: (
    event: {
      /**
       *
       */
      nativeEvent: object
    },
    date: Date,
  ) => void
  /** The moment the picker shows. */
  value: Date
}

/**
 * The test stand-in for the native date and time picker, which needs a native module Jest does not
 * have. It is a button named like the picker, and pressing it picks the moment an hour later.
 * @param props - What the field passes.
 * @param props.accessibilityLabel - The picker's accessible name.
 * @param props.onValueChange - Called with the moment picked.
 * @param props.value - The moment the picker shows.
 * @returns The button.
 */
const StandInPicker = ({ accessibilityLabel, onValueChange, value }: IPickerProps): ReactElement =>
  createElement(Pressable, {
    accessibilityLabel,
    accessibilityRole: 'button',
    /** Picks the moment an hour later. */
    onPress: (): void => {
      onValueChange({ nativeEvent: {} }, new Date(value.getTime() + HOUR))
    },
  })

/** The stand-in as a module, the shape jest.mock returns for the picker package. */
export const datetimepickerModule = {
  __esModule: true,
  DateTimePickerAndroid: { open: jest.fn() },
  default: StandInPicker,
}
