import type { ReactElement } from 'react'

import { useCallback, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { TTextProps } from './Text'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * How a date field and its picker write, read and step through moments, which the caller supplies
 * for the person's locale. The UI does no date math of its own: core's DateFormatter does all of it.
 */
export interface IDateTimeFormat {
  /**
   * Writes a moment as the field shows it.
   * @param date - The moment.
   * @returns The text, such as "Sat 31 Oct, 8:00 pm".
   */
  display: (date: Date) => string
  /**
   * Writes the month the picker is showing.
   * @param month - Any moment in the month.
   * @returns The text, such as "November 2026".
   */
  monthLabel: (month: Date) => string
  /**
   * Writes the initials that head the picker's columns, in the order the locale starts its week.
   * @returns Seven letters.
   */
  weekdayLabels: () => string[]
  /**
   * Lays a month out as the picker's grid.
   * @param month - Any moment in the month.
   * @returns The weeks, each of seven cells: the day, or undefined where the cell belongs to another month.
   */
  weeks: (month: Date) => (Date | undefined)[][]
  /**
   * Writes a day the way a screen reader says it.
   * @param date - The day to write.
   * @returns The text, such as "Saturday 31 October".
   */
  dayLabel: (date: Date) => string
  /**
   * Writes the number of a day for the picker's grid.
   * @param date - The day to write.
   * @returns The day of the month, such as "7".
   */
  dayText: (date: Date) => string
  /**
   * Reads the clock.
   * @returns The current moment.
   */
  today: () => Date
  /**
   * Whether two moments fall on the same day.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when both are on one day.
   */
  isSameDay: (date: Date, other: Date) => boolean
  /**
   * Whether a moment's day comes before another's, whatever the time.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when `date` falls on an earlier day.
   */
  isBeforeDay: (date: Date, other: Date) => boolean
  /**
   * Finds the first moment of a month.
   * @param date - Any moment in the month.
   * @returns Midnight on the 1st.
   */
  startOfMonth: (date: Date) => Date
  /**
   * Moves a moment by whole months.
   * @param date - The moment.
   * @param months - How many months to move, negative for earlier.
   * @returns The moment that many months away.
   */
  addMonths: (date: Date, months: number) => Date
  /**
   * Moves a moment by minutes, rolling over into the next or previous day.
   * @param date - The moment.
   * @param minutes - How many minutes to move, negative for earlier.
   * @returns The moment that many minutes away.
   */
  addMinutes: (date: Date, minutes: number) => Date
  /**
   * Puts a moment on another day and keeps its time.
   * @param date - The moment whose time is kept.
   * @param day - The day to move it to.
   * @returns The moment on that day at the same time.
   */
  withDay: (date: Date, day: Date) => Date
  /**
   * Whether the locale tells time on a 12-hour clock, with am and pm.
   * @returns False when the picker leaves out its am and pm switch.
   */
  uses12Hour: () => boolean
  /**
   * Writes the hour of a moment as the locale's clock shows it.
   * @param date - The moment.
   * @returns The hour, such as "8", or "08" on a 24-hour clock.
   */
  hourText: (date: Date) => string
  /**
   * Writes the minutes of a moment.
   * @param date - The moment.
   * @returns The minutes, such as "05".
   */
  minuteText: (date: Date) => string
  /**
   * Whether a moment is from noon on.
   * @param date - The moment.
   * @returns True for pm, false for am.
   */
  isPm: (date: Date) => boolean
}

/** Props for DateTimePicker. */
export interface IDateTimePickerProps {
  /** The chosen moment. */
  value: Date
  /** How the picker writes and steps through moments. */
  format: IDateTimeFormat
  /** The earliest moment offered: earlier days are off and the month before it cannot be opened. */
  min?: Date
  /** How many minutes the minutes stepper moves by. Defaults to 15. */
  minuteStep?: number
  /** Called with the moment the person picks. */
  onChange: (value: Date) => void
}

/** How many minutes the hour stepper moves by. */
const HOUR_MINUTES = 60

/** How many minutes between am and pm, which the switch moves by. */
const HALF_DAY_MINUTES = 720

/** A day of the grid with what does not change while its month is on show. */
interface IDayCell {
  /** The day. */
  day: Date
  /** The day's number. */
  text: string
  /** What a screen reader says for the day. */
  label: string
  /** Whether it is today. */
  today: boolean
  /** Whether it is before `min` and cannot be picked. */
  disabled: boolean
}

/** Props for one day of the grid. */
interface IDayButtonProps {
  /** The day this cell stands for. */
  day: Date
  /** Whether the day is before `min` and cannot be picked. */
  disabled: boolean
  /** The day's number. */
  text: string
  /** What a screen reader says for the day. */
  label: string
  /** Whether this is the chosen day. */
  selected: boolean
  /** Whether this is today. */
  today: boolean
  /** Called with the day when it is pressed. */
  onPick: (day: Date) => void
}

/**
 * One day of the grid: a 44 point circle, ringed when it is today and filled when it is chosen.
 * @returns The pressable day.
 */
const DayButton = ({
  day,
  disabled,
  label,
  onPick,
  selected,
  text,
  today,
}: IDayButtonProps): ReactElement => {
  const handlePress = useCallback((): void => {
    onPick(day)
  }, [day, onPick])

  const emphasized = selected || today
  let tone: TTextProps['tone'] = 'fg'

  if (selected) tone = 'on-accent'
  else if (disabled) tone = 'subtle'

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      aria-disabled={disabled}
      aria-selected={selected}
      className={cn(
        'size-11 items-center justify-center rounded-full border border-transparent focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
        !disabled && !selected && 'hover:bg-bg-hover',
        today && 'border-accent',
        selected && 'bg-accent',
      )}
      disabled={disabled}
      onPress={handlePress}
    >
      {/* The circle is a fixed 44 points, so its number keeps its size instead of following the
          device's text size, which would clip it. */}
      <Text allowFontScaling={false} tone={tone} variant={emphasized ? 'day-strong' : 'day'}>
        {text}
      </Text>
    </Pressable>
  )
}

