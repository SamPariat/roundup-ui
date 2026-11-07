import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'
import { View } from 'react-native'

import type { INotice } from '@roundup/ui'

import { Button, Notifier } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/** The notice the offline specimens show. */
const OFFLINE: INotice = {
  id: 'offline',
  message: "You're offline. We'll reconnect when you're back.",
  tone: 'error',
}

/** The notice shown when the connection returns. */
const BACK_ONLINE: INotice = { id: 'back-online', message: 'Back online', tone: 'success' }

/** Props for Stage. */
interface IStageProps {
  /** The notice to float at the top of the stage. */
  notice?: INotice | undefined
}

/**
 * A screen-sized box, so the notifier floats at the top of it instead of the page.
 * @returns The box with the notifier in it.
 */
const Stage = ({ notice }: IStageProps): ReactElement => (
  <View className="relative h-32 overflow-hidden rounded-lg bg-bg-sunken">
    <Notifier notice={notice} />
  </View>
)

/**
 * Notifier with each tone, the two offline notices, and a button that toggles between them.
 * @returns The specimens.
 */
export const NotifierDemo = (): ReactElement => {
  const [offline, setOffline] = useState(false)

  const handleToggle = useCallback((): void => {
    setOffline((current) => !current)
  }, [])

  return (
    <>
      <Specimen title="tone=info">
        <Stage notice={{ id: 'info', message: 'Invite link copied.', tone: 'info' }} />
      </Specimen>
      <Specimen title="tone=success">
        <Stage notice={{ id: 'success', message: 'Squad created.', tone: 'success' }} />
      </Specimen>
      <Specimen title="tone=error">
        <Stage notice={{ id: 'error', message: 'Could not send the code.', tone: 'error' }} />
      </Specimen>
      <Specimen note="What a person sees with no connection." title="Offline">
        <Stage notice={OFFLINE} />
      </Specimen>
      <Specimen note="Shown for about two seconds when the connection returns." title="Back online">
        <Stage notice={BACK_ONLINE} />
      </Specimen>
      <Specimen note="Slides in and out, or just appears under Reduce Motion." title="Interactive">
        <Stage notice={offline ? OFFLINE : undefined} />
        <Button onPress={handleToggle} size="sm" variant="secondary">
          Toggle offline
        </Button>
      </Specimen>
    </>
  )
}
