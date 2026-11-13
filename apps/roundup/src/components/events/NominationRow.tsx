import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { IEventNomination } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Button, Icon, ListRow } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'

/** Props for NominationRow. */
export interface INominationRowProps {
  /** The suggested place the row shows. */
  nomination: IEventNomination
  /** True while this suggestion is being taken back. */
  removing: boolean
  /** Called with the suggestion when the person takes it back. */
  onRemove: (nomination: IEventNomination) => Promise<boolean>
}

/**
 * One suggested place of an event: its name and who suggested it, with its rating and price. When
 * the person may take the suggestion back, a Remove button sits at the end, which becomes
 * Removing… while the request runs.
 * @returns The list row.
 */
export const NominationRow = ({
  nomination,
  onRemove,
  removing,
}: INominationRowProps): ReactElement => {
  const { t } = useT()

  const handleRemove = useCallback(async (): Promise<void> => {
    await onRemove(nomination)
  }, [nomination, onRemove])

  return (
    <ListRow
      leading={<Icon decorative name="pin" />}
      subtitle={EventText.nominationLine(t, nomination)}
      title={nomination.name}
      trailing={
        nomination.canRemove ? (
          <Button
            icon="close"
            label={t('screens.event.remove', { name: nomination.name })}
            onPress={handleRemove}
            size="sm"
            variant="ghost"
          />
        ) : null
      }
      {...(removing ? { working: t('screens.event.removing') } : {})}
    />
  )
}