/** Props for one stepper. */
interface IStepperProps {
  /** The stepper's name, such as "Hour". */
  label: string
  /** What the button before the value says. */
  earlierLabel: string
  /** What the button after the value says. */
  laterLabel: string
  /** The value between the buttons. */
  text: string
  /** Called when the button before the value is pressed. */
  onEarlier: () => void
  /** Called when the button after the value is pressed. */
  onLater: () => void
}

/** Props for one button of a stepper. */
interface IStepButtonProps {
  /** Which way the button steps: back points left, chevron right. */
  icon: 'back' | 'chevron'
  /** What the button says. */
  label: string
  /** Called when it is pressed. */
  onPress: () => void
}

/**
 * One button of a stepper: a 40 point wide arrow, as tall as the stepper.
 * @returns The pressable arrow.
 */
const StepButton = ({ icon, label, onPress }: IStepButtonProps): ReactElement => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    className="h-full w-10 items-center justify-center rounded-lg hover:bg-bg-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
    onPress={onPress}
  >
    <Icon decorative name={icon} size={18} tone="fg-muted" />
  </Pressable>
)

/**
 * A value between an earlier and a later button, as a labeled group. The value is a polite live
 * region, so a screen reader says it as it changes. It is 48 points tall like a field.
 * @returns The group.
 */
const Stepper = ({
  earlierLabel,
  label,
  laterLabel,
  onEarlier,
  onLater,
  text,
}: IStepperProps): ReactElement => (
  <View
    accessibilityLabel={label}
    className="h-12 flex-row items-center rounded-lg border border-border-strong bg-bg-raised"
    role="group"
  >
    <StepButton icon="back" label={earlierLabel} onPress={onEarlier} />
    <Text
      accessibilityLiveRegion="polite"
      allowFontScaling={false}
      aria-live="polite"
      className="min-w-6 text-center"
      variant="stepper"
    >
      {text}
    </Text>
    <StepButton icon="chevron" label={laterLabel} onPress={onLater} />
  </View>
)

/** Props for one side of the am and pm switch. */
interface IHalfButtonProps {
  /** Whether this side is chosen. */
  active: boolean
  /** Whether this side is pm. */
  pm: boolean
  /** Called with whether the person chose pm. */
  onSelect: (pm: boolean) => void
}

/**
 * One side of the am and pm switch, drawn like a tab of Tabs and announced as a radio.
 * @returns The pressable side.
 */
