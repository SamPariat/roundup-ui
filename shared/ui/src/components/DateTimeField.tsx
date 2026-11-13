import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'
import { Pressable } from 'react-native'

import { useT } from '@roundup/i18n'

import type { TIconName } from '../lib/icons'
import type { IDateTimeFormat } from './DateTimePicker'

import { Button } from './Button'
import { DateTimePicker } from './DateTimePicker'
import { FieldFrame } from './Field'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { Text } from './Text'

/** Props for DateTimeField. */
export interface IDateTimeFieldProps {
  /** Required: a field with no visible name has no accessible name either. It also titles the picker. */
  label: string
  /** The chosen moment. Without one the field shows its placeholder. */
  value?: Date
  /** How the field and its picker write and step through moments. */
  format: IDateTimeFormat
  /** Hint shown while there is no value. Not a substitute for the label. */
  placeholder?: string
  /** Hint shown under the field until there is an error. */
  helper?: string
  /** Replaces the helper text and turns the field red. */
  error?: string
  /** Makes the field inert and grayed out. */
  disabled?: boolean
  /** The earliest moment the picker offers. */
  min?: Date
  /** Icon drawn at the start of the field. Defaults to a clock. */
  icon?: TIconName
  /** Called with the moment once the person presses Done. */
  onChange: (value: Date) => void
}

/**
 * A labeled date and time field: one button that shows the moment on a line and opens a
 * DateTimePicker in a Modal titled with the label. The field keeps its value until Done is
 * pressed; Cancel, the backdrop and Esc drop the changes. It looks and behaves the same on iOS,
 * Android and the web, and it can sit inside another Modal: the picker's Modal opens on top.
 * @returns The labeled field and its picker.
 */
export const DateTimeField = ({
  disabled = false,
  error,
  format,
  helper,
  icon = 'clock',
  label,
  min,
  onChange,
  placeholder,
  value,
}: IDateTimeFieldProps): ReactElement => {
  const { t } = useT()
  const [open, setOpen] = useState<boolean>(false)
  // What the picker shows while it is open, kept apart from the value until Done.
  const [draft, setDraft] = useState<Date>(value ?? format.today())

  const handleOpen = useCallback((): void => {
    setDraft(value ?? format.today())
    setOpen(true)
  }, [format, value])

  const handleClose = useCallback((): void => {
    setOpen(false)
  }, [])

  const handleDone = useCallback((): void => {
    onChange(draft)
    setOpen(false)
  }, [draft, onChange])

  const optional = {
    ...(error === undefined ? {} : { error }),
    ...(helper === undefined ? {} : { helper }),
  }

  const optionalMin = min === undefined ? {} : { min }

  const actions = [
    <Button key="done" onPress={handleDone}>
      {t('common.done')}
    </Button>,
    <Button key="cancel" onPress={handleClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  return (
    <>
      <FieldFrame disabled={disabled} focused={open} label={label} {...optional}>
        {/* The button runs out to the box's edges, so the whole box is the tap target. */}
        <Pressable
          accessibilityHint={error ?? helper}
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: open }}
          accessibilityValue={{ text: value === undefined ? undefined : format.display(value) }}
          aria-disabled={disabled}
          aria-expanded={open}
          className="-mx-3 min-w-0 flex-1 flex-row items-center gap-2 self-stretch rounded-xl px-3 focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
          disabled={disabled}
          onPress={handleOpen}
        >
          <Icon decorative name={icon} tone="fg-muted" />
          {/* The field is a fixed 52 points tall, so its text keeps its size instead of following
              the device's text size, which would clip it. */}
          <Text
            allowFontScaling={false}
            className="min-w-0 flex-1"
            numberOfLines={1}
            tone={value === undefined || disabled ? 'subtle' : 'fg'}
          >
            {value === undefined
              ? (placeholder ?? t('dateTimeField.placeholder'))
              : format.display(value)}
          </Text>
          <Icon className="rotate-90" decorative name="chevron" size={16} tone="fg-muted" />
        </Pressable>
      </FieldFrame>
      <Modal actions={actions} onClose={handleClose} title={label} visible={open}>
        <DateTimePicker format={format} onChange={setDraft} value={draft} {...optionalMin} />
      </Modal>
    </>
  )
}
