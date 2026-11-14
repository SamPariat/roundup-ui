import type { ReactElement } from 'react'

import { useMemo } from 'react'

import { useSaveVenueViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, List, Modal, Skeleton, Text, Toast } from '@roundup/ui'

import { SaveSquadRow } from './SaveSquadRow'
import { useErrorText } from '@/hooks/useErrorText'

/** Props for SaveVenueModal. */
export interface ISaveVenueModalProps {
  /** The venue being saved. */
  placeId: string
  /** The venue's name, for the subtitle. */
  name: string
  /** Called when the person is done. */
  onClose: () => void
}

/**
 * The Save to squad modal: every squad the person is in, with a tick on those that have the venue.
 * Pressing a squad saves or removes the venue straight away, so Done only closes the modal. Mount
 * it only while it is open.
 * @returns The modal with the squads and Done.
 */
export const SaveVenueModal = ({ name, onClose, placeId }: ISaveVenueModalProps): ReactElement => {
  const { t } = useT()

  const { busySquadId, error, loading, requestId, squads, toggle } = useSaveVenueViewModel(placeId)
  const errorText = useErrorText(error, requestId)
  const busy = busySquadId !== undefined

  const actions = useMemo(
    (): ReactElement[] => [
      <Button key="done" onPress={onClose}>
        {t('saveVenue.done')}
      </Button>,
    ],
    [onClose, t],
  )

  return (
    <Modal
      actions={actions}
      busy={busy}
      onClose={onClose}
      {...(loading ? {} : { subtitle: t('saveVenue.subtitle', { name }) })}
      title={t('saveVenue.title')}
    >
      {loading ? <Skeleton count={3} variant="item" /> : null}
      {!loading && squads.length === 0 ? (
        <Text tone="muted" variant="body-sm">
          {t('saveVenue.noSquads')}
        </Text>
      ) : null}
      {squads.length > 0 ? (
        <List>
          {squads.map((squad) => (
            <SaveSquadRow
              busy={busy}
              key={squad.squadId}
              onToggle={toggle}
              saving={busySquadId === squad.squadId}
              squad={squad}
            />
          ))}
        </List>
      ) : null}
      {errorText === undefined ? null : <Toast tone="error">{errorText}</Toast>}
    </Modal>
  )
}
