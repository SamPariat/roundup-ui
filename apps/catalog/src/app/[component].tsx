import type { ReactElement } from 'react'

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { createElement, useCallback } from 'react'
import { ScrollView, View } from 'react-native'

import { PageHeader, Screen, TopAppBar } from '@roundup/ui'

import { Frame } from '../components/Frame.tsx'
import { NotFound } from '../components/NotFound.tsx'
import { Toolbar } from '../components/Toolbar.tsx'
import { useWide } from '../hooks/useWide.ts'
import { findEntry, REGISTRY } from '../registry.ts'

/**
 * The slugs the static web export renders a page for: one per registry entry.
 * @returns The route parameters of every page.
 */
export function generateStaticParams(): Record<string, string>[] {
  return REGISTRY.map(({ slug }) => ({ component: slug }))
}

/**
 * One component's page: the toolbar, then its demo inside the width frame. From 1024 wide the
 * list beside the page does the navigating and a PageHeader names the page; below that a TopAppBar
 * with a back button does. An unknown slug shows the not-found page.
 * @returns The page for the slug in the URL.
 */
export default function ComponentScreen(): ReactElement {
  const { component } = useLocalSearchParams<'/[component]'>()
  const router = useRouter()
  const wide = useWide()
  const entry = findEntry(component)

  const back = useCallback((): void => {
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }, [router])

  if (entry === undefined) return <NotFound />

  const { summary, title } = entry

  return (
    <>
      <Stack.Screen options={{ title: `${title} · Roundup Catalog` }} />
      <Screen header={wide ? undefined : <TopAppBar onBack={back} title={title} />}>
        <ScrollView contentContainerClassName="mx-auto w-full max-w-content gap-6 p-4 pb-12 md:p-8">
          {wide ? <PageHeader subtitle={summary} title={title} /> : null}
          <Toolbar />
          <Frame>
            <View className="gap-6">{createElement(entry.Demo)}</View>
          </Frame>
        </ScrollView>
      </Screen>
    </>
  )
}
