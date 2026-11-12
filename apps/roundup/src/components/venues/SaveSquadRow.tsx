import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { ISavedIn } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Avatar, Button, Icon, ListRow } from '@roundup/ui'

/** Props for SaveSquadRow. */
export interface ISaveSquadRowProps {
  /** The squad the row shows and whether the venue is saved in it. */
  squad: ISavedIn
  /** True while this row's request runs: it shows Saving… in place of the tick. */
  saving: boolean
  /** True while any row's request runs: the row stays but cannot be pressed meanwhile. */
  busy: boolean
  /** Called with the squad when the row is pressed. */
  onToggle: (squad: ISavedIn) => Promise<boolean>
}

/**
 * One squad of the Save to squad sheet: its avatar and name, saying Saved with a tick or Tap to
 * save. While its request runs the row shows Saving… instead. Pressing it saves the venue in the
 * squad, or takes it out again.
 * @returns The list row, a button that is selected when ticked.
 */
export const SaveSquadRow = ({
  busy,
  onToggle,
  saving,
  squad,
}: ISaveSquadRowProps): ReactElement => {
  const { t } = useT()

  const handlePress = useCallback(async (): Promise<void> => {
    await onToggle(squad)
  }, [onToggle, squad])

  const tick = squad.saved ? <Icon label={t('saveVenue.saved')} name="check" tone="accent" /> : null

  const trailing = saving ? (
    <Button loading loadingLabel={t('saveVenue.saving')} size="sm" variant="ghost">
      {t('saveVenue.saving')}
    </Button>
  ) : (
    tick
  )

  const hint = squad.saved ? t('saveVenue.saved') : t('saveVenue.tapToSave')

  return (
    <ListRow
      busy={busy}
      leading={<Avatar id={squad.squadId} name={squad.squadName} size={40} />}
      onPress={handlePress}
      selected={squad.saved}
      title={squad.squadName}
      trailing={trailing}
      {...(saving ? {} : { subtitle: hint })}
    />
  )
}
