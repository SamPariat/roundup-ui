import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SafeArea, Welcome } from '@roundup/ui'

const EDGES = ['top', 'right', 'bottom', 'left'] as const

/**
 * The signed-out "/". Sign-in arrives with the auth work; for now Start opens the shell. It has no
 * shell around it, so it keeps clear of the status bar, notch and home indicator itself.
 * @returns The Welcome page wired to open the shell.
 */
export default function WelcomeScreen(): ReactElement {
  const router = useRouter()

  const start = useCallback(() => {
    router.push('/squads')
  }, [router])

  return (
    <SafeArea className="flex-1 bg-bg" edges={EDGES}>
      <Welcome onStart={start} />
    </SafeArea>
  )
}
