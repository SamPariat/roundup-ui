import type { ReactElement } from 'react'

import { useCallback } from 'react'

import { useAddMemberViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Modal, PhoneInput } from '@roundup/ui'

import { useErrorText } from '@/hooks/useErrorText'

/** Props for AddNumberModal. */
export interface IAddNumberModalProps {
  /** The squad people are added to. */
  squadId: string
  /** The squad's name, shown under the title. */
  squadName: string
  /** Called when the person closes the modal, or once the person is added. */
  onClose: () => void
}

/**
 * The Add by phone number modal: the phone field and Add to squad. It is the whole Add people
 * dialog on web, which has no contacts to pick from, and the fallback on a phone when the person
 * does not allow contacts.
 * @returns The modal with the phone field and its two buttons.
 */
export const AddNumberModal = ({
  onClose,
  squadId,
  squadName,
}: IAddNumberModalProps): ReactElement => {
  const { t } = useT()
  const { busy, error, phone, requestId, setPhone, submit } = useAddMemberViewModel(squadId)
  const errorText = useErrorText(error, requestId)

  const handleAdd = useCallback(async (): Promise<void> => {
    if (await submit()) onClose()
  }, [onClose, submit])

  const actions = [
    <Button
      key="add"
      loading={busy}
      loadingLabel={t('addPeople.number.submitting')}
      onPress={handleAdd}
    >
      {t('addPeople.number.submit')}
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
      subtitle={squadName}
      title={t('addPeople.number.title')}
    >
      <PhoneInput
        helper={t('addPeople.number.helper')}
        label={t('addPeople.number.label')}
        onChangeText={setPhone}
        value={phone}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
    </Modal>
  )
}
