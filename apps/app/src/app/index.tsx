import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'

import { Welcome } from '@roundup/ui'

// The signed-out "/". Sign-in arrives with the auth work; for now Start opens the shell.
export default function WelcomeScreen(): ReactElement {
  const router = useRouter()

  return (
    <Welcome
      onStart={() => {
        router.push('/squads')
      }}
    />
  )
}