const HalfButton = ({ active, onSelect, pm }: IHalfButtonProps): ReactElement => {
  const { t } = useT()
  const label = pm ? t('dateTimePicker.pm') : t('dateTimePicker.am')

  const handlePress = useCallback((): void => {
    onSelect(pm)
  }, [onSelect, pm])

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      aria-checked={active}
      className={cn(
        'h-10 w-11 items-center justify-center rounded-lg focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
        active ? 'border border-border bg-bg-raised' : 'hover:bg-bg-hover',
      )}
      onPress={handlePress}
    >
      <Text tone={active ? 'fg' : 'muted'} variant="label">
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * Picks a day and a time: a month of days on top, the time underneath and the result spelled out
 * at the bottom, for the body of a Modal. It is controlled: it shows `value` and reports each
 * change, so the caller decides when a change counts. Days before `min` are off. Every date and
 * time calculation is the format's, so the week's first day and the clock follow the locale.
 * @returns The month, the time and the summary, in one column.
 */
export const DateTimePicker = ({
  format,
  min,
  minuteStep = 15,
  onChange,
  value,
}: IDateTimePickerProps): ReactElement => {
  const { t } = useT()

  // The first day of the month on show, which the arrows move.
  const [month, setMonth] = useState<Date>(format.startOfMonth(value))

  const today = useMemo((): Date => format.today(), [format])
  const weekdays = useMemo((): string[] => format.weekdayLabels(), [format])
  const monthLabel = useMemo((): string => format.monthLabel(month), [format, month])

  const canGoBack = useMemo(
    (): boolean => min === undefined || format.isBeforeDay(min, month),
    [format, min, month],
  )

  // Each day's number, spoken label, today ring and whether it is off depend only on the month on
  // show, so they are worked out once per month rather than on every change of the value.
  const weeks = useMemo(
    (): (IDayCell | undefined)[][] =>
      format.weeks(month).map((week) =>
        week.map((day): IDayCell | undefined => {
          if (day === undefined) return undefined

          const isToday = format.isSameDay(day, today)

          return {
            day,
            disabled: min !== undefined && format.isBeforeDay(day, min),
            label: isToday
              ? t('dateTimePicker.today', { day: format.dayLabel(day) })
              : format.dayLabel(day),
            text: format.dayText(day),
            today: isToday,
          }
        }),
      ),
    [format, min, month, t, today],
  )

  const pm = format.isPm(value)

  const handlePreviousMonth = useCallback((): void => {
    setMonth(format.addMonths(month, -1))
  }, [format, month])

  const handleNextMonth = useCallback((): void => {
    setMonth(format.addMonths(month, 1))
  }, [format, month])

  const handlePickDay = useCallback(
    (day: Date): void => {
      onChange(format.withDay(value, day))
    },
    [format, onChange, value],
  )

  const handleEarlierHour = useCallback((): void => {
    onChange(format.addMinutes(value, -HOUR_MINUTES))
  }, [format, onChange, value])

  const handleLaterHour = useCallback((): void => {
    onChange(format.addMinutes(value, HOUR_MINUTES))
  }, [format, onChange, value])

  const handleEarlierMinutes = useCallback((): void => {
    onChange(format.addMinutes(value, -minuteStep))
  }, [format, minuteStep, onChange, value])

  const handleLaterMinutes = useCallback((): void => {
    onChange(format.addMinutes(value, minuteStep))
  }, [format, minuteStep, onChange, value])

  const handleHalf = useCallback(
    (toPm: boolean): void => {
      if (toPm === pm) return

      onChange(format.addMinutes(value, toPm ? HALF_DAY_MINUTES : -HALF_DAY_MINUTES))
    },
    [format, onChange, pm, value],
  )

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-2">
        <Button
          disabled={!canGoBack}
          icon="back"
          label={t('dateTimePicker.previousMonth')}
          onPress={handlePreviousMonth}
          size="sm"
          variant="ghost"
        />
        <Text accessibilityLiveRegion="polite" aria-live="polite" variant="body-strong">
          {monthLabel}
        </Text>
        <Button
          icon="chevron"
          label={t('dateTimePicker.nextMonth')}
          onPress={handleNextMonth}
          size="sm"
          variant="ghost"
        />
      </View>
      <View accessibilityLabel={monthLabel} role="grid">
        <View className="flex-row" role="row">
          {weekdays.map((initial, column) => (
            <View
              className="h-8 flex-1 items-center justify-center"
              key={`${initial}-${String(column)}`}
              role="columnheader"
            >
              <Text tone="muted" variant="caption">
                {initial}
              </Text>
            </View>
          ))}
        </View>
        {weeks.map((week) => (
          <View
            className="flex-row py-0.5"
            key={week.find((cell) => cell !== undefined)?.day.getTime()}
            role="row"
          >
            {week.map((cell, column) => (
              <View
                className="h-11 flex-1 items-center"
                key={cell?.day.getTime() ?? `blank-${String(column)}`}
              >
                {cell === undefined ? null : (
                  <DayButton
                    day={cell.day}
                    disabled={cell.disabled}
                    label={cell.label}
                    onPick={handlePickDay}
                    selected={format.isSameDay(cell.day, value)}
                    text={cell.text}
                    today={cell.today}
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      <View className="gap-2 border-t border-border pt-3">
        <Text variant="label">{t('dateTimePicker.time')}</Text>
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Stepper
            earlierLabel={t('dateTimePicker.earlierHour')}
            label={t('dateTimePicker.hour')}
            laterLabel={t('dateTimePicker.laterHour')}
            onEarlier={handleEarlierHour}
            onLater={handleLaterHour}
            text={format.hourText(value)}
          />
          <Text aria-hidden tone="muted" variant="stepper">
            :
          </Text>
          <Stepper
            earlierLabel={t('dateTimePicker.earlierMinutes', { step: minuteStep })}
            label={t('dateTimePicker.minutes')}
            laterLabel={t('dateTimePicker.laterMinutes', { step: minuteStep })}
            onEarlier={handleEarlierMinutes}
            onLater={handleLaterMinutes}
            text={format.minuteText(value)}
          />
          {format.uses12Hour() ? (
            <View
              accessibilityLabel={t('dateTimePicker.half')}
              className="ml-auto flex-row gap-1 rounded-xl bg-bg-sunken p-1"
              role="radiogroup"
            >
              <HalfButton active={!pm} onSelect={handleHalf} pm={false} />
              <HalfButton active={pm} onSelect={handleHalf} pm />
            </View>
          ) : null}
        </View>
      </View>
      <Text tone="muted" variant="numeric">
        {format.display(value)}
      </Text>
    </View>
  )
}
