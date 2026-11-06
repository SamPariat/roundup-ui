import type { ReactElement } from 'react'

import { useCallback } from 'react'

import { useSquadMembersViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Modal } from '@roundup/ui'

import { useErrorText } from '../../hooks/useErrorText'
import { InlineError } from '../InlineError'

/** Props for LeaveSquadModal. */
export interface ILeaveSquadModalProps {
  /** The squad to leave. */
  squadId: string
  /** The squad's name, for the question. */
  name: string
  /** Called when the person closes the modal without leaving. */
  onClose: () => void
  /** Called once the person has left, to take them away from the squad's page. */
  onLeft: () => void
}

/**
 * The Leave squad confirmation. Leaving drops the squad's page from the query cache, so a screen
 * that renders again afterwards would fetch it, get a 404 and flash not-found. The request and its
 * busy state therefore live here rather than in the squad's screen, which never renders because of
 * them, and `onLeft` runs in the promise continuation of the request, before React gets to render
 * the modal's own state change. The person goes back only after the server says yes, so a refusal
 * such as "a squad needs an admin" stays on screen as an error.
 * @returns The confirmation with Leave squad and Cancel.
 */
export const LeaveSquadModal = ({
  name,
  onClose,
  onLeft,
  squadId,
}: ILeaveSquadModalProps): ReactElement => {
  const { t } = useT()
  const { busyUserId, error, leave, requestId } = useSquadMembersViewModel(squadId)
  const errorText = useErrorText(error, requestId)
  const busy = busyUserId !== undefined

  const confirm = useCallback((): void => {
    void leave().then((left) => {
      if (left) onLeft()
    })
  }, [leave, onLeft])

  const actions = [
    <Button
      key="leave"
      loading={busy}
      loadingLabel={t('screens.squad.leave.submitting')}
      onPress={confirm}
      variant="destructive"
    >
      {t('screens.squad.leave.submit')}
    </Button>,
    <Button key="cancel" onPress={onClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  return (
    <Modal
      actions={actions}
      body={t('screens.squad.leave.body')}
      busy={busy}
      onClose={onClose}
      title={t('screens.squad.leave.title', { name })}
      tone="confirm"
    >
      <InlineError message={errorText} />
    </Modal>
  )
}
