import type { ReactElement, ReactNode } from 'react'

import { onlineManager, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { setAuthBridge } from '@roundup/api'

import type { IDeps } from './deps'

import { createSession } from '../session/session'
import { DepsContext, SessionContext } from './context'
import { createDeps } from './deps'

/** Props for CoreProvider. */
export interface ICoreProviderProps {
  /** The app below. */
  children: ReactNode
  /** Replaces any of the real dependencies, which tests use to pass fakes. */
  deps?: Partial<IDeps>
}

/**
 * Builds the dependencies and the session once, wires the session into the API client, restores
 * the saved session, and provides all of it, plus the query client, to the app.
 * @returns The providers around the children.
 */
export const CoreProvider = ({ children, deps }: ICoreProviderProps): ReactElement => {
  const [built] = useState(() => {
    const merged: IDeps = { ...createDeps(), ...deps }

    return {
      deps: merged,
      session: createSession({ queryClient: merged.queryClient, store: merged.session }),
    }
  })

  useEffect(() => {
    setAuthBridge({
      getAccessToken: built.session.getAccessToken,
      refresh: built.session.refresh,
    })

    void built.session.restore()

    // Queries pause while offline and refetch when the connection returns.
    onlineManager.setEventListener((setOnline) => {
      void built.deps.network.getState().then(({ online }) => {
        setOnline(online)
      })

      return built.deps.network.subscribe(({ online }) => {
        setOnline(online)
      })
    })

    return () => {
      setAuthBridge(undefined)
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
