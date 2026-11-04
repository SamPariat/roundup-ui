import { useSyncExternalStore } from 'react'

/**
 * Hydration subscription helpers. Static members only; they are arrow functions because React
 * takes them as bare callbacks.
 */
class HydrationHelper {
  /**
   * A no-op unsubscribe: hydration state never changes after render.
   */
  private static readonly unsubscribe = (): void => {
    // Hydration state never changes after render, so there is nothing to undo.
  }

  /**
   * A subscription that never fires, which is all useSyncExternalStore needs here.
   * @returns The no-op unsubscribe.
   */
  static readonly subscribe = (): (() => void) => HydrationHelper.unsubscribe
}

/**
 * False while the static export is rendered and during the first client pass that hydrates it,
 * true everywhere after (and always on native, which never hydrates). Anything that depends on
 * the window or the device appearance waits for it, so the first client render equals the HTML.
 * @returns Whether the client has taken over from the static HTML.
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    HydrationHelper.subscribe,
    () => true,
    () => false,
  )
