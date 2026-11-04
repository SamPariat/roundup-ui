import { useEffect, useState } from 'react'

import type { en } from '@roundup/i18n'

import type { TPhase } from '../helpers/notice'
import type { INetworkState } from './types'

import { useDeps } from '../di/useDeps'

/** How long "Back online" stays up, in milliseconds. */
export const BACK_ONLINE_MS = 2000

/** A key of the translated notices, such as notice.offline. */
type TNoticeKey = `notice.${keyof typeof en.notice}`

/** A message about the connection, ready for the notifier once its key is translated. */
export interface INetworkNotice {
  /** Identifies the message, so the notifier announces a change. */
  id: string
  /** The i18n key of the text. */
  message: TNoticeKey
  /** error while offline, success once back. */
  tone: 'error' | 'success'
}

const NOTICES = {
  back: { id: 'back-online', message: 'notice.backOnline', tone: 'success' },
  offline: { id: 'offline', message: 'notice.offline', tone: 'error' },
} as const satisfies Record<Exclude<TPhase, 'online'>, INetworkNotice>

/**
 * Follows the network source: a notice while offline, then "back online" for BACK_ONLINE_MS after
 * the connection returns, then nothing. Starting online shows nothing at all.
 * @returns The notice to show, or undefined.
 */
export const useOfflineNotice = (): INetworkNotice | undefined => {
  const { helpers, network } = useDeps()
  const noticeHelper = helpers.notice
  const [phase, setPhase] = useState<TPhase>('online')

  useEffect(() => {
    let active = true

    /**
     * Moves to the phase for a new reading.
     * @param state - What the source reported.
     * @param state.online - Whether the device is online.
     */
    const apply = ({ online }: INetworkState): void => {
      if (active) setPhase((current) => noticeHelper.next(current, online))
    }

    void network.getState().then(apply)

    const unsubscribe = network.subscribe(apply)

    return () => {
      active = false
      unsubscribe()
    }
  }, [network, noticeHelper])

  useEffect(() => {
    if (phase !== 'back') return

    const timer = setTimeout(() => {
      setPhase('online')
    }, BACK_ONLINE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [phase])

  return phase === 'online' ? undefined : NOTICES[phase]
}
