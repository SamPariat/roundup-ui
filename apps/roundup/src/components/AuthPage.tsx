import type { ReactElement, ReactNode } from 'react'

import { ScrollView, View } from 'react-native'

import { cn, Logo, Screen, Text, TopAppBar, useBreakpoint } from '@roundup/ui'

/** Props for AuthPage. */
export interface AuthPageProps {
  /** The page's level-1 heading. */
  title: string
  /** The sentence under it. */
  body: string
  /** Shows a back bar on phones, and is called when it is pressed. */
  onBack?: () => void
  /** The form: fields, the main button and any extras. */
  children: ReactNode
}

/**
 * The frame of the sign-in screens. On a phone it is a single column, with a back bar when the
 * step has one; from 768 wide it is a centred card with the brand on the left and the form on the
 * right.
 * @returns A scrolling page that keeps clear of the notch and the keyboard.
 */
export const AuthPage = ({ body, children, onBack, title }: AuthPageProps): ReactElement => {
  const { breakpoint } = useBreakpoint()
  const wide = breakpoint !== 'phone'
  const bar = !wide && onBack !== undefined

  const header = bar ? <TopAppBar onBack={onBack} title={title} /> : undefined

  return (
    <Screen {...(header === undefined ? {} : { header })}>
      <ScrollView
        contentContainerClassName={cn('grow', wide && 'items-center justify-center p-8')}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className={cn(
            'w-full gap-6',
            wide
              ? 'max-w-4xl flex-row gap-12 rounded-3xl border border-border bg-bg-raised p-12'
              : 'px-4 pt-6 pb-8',
          )}
        >
          <View className={cn('gap-4', wide && 'min-w-0 flex-1 justify-center')}>
            {bar ? null : <Logo size="lg" />}
            {bar ? null : (
              <Text heading={1} variant="title">
                {title}
              </Text>
            )}
            <Text tone="muted" variant="body">
              {body}
            </Text>
          </View>
          <View className={cn('gap-4', wide && 'min-w-0 flex-1 justify-center')}>{children}</View>
        </View>
      </ScrollView>
    </Screen>
  )
}
