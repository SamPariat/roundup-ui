import { useBreakpoint } from '@roundup/ui'

/**
 * Whether the window is wide enough (1024 and up) for the component list to sit beside the page
 * instead of being a screen of its own.
 * @returns True from the desktop breakpoint up.
 */
export const useWide = (): boolean => useBreakpoint().breakpoint === 'desktop'
