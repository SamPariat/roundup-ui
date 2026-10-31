import { useSyncExternalStore } from 'react'

/**
 * A no-op unsubscribe: hydration state never changes after render.
 * @returns Nothing.
 */
const unsubscribe = (): void => undefined
/**
 * A subscription that never fires, which is all useSyncExternalStore needs here.
 * @returns The no-op unsubscribe.
 */
const subscribe = (): (() => void) => unsubscribe

/**
 * False while the static export is rendered and during the first client pass that hydrates it,
 * true everywhere after (and always on native, which never hydrates). Anything that depends on
 * the window or the device appearance waits for it, so the first client render equals the HTML.
 * @returns Whether the client has taken over from the static HTML.
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
