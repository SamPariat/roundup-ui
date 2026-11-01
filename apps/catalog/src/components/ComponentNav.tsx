import type { ReactElement } from 'react'

import { Link } from 'expo-router'
import { Pressable, ScrollView, View } from 'react-native'

import { Logo, SafeArea, Text } from '@roundup/ui'

import { entriesIn, GROUPS } from '../registry.ts'
import { NavEntry } from './NavEntry.tsx'

/** Props for ComponentNav. */
export interface ComponentNavProps {
  /** The slug of the page on show, if any. */
  current?: string | undefined
}

/**
 * The list of components that sits beside the page from 1024 wide, in the manner of SideNav: the
 * logo on top, then every group with its components.
 * @returns The side list.
 */
export const ComponentNav = ({ current }: ComponentNavProps): ReactElement => (
  <SafeArea
    accessibilityLabel="Components"
    className="w-62 border-r border-border bg-bg-sunken"
    edges={['top', 'bottom', 'left']}
    role="navigation"
  >
    <ScrollView contentContainerClassName="gap-6 p-4">
      <Link asChild href="/">
        <Pressable accessibilityLabel="Roundup Catalog, all components" accessibilityRole="link">
          <Logo size="md" />
        </Pressable>
      </Link>
      {GROUPS.map((group) => (
        <View className="gap-1" key={group}>
          <Text className="px-3" heading={2} tone="subtle" variant="caption">
            {group}
          </Text>
          {entriesIn(group).map((entry) => (
            <NavEntry current={entry.slug === current} entry={entry} key={entry.slug} />
          ))}
        </View>
      ))}
    </ScrollView>
  </SafeArea>
)
