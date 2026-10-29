import { createContext } from 'react'

export interface ActionContextValue {
  /** A request is in flight in the surrounding Modal: only the loading Button stays active. */
  busy: boolean
  /** The surrounding Modal is a bottom sheet, so its actions stretch to the full width. */
  block: boolean
}

export const ActionContext = createContext<ActionContextValue>({ busy: false, block: false })
