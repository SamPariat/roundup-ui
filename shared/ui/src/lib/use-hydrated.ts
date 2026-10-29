import { useSyncExternalStore } from 'react'

const unsubscribe = (): void => undefined
const subscribe = (): (() => void) => unsubscribe

// False while the static export is rendered and during the first client pass that hydrates it,
// true everywhere after (and always on native, which never hydrates). Anything that depends on
// the window or the device appearance waits for it, so the first client render equals the HTML.
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
