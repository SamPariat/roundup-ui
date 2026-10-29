import type { ReactElement, ReactNode } from 'react'

import { Link } from 'expo-router'
import { useCallback } from 'react'
import { Pressable } from 'react-native'

import type { NavItemData } from '../lib/nav-items.ts'

interface NavTabProps {
  item: NavItemData
  active: boolean
  onChange?: ((id: string) => void) | undefined
  className: string
  children: ReactNode
}

// One tab of the bottom bar or side rail. The press handler is built here from the item, so the
// parents pass data instead of an inline function. Items with an href go through the router's
// Link so the web gets real anchors.
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
