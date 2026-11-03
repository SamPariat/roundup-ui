import type { ReactElement } from 'react'

import { Redirect, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView } from 'react-native'

import { Screen, Welcome } from '@roundup/ui'

import { useRouteGate } from '../hooks/useRouteGate.ts'
import { paths } from '../navigation/paths.ts'

/**
 * The "/" of the app. A signed-out visitor sees Welcome, and Start opens the sign-in screens; a
 * signed-in person is sent to the app, since "/" is where every launch starts. It has no shell
 * around it, so Screen keeps it clear of the status bar, notch and home indicator.
 * @returns The Welcome page wired to open sign-in, or a redirect into the app.
 */
export default function WelcomeScreen(): ReactElement {
  const router = useRouter()
  const gate = useRouteGate()

  const start = useCallback(() => {
    router.push(paths.signIn.phone())
  }, [router])

  if (gate === 'signedIn') return <Redirect href={paths.tabs.squads()} />

  if (gate === 'needsName') return <Redirect href={paths.signIn.name()} />

  // On a phone too short for the page (an iPhone SE, or with large text) it scrolls; on a taller
  // one the content container grows, so Welcome fills the screen and centres its middle section.
  return (
    <Screen>
      <ScrollView contentContainerClassName="grow">
        <Welcome onStart={start} />
      </ScrollView>
    </Screen>
  )
}
