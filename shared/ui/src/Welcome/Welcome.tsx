import type { ReactElement } from 'react'
import type { LayoutChangeEvent } from 'react-native'

import { useState } from 'react'
import { Text as NativeText, View } from 'react-native'
import Svg, { Circle, G, Rect } from 'react-native-svg'

import { breakpoints } from '@roundup/tokens'

import type { IconName } from '../Icon/icons.ts'

import { Button } from '../Button/Button.tsx'
import { Icon } from '../Icon/Icon.tsx'
import { cn } from '../lib/cn.ts'
import { Logo } from '../Logo/Logo.tsx'
import { Text } from '../Text/Text.tsx'
import { useTheme } from '../theme/theme.tsx'

export interface WelcomeProps {
  title?: string
  body?: string
  startLabel?: string
  onStart?: () => void
}

const POINTS = [
  {
    icon: 'squads',
    title: 'Squads',
    text: 'Add friends by phone number. Admins keep the list tidy.',
  },
  { icon: 'explore', title: 'Explore', text: 'Find bars, cafes and restaurants near you.' },
  { icon: 'history', title: 'History', text: 'See where the squad has been, and how often.' },
] as const satisfies readonly { icon: IconName; text: string; title: string }[]

const DOT_ROWS = [0, 1, 2, 3] as const
const DOT_COLUMNS = [0, 1] as const

// The mark at large size with a cluster of dots: the squad gathering round.
const WelcomeArt = (): ReactElement => {
  const { roles } = useTheme()
  return (
    <Svg aria-hidden height="100%" viewBox="0 0 44 32" width="100%">
      <Rect fill={roles['logo-stem']} height={28} rx={5.5} width={11} x={2} y={2} />
      <Circle cx={21} cy={10} fill={roles['logo-bowl']} r={8} />
      <Circle cx={24} cy={25} fill={roles['logo-leg']} r={5} />
      <G fill={roles['logo-bowl']}>
        {DOT_ROWS.flatMap((row) =>
          DOT_COLUMNS.map((column) => (
            <Circle
              cx={37 + column * 4}
              cy={4 + row * 4}
              key={`${String(row)}-${String(column)}`}
              r={1.2}
            />
          )),
        )}
      </G>
    </Svg>
  )
}

/** Full-page intro for signed-out visitors. Lays itself out from its own width, not the window's. */
export const Welcome = ({
  body = 'Make a squad, find a place nearby, and keep a record of every night out.',
  onStart,
  startLabel = 'Continue with phone',
  title = 'Weekend plans for the whole squad.',
}: WelcomeProps): ReactElement => {
  const [width, setWidth] = useState(0)
  const wide = width >= breakpoints['bp-tablet']

  return (
    <View
      accessibilityLabel="Welcome to Roundup"
      className="min-h-full w-full flex-1 bg-bg"
      onLayout={(event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width)
      }}
    >
      <View
        className={cn(
          'mx-auto w-full max-w-content flex-1 px-4 pt-6 pb-8',
          wide ? 'gap-12 px-8 pt-8 pb-12' : 'gap-8',
        )}
      >
        <Logo size="md" />
        <View
          className={cn(
            'flex-1 justify-center',
            wide ? 'flex-row items-center gap-12' : 'flex-col-reverse gap-6',
          )}
        >
          <View className={cn('gap-4', wide && 'min-w-0 flex-1')}>
            <NativeText
              accessibilityRole="header"
              aria-level={1}
              className={cn(
                'font-onest-700 text-fg',
                wide
                  ? 'text-[64px] leading-[68px] tracking-[-2.88px]'
                  : 'text-[36px] leading-[40px] tracking-[-1.26px]',
              )}
            >
              {title}
            </NativeText>
            <Text className="max-w-[520px]" tone="muted" variant="body">
              {body}
            </Text>
            <View className={cn('mt-2 gap-2', wide && 'flex-row items-center gap-4')}>
              <Button block={!wide} onPress={onStart} size="lg">
                {startLabel}
              </Button>
              <Text tone="muted" variant="caption">
                New here? The same code creates your account.
              </Text>
            </View>
          </View>
          <View
            className={
              wide ? 'aspect-[44/32] w-[40%] max-w-[420px]' : 'aspect-[44/32] w-[60%] max-w-[220px]'
            }
          >
            <WelcomeArt />
          </View>
        </View>
        <View className={cn('gap-4', wide && 'flex-row gap-6 border-t border-border pt-8')}>
          {POINTS.map((point) => (
            <View className={cn('flex-row items-start gap-3', wide && 'flex-1')} key={point.title}>
              <View className="size-[40px] items-center justify-center rounded-md bg-accent-soft">
                <Icon decorative name={point.icon} tone="accent" />
              </View>
              <View className="min-w-0 flex-1">
                <Text variant="body-strong">{point.title}</Text>
                <Text tone="muted" variant="body-sm">
                  {point.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
