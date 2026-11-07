import type { ReactElement } from 'react'

import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

import { Avatar, Button, Modal, Text } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/** Which modal is open, if any. */
type TOpen = 'busy' | 'confirm' | 'content' | null

/**
 * Modal as content, as a confirmation, busy while a request runs, and without a close button. Each
 * is opened from a button, because a modal covers the screen. The sheet below 768 wide is a bottom
 * sheet, from there up a centerd card.
 * @returns The specimens.
 */
export const ModalDemo = (): ReactElement => {
  const [open, setOpen] = useState<TOpen>(null)
  const [saving, setSaving] = useState<boolean>(false)

  const handleShowContent = useCallback((): void => {
    setOpen('content')
  }, [])

  const handleShowConfirm = useCallback((): void => {
    setOpen('confirm')
  }, [])

  const handleShowBusy = useCallback((): void => {
    setSaving(false)
    setOpen('busy')
  }, [])

  const handleClose = useCallback((): void => {
    setOpen(null)
  }, [])

  const handleSave = useCallback((): void => {
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
      <Specimen title="tone=content (default) · leading · subtitle">
        <Button onPress={handleShowContent} variant="secondary">
          Open a content modal
        </Button>
      </Specimen>
      <Specimen title="tone=confirm · body">
        <Button onPress={handleShowConfirm} variant="secondary">
          Open a confirmation
        </Button>
      </Specimen>
      <Specimen
        note="Only the buttons look disabled; the title and body stay as they are, and nothing closes it until it ends."
        title="busy=true"
      >
        <Button onPress={handleShowBusy} variant="secondary">
          Open a modal that saves
        </Button>
      </Specimen>
      <Modal
        actions={[
          <Button key="done" onPress={handleClose}>
            Done
          </Button>,
        ]}
        leading={<Avatar name="Friday Footy" size={40} />}
        onClose={handleClose}
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
          <Button key="leave" onPress={handleClose} variant="destructive">
            Leave squad
          </Button>,
          <Button key="stay" onPress={handleClose} variant="secondary">
            Stay
          </Button>,
        ]}
        body="You will stop seeing its plans and bills."
        onClose={handleClose}
        title="Leave Friday Footy?"
        tone="confirm"
        visible={open === 'confirm'}
      />
      <Modal
        actions={[
          <Button key="save" loading={saving} loadingLabel="Saving…" onPress={handleSave}>
            Save changes
          </Button>,
          <Button key="cancel" onPress={handleClose} variant="secondary">
            Cancel
          </Button>,
        ]}
        body="Press Save changes: the modal goes busy for two seconds, then closes."
        busy={saving}
        onClose={handleClose}
        title="Rename squad"
        visible={open === 'busy'}
      />
    </>
  )
}
