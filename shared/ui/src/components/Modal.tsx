import type { ComponentRef, ReactElement, ReactNode } from 'react'

import { useMemo, useRef } from 'react'
import {
  AccessibilityInfo,
  Modal as NativeModal,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'

import { breakpoints } from '@roundup/tokens'

import { ActionContext } from '../lib/action-context.ts'
import { cn } from '../lib/cn.ts'
import { useTheme } from '../theme/theme.tsx'
import { Button } from './Button.tsx'
import { Surface } from './Surface.tsx'
import { Text } from './Text.tsx'

export interface ModalProps {
  title: string
  subtitle?: string
  /** The subject the modal is about, e.g. an Avatar. */
  leading?: ReactNode
  /** `confirm` is a short question with two actions and no close button. Default `content`. */
  tone?: 'confirm' | 'content'
  /** One plain-text paragraph under the header (confirmations). */
  body?: string
  children?: ReactNode
  /** Footer buttons, primary first. Stacked on a phone, right-aligned on a wide screen. */
  actions?: ReactNode[]
  /** A request is in flight: other actions disable, the body dims and the close button hides.
   *  Put `loading` and a `loadingLabel` on the Button that started it. */
  busy?: boolean
  /** Show the close button (content modals only). Default true. */
  closable?: boolean
  /** Whether it is showing. The modal mounts its content only while visible. */
  visible?: boolean
  onClose?: () => void
}

type TitleElement = ComponentRef<typeof View>

const moveFocusTo = (title: null | TitleElement): void => {
  if (title === null) return
  if (Platform.OS === 'web') {
    ;(title as unknown as { focus?: () => void }).focus?.()
    return
  }
  AccessibilityInfo.sendAccessibilityEvent(title, 'focus')
}

/**
 * Every sheet, form and confirmation. A bottom sheet below 768 wide, a centred 480 panel from
 * there up; identical content on web and app. The web build traps focus inside, closes on Esc
 * and returns focus to the trigger; native closes on the Android back button.
 */
export const Modal = ({
  actions,
  body,
  busy = false,
  children,
  closable = true,
  leading,
  onClose,
  subtitle,
  title,
  tone = 'content',
  visible = true,
}: ModalProps): ReactElement => {
  const { width } = useWindowDimensions()
  const { shadow } = useTheme()
  const titleRef = useRef<TitleElement>(null)
  const sheet = width < breakpoints['bp-tablet']
  const confirm = tone === 'confirm'
  const showClose = !confirm && !busy && closable

  // While a request is in flight only the loading Button stays active; Buttons read this context.
  const actionContext = useMemo(() => ({ busy, block: sheet }), [busy, sheet])

  return (
    <NativeModal
      animationType={sheet ? 'slide' : 'fade'}
      onRequestClose={() => {
        if (!busy) onClose?.()
      }}
      onShow={() => {
        moveFocusTo(titleRef.current)
      }}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        className={cn('flex-1 bg-scrim', sheet ? 'justify-end' : 'items-center justify-center p-6')}
      >
        <Surface
          accessibilityLabel={title}
          accessibilityViewIsModal
          aria-busy={busy}
          aria-modal
          className={cn(
            'max-h-[85%] p-6',
            sheet ? 'w-full rounded-t-xl' : 'w-[480px] max-w-full rounded-lg',
          )}
          role={confirm ? 'alertdialog' : 'dialog'}
          style={{ boxShadow: shadow[sheet ? 'shadow-sheet' : 'shadow-toast'] ?? '' }}
        >
          {sheet ? (
            <View
              aria-hidden
              className="absolute top-2 left-1/2 -ml-4 h-1 w-8 rounded-full bg-border-strong"
            />
          ) : null}
          <View className="flex-row items-center gap-3">
            {leading}
            <View className="min-w-0 flex-1 gap-1">
              <View accessible focusable={false} ref={titleRef}>
                <Text heading={2} variant="heading">
                  {title}
                </Text>
              </View>
              {subtitle === undefined ? null : (
                <Text tone="muted" variant="body-sm">
                  {subtitle}
                </Text>
              )}
            </View>
            {showClose ? (
              <Button icon="close" label="Close" onPress={onClose} size="sm" variant="ghost" />
            ) : null}
          </View>
          {body !== undefined || children !== undefined ? (
            // Dimming goes on the content, never on the Surface: glass does not render below opacity 1.
            <ScrollView
              className={cn('mt-4 shrink', busy && 'opacity-60')}
              contentContainerClassName="gap-3"
              pointerEvents={busy ? 'none' : 'auto'}
            >
              {body === undefined ? null : (
                <Text tone="muted" variant="body-sm">
                  {body}
                </Text>
              )}
              {children}
            </ScrollView>
          ) : null}
          {actions !== undefined && actions.length > 0 ? (
            <ActionContext value={actionContext}>
              <View className={cn('mt-6 gap-2', !sheet && 'flex-row-reverse justify-start')}>
                {actions}
              </View>
            </ActionContext>
          ) : null}
        </Surface>
      </View>
    </NativeModal>
  )
}
