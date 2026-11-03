import type { ReactElement, ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { setAuthBridge } from '@roundup/api'

import type { Deps } from './deps.ts'

import { createSession } from '../session/session.ts'
import { DepsContext, SessionContext } from './context.ts'
import { createDeps } from './deps.ts'

/** Props for CoreProvider. */
export interface CoreProviderProps {
  /** The app below. */
  children: ReactNode
  /** Replaces any of the real dependencies, which tests use to pass fakes. */
  deps?: Partial<Deps>
}

/**
 * Builds the dependencies and the session once, wires the session into the API client, restores
 * the saved session, and provides all of it, plus the query client, to the app.
 * @returns The providers around the children.
 */
export const CoreProvider = ({ children, deps }: CoreProviderProps): ReactElement => {
  const [built] = useState(() => {
    const merged: Deps = { ...createDeps(), ...deps }

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
