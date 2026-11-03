import { createContext } from 'react'

import type { ISession } from '../session/session'
import type { IDeps } from './deps'

/** The dependencies, provided by CoreProvider. */
export const DepsContext = createContext<IDeps | null>(null)

/** The session built from those dependencies, provided by CoreProvider. */
export const SessionContext = createContext<ISession | null>(null)
