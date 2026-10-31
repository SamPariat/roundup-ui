import type { ReactElement, ReactNode } from 'react'

import { Link } from 'expo-router'
import { useCallback } from 'react'
import { Pressable } from 'react-native'

import type { NavItemData } from '../lib/nav-items.ts'

/** Props for NavTab. */
interface NavTabProps {
  /** The destination this tab goes to. */
  item: NavItemData
  /** Whether this is the current destination. */
  active: boolean
  /** Called with the item's id when the tab is pressed. */
  onChange?: ((id: string) => void) | undefined
  /** Classes for the pressable, which differ between the bottom bar and the side rail. */
  className: string
  /** The tab's icon and label. */
  children: ReactNode
}

/**
 * One tab of the bottom bar or side rail. The press handler is built here from the item, so the
 * parents pass data instead of an inline function. Items with an href go through the router's
 * Link so the web gets real anchors.
 * @returns The tab, wrapped in a router link when the item has an href.
 */
export const NavTab = ({
  active,
  children,
  className,
  item,
  onChange,
}: NavTabProps): ReactElement => {
  const press = useCallback(() => {
    onChange?.(item.id)
  }, [item.id, onChange])

  const pressable = (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      aria-selected={active}
      className={className}
      onPress={press}
    >
      {children}
    </Pressable>
  )

  if (item.href === undefined) return pressable

  // Link would stamp role="link" on the child; keep the tab role the tablist expects. The
  // browser still gets a real anchor, which is what makes middle-click and copy-link work.
  return (
    <Link asChild href={item.href} role="tab">
      {pressable}
    </Link>
  )
}
