import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useRoleColor } from '@roundup/ui'

import { useRouteGate } from '@/hooks/useRouteGate'

/**
 * The root stack. The guards do the redirects, so no screen calls router.replace for auth: signed
 * out can reach the sign-in screens, a signed-in person with no name can reach only the name step,
 * and one with a name can reach the app. Welcome is the exception, since
 * "/" is where every launch starts. While the saved session is being checked nothing renders, and
 * the splash screen stays up.
 * @returns The guarded stack, or null while the session loads.
 */
export const AuthStack = (): null | ReactElement => {
  const gate = useRouteGate()
  const background = useRoleColor('bg')

  if (gate === 'loading') return null

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: background }, headerShown: false }}>
      {/* Welcome is "/", which every launch starts at, so it is always routable: it sends a signed-in person on to the app itself. */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={gate === 'signedOut'}>
        <Stack.Screen name="sign-in/index" />
        <Stack.Screen name="sign-in/code" />
      </Stack.Protected>
      <Stack.Protected guard={gate === 'needsName'}>
        <Stack.Screen name="sign-in/name" />
      </Stack.Protected>
      <Stack.Protected guard={gate === 'signedIn'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  )
}
