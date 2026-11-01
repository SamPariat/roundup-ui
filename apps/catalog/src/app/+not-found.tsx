import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { NotFound } from '../components/NotFound.tsx'

/**
 * Expo Router's fallback for any URL that matches no route.
 * @returns The window title and the not-found page.
 */
export default function NotFoundScreen(): ReactElement {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found · Roundup Catalog' }} />
      <NotFound />
    </>
  )
}
