import type { ComponentRef, ReactElement, ReactNode, RefObject } from 'react'
import type { ViewStyle } from 'react-native'

import { BlurView } from 'expo-blur'
import { useCallback, useMemo, useRef } from 'react'
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Modal as NativeModal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native'

import { useT } from '@roundup/i18n'

import type { IActionContextValue } from '../lib/action-context'

import { ActionContext } from '../lib/action-context'
import { cn } from '../lib/cn'
import { ABSOLUTE_FILL } from '../lib/fill'
import { useModalMotion } from '../lib/useModalMotion'
import { useTheme } from '../theme/theme'
import { Button } from './Button'
import { Surface } from './Surface'
import { Text } from './Text'

/** Props for Modal. */
export interface IModalProps {
  /** The dialog's title. It is also the dialog's accessible name and receives focus when it opens. */
  title: string
  /** A line under the title. */
  subtitle?: string
  /** The subject the modal is about, e.g. an Avatar. */
  leading?: ReactNode
  /** `confirm` is a short question with two actions and no close button. Default `content`. */
  tone?: 'confirm' | 'content'
  /** One plain-text paragraph under the header (confirmations). */
  body?: string
  /** Custom body content, in a scroll view under the header. */
  children?: ReactNode
  /** Footer buttons, primary first. Stacked on a phone, right-aligned on a wide screen. */
  actions?: ReactNode[]
  /**
   * A request is in flight: other actions disable, the body dims and the close button hides.
   * Put `loading` and a `loadingLabel` on the Button that started it.
   */
  busy?: boolean
  /** Show the close button (content modals only). Default true. */
  closable?: boolean
  /** Whether it is showing. The modal mounts its content only while visible. */
  visible?: boolean
  /** Called when the close button, Esc, the Android back button or a tap on the backdrop asks to close. Not called while busy. */
  onClose?: () => void
}

/** How strongly the screen behind is blurred, on expo-blur's 0 to 100 scale. */
const BACKDROP_BLUR = 24

/** The native element behind the title wrapper, which gets focus on open. */
type TTitleElement = ComponentRef<typeof View>

/** The web DOM focus method that the title element has on web. */
interface IFocusable {
  /** Moves keyboard and screen-reader focus to the element. */
  focus?: () => void
}

/**
 * Modal helpers. Static methods only.
 */
class ModalFocus {
  /**
   * Moves focus to the dialog title so assistive technology starts reading at the top of the dialog.
   * @param title - The title element, or null before it has mounted.
   */
  static moveFocusTo(title: null | TTitleElement): void {
    if (title === null) return

    if (Platform.OS === 'web') {
      ;(title as unknown as IFocusable).focus?.()

      return
    }

    AccessibilityInfo.sendAccessibilityEvent(title, 'focus')
  }
}

/** Props for the header row of the modal. */
interface IHeaderProps {
  /** The subject the modal is about. */
  leading?: ReactNode
  /** Called when the close button is pressed. */
  onClose?: (() => void) | undefined
  /** The line under the title. */
  subtitle?: string | undefined
  /** The title text. */
  title: string
  /** Whether the close button is drawn. */
  showClose: boolean
  /** Ref to the focusable title wrapper. */
  titleRef: RefObject<null | TTitleElement>
}

/**
 * The modal header: the subject, the title with its subtitle, and the close button.
 * @returns The header row.
 */
const ModalHeader = ({
  leading,
  onClose,
  showClose,
  subtitle,
  title,
  titleRef,
}: IHeaderProps): ReactElement => {
  const { t } = useT()

  return (
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
        <Button
          icon="close"
          label={t('common.close')}
          onPress={onClose}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </View>
  )
}

/**
 * The modal body: an optional paragraph and the children in a scroll view that dims and goes inert while busy.
 * @returns The scroll view, or null when there is no body and no children.
 */
const ModalContent = ({
  body,
  busy,
  children,
}: {
  /** The plain-text paragraph. */
  body?: string | undefined
  /** Whether a request is in flight. */
  busy: boolean
  /** The custom body content. */
  children?: ReactNode
}): null | ReactElement => {
  if (body === undefined && children === undefined) return null

  // Dimming goes on the content, never on the Surface: glass does not render below opacity 1.
  return (
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
  )
}

/** Props for the backdrop behind the modal. */
interface IBackdropProps {
  /** Called when the backdrop is tapped. */
  onPress: () => void
  /** Its fade, which follows the modal opening and closing. */
  style: Animated.WithAnimatedValue<ViewStyle>
}

