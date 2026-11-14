import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'

import { useRenameSquadViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Modal, TextField } from '@roundup/ui'

import { useErrorText } from '@/hooks/useErrorText'

/** Props for RenameSquadModal. */
export interface IRenameSquadModalProps {
  /** The squad to rename. */
  squadId: string
  /** The squad's name now, which the field starts with. */
  currentName: string
  /** Called when the person closes the modal, or once the name is saved. */
  onClose: () => void
}

/**
 * The Rename squad modal. Only admins reach it: the squad page offers it when the server says the
 * person may edit the squad. Mount it only while it is open, so the field starts with the current
 * name each time.
 * @returns The modal with the name field and its two buttons.
 */
export const RenameSquadModal = ({
  currentName,
  onClose,
  squadId,
}: IRenameSquadModalProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const { busy, error, name, requestId, setName, submit } = useRenameSquadViewModel(
    squadId,
    currentName,
  )

  const errorText = useErrorText(error, requestId)

  // The squad page's title rides in its title query parameter, so a saved name updates it there.
  const handleSave = useCallback(async (): Promise<void> => {
    if (!(await submit())) return

    router.setParams({ title: name.trim() })
    onClose()
  }, [name, onClose, router, submit])

  const actions = useMemo(
    (): ReactElement[] => [
      <Button
        key="save"
        loading={busy}
        loadingLabel={t('screens.squad.rename.submitting')}
        onPress={handleSave}
      >
        {t('screens.squad.rename.submit')}
      </Button>,
      <Button key="cancel" onPress={onClose} variant="ghost">
        {t('common.cancel')}
      </Button>,
    ],
    [busy, handleSave, onClose, t],
  )

  return (
    <Modal
      actions={actions}
      busy={busy}
      onClose={onClose}
      subtitle={t('screens.squad.rename.subtitle')}
      title={t('screens.squad.rename.title')}
    >
      <TextField
        helper={t('screens.squad.rename.nameHelper')}
        label={t('screens.squad.rename.nameLabel')}
        onChangeText={setName}
        value={name}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
    </Modal>
  )
}
