import type { ComponentRef, ReactElement, Ref } from 'react'
import type { ViewStyle } from 'react-native'

import { HeaderHeightContext } from 'expo-router/react-navigation'
import { use, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Modal, Platform, Pressable, useWindowDimensions, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { TIconName } from '../lib/icons'

import { cn } from '../lib/cn'
import { useMenuMotion } from '../lib/useMenuMotion'
import { Button } from './Button'
import { Chip } from './Chip'
import { Icon } from './Icon'
import { Surface } from './Surface'
import { Text } from './Text'

/** One action of a Menu. */
export interface IMenuItem {
  /** What the row does, a verb in sentence case ("Rename squad"). Its accessible name. */
  label: string
  /** The row's icon. */
  icon?: TIconName
  /** Draws the row in danger and groups it last, after a divider. Follow it with a confirm Modal. */
  destructive?: boolean
  /** Marks the row as the current choice: it shows a check and is announced as selected. */
  selected?: boolean
  /** Runs once the menu has closed. */
  onPress: () => void
}

/** Props for Menu. */
export interface IMenuProps {
  /** The actions, in order; destructive ones are moved last. */
  items: readonly IMenuItem[]
  /** The name of the ⋯ button and of the menu, such as "Squad options". */
  label: string
  /**
   * Draws the trigger as a Chip with this text and a chevron, named by `label`, instead of the ⋯
   * button, for a menu that picks one value such as "Within 3 km".
   */
  chip?: string
  /**
   * `header` when the screen header draws the ⋯ button itself (the iOS header's native button),
   * which calls `open` on the ref: the Menu draws no button and opens under the header's right
   * end. Leaving it out renders the Menu's own ⋯ button, and the card opens under it.
   */
  anchor?: 'header'
  /** Opens the menu from outside, for a ⋯ button the Menu does not draw. */
  ref?: Ref<IMenuHandle>
}

/** What a Menu lets its owner do: open it from a ⋯ button it does not draw. */
export interface IMenuHandle {
  /** Opens the menu at its anchor. */
  open: () => void
}

/** Props for one row. */
interface IMenuRowProps {
  /** The action. */
  item: IMenuItem
  /** Closes the menu, then runs the action. */
  onPick: (action: () => void) => void
}

/** Where the open card sits in the window: its top and its distance from the right edge. */
interface IMenuPlace {
  /** Points from the top of the window. */
  top: number
  /** Points from the right edge of the window. */
  right: number
}

/** The gap between the trigger and the card, and the least margin the card keeps from the edge. */
const GAP = 8

/** The least room the card keeps from the right edge of the window. */
const EDGE = 16

/**
 * The web's glass fill, the raised color at 60%; its blur is part of the motion (useMenuMotion).
 * iOS draws Liquid Glass through Surface.
 */
const WEB_FILL = Platform.select({ default: '', web: 'bg-glass' })

/** The card's corners, on the animated view too, so the web blur it carries is clipped to them. */
const CARD_SHAPE: ViewStyle = { borderRadius: 16 }

/**
 * iOS cannot present a Modal while another one is still being dismissed, so there a picked action
 * waits for the menu's own Modal to finish closing. Elsewhere it runs straight away.
 */
const WAIT_FOR_DISMISS = Platform.OS === 'ios'

/** Props for the trigger. */
interface IMenuTriggerProps {
  /** The text of a chip trigger; undefined draws the ⋯ button. */
  chip: string | undefined
  /** The trigger's accessible name. */
  label: string
  /** Opens the menu. */
  onOpen: () => void
}

/**
 * The control that opens the menu: the ⋯ button, or a chip with a chevron when `chip` is set.
 * @returns The pressable trigger.
 */
const MenuTrigger = ({ chip, label, onOpen }: IMenuTriggerProps): ReactElement =>
  chip === undefined ? (
    <Button icon="more" label={label} onPress={onOpen} variant="ghost" />
  ) : (
    <Chip label={label} menu onPress={onOpen}>
      {chip}
    </Chip>
  )

/**
 * One action: an icon and a label, 48 tall; red when destructive.
 * @returns The pressable row.
 */
const MenuRow = ({ item, onPick }: IMenuRowProps): ReactElement => {
  const { destructive = false, icon, label, onPress, selected = false } = item

  const handlePress = useCallback((): void => {
    onPick(onPress)
  }, [onPick, onPress])

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="menuitem"
      aria-selected={selected}
      className="min-h-12 flex-row items-center gap-3 rounded-lg px-3 active:bg-bg-hover"
      onPress={handlePress}
    >
      {icon === undefined ? null : (
        <Icon decorative name={icon} tone={destructive ? 'danger' : 'fg-muted'} />
      )}
      <Text className="min-w-0 flex-1" numberOfLines={1} tone={destructive ? 'danger' : 'fg'}>
        {label}
      </Text>
      {selected ? <Icon decorative name="check" tone="accent" /> : null}
    </Pressable>
  )
}

