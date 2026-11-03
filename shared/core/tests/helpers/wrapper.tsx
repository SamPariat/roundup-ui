import type { ReactElement, ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

import type { Deps } from '../../src/di/deps.ts'

import { CoreProvider } from '../../src/di/core-provider.tsx'
import { FakeStore } from './fakes.ts'

/** The props of the wrapper component. */
interface WrapperProps {
  /** What the test renders. */
  children: ReactNode
}

/** What a test gets back with its wrapper. */
export interface TestCore {
  /** The store the wrapper uses. */
  store: FakeStore
  /** The query client the wrapper uses. */
  queryClient: QueryClient
  /** Wrap renderHook or render with this. */
  wrapper: (props: WrapperProps) => ReactElement
}

/**
 * Builds a CoreProvider wrapper with fake dependencies, so a view model runs against a fake
 * Keychain and a stubbed network and no module is mocked.
 * @param overrides - Any dependency to replace, such as the clock.
 * @returns The wrapper and the fakes behind it.
 */
export const createTestCore = (overrides: Partial<Deps> = {}): TestCore => {
  const store = new FakeStore()

  // gcTime Infinity: the default 5 minute garbage-collection timer would keep Jest alive.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  })

  const deps: Partial<Deps> = { queryClient, session: store, ...overrides }

  /**
   * The provider with the fakes.
   * @returns The test's content, inside CoreProvider.
   */
  const wrapper = ({ children }: WrapperProps): ReactElement => (
    <CoreProvider deps={deps}>{children}</CoreProvider>
  )

  return { queryClient, store, wrapper }
}
