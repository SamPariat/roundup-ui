import type { Href } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'
import type { PressableProps } from 'react-native'

import { Link } from 'expo-router'
import { Pressable } from 'react-native'

type NavPressableProps = Omit<PressableProps, 'children'> & {
  children: ReactNode
  href?: Href | undefined
}

// Items with an href go through the router's Link so the web gets real anchors.
export const NavPressable = ({ children, href, ...props }: NavPressableProps): ReactElement => {
  const pressable = <Pressable {...props}>{children}</Pressable>
  if (href === undefined) return pressable
  // Link would stamp role="link" on the child; keep the tab role the tablist expects. The
  // browser still gets a real anchor, which is what makes middle-click and copy-link work.
  return (
    <Link asChild href={href} role="tab">
      {pressable}
    </Link>
  )
}
