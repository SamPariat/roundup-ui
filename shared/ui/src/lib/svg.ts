import type { ComponentType, FC } from 'react'

/** Props that a styled SVG component accepts on top of its own. */
export type TStyled<P> = P & {
  /** Tailwind classes: text-* sets `currentColor`, fill-* and stroke-* color shapes. */
  className?: string
}

/**
 * SVG helpers. Static methods only. Native has its own version of this file (svg.native.ts) with
 * the same class and API.
 */
export class SvgHelper {
  /**
   * Lets an SVG component take a className. On the web react-native-svg renders real SVG elements,
   * so the className reaches the DOM unchanged and the stylesheet does the rest. Native resolves
   * the classes into the props SVG reads.
   * @param component - A react-native-svg component or an imported .svg file.
   * @returns The same component, typed to accept className.
   */
  static style<P extends object>(component: ComponentType<P>): FC<TStyled<P>> {
    return component as FC<TStyled<P>>
  }
}
