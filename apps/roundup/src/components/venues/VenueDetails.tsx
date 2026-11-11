import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'
import { Linking } from 'react-native'

import type { IVenueInfo } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Icon, List, ListRow } from '@roundup/ui'

/** Props for VenueDetails. */
export interface IVenueDetailsProps {
  /** The venue whose facts the list shows. */
  venue: IVenueInfo
}

/** What separates the squads' names in the Saved in row. */
const NAME_SEPARATOR = ', '

/** Everything but digits and the plus sign, which a tel: link cannot carry. */
const NOT_DIALABLE = /[^\d+]/g

/**
 * The facts of a venue as a list: address, hours (today's, opening to the whole week), phone and
 * website (each opens the dialer or the browser) and the squads it is saved in. A row is left out
 * when the venue has nothing for it.
 * @returns The list of rows.
 */
export const VenueDetails = ({ venue }: IVenueDetailsProps): ReactElement => {
  const { t } = useT()
  const [hoursOpen, setHoursOpen] = useState<boolean>(false)
  const { phone, website } = venue

  const handleToggleHours = useCallback((): void => {
    setHoursOpen((open) => !open)
  }, [])

  const handleCall = useCallback((): void => {
    if (phone !== undefined) void Linking.openURL(`tel:${phone.replaceAll(NOT_DIALABLE, '')}`)
  }, [phone])

  const handleOpenWebsite = useCallback((): void => {
    if (website !== undefined) void Linking.openURL(website)
  }, [website])

  const hoursSummary =
    venue.hoursToday === undefined
      ? {}
      : { subtitle: t('screens.venue.hoursToday', { hours: venue.hoursToday }) }

  const savedNames = venue.savedIn
    .filter((squad) => squad.saved)
    .map((squad) => squad.squadName)
    .join(NAME_SEPARATOR)

  return (
    <List>
      {venue.address === undefined ? null : (
        <ListRow
          leading={<Icon decorative name="pin" />}
          subtitle={venue.address}
          title={t('screens.venue.address')}
        />
      )}
      {venue.hours.length === 0 ? null : (
        <ListRow
          chevron
          expanded={hoursOpen}
          leading={<Icon decorative name="clock" />}
          onPress={handleToggleHours}
          title={t('screens.venue.hours')}
          {...hoursSummary}
        />
      )}
      {hoursOpen ? venue.hours.map((line) => <ListRow key={line} title={line} />) : null}
      {phone === undefined ? null : (
        <ListRow
          leading={<Icon decorative name="phone" />}
          onPress={handleCall}
          subtitle={phone}
          title={t('screens.venue.phone')}
        />
      )}
      {website === undefined ? null : (
        <ListRow
          leading={<Icon decorative name="explore" />}
          onPress={handleOpenWebsite}
          subtitle={website}
          title={t('screens.venue.website')}
        />
      )}
      <ListRow
        leading={<Icon decorative name="bookmark-filled" />}
        subtitle={savedNames === '' ? t('screens.venue.savedInNone') : savedNames}
        title={t('screens.venue.savedIn')}
      />
    </List>
  )
}
