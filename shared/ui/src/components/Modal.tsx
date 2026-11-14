import type { ComponentRef, ReactElement, ReactNode, RefObject } from 'react'
import type { ViewStyle } from 'react-native'

import { BlurView } from 'expo-blur'
import { useCallback, useMemo, useRef } from 'react'
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Modal as NativeModal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { IActionContextValue } from '../lib/action-context'
import type { TMotionStyle } from '../lib/useModalMotion'

import { ActionContext } from '../lib/action-context'
import { cn } from '../lib/cn'
import { ABSOLUTE_FILL } from '../lib/fill'
import { useKeyboardShown } from '../lib/useKeyboardShown'
import { useModalMotion } from '../lib/useModalMotion'
import { useTheme } from '../theme/theme'
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
  /** `confirm` is a short question with two actions. Default `content`. */
  tone?: 'confirm' | 'content'
  /** One plain-text paragraph under the header (confirmations). */
  body?: string
  /** Custom body content, in a scroll view under the header. */
  children?: ReactNode
  /**
   * Footer buttons, primary first. Stacked in the app's sheet, right-aligned in the web card. There
   * is no close button, so include one that dismisses (Cancel, Done) for screen-reader users.
   */
  actions?: ReactNode[]
  /**
   * A request is in flight: the other actions disable, the body ignores taps without dimming, and
   * nothing closes the modal.
   * Put `loading` and a `loadingLabel` on the Button that started it.
   */
  busy?: boolean
  /** Whether it is showing. The modal mounts its content only while visible. */
  visible?: boolean
  /** Called when a tap on the backdrop, Esc or the Android back button asks to close. Not called while busy. */
  onClose?: () => void
}

/** The padding inside the modal, in points; at the bottom the sheet sits a small gap over the home indicator instead when that is taller. */
const PADDING = 24

/** The gap between the home indicator's inset and the sheet's last action, in points. */
const SAFE_AREA_GAP = 8

/**
 * The sheet's bottom padding while the keyboard is up, in points. The keyboard covers the home
 * indicator, so its inset is dropped, and the last action sits this close above the keys.
 */
const KEYBOARD_GAP = 16

/** How much of the window a web card may take, as a share of its height. */
const CARD_SHARE = 0.85

/** The gap the sheet keeps under the status bar and the notch, in points. */
const SHEET_GAP = 16

/** How strongly the app blurs the screen behind the sheet, on expo-blur's 0 to 100 scale. */
const BACKDROP_BLUR = 24

/** The web card's corners, on the animated view that carries its blur so the blur is clipped too. */
const CARD_CORNERS: ViewStyle = { borderRadius: 20 }

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
  /** The line under the title. */
  subtitle?: string | undefined
  /** The title text. */
  title: string
  /** Ref to the focusable title wrapper. */
  titleRef: RefObject<null | TTitleElement>
}

/**
 * The modal header: the subject, and the title with its subtitle.
 * @returns The header row.
 */
const ModalHeader = ({ leading, subtitle, title, titleRef }: IHeaderProps): ReactElement => {
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
    </View>
  )
}

/**
 * The modal body: an optional paragraph and the children in a scroll view that ignores taps while busy.
 * It does not dim: only the action buttons look disabled while a request is in flight.
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

  return (
    <ScrollView
      alwaysBounceVertical={false}
      className="mt-4 shrink"
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
  /** Its fade (and on the web its blur), which follows the modal opening and closing. */
  style: TMotionStyle
  /** Whether to draw expo-blur's view: the app's sheet. The web blurs through the motion style. */
  native: boolean
}

/**
 * The screen behind the modal, blurred under a light scrim. Tapping it asks the modal to close.
 * It is hidden from assistive technology, which closes the modal with its actions, Esc or the
 * Android back button instead. Android cannot blur another window, so it gets the scrim alone.
 * @returns The pressable, blurred backdrop.
 */
const ModalBackdrop = ({ native, onPress, style }: IBackdropProps): ReactElement => {
  const { name } = useTheme()

  return (
    // NativeWind does not style Reanimated views, so the fill is a style here too.
    <Animated.View style={[ABSOLUTE_FILL, style]}>
      <Pressable
        accessible={false}
        aria-hidden
        className="absolute inset-0"
        focusable={false}
        importantForAccessibility="no-hide-descendants"
        onPress={onPress}
      >
        {native ? (
          <BlurView
            intensity={BACKDROP_BLUR}
            style={ABSOLUTE_FILL}
            tint={name === 'latte' ? 'light' : 'dark'}
          />
        ) : null}
        <View className="absolute inset-0 bg-scrim" />
      </Pressable>
    </Animated.View>
  )
}

