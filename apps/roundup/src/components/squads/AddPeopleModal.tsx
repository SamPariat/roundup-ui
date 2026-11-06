import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { AddNumberModal } from './AddNumberModal'
import { ContactPickerModal } from './ContactPickerModal'

/** Props for AddPeopleModal. */
export interface IAddPeopleModalProps {
  /** The squad people are added to. */
  squadId: string
  /** The squad's name, shown under the title. */
  squadName: string
  /** Called when the person closes the modal, or once they have added someone. */
  onClose: () => void
}

/**
 * Add people on iOS and Android: the contacts picker, which gives way to the phone field when the
 * person does not allow contacts or asks to type a number. The web version of this file
 * (AddPeopleModal.web.tsx) takes the same props and shows the phone field only.
 * @returns The picker, or the phone number modal once the person chose to type.
 */
export const AddPeopleModal = ({
  onClose,
  squadId,
  squadName,
}: IAddPeopleModalProps): ReactElement => {
  const [typing, setTyping] = useState(false)

  const typeNumber = useCallback((): void => {
    setTyping(true)
  }, [])

  if (typing) return <AddNumberModal onClose={onClose} squadId={squadId} squadName={squadName} />

  return <ContactPickerModal onClose={onClose} onTypeNumber={typeNumber} squadId={squadId} />
}
