import { createContext } from 'react'

/** What a Modal tells the Buttons inside its footer. */
export interface ActionContextValue {
  /** A request is in flight in the surrounding Modal: only the loading Button stays active. */
  busy: boolean
  /** The surrounding Modal is a bottom sheet, so its actions stretch to the full width. */
  block: boolean
}

/** Carries the surrounding Modal's busy and sheet state down to its Buttons without prop drilling. */
export const ActionContext = createContext<ActionContextValue>({ busy: false, block: false })
