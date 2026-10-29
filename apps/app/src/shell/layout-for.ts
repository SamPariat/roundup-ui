import { breakpoints, sizes, spacing } from '@roundup/tokens'

export interface ShellLayout {
  nav: 'bottom' | 'side'
  /** Side gutter: space-4 on phones, space-8 from the tablet breakpoint. */
  gutter: number
  /** The column never grows past size-content; wider windows get margin, not longer lines. */
  contentWidth: number
}

// Width is the only input: folded, open, rotated and Split View windows all look the same to it.
export const layoutFor = (width: number): ShellLayout => {
  const nav = width >= breakpoints['bp-desktop'] ? 'side' : 'bottom'
  const gutter = width >= breakpoints['bp-tablet'] ? spacing['space-8'] : spacing['space-4']
  const available = width - (nav === 'side' ? sizes['size-sidenav'] : 0)

  return { nav, gutter, contentWidth: Math.min(available - gutter * 2, sizes['size-content']) }
}
