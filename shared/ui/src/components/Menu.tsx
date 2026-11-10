import type { ReactElement } from 'react'
import type { ViewStyle } from 'react-native'

import { useCallback, useEffect, useMemo } from 'react'
import { BackHandler, Platform, Pressable, View } from 'react-native'

import type { TIconName } from '../lib/icons'

import { cn } from '../lib/cn'
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
  /** Runs once the menu has closed. */
  onPress: () => void
}

/** Props for Menu. */
export interface IMenuProps {
  /** Whether the menu is open. */
  visible: boolean
  /** The actions, in order; destructive ones are moved last. */
  items: readonly IMenuItem[]
  /** The menu's accessible name, such as "Squad options". */
  label: string
  /** How far below the top of its parent the card sits, in points. Defaults to 8. */
  top?: number
  /**
   * Classes of the column the card lines up with, such as the content's max width and side gutter:
   * its right edge sits on that column's right edge, under the ⋯ button. Defaults to a 16 gutter.
   */
  column?: string
  /** Called by a tap outside, Esc, the Android back button and after a row is picked. */
  onClose: () => void
}

/** Props for one row. */
interface IMenuRowProps {
  /** The action. */
  item: IMenuItem
  /** Closes the menu before the action runs. */
  onClose: () => void
}

/** The web's glass: the raised color at 60% over a blur. iOS draws Liquid Glass through Surface. */
const WEB_GLASS = Platform.select({ default: '', web: 'bg-glass backdrop-blur-2xl' })

/**
 * One action: an icon and a label, 48 tall; red when destructive.
 * @returns The pressable row.
 */
const MenuRow = ({ item, onClose }: IMenuRowProps): ReactElement => {
  const { destructive = false, icon, label, onPress } = item

  const handlePress = useCallback((): void => {
    onClose()
    onPress()
  }, [onClose, onPress])

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="menuitem"
      className="min-h-12 flex-row items-center gap-3 rounded-lg px-3 active:bg-bg-hover"
      onPress={handlePress}
    >
      {icon === undefined ? null : (
        <Icon decorative name={icon} tone={destructive ? 'danger' : 'fg-muted'} />
      )}
      <Text className="min-w-0 flex-1" numberOfLines={1} tone={destructive ? 'danger' : 'fg'}>
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * Closes the menu on the Android back button and on Esc on the web, while it is open.
 * @param visible - Whether the menu is open.
 * @param onClose - Closes it.
 */
const useDismissKeys = (visible: boolean, onClose: () => void): void => {
  const handleBack = useCallback((): boolean => {
    onClose()

    return true
  }, [onClose])

  const handleKey = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!visible) return

    if (Platform.OS === 'web') {
      globalThis.addEventListener('keydown', handleKey)

      return () => {
        globalThis.removeEventListener('keydown', handleKey)
      }
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack)

    return () => {
      subscription.remove()
    }
  }, [handleBack, handleKey, visible])
}

/**
 * The options behind a ⋯ button: a glass card at the top of its parent (the screen, just under
 * its header), its right edge on the right edge of the given column, so it sits under the button, one row per action, destructive rows last after a divider. It is the same on
 * web, Android and iOS. The screen behind is not dimmed: a tap anywhere outside, Esc or the
 * Android back button closes it, and picking a row closes it, then runs the action, so a Modal the
 * action opens never overlaps it. Put it last in the screen, so it covers the content.
 * @returns The menu while open, or nothing.
 */
export const Menu = ({
  items,
  label,
  onClose,
  column = 'px-4',
  top = 8,
  visible,
}: IMenuProps): null | ReactElement => {
  useDismissKeys(visible, onClose)

  const place = useMemo((): ViewStyle => ({ top }), [top])
  const plain = items.filter((item) => item.destructive !== true)
  const danger = items.filter((item) => item.destructive === true)

  if (!visible) return null

  return (
    <View className="absolute inset-0 z-10">
      <Pressable
        accessible={false}
        aria-hidden
        className="absolute inset-0"
        focusable={false}
        importantForAccessibility="no-hide-descendants"
        onPress={onClose}
      />
      <View className="absolute inset-x-0 items-center" pointerEvents="box-none" style={place}>
        <View className={cn('w-full items-end', column)} pointerEvents="box-none">
          <Surface
            accessibilityLabel={label}
            className={cn(
              'max-w-80 min-w-55 rounded-2xl border border-glass-edge p-1.5 shadow-toast',
              WEB_GLASS,
            )}
            role="menu"
          >
            {plain.map((item) => (
              <MenuRow item={item} key={item.label} onClose={onClose} />
            ))}
            {plain.length > 0 && danger.length > 0 ? (
              <View className="mx-3 my-1.5 h-px bg-border" role="separator" />
            ) : null}
            {danger.map((item) => (
              <MenuRow item={item} key={item.label} onClose={onClose} />
            ))}
          </Surface>
        </View>
      </View>
    </View>
  )
}
