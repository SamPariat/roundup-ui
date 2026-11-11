import { Platform } from 'react-native'

import { Breakpoint, useBreakpoint } from '@roundup/ui'

/**
 * Whether the app runs in the system chrome: on iOS the system tab bar and header stand in for
 * AppShell, so a screen pads itself with the gutter and puts its actions in the header. Web and
 * Android draw AppShell, which pads the screen and shows actions in the page.
 */
const SYSTEM_CHROME: boolean = Platform.OS === 'ios'

/** The widest the content gets, which max-w-content sets in CSS. */
const CONTENT_MAX = 1200

/** The narrowest a card of a grid is, so the columns are as many as fit at that width. */
const CARD_MIN = 280

/** The space a grid cell adds around its card: 6 points on each side. */
const CELL_PADDING = 12

/** The room below the last row of a screen's content, before any floating button. */
const END_GAP = 24

/** The room a FloatingActionButton takes at the bottom: its 56 point height and 16 point offset. */
const FAB_RESERVE = 72

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
   * How many equal columns a grid of cards has, as many as keep every card at least 280 wide, like
   * the design's auto-fill grid; one on a phone.
   * @param width - The width of the list, in points, as measured.
   * @param gutter - The side gutter of the shell, in points.
   * @returns At least 1.
   */
  static columnsFor(width: number, gutter: number): number {
    const row = Math.min(width, CONTENT_MAX) - 2 * gutter

    return Math.max(1, Math.floor(row / (CARD_MIN + CELL_PADDING)))
  }

  /**
   * The padding below the last row of a list of cells, which already carry half of CELL_PADDING
   * under their card, so the gap below the card matches a plain page's.
   * @param fab - True when the screen floats a button over its content.
   * @returns The padding, in points.
   */
  static listBottomPad(fab: boolean): number {
    return Layout.bottomPad(fab) - CELL_PADDING / 2
  }

  /**
   * The padding below the last row of a scrolling screen, the one place the bottom spacing is set:
   * the normal gap, plus the floating button's footprint when the screen has one, so the last row
   * rests just clear of it. The tab bar is not counted: AppShell's BottomNav sits below the screen
   * on web and Android, and iOS insets the scroll view for its tab bar.
   * @param fab - True when the screen floats a button over its content.
   * @returns The padding, in points.
   */
  static bottomPad(fab: boolean): number {
    return fab ? END_GAP + FAB_RESERVE : END_GAP
  }

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
