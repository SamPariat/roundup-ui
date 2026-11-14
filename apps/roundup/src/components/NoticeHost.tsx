import type { ReactElement, ReactNode } from 'react'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { INotice } from '@roundup/ui'

import { useOfflineNotice } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Notifier } from '@roundup/ui'

import { NotifyContext } from '@/hooks/useNotify'

/** Props for NoticeHost. */
export interface INoticeHostProps {
  /** The app, whose screens can show notices through useNotify. */
  children: ReactNode
}

/** How long a screen's notice stays up, in milliseconds. */
const SHOW_MS = 4000

/**
 * The app's one notice over every screen. The connection comes first: while the device is offline,
 * or just back, that is what shows. Otherwise it shows the last notice a screen sent through
 * useNotify, for a few seconds.
 * @returns The app with the notifier over it.
 */
export const NoticeHost = ({ children }: INoticeHostProps): ReactElement => {
  const { t } = useT()

  const [notice, setNotice] = useState<INotice | undefined>()

  const offline = useOfflineNotice()

  const shown = useMemo(
    (): INotice | undefined =>
      offline === undefined ? notice : { ...offline, message: t(offline.message) },
    [notice, offline, t],
  )

  const handleClear = useCallback((): void => {
    setNotice(undefined)
  }, [])

  // A screen's notice clears itself; a newer one starts the time again.
  const handleShow = useCallback((): (() => void) | undefined => {
    if (notice === undefined) return undefined

    const timer = setTimeout(handleClear, SHOW_MS)

    return (): void => {
      clearTimeout(timer)
    }
  }, [handleClear, notice])

  useEffect(handleShow, [handleShow])

  return (
    <NotifyContext value={setNotice}>
      {children}
      <Notifier notice={shown} />
    </NotifyContext>
  )
}
