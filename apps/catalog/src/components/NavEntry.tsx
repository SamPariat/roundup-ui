import type { ReactElement } from 'react'

import { Link } from 'expo-router'
import { Pressable } from 'react-native'

import { cn, Text } from '@roundup/ui'

import type { CatalogEntry } from '../registry.ts'

/** Props for NavEntry. */
export interface NavEntryProps {
  /** The page this link opens. */
  entry: CatalogEntry
  /** Whether it is the page on show. */
  current: boolean
}

/**
 * One link of the side list. It is a real link: an anchor on the web, a router push on native.
 * @returns The link, highlighted when it is the current page.
 */
export const NavEntry = ({ current, entry }: NavEntryProps): ReactElement => (
  <Link asChild href={{ pathname: '/[component]', params: { component: entry.slug } }}>
    <Pressable
      accessibilityLabel={entry.title}
      accessibilityRole="link"
      accessibilityState={{ selected: current }}
      className={cn(
        'min-h-9 justify-center rounded-lg px-3 hover:bg-bg-hover focus:outline-2 focus:-outline-offset-2 focus:outline-focus-ring active:bg-bg-hover',
        current && 'bg-accent-soft',
      )}
    >
      <Text tone={current ? 'accent' : 'fg'} variant={current ? 'body-strong' : 'body-sm'}>
        {entry.title}
      </Text>
    </Pressable>
  </Link>
)
