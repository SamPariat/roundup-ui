import type { ViewStyle } from 'react-native'

/**
 * Covers the parent edge to edge. Library views such as GlassView and BlurView take a style, not a
 * className, so this is the one shared style object for them.
 */
export const ABSOLUTE_FILL: ViewStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}
