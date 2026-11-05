import { Breakpoint, useBreakpoint } from '@roundup/ui'

/** How the shell is laid out at a given width. */
export interface IShellLayout {
  /** Which navigation to show: the bottom bar or the side rail. */
  nav: 'bottom' | 'side'
  /** Side gutter: 16 (p-4) on phones, 32 (p-8) from the tablet breakpoint. */
  gutter: number
}

/**
 * Shell layout helpers. Static methods only.
 */
export class Layout {
  /**
   * Width is the only input: folded, open, rotated and Split View windows all look the same to it.
   * @param width - The window width in points.
   * @returns The navigation and gutter.
   */
  static forWidth(width: number): IShellLayout {
    // Tailwind's defaults: md is 768 and lg is 1024, p-4 is 16 and p-8 is 32.
    const step = Breakpoint.of(width)
    const nav = step === 'desktop' ? 'side' : 'bottom'
    const gutter = step === 'phone' ? 16 : 32

    return { nav, gutter }
  }
}

/**
 * The shell layout for the current window, recomputed when it is resized, folded or rotated.
 * @returns The navigation and gutter.
 */
export const useLayout = (): IShellLayout => Layout.forWidth(useBreakpoint().width)
