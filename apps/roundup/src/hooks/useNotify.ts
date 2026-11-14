import { createContext, use } from 'react'

import type { INotice } from '@roundup/ui'

/** Shows a notice over every screen; a new one replaces the one showing. */
export type TNotify = (notice: INotice) => void

/** Shows nothing: what a screen gets outside NoticeHost, as in a component test. */
const ignore: TNotify = (): void => {
  // Outside the host there is nowhere to show a notice.
}

/** The notice host's way in, which NoticeHost provides to every screen under it. */
export const NotifyContext = createContext<TNotify>(ignore)

/**
 * Lets a screen float a short notice over the app, such as new votes that came in. The app has one
 * Notifier at the top of the screen; this is how a screen reaches it.
 * @returns The function that shows a notice.
 */
export const useNotify = (): TNotify => use(NotifyContext)
