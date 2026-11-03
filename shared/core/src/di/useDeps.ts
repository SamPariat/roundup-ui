import { use } from 'react'

import type { Deps } from './deps.ts'

import { DepsContext } from './context.ts'

/**
 * Reads the dependencies of the nearest CoreProvider.
 * @returns The dependencies.
 */
export const useDeps = (): Deps => {
  const deps = use(DepsContext)

  if (deps === null) throw new Error('useDeps needs a CoreProvider above it')

  return deps
}
