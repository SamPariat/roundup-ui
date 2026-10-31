import { breakpointFor, useBreakpoint } from '@roundup/ui'

/** How the shell is laid out at a given width. */
export interface ShellLayout {
  /** Which navigation to show: the bottom bar or the side rail. */
  nav: 'bottom' | 'side'
  /** Side gutter: 16 (p-4) on phones, 32 (p-8) from the tablet breakpoint. */
  gutter: number
  /** The column never grows past max-w-content (1200); wider windows get margin, not longer lines. */
  contentWidth: number
}

/**
 * Width is the only input: folded, open, rotated and Split View windows all look the same to it.
 * @param width - The window width in points.
 * @returns The navigation, gutter and content width.
 */
export const layoutFor = (width: number): ShellLayout => {
  // Tailwind's defaults: md is 768 and lg is 1024, p-4 is 16 and p-8 is 32, w-62 (the SideNav) is
  // 248. The content column is max-w-content, 1200, from theme.css.
  const step = breakpointFor(width)
  const nav = step === 'desktop' ? 'side' : 'bottom'
  const gutter = step === 'phone' ? 16 : 32
  const available = width - (nav === 'side' ? 248 : 0)

  return { nav, gutter, contentWidth: Math.min(available - gutter * 2, 1200) }
}

/**
 * The shell layout for the current window, recomputed when it is resized, folded or rotated.
 * @returns The navigation, gutter and content width.
 */
export const useLayout = (): ShellLayout => layoutFor(useBreakpoint().width)
