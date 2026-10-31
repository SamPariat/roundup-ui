import { useWindowDimensions } from 'react-native'

import { breakpoints } from '@roundup/tokens'

import { useHydrated } from './useHydrated.ts'

/** Which layout step the window width falls in. */
export type Breakpoint = 'desktop' | 'phone' | 'tablet'

/** The current layout step and the width it was derived from. */
export interface BreakpointState {
  /** The layout step. */
  breakpoint: Breakpoint
  /** The window width the step came from; 0 before hydration. */
  width: number
}

/**
 * Maps a window width to a layout step using the design-system breakpoints.
 * @param width - The window width in points.
 * @returns phone below 768, tablet from 768, desktop from 1024.
 */
export const breakpointFor = (width: number): Breakpoint => {
  if (width >= breakpoints['bp-desktop']) return 'desktop'
  if (width >= breakpoints['bp-tablet']) return 'tablet'

  return 'phone'
}

/**
 * Width-driven only: folded, open, rotated and Split View windows all change width, so the
 * layout follows without any device checks. Never cache the size at module load.
 * The server has no window, so until hydration the phone layout is used; the real width
 * replaces it on the next pass, which keeps the static HTML and the first client render equal.
 * @returns The layout step and width, re-read on every resize.
 */
export const useBreakpoint = (): BreakpointState => {
  const { width: live } = useWindowDimensions()
  const hydrated = useHydrated()
  const width = hydrated ? live : 0

  return { breakpoint: breakpointFor(width), width }
}
