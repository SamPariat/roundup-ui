import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { useCreateSquadViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Modal, TextField } from '@roundup/ui'

import { useErrorText } from '@/hooks/useErrorText'
import { Paths } from '@/navigation/paths'

/** Props for CreateSquadModal. */
export interface ICreateSquadModalProps {
  /** Called when the person closes the modal, or once the squad is made. */
  onClose: () => void
}

/**
 * The New squad modal: one name field. Making the squad closes the modal and opens the new squad,
 * so adding people is the next thing they see. Mount it only while it is open, so each opening
 * starts with an empty field.
 * @returns The modal with the name field and its two buttons.
 */
export const CreateSquadModal = ({ onClose }: ICreateSquadModalProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()
  const { busy, error, name, requestId, setName, submit } = useCreateSquadViewModel()
  const errorText = useErrorText(error, requestId)

  const handleCreate = useCallback(async (): Promise<void> => {
    const id = await submit()

    if (id === undefined) return

    onClose()
    router.push(Paths.squad(id, { title: name.trim() }))
  }, [name, onClose, router, submit])

  const actions = [
    <Button
      key="create"
      loading={busy}
      loadingLabel={t('screens.squads.create.submitting')}
      onPress={handleCreate}
    >
      {t('screens.squads.create.submit')}
    </Button>,
    <Button key="cancel" onPress={onClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  return (
    <Modal
      actions={actions}
      busy={busy}
      onClose={onClose}
      subtitle={t('screens.squads.create.subtitle')}
      title={t('screens.squads.create.title')}
    >
      <TextField
        helper={t('screens.squads.create.nameHelper')}
        label={t('screens.squads.create.nameLabel')}
        onChangeText={setName}
        value={name}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
    </Modal>
  )
}
