import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { IContactMatch } from '@roundup/core'

import { useDeps } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Icon, ListRow } from '@roundup/ui'

/** Props for PersonRow. */
export interface IPersonRowProps {
  /** The contact the row shows. */
  person: IContactMatch
  /** Whether the person is ticked. */
  picked: boolean
  /** Called with the contact's user ID when the row is pressed. */
  onToggle: (userId: string) => void
}

/**
 * A contact on Roundup in the picker: avatar, name and number, with a tick when picked. It is a
 * button that ticks and unticks, and says whether it is selected.
 * @returns The list row.
 */
export const PersonRow = ({ onToggle, person, picked }: IPersonRowProps): ReactElement => {
  const { t } = useT()
  const { helpers } = useDeps()

  const handleToggle = useCallback((): void => {
    onToggle(person.id)
  }, [onToggle, person.id])

  return (
    <ListRow
      leading={
        <Avatar
          id={person.id}
          name={person.name}
          size={40}
          {...(person.src === undefined ? {} : { src: person.src })}
        />
      }
      onPress={handleToggle}
      selected={picked}
      subtitle={helpers.phone.format(person.phone)}
      title={person.name}
      trailing={picked ? <Icon label={t('addPeople.picked')} name="check" tone="accent" /> : null}
    />
  )
}
