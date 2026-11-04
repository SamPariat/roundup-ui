import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { ClassHelper } from '../lib/class-helper'
import { Icon } from './Icon'
import { Text } from './Text'

/** Props for FieldFrame. */
export interface IFieldFrameProps {
  /** The visible label above the box. */
  label: string
  /** Hint shown below the box until there is an error. */
  helper?: string
  /** Replaces the helper text and turns the field red. */
  error?: string
  /** Grays the box out. */
  disabled: boolean
  /** Whether the input inside has focus, which draws the focus ring. */
  focused: boolean
  /** The input (and any icon) that goes inside the box. */
  children: ReactNode
}

/**
 * The shared frame of TextField and PhoneInput: label above, box, then helper or error below.
 * An error is a live region, so it is announced when it appears.
 * @returns The labeled box with its helper or error line.
 */
export const FieldFrame = ({
  children,
  disabled,
  error,
  focused,
  helper,
  label,
}: IFieldFrameProps): ReactElement => {
  const message = error ?? helper

  return (
    <View className="min-w-0 gap-1">
      <Text variant="label">{label}</Text>
      <View
        className={ClassHelper.cn(
          'h-13 flex-row items-center gap-2 rounded-xl border border-border-strong bg-bg-raised px-3',
          focused && 'border-accent',
          error !== undefined && 'border-danger bg-danger-soft',
          disabled && 'border-border bg-bg-sunken',
        )}
      >
        {children}
      </View>
      {message === undefined ? null : (
        <View
          accessibilityLiveRegion={error === undefined ? 'none' : 'assertive'}
          accessible
          aria-live={error === undefined ? 'off' : 'assertive'}
          className="flex-row items-center gap-1"
          role={error === undefined ? undefined : 'alert'}
        >
          {error === undefined ? null : <Icon decorative name="alert" size={16} tone="danger" />}
          <Text tone={error === undefined ? 'muted' : 'danger'} variant="body-sm">
            {message}
          </Text>
        </View>
      )}
    </View>
  )
}
