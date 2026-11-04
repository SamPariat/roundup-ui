import type { ComponentRef, ReactElement } from 'react'

import { useCallback, useRef } from 'react'
import { Pressable, TextInput, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { ClassHelper } from '../lib/class-helper'
import { Icon } from './Icon'
import { Text } from './Text'

/** The native text input behind the boxes. */
type TInputElement = ComponentRef<typeof TextInput>

/** Props for OtpInput. */
export interface IOtpInputProps {
  /** Required: for example "6-digit code". */
  label: string
  /** Digits entered so far. Complete when its length equals `length`. */
  value?: string
  /** How many digits the code has. Defaults to 6. */
  length?: number
  /** Message shown in red instead of the resend row; also sets the input's hint. */
  error?: string
  /** Seconds until the code can be resent; 0 shows the Resend link. */
  resendIn?: number
  /** Called when the Resend link is pressed. */
  onResend?: () => void
  /** Called with the digits typed or pasted so far. */
  onChangeText?: (text: string) => void
  /** Focuses the field, and so opens the keyboard, when it mounts. */
  autoFocus?: boolean
}

/**
 * Resend countdown helpers. Static methods only.
 */
export class CountdownHelper {
  /**
   * Formats a number of seconds as m:ss for the resend countdown.
   * @param seconds - Whole seconds remaining.
   * @returns The time as minutes, a colon and two-digit seconds.
   */
  static format(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const rest = seconds % 60

    return `${String(minutes)}:${rest < 10 ? '0' : ''}${String(rest)}`
  }
}

/**
 * One real text input sits invisibly over the boxes, so paste, autofill from SMS and the
 * keyboard all work, and a screen reader meets a single field instead of six. Pressing the boxes
 * focuses that input directly: iOS skips a near-transparent view when it hit-tests a tap, so the
 * overlay alone cannot be relied on to open the keyboard.
 * @returns The code boxes and the resend row.
 */
export const OtpInput = ({
  autoFocus = false,
  error,
  label,
  length = 6,
  onChangeText,
  onResend,
  resendIn = 0,
  value = '',
}: IOtpInputProps): ReactElement => {
  const { t } = useT()
  const digits = value.slice(0, length)
  const complete = digits.length === length
  const boxes = Array.from({ length }, (_, position) => position)
  const inputRef = useRef<TInputElement>(null)

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <View className="items-start gap-3">
      <Pressable accessible={false} className="relative" onPress={focusInput}>
        <View aria-hidden className="flex-row gap-2">
          {boxes.map((position) => (
            <View
              className={ClassHelper.cn(
                'h-14 w-11 items-center justify-center rounded-lg border border-border-strong bg-bg-raised',
                error === undefined && !complete && position === digits.length && 'border-accent',
                error !== undefined && 'border-danger bg-danger-soft',
                error === undefined && complete && 'border-success',
              )}
              key={position}
            >
              <Text variant="otp">{digits[position] ?? ''}</Text>
            </View>
          ))}
        </View>
        <TextInput
          accessibilityHint={error}
          accessibilityLabel={label}
          aria-invalid={error !== undefined}
          autoComplete="sms-otp"
          autoFocus={autoFocus}
          caretHidden
          className="absolute inset-0 text-transparent opacity-1"
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={length}
          onChangeText={onChangeText}
          ref={inputRef}
          textContentType="oneTimeCode"
          value={digits}
        />
      </Pressable>
      {error === undefined ? (
        <View className="flex-row items-center gap-1">
          {resendIn > 0 ? (
            <>
              <Text tone="muted" variant="body-sm">
                {t('otpInput.resendIn')}
              </Text>
              <Text variant="numeric">{CountdownHelper.format(resendIn)}</Text>
            </>
          ) : (
            <>
              <Text tone="muted" variant="body-sm">
                {t('otpInput.didntGetIt')}
              </Text>
              <Pressable
                accessibilityRole="link"
                className="min-h-12 justify-center focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
                hitSlop={8}
                onPress={onResend}
              >
                <Text tone="accent" variant="label">
                  {t('otpInput.resend')}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <View
          accessibilityLiveRegion="assertive"
          accessible
          aria-live="assertive"
          className="flex-row items-center gap-1"
          role="alert"
        >
          <Icon decorative name="alert" size={16} tone="danger" />
          <Text tone="danger" variant="body-sm">
            {error}
          </Text>
        </View>
      )}
    </View>
  )
}
