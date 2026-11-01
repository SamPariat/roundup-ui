import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { ScrollView } from 'react-native'

import { Screen, TopAppBar } from '@roundup/ui'

import { CatalogIndex } from '../components/CatalogIndex.tsx'
import { useWide } from '../hooks/useWide.ts'

/**
 * The component index. On a phone it is a screen of its own with a top bar; from 1024 wide the
 * root layout already lists the components beside the page, so it shows the same lists as a landing page.
 * @returns The grouped index.
 */
export default function IndexScreen(): ReactElement {
  const wide = useWide()

  return (
    <>
      <Stack.Screen options={{ title: 'Roundup Catalog' }} />
      <Screen header={wide ? undefined : <TopAppBar logo title="Components" />}>
        <ScrollView contentContainerClassName="mx-auto w-full max-w-content p-4 pb-12 md:p-8">
          <CatalogIndex />
        </ScrollView>
      </Screen>
    </>
  )
}
