import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView } from 'react-native'

import { Screen, Welcome } from '@roundup/ui'

/**
 * The signed-out "/". Sign-in arrives with the auth work; for now Start opens the shell. It has no
 * shell around it, so Screen keeps it clear of the status bar, notch and home indicator.
 * @returns The Welcome page wired to open the shell.
 */
export default function WelcomeScreen(): ReactElement {
  const router = useRouter()

  const start = useCallback(() => {
    router.push('/squads')
  }, [router])

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
