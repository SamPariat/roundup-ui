import type { ReactElement } from 'react'

import { useOfflineNotice } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Notifier } from '@roundup/ui'

/**
 * Tells people when the device has no internet, and when it is back, over every screen.
 * @returns The notifier, showing the current connection notice if there is one.
 */
export const OfflineNotice = (): ReactElement => {
  const { t } = useT()
  const notice = useOfflineNotice()

  return (
    <Notifier
      notice={notice === undefined ? undefined : { ...notice, message: t(notice.message) }}
    />
  )
}
