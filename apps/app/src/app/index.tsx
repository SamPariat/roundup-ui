import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { Welcome } from '@roundup/ui'

// The signed-out "/". Sign-in arrives with the auth work; for now Start opens the shell.
export default function WelcomeScreen(): ReactElement {
  const router = useRouter()

  const start = useCallback(() => {
    router.push('/squads')
  }, [router])

  return <Welcome onStart={start} />
}
