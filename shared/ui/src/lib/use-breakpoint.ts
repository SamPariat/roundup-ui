import { useWindowDimensions } from 'react-native'

import { breakpoints } from '@roundup/tokens'

import { useHydrated } from './use-hydrated.ts'

export type Breakpoint = 'desktop' | 'phone' | 'tablet'

export const breakpointFor = (width: number): Breakpoint => {
  if (width >= breakpoints['bp-desktop']) return 'desktop'
  if (width >= breakpoints['bp-tablet']) return 'tablet'

  return 'phone'
}

// Width-driven only: folded, open, rotated and Split View windows all change width, so the
// layout follows without any device checks. Never cache the size at module load.
// The server has no window, so until hydration the phone layout is used; the real width
// replaces it on the next pass, which keeps the static HTML and the first client render equal.
export const useBreakpoint = (): { breakpoint: Breakpoint; width: number } => {
  const { width: live } = useWindowDimensions()
  const hydrated = useHydrated()
  const width = hydrated ? live : 0

  return { breakpoint: breakpointFor(width), width }
}