/**
 * A dialog, drawn as glass over a blurred backdrop that closes it when tapped. There is no close
 * button and no drag: it also closes on Esc, the Android back button and its own actions. In the
 * app it is a bottom sheet at every width, edge to edge with rounded top corners and padded clear
 * of the home indicator, 560 points wide at most on a tablet. On the web it is a centered card at
 * every width, where a sheet at the bottom of a browser window reads as broken. Identical content
 * on web and app. It traps focus and tells assistive technology it is a (alert)dialog and when it
 * is busy; while busy nothing closes it. A Modal can sit in another Modal's body (a date field's
 * picker in the New event form): it is a native modal of its own, presented from the one it is in on
 * iOS, a second dialog on Android and the topmost modal on web, where only that one traps focus and
 * answers Esc. Only the top one closes.
 * @returns The native modal host with its sheet or card.
 */
export const Modal = ({
  actions,
  body,
  busy = false,
  children,
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

  // While a request is in flight only the loading Button stays active; Buttons read this context.
  const actionContext = useMemo((): IActionContextValue => ({ busy, block: sheet }), [busy, sheet])

  // Every way of closing plays the closing motion first: the backdrop, Esc and the Android back
  // button. While busy none of them does anything.
  const { backdrop, mounted, panel, requestClose } = useModalMotion({
    busy,
    onClose,
    sheet,
    visible,
  })

  // The sheet runs to the bottom edge, so its last action stays clear of the home indicator.
  const { bottom, top } = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  // The cap is a number, not a percentage: the parents are as tall as their content, and Yoga has
  // no height to take a percentage of, so a percentage cap let the sheet outgrow the screen or
  // scroll too early. The sheet may fill the screen below the status bar; the card keeps its
  // share. Whatever is taller scrolls in the body, because everything between the wrapper and the
  // body shrinks.
  const maxHeight = useMemo(
    (): ViewStyle => ({ maxHeight: sheet ? height - top - SHEET_GAP : height * CARD_SHARE }),
    [height, sheet, top],
  )

  // The keyboard already covers the home indicator, and the KeyboardAvoidingView lifts the sheet
  // by the keyboard's full height, so keeping the inset too would float the sheet above the keys.
  const keyboardShown = useKeyboardShown()

  const sheetPadding = useMemo((): undefined | ViewStyle => {
    if (!sheet) return undefined

    if (keyboardShown) return { paddingBottom: KEYBOARD_GAP }

    // A small gap over the home indicator's inset keeps the last action clear of it; the full
    // padding on top of the inset left a band of empty sheet. Phones without one keep the padding.
    return { paddingBottom: Math.max(PADDING, bottom + SAFE_AREA_GAP) }
  }, [bottom, keyboardShown, sheet])

  const handleFocusTitle = useCallback((): void => {
    ModalFocus.moveFocusTo(titleRef.current)
  }, [])

  return (
    <NativeModal
      animationType="none"
      onRequestClose={requestClose}
      onShow={handleFocusTitle}
      statusBarTranslucent
      transparent
      visible={mounted}
    >
      {/* iOS draws the keyboard over the window, so a field in the sheet would sit behind it;
          padding by the keyboard's height lifts the sheet. Android resizes the window itself. */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding' })}
        className={cn('flex-1', sheet ? 'justify-end' : 'items-center justify-center p-6')}
      >
        <ModalBackdrop native={sheet} onPress={requestClose} style={backdrop} />
        {/* NativeWind does not style Reanimated views, so the size lives on a plain View and the
            animated one inside it only moves. */}
        <View
          className={cn('shrink', sheet ? 'mx-auto w-full max-w-140' : 'w-120 max-w-full')}
          style={maxHeight}
        >
          <Animated.View className="shrink" style={sheet ? panel : [panel, CARD_CORNERS]}>
            <Surface
              accessibilityLabel={title}
              accessibilityViewIsModal
              aria-busy={busy}
              aria-modal
              className={cn(
                'shrink border border-glass-edge px-6 pt-6',
                sheet
                  ? 'rounded-t-[20px] border-x-0 border-b-0 shadow-sheet'
                  : 'rounded-[20px] shadow-toast',
                !sheet && 'bg-glass pb-6',
              )}
              role={confirm ? 'alertdialog' : 'dialog'}
              style={sheetPadding}
            >
              <ModalHeader
                leading={leading}
                subtitle={subtitle}
                title={title}
                titleRef={titleRef}
              />
              <ModalContent body={body} busy={busy}>
                {children}
              </ModalContent>
              {actions !== undefined && actions.length > 0 ? (
                <ActionContext value={actionContext}>
                  <View
                    className={cn(
                      'mt-6 gap-2',
                      !sheet && 'flex-row-reverse flex-wrap justify-start',
                    )}
                  >
                    {actions}
                  </View>
                </ActionContext>
              ) : null}
            </Surface>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </NativeModal>
  )
}
