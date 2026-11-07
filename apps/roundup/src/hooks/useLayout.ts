import { Platform } from 'react-native'

import { Breakpoint, useBreakpoint } from '@roundup/ui'

/**
 * Whether the app runs in the system chrome: on iOS the system tab bar and header stand in for
 * AppShell, so a screen pads itself with the gutter and puts its actions in the header. Web and
 * Android draw AppShell, which pads the screen and shows actions in the page.
 */
const SYSTEM_CHROME: boolean = Platform.OS === 'ios'

/** How the shell is laid out at a given width. */
export interface IShellLayout {
  /** Which navigation to show: the bottom bar or the side rail. */
  nav: 'bottom' | 'side'
  /** Side gutter: 16 (p-4) on phones, 32 (p-8) from the tablet breakpoint. */
  gutter: number
  /** The gutter as a padding class. */
  gutterClass: 'px-4' | 'px-8'
  /** True on iOS, where the system tab bar and header replace AppShell. */
  systemChrome: boolean
}

/**
 * Shell layout helpers. Static methods only.
 */
export class Layout {
  /**
   * Width is the only input: folded, open, rotated and Split View windows all look the same to it.
   * @param width - The window width in points.
   * @returns The navigation, the gutter and whether the system chrome is in use.
   */
  static forWidth(width: number): IShellLayout {
    // Tailwind's defaults: md is 768 and lg is 1024, p-4 is 16 and p-8 is 32.
    const step = Breakpoint.of(width)
    const nav = step === 'desktop' ? 'side' : 'bottom'
    const phone = step === 'phone'

    return {
      gutter: phone ? 16 : 32,
      gutterClass: phone ? 'px-4' : 'px-8',
      nav,
      systemChrome: SYSTEM_CHROME,
    }
  }
}

/**
 * The shell layout for the current window, recomputed when it is resized, folded or rotated.
 * @returns The navigation and gutter.
 */
export const useLayout = (): IShellLayout => Layout.forWidth(useBreakpoint().width)
