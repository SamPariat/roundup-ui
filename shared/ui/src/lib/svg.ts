import type { ComponentType, FC } from 'react'

/** Props that a styled SVG component accepts on top of its own. */
export type Styled<P> = P & {
  /** Tailwind classes: text-* sets `currentColor`, fill-* and stroke-* colour shapes. */
  className?: string
}

/**
 * Lets an SVG component take a className. On the web react-native-svg renders real SVG elements,
 * so the className reaches the DOM unchanged and the stylesheet does the rest. Native has its own
 * version of this file (svg.native.ts) that resolves the classes into the props SVG reads.
 * @param component - A react-native-svg component or an imported .svg file.
 * @returns The same component, typed to accept className.
 */
export const styleSvg = <P extends object>(component: ComponentType<P>): FC<Styled<P>> =>
  component as FC<Styled<P>>
