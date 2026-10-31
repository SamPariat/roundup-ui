import type { ReactElement } from 'react'
import type { LayoutChangeEvent } from 'react-native'

import { useCallback, useState } from 'react'
import { Text as NativeText, View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { IconName } from '../lib/icons.ts'

import ArtDark from '../../../../assets/svg/illustrations/welcome-dark.svg'
import ArtLight from '../../../../assets/svg/illustrations/welcome-light.svg'
import { cn } from '../lib/cn.ts'
import { breakpointFor } from '../lib/useBreakpoint.ts'
import { useTheme } from '../theme/theme.tsx'
import { Button } from './Button.tsx'
import { Icon } from './Icon.tsx'
import { Logo } from './Logo.tsx'
import { Text } from './Text.tsx'

/** Props for Welcome. */
export interface WelcomeProps {
  /** Headline. Defaults to the translated tagline. */
  title?: string
  /** Paragraph under the headline. Defaults to the translated intro. */
  body?: string
  /** Text of the main button. Defaults to the translated "Continue with phone". */
  startLabel?: string
  /** Called when the main button is pressed. */
  onStart?: () => void
}

/** One of the three selling points. */
interface Point {
  /** Icon in the accent tile. */
  icon: IconName
  /** Which translated title and text to use. */
  id: 'explore' | 'history' | 'squads'
}

const POINTS = [
  { icon: 'squads', id: 'squads' },
  { icon: 'explore', id: 'explore' },
  { icon: 'history', id: 'history' },
] as const satisfies readonly Point[]

/**
 * The mark at large size with a cluster of dots: the squad gathering round. The artwork is an SVG
 * file per theme, in the logo-* token colours.
 * @returns The theme's welcome illustration, decorative.
 */
const WelcomeArt = (): ReactElement => {
  const { name } = useTheme()
  const Art = name === 'mocha' ? ArtDark : ArtLight

  return <Art aria-hidden height="100%" width="100%" />
}

/**
 * Full-page intro for signed-out visitors. Lays itself out from its own width, not the window's.
 * @returns A full-height page with the logo, headline, call to action, artwork and three selling points.
 */
export const Welcome = ({ body, onStart, startLabel, title }: WelcomeProps): ReactElement => {
  const { t } = useT()
  const [width, setWidth] = useState(0)
  const wide = breakpointFor(width) !== 'phone'

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  return (
    <View
      accessibilityLabel={t('welcome.label')}
      className="min-h-full w-full flex-1 bg-bg"
      onLayout={handleLayout}
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
                wide ? 'text-[64px]/17 tracking-[-2.88px]' : 'text-4xl/10 tracking-[-1.26px]',
              )}
            >
              {title ?? t('welcome.title')}
            </NativeText>
            <Text className="max-w-130" tone="muted" variant="body">
              {body ?? t('welcome.body')}
            </Text>
            <View className={cn('mt-2 gap-2', wide && 'flex-row items-center gap-4')}>
              <Button block={!wide} onPress={onStart} size="lg">
                {startLabel ?? t('welcome.start')}
              </Button>
              <Text tone="muted" variant="caption">
                {t('welcome.newHere')}
              </Text>
            </View>
          </View>
          <View className={wide ? 'aspect-44/32 w-2/5 max-w-105' : 'aspect-44/32 w-3/5 max-w-55'}>
            <WelcomeArt />
          </View>
        </View>
        <View className={cn('gap-4', wide && 'flex-row gap-6 border-t border-border pt-8')}>
          {POINTS.map((point) => (
            <View className={cn('flex-row items-start gap-3', wide && 'flex-1')} key={point.id}>
              <View className="size-10 items-center justify-center rounded-xl bg-accent-soft">
                <Icon decorative name={point.icon} tone="accent" />
              </View>
              <View className="min-w-0 flex-1">
                <Text variant="body-strong">{t(`welcome.points.${point.id}.title`)}</Text>
                <Text tone="muted" variant="body-sm">
                  {t(`welcome.points.${point.id}.text`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
