import type { ReactElement } from 'react'

import { createElement } from 'react'

/**
 * The test stand-in for expo-image's Image, which draws through a native view Jest lacks. It is a
 * plain view named "Photo" that keeps every prop it was given, so a test can read the source, the
 * cache policy and the transition.
 * @param props - What Photo passes to the image.
 * @returns A labeled view carrying those props.
 */
const StandInImage = (props: object): ReactElement =>
  createElement('View', { ...props, accessibilityLabel: 'Photo', accessible: true })

/** The stand-in as a module, the shape jest.mock returns for expo-image. */
export const expoImageModule = { Image: StandInImage }
