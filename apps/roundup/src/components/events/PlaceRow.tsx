import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { TIconName } from '@roundup/ui'

import { useT } from '@roundup/i18n'
import { Badge, Button, Icon, ListRow } from '@roundup/ui'

/** Props for PlaceRow. */
export interface IPlaceRowProps {
  /** The place's Google ID. */
  id: string
  /** The place's name. */
  name: string
  /** The line under the name; left out when nothing is known of it. */
  subtitle?: string | undefined
  /** The icon in front of the name. */
  icon: TIconName
  /** True once the place is suggested for the event: a Suggested badge replaces the button. */
  suggested: boolean
  /** True while this place's suggestion is being sent: the button says Suggesting…. */
  suggesting: boolean
  /** True while any suggestion is being sent: the other buttons stay but cannot be pressed. */
  busy: boolean
  /** Called with the place's ID when its button is pressed. */
  onSuggest: (placeId: string) => Promise<boolean>
}

/**
 * One place of the Suggest a place sheet: its name and a line about it, with a Suggest button at
 * the end that says Suggesting… while the request runs, and a Suggested badge once it is done.
 * @returns The list row.
 */
export const PlaceRow = ({
  busy,
  icon,
  id,
  name,
  onSuggest,
  subtitle,
  suggested,
  suggesting,
}: IPlaceRowProps): ReactElement => {
  const { t } = useT()

  const handleSuggest = useCallback(async (): Promise<void> => {
    await onSuggest(id)
  }, [id, onSuggest])

  const trailing = suggested ? (
    <Badge>{t('screens.event.suggest.done')}</Badge>
  ) : (
    <Button
      disabled={busy && !suggesting}
      label={t('screens.event.suggest.actionNamed', { name })}
      loading={suggesting}
      loadingLabel={t('screens.event.suggest.acting')}
      onPress={handleSuggest}
      size="sm"
      variant="secondary"
    >
      {t('screens.event.suggest.action')}
    </Button>
  )

  return (
    <ListRow
      leading={<Icon decorative name={icon} />}
      title={name}
      trailing={trailing}
      {...(subtitle === undefined ? {} : { subtitle })}
    />
  )
}
