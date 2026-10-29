import type { ReactElement } from 'react'

import { Pressable, TextInput, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

export interface OtpInputProps {
  /** Required: for example "6-digit code". */
  label: string
  /** Digits entered so far. Complete when its length equals `length`. */
  value?: string
  length?: number
  error?: string
  /** Seconds until the code can be resent; 0 shows the Resend link. */
  resendIn?: number
  onResend?: () => void
  onChangeText?: (text: string) => void
}

export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60

  return `${String(minutes)}:${rest < 10 ? '0' : ''}${String(rest)}`
}

// One real text input sits invisibly over the boxes, so paste, autofill from SMS and the
// keyboard all work, and a screen reader meets a single field instead of six.
export const OtpInput = ({
  error,
  label,
  length = 6,
  onChangeText,
  onResend,
  resendIn = 0,
  value = '',
}: OtpInputProps): ReactElement => {
  const { t } = useT()
  const digits = value.slice(0, length)
  const complete = digits.length === length
  const boxes = Array.from({ length }, (_, position) => position)

  return (
    <View className="items-start gap-3">
      <View className="relative">
        <View aria-hidden className="flex-row gap-2">
          {boxes.map((position) => (
            <View
              className={cn(
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
          caretHidden
          className="absolute inset-0 text-transparent opacity-1"
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={length}
          onChangeText={onChangeText}
          textContentType="oneTimeCode"
          value={digits}
        />
      </View>
      {error === undefined ? (
        <View className="flex-row items-center gap-1">
          {resendIn > 0 ? (
            <>
              <Text tone="muted" variant="body-sm">
                {t('otpInput.resendIn')}
              </Text>
              <Text variant="numeric">{formatCountdown(resendIn)}</Text>
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
