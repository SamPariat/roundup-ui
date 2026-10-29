import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

import { cva } from 'class-variance-authority'
import { use, useEffect } from 'react'
import { AccessibilityInfo, Pressable, View } from 'react-native'

import type { IconName } from '../lib/icons.ts'
import type { IconProps } from './Icon.tsx'
import type { TextProps } from './Text.tsx'

import { ActionContext } from '../lib/action-context.ts'
import { cn } from '../lib/cn.ts'
import { Icon } from './Icon.tsx'
import { Spinner } from './Spinner.tsx'
import { Text } from './Text.tsx'

export const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-xl border border-transparent focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring active:scale-98',
  {
    variants: {
      variant: {
        primary: 'bg-accent active:opacity-85',
        secondary: 'border-border bg-bg-raised active:bg-bg-hover',
        ghost: 'bg-transparent active:bg-bg-hover',
        destructive: 'bg-danger active:opacity-85',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'min-h-12 px-4',
        lg: 'min-h-14 px-6',
      },
      block: { true: 'w-full', false: 'self-start' },
      iconOnly: { true: 'px-0', false: '' },
      inactive: { true: 'border-border bg-bg-sunken active:scale-100', false: '' },
    },
    compoundVariants: [
      { iconOnly: true, size: 'sm', className: 'w-9' },
      { iconOnly: true, size: 'md', className: 'w-12' },
      { iconOnly: true, size: 'lg', className: 'w-14' },
      { inactive: true, variant: 'ghost', className: 'border-transparent bg-transparent' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
      iconOnly: false,
      inactive: false,
    },
  },
)

type Variant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

const LABEL_TONE = {
  primary: 'on-accent',
  secondary: 'fg',
  ghost: 'accent',
  destructive: 'on-accent',
} as const satisfies Record<Variant, 'accent' | 'fg' | 'on-accent'>

interface ButtonBase {
  variant?: Variant
  size?: 'lg' | 'md' | 'sm'
  /** A request is in flight: shows a spinner, disables the button and keeps its width. */
  loading?: boolean
  /** What the button says while loading, e.g. "Sending code…". Two or three words. */
  loadingLabel?: string
  disabled?: boolean
  /** Stretch to the container width (bottom-of-screen actions). */
  block?: boolean
  onPress?: (() => void) | undefined
  className?: string
}

/** An icon-only button must name itself; a button with text names itself from the text. */
export type ButtonProps = ButtonBase &
  (
    | { children: ReactNode; icon?: IconName; label?: string }
    | { children?: never; icon: IconName; label: string }
  )

type Size = NonNullable<ButtonProps['size']>

const RestingContent = ({
  children,
  icon,
  iconTone,
  size,
  textTone,
}: {
  children?: ReactNode
  icon?: IconName | undefined
  iconTone: NonNullable<IconProps['tone']>
  size: Size
  textTone: NonNullable<TextProps['tone']>
}): ReactElement => (
  <>
    {icon === undefined ? null : (
      <Icon decorative name={icon} size={size === 'sm' ? 18 : 20} tone={iconTone} />
    )}
    {typeof children === 'string' ? (
      <Text tone={textTone} variant={size === 'sm' ? 'label' : 'body-strong'}>
        {children}
      </Text>
    ) : (
      children
    )}
  </>
)

const LoadingContent = ({
  children,
  loadingLabel,
  size,
}: {
  children: ReactNode
  loadingLabel?: string | undefined
  size: Size
}): ReactElement => (
  <>
    {/* The resting content stays in layout, hidden, so the button keeps its width. */}
    <View
      aria-hidden
      className="flex-row items-center justify-center gap-2 opacity-0"
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </View>
    <View className="absolute inset-0 flex-row items-center justify-center gap-2">
      <Spinner tone="fg-subtle" />
      {loadingLabel === undefined ? null : (
        <Text
          accessibilityLiveRegion="polite"
          aria-live="polite"
          tone="subtle"
          variant={size === 'sm' ? 'label' : 'body-strong'}
        >
          {loadingLabel}
        </Text>
      )}
    </View>
  </>
)

export const Button = ({
  block: blockProp,
  children,
  className,
  disabled = false,
  icon,
  label,
  loading = false,
  loadingLabel,
  onPress,
  size = 'md',
  variant = 'primary',
}: ButtonProps): ReactElement => {
  const action = use(ActionContext)
  const block = blockProp ?? action.block
  const iconOnly = icon !== undefined && children === undefined
  // Inside a busy Modal every Button but the one that is loading goes inert.
  const inactive = disabled || loading || (action.busy && !loading)
  const labelTone = LABEL_TONE[variant]
  const iconTone = inactive ? 'fg-subtle' : labelTone
  const textTone = inactive ? 'subtle' : labelTone
  const name = label ?? (typeof children === 'string' ? children : undefined)
  const status = loading ? loadingLabel : undefined

  useEffect(() => {
    // iOS has no live regions, so say it out loud when the request starts.
    if (status !== undefined) AccessibilityInfo.announceForAccessibility(status)
  }, [status])

  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityRole="button"
      aria-busy={loading}
      aria-disabled={inactive}
      className={cn(buttonVariants({ variant, size, block, iconOnly, inactive }), className)}
      disabled={inactive}
      hitSlop={size === 'sm' ? 6 : 0}
      onPress={onPress}
    >
      {loading ? (
        <LoadingContent loadingLabel={loadingLabel} size={size}>
          <RestingContent icon={icon} iconTone={iconTone} size={size} textTone={textTone}>
            {children}
          </RestingContent>
        </LoadingContent>
      ) : (
        <RestingContent icon={icon} iconTone={iconTone} size={size} textTone={textTone}>
          {children}
        </RestingContent>
      )}
    </Pressable>
  )
}
