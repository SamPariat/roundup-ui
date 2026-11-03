import type { ReactElement, ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

import type { IDeps } from '../../src/di/deps'

import { CoreProvider } from '../../src/di/core-provider'
import { FakeStore } from './fakes'

/** The props of the wrapper component. */
interface IWrapperProps {
  /** What the test renders. */
  children: ReactNode
}

/** What a test gets back with its wrapper. */
export interface ITestCore {
  /** The store the wrapper uses. */
  store: FakeStore
  /** The query client the wrapper uses. */
  queryClient: QueryClient
  /** Wrap renderHook or render with this. */
  wrapper: (props: IWrapperProps) => ReactElement
}

/**
 * Builds a CoreProvider wrapper with fake dependencies, so a view model runs against a fake
 * Keychain and a stubbed network and no module is mocked.
 * @param overrides - Any dependency to replace, such as the clock.
 * @returns The wrapper and the fakes behind it.
 */
export const createTestCore = (overrides: Partial<IDeps> = {}): ITestCore => {
  const store = new FakeStore()

  // gcTime Infinity: the default 5 minute garbage-collection timer would keep Jest alive.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  })

  const deps: Partial<IDeps> = { queryClient, session: store, ...overrides }

  /**
   * The provider with the fakes.
   * @returns The test's content, inside CoreProvider.
   */
  const wrapper = ({ children }: IWrapperProps): ReactElement => (
    <CoreProvider deps={deps}>{children}</CoreProvider>
  )

  return { queryClient, store, wrapper }
}
