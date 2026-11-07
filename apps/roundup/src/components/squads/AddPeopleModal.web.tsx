import type { ReactElement } from 'react'

import type { IAddPeopleModalProps } from './AddPeopleModal'

import { AddNumberModal } from './AddNumberModal'

/**
 * Add people on web. A browser has no contacts to read, so this is only the phone field. The
 * native version of this file (AddPeopleModal.tsx) takes the same props.
 * @returns The Add by phone number modal.
 */
export const AddPeopleModal = ({
  onClose,
  squadId,
  squadName,
}: IAddPeopleModalProps): ReactElement => (
  <AddNumberModal onClose={onClose} squadId={squadId} squadName={squadName} />
)
