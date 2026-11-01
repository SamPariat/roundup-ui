import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Button, Text, Toast } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * Toast in each tone, with and without an action, and one whose action really undoes something.
 * @returns The specimens.
 */
export const ToastDemo = (): ReactElement => {
  const [removed, setRemoved] = useState(true)

  const undo = useCallback(() => {
    setRemoved(false)
  }, [])

  const reset = useCallback(() => {
    setRemoved(true)
  }, [])

  return (
    <>
      <Specimen title="tone=info (default)">
        <Toast>Invite link copied.</Toast>
      </Specimen>
      <Specimen title="tone=success">
        <Toast tone="success">Squad created.</Toast>
      </Specimen>
      <Specimen note="Errors interrupt screen readers; the other tones wait." title="tone=error">
        <Toast tone="error">Could not send the code. Try again.</Toast>
      </Specimen>
      <Specimen title="action=Undo">
        <Toast action="Undo" tone="success">
          Aarav removed from Friday Footy.
        </Toast>
      </Specimen>
      <Specimen title="Long message">
        <Toast action="Retry" tone="error">
          We could not reach the server, so your changes to the squad were not saved. Check your
          connection and try again.
        </Toast>
      </Specimen>
      <Specimen note="Press Undo." title="Interactive">
        {removed ? (
          <Toast action="Undo" onAction={undo} tone="success">
            Aarav removed from Friday Footy.
          </Toast>
        ) : (
          <Text tone="muted">Aarav is back in the squad.</Text>
        )}
        <Button onPress={reset} size="sm" variant="secondary">
          Remove again
        </Button>
      </Specimen>
    </>
  )
}
