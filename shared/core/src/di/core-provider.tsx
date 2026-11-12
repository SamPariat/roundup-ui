import type { ReactElement, ReactNode } from 'react'
import type { AppStateStatus } from 'react-native'

import { focusManager, onlineManager, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

import { AuthBridge } from '@roundup/api'

import type { INetworkSource } from '../network/types'
import type { ISession } from '../session/session'
import type { IDeps } from './deps'

import { Session } from '../session/session'
import { DepsContext, SessionContext } from './context'
import { Deps } from './deps'

/** Props for CoreProvider. */
export interface ICoreProviderProps {
  /** The app below. */
  children: ReactNode
  /** Replaces any of the real dependencies, which tests use to pass fakes. */
  deps?: Partial<IDeps>
}

/** Tells TanStack Query whether the device is online. */
type TSetOnline = (online: boolean) => void

/**
 * Connects TanStack Query's online state to the network source. Static methods only.
 */
class OnlineBridge {
  /**
   * Builds the listener setup for onlineManager: it reports the current state, then every change,
   * and returns the unsubscribe that onlineManager calls when the listener is replaced.
   * @param network - Where the connection state comes from.
   * @returns The setup function onlineManager takes.
   */
  static listenTo(network: INetworkSource): (setOnline: TSetOnline) => () => void {
    return (setOnline: TSetOnline): (() => void) => {
      void network.getState().then(({ online }) => {
        setOnline(online)
      })

      return network.subscribe(({ online }) => {
        setOnline(online)
      })
    }
  }

  /**
   * A setup that listens to nothing. Installing it makes onlineManager call the previous
   * listener's unsubscribe, which is how the network subscription is let go.
   */
  static readonly none = (): undefined => {
    // Subscribes to nothing, so there is nothing to undo.
  }
}

/** Tells TanStack Query whether the app is in the foreground. */
type TSetFocused = (focused: boolean) => void

/**
 * Connects TanStack Query's focus state to the app being in the foreground: on a phone, coming back
 * from another app or from Settings, and on web, coming back to the tab. Static methods only.
 */
class FocusBridge {
  /**
   * The listener setup for focusManager: it reports every foreground change and returns the
   * unsubscribe that focusManager calls when the listener is replaced.
   * @param setFocused - Tells TanStack Query whether the app is in the foreground.
   * @returns The unsubscribe.
   */
  static readonly listen = (setFocused: TSetFocused): (() => void) => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      setFocused(state === 'active')
    })

    return () => {
      subscription.remove()
    }
  }

  /**
   * A setup that listens to nothing. Installing it makes focusManager call the previous
   * listener's unsubscribe, which is how the app state subscription is let go.
   */
  static readonly none = (): undefined => {
    // Subscribes to nothing, so there is nothing to undo.
  }
}

/** What the provider builds once: the dependencies and the session on top of them. */
interface IBuiltCore {
  /** The default dependencies with the caller's overrides. */
  deps: IDeps
  /** The session, built on those dependencies. */
  session: ISession
}

/**
 * Builds the dependencies and the session once, wires the session into the API client, restores
 * the saved session, and provides all of it, plus the query client, to the app.
 * @returns The providers around the children.
 */
export const CoreProvider = ({ children, deps }: ICoreProviderProps): ReactElement => {
  const [built] = useState<IBuiltCore>((): IBuiltCore => {
    const merged = Deps.create(deps)

    return {
      deps: merged,
      session: Session.create({ queryClient: merged.queryClient, store: merged.session }),
    }
  })

  useEffect(() => {
    AuthBridge.set({
      getAccessToken: built.session.getAccessToken,
      refresh: built.session.refresh,
    })

    void built.session.restore()

    // Queries pause while offline and refetch when the connection returns.
    onlineManager.setEventListener(OnlineBridge.listenTo(built.deps.network))
    // Stale queries refetch when the app comes back to the foreground.
    focusManager.setEventListener(FocusBridge.listen)

    return () => {
      AuthBridge.set(undefined)
      // onlineManager is global and outlives this provider; without this it keeps the network
      // subscription, and with it the dependencies this provider built.
      onlineManager.setEventListener(OnlineBridge.none)
      focusManager.setEventListener(FocusBridge.none)
    }
  }, [built])

  return (
    <DepsContext value={built.deps}>
      <SessionContext value={built.session}>
        <QueryClientProvider client={built.deps.queryClient}>{children}</QueryClientProvider>
      </SessionContext>
    </DepsContext>
  )
}
