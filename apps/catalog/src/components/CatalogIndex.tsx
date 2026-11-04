import type { ReactElement } from 'react'

import { View } from 'react-native'

import { List, Text } from '@roundup/ui'

import { GROUPS, Registry } from '../registry'
import { CatalogRow } from './CatalogRow'

/**
 * The component index: every group as a heading over a list of its components.
 * @returns The grouped lists.
 */
export const CatalogIndex = (): ReactElement => (
  <View className="gap-8">
    <View className="gap-2">
      <Text heading={1} variant="title">
        Roundup Catalog
      </Text>
      <Text tone="muted">
        Every component of the design system in every variant and state. Switch between Mocha and
        Latte from any page.
      </Text>
    </View>
    {GROUPS.map((group) => (
      <View className="gap-3" key={group}>
        <Text heading={2} variant="heading">
          {group}
        </Text>
        <List>
          {Registry.entriesIn(group).map((entry) => (
            <CatalogRow entry={entry} key={entry.slug} />
          ))}
        </List>
      </View>
    ))}
  </View>
)
