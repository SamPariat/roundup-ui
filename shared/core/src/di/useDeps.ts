import { use } from 'react'

import type { IDeps } from './deps'

import { DepsContext } from './context'

/**
 * Reads the dependencies of the nearest CoreProvider.
 * @returns The dependencies.
 */
export const useDeps = (): IDeps => {
  const deps = use(DepsContext)

  if (deps === null) throw new Error('useDeps needs a CoreProvider above it')

  return deps
}