/**
 * The options behind a ⋯ button, the same on web, Android and iOS. It renders the button itself and
 * keeps its own open state: pressing it opens a glass card 8 below the button, its right edge on
 * the button's right edge, one row per action, destructive rows last after a divider. The card
 * grows from its corner like an iOS context menu and shrinks away on close. It floats in a
 * transparent Modal over the whole window, so a tap anywhere (the header, the tab bar, the button
 * again), Esc or the Android back button closes it. Picking a row closes it, then runs the action,
 * so a Modal the action opens never overlaps it. Where the header draws a native ⋯ (iOS), pass
 * `anchor="header"` and call `open` on the ref.
 * @returns The trigger (unless anchored), and the menu while open.
 */
export const Menu = ({ anchor, chip, items, label, ref }: IMenuProps): ReactElement => {
  const triggerRef = useRef<ComponentRef<typeof View>>(null)
  // The action picked, run once the menu has gone; undefined when it closed without a pick.
  const pendingRef = useRef<(() => void) | undefined>(undefined)
  const [open, setOpen] = useState<boolean>(false)
  // Where the card goes, once the trigger has been measured.
  const [place, setPlace] = useState<IMenuPlace | undefined>()
  const { width } = useWindowDimensions()
  // The screen's header height, read from its context so a Menu outside a navigator (a test, the
  // catalog) falls back to the top safe area instead of throwing as useHeaderHeight would.
  const headerHeight = use(HeaderHeightContext)
  const { top: safeTop } = useSafeAreaInsets()
  const motion = useMenuMotion(Platform.OS === 'web')
  const { open: playOpen } = motion

  const handleOpen = useCallback((): void => {
    setOpen(true)

    if (anchor === 'header') {
      // The header's own buttons sit 16 in from its right end.
      setPlace({ right: EDGE, top: (headerHeight ?? safeTop) + GAP })
      playOpen()

      return
    }

    triggerRef.current?.measureInWindow(
      (x: number, y: number, triggerWidth: number, triggerHeight: number): void => {
        setPlace({ right: Math.max(EDGE, width - x - triggerWidth), top: y + triggerHeight + GAP })
        playOpen()
      },
    )
  }, [anchor, headerHeight, playOpen, safeTop, width])

  useImperativeHandle(ref, (): IMenuHandle => ({ open: handleOpen }), [handleOpen])

  const runPending = useCallback((): void => {
    const action = pendingRef.current

    pendingRef.current = undefined
    action?.()
  }, [])

  // The closing motion has ended: hide the Modal, and run the picked action unless iOS has to
  // wait for the Modal to finish going (see handleDismiss).
  const handleClosed = useCallback((): void => {
    setOpen(false)
    setPlace(undefined)

    if (!WAIT_FOR_DISMISS) runPending()
  }, [runPending])

  const { close: playClose } = motion

  const handleClose = useCallback((): void => {
    pendingRef.current = undefined
    playClose(handleClosed)
  }, [handleClosed, playClose])

  const handlePick = useCallback(
    (action: () => void): void => {
      pendingRef.current = action
      playClose(handleClosed)
    },
    [handleClosed, playClose],
  )

  const cardPlace = useMemo(
    (): ViewStyle =>
      place === undefined
        ? { ...CARD_SHAPE, opacity: 0, position: 'absolute' }
        : { ...CARD_SHAPE, position: 'absolute', right: place.right, top: place.top },
    [place],
  )

  const plain = items.filter((item) => item.destructive !== true)
  const danger = items.filter((item) => item.destructive === true)

  const button =
    anchor === undefined ? <MenuTrigger chip={chip} label={label} onOpen={handleOpen} /> : null

  return (
    <View collapsable={false} ref={triggerRef}>
      {button}
      <Modal
        animationType="none"
        onDismiss={runPending}
        onRequestClose={handleClose}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <Pressable
          accessible={false}
          aria-hidden
          className="absolute inset-0"
          focusable={false}
          importantForAccessibility="no-hide-descendants"
          onPress={handleClose}
        />
        {/* NativeWind does not style Reanimated views, so the place, corners and motion are styles. */}
        <Animated.View style={[cardPlace, motion.style]}>
          <Surface
            accessibilityLabel={label}
            className={cn(
              'max-w-80 min-w-55 rounded-2xl border border-glass-edge p-1.5 shadow-toast',
              WEB_FILL,
            )}
            role="menu"
          >
            {plain.map((item) => (
              <MenuRow item={item} key={item.label} onPick={handlePick} />
            ))}
            {plain.length > 0 && danger.length > 0 ? (
              <View className="mx-3 my-1.5 h-px bg-border" role="separator" />
            ) : null}
            {danger.map((item) => (
              <MenuRow item={item} key={item.label} onPick={handlePick} />
            ))}
          </Surface>
        </Animated.View>
      </Modal>
    </View>
  )
}