/**
 * The screen behind the modal, blurred under a light scrim. Tapping it asks the modal to close.
 * It is hidden from assistive technology, which closes the modal with its close button, Esc or the
 * Android back button instead. Android cannot blur another window, so it gets the scrim alone.
 * @returns The pressable, blurred backdrop.
 */
const ModalBackdrop = ({ onPress, style }: IBackdropProps): ReactElement => {
  const { name } = useTheme()

  return (
    <Animated.View className="absolute inset-0" style={style}>
      <Pressable
        accessible={false}
        aria-hidden
        className="absolute inset-0"
        focusable={false}
        importantForAccessibility="no-hide-descendants"
        onPress={onPress}
      >
        <BlurView
          intensity={BACKDROP_BLUR}
          style={ABSOLUTE_FILL}
          tint={name === 'latte' ? 'light' : 'dark'}
        />
        <View className="absolute inset-0 bg-scrim" />
      </Pressable>
    </Animated.View>
  )
}

/**
 * A dialog, drawn as glass over a blurred backdrop that closes it when tapped. In the app it is a
 * bottom sheet at every width, floating 8 points in from the edges with corners that follow the
 * device's, like the system sheets. On the web it is a centered card at every width, where a sheet
 * at the bottom of a browser window reads as broken. Identical content on web and app. It traps
 * focus, closes on Esc and the Android back button, and tells assistive technology it is a
 * (alert)dialog and when it is busy; while busy nothing closes it.
 * @returns The native modal host with its sheet or card.
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
}: IModalProps): ReactElement => {
  const titleRef = useRef<TTitleElement>(null)
  const sheet = Platform.OS !== 'web'
  const confirm = tone === 'confirm'
  const showClose = !confirm && !busy && closable

  // While a request is in flight only the loading Button stays active; Buttons read this context.
  const actionContext = useMemo((): IActionContextValue => ({ busy, block: sheet }), [busy, sheet])

  // Every way of closing plays the closing motion first: the backdrop, the close button, a drag,
  // Esc and the Android back button. While busy none of them does anything.
  const { backdrop, dragHandlers, mounted, panel, requestClose } = useModalMotion({
    busy,
    onClose,
    sheet,
    visible,
  })

  const focusTitle = useCallback((): void => {
    ModalFocus.moveFocusTo(titleRef.current)
  }, [])

  return (
    <NativeModal
      animationType="none"
      onRequestClose={requestClose}
      onShow={focusTitle}
      statusBarTranslucent
      transparent
      visible={mounted}
    >
      {/* iOS draws the keyboard over the window, so a field in the sheet would sit behind it;
          padding by the keyboard's height lifts the sheet. Android resizes the window itself. */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding' })}
        className={cn(
          'flex-1',
          sheet ? 'justify-end px-2 pb-2' : 'items-center justify-center p-6',
        )}
      >
        <ModalBackdrop onPress={requestClose} style={backdrop} />
        <Animated.View
          className={cn('max-h-[85%]', sheet ? 'mx-auto w-full max-w-140' : 'w-120 max-w-full')}
          style={panel}
        >
          <Surface
            accessibilityLabel={title}
            accessibilityViewIsModal
            aria-busy={busy}
            aria-modal
            className={cn(
              'max-h-full border border-glass-edge p-6',
              sheet ? 'rounded-[32px] shadow-sheet' : 'rounded-[28px] shadow-toast',
              !sheet && 'bg-glass backdrop-blur-2xl',
            )}
            role={confirm ? 'alertdialog' : 'dialog'}
          >
            {/* The handle and the header are where a finger drags the sheet down to close it. */}
            <View {...dragHandlers}>
              {sheet ? (
                <View
                  aria-hidden
                  className="-mt-3 mb-3 h-1.5 w-10 self-center rounded-full bg-border-strong"
                />
              ) : null}
              <ModalHeader
                leading={leading}
                onClose={requestClose}
                showClose={showClose}
                subtitle={subtitle}
                title={title}
                titleRef={titleRef}
              />
            </View>
            <ModalContent body={body} busy={busy}>
              {children}
            </ModalContent>
            {actions !== undefined && actions.length > 0 ? (
              <ActionContext value={actionContext}>
                <View
                  className={cn('mt-6 gap-2', !sheet && 'flex-row-reverse flex-wrap justify-start')}
                >
                  {actions}
                </View>
              </ActionContext>
            ) : null}
          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>
    </NativeModal>
  )
}
