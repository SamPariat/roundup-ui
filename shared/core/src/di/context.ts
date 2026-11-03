import { createContext } from 'react'

import type { Session } from '../session/session.ts'
import type { Deps } from './deps.ts'

/** The dependencies, provided by CoreProvider. */
export const DepsContext = createContext<Deps | null>(null)

/** The session built from those dependencies, provided by CoreProvider. */
export const SessionContext = createContext<null | Session>(null)
