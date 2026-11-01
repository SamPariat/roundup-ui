import type { ReactElement } from 'react'

import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

import { Avatar, Button, Modal, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** Which modal is open, if any. */
type Open = 'busy' | 'confirm' | 'content' | 'locked' | null

/**
 * Modal as content, as a confirmation, busy while a request runs, and without a close button. Each
 * is opened from a button, because a modal covers the screen. The sheet below 768 wide is a bottom
 * sheet, from there up a centred card.
 * @returns The specimens.
 */
export const ModalDemo = (): ReactElement => {
  const [open, setOpen] = useState<Open>(null)
  const [saving, setSaving] = useState(false)

  const showContent = useCallback(() => {
    setOpen('content')
  }, [])

  const showConfirm = useCallback(() => {
    setOpen('confirm')
  }, [])

  const showBusy = useCallback(() => {
    setSaving(false)
    setOpen('busy')
  }, [])

  const showLocked = useCallback(() => {
    setOpen('locked')
  }, [])

  const close = useCallback(() => {
    setOpen(null)
  }, [])

  const save = useCallback(() => {
    setSaving(true)
  }, [])

  // The busy modal closes by itself when the pretend request ends.
  useEffect(() => {
    if (!saving) return

    const timer = setTimeout(() => {
      setSaving(false)
      setOpen(null)
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [saving])

  return (
    <>
      <Specimen title="tone=content (default) · leading · subtitle · closable=true">
        <Button onPress={showContent} variant="secondary">
          Open a content modal
        </Button>
      </Specimen>
      <Specimen title="tone=confirm · body">
        <Button onPress={showConfirm} variant="secondary">
          Open a confirmation
        </Button>
      </Specimen>
      <Specimen
        note="Other actions go inert, the body dims and the close button hides until it ends."
        title="busy=true"
      >
        <Button onPress={showBusy} variant="secondary">
          Open a modal that saves
        </Button>
      </Specimen>
      <Specimen title="closable=false">
        <Button onPress={showLocked} variant="secondary">
          Open a modal with no close button
        </Button>
      </Specimen>
      <Modal
        actions={[
          <Button key="done" onPress={close}>
            Done
          </Button>,
        ]}
        leading={<Avatar name="Friday Footy" size={40} />}
        onClose={close}
        subtitle="12 members"
        title="Friday Footy"
        visible={open === 'content'}
      >
        <View className="gap-2">
          <Text tone="muted" variant="body-sm">
            Content goes in a scroll view under the header.
          </Text>
        </View>
      </Modal>
      <Modal
        actions={[
          <Button key="leave" onPress={close} variant="destructive">
            Leave squad
          </Button>,
          <Button key="stay" onPress={close} variant="secondary">
            Stay
          </Button>,
        ]}
        body="You will stop seeing its plans and bills."
        onClose={close}
        title="Leave Friday Footy?"
        tone="confirm"
        visible={open === 'confirm'}
      />
      <Modal
        actions={[
          <Button key="save" loading={saving} loadingLabel="Saving…" onPress={save}>
            Save changes
          </Button>,
          <Button key="cancel" onPress={close} variant="secondary">
            Cancel
          </Button>,
        ]}
        body="Press Save changes: the modal goes busy for two seconds, then closes."
        busy={saving}
        onClose={close}
        title="Rename squad"
        visible={open === 'busy'}
      />
      <Modal
        actions={[
          <Button key="ok" onPress={close}>
            Got it
          </Button>,
        ]}
        body="Only the action below can close this one."
        closable={false}
        onClose={close}
        title="Heads up"
        visible={open === 'locked'}
      />
    </>
  )
}
