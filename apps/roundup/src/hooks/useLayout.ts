import { breakpoints, sizes, spacing } from '@roundup/tokens'
import { useBreakpoint } from '@roundup/ui'

/** How the shell is laid out at a given width. */
export interface ShellLayout {
  /** Which navigation to show: the bottom bar or the side rail. */
  nav: 'bottom' | 'side'
  /** Side gutter: space-4 on phones, space-8 from the tablet breakpoint. */
  gutter: number
  /** The column never grows past size-content; wider windows get margin, not longer lines. */
  contentWidth: number
}

/**
 * Width is the only input: folded, open, rotated and Split View windows all look the same to it.
 * @param width - The window width in points.
 * @returns The navigation, gutter and content width.
 */
export const layoutFor = (width: number): ShellLayout => {
  const nav = width >= breakpoints['bp-desktop'] ? 'side' : 'bottom'
  const gutter = width >= breakpoints['bp-tablet'] ? spacing['space-8'] : spacing['space-4']
  const available = width - (nav === 'side' ? sizes['size-sidenav'] : 0)

  return { nav, gutter, contentWidth: Math.min(available - gutter * 2, sizes['size-content']) }
}

/**
 * The shell layout for the current window, recomputed when it is resized, folded or rotated.
 * @returns The navigation, gutter and content width.
 */
export const useLayout = (): ShellLayout => layoutFor(useBreakpoint().width)
