import type { ReactElement } from 'react'

import { Image } from 'expo-image'
import { styled } from 'nativewind'

import { useReducedMotion } from '../lib/useReducedMotion'

/** Props for Photo. */
export interface IPhotoProps {
  /** The photo's URL, already sized for where it is drawn. */
  src: string
  /** Classes for the size, shape and the placeholder color (`bg-bg-sunken`) shown until it loads. */
  className: string
  /** Identifies the photo in a recycled list item, so a row never flashes its previous photo. */
  recyclingKey?: string
}

/** The fade from the placeholder to the photo, in milliseconds. */
const FADE_MS = 150

// expo-image is not a React Native component, so className is mapped onto its style here.
const StyledImage = styled(Image, { className: 'style' })

/**
 * A decorative photo, cached in memory and on disk, that fades in over its placeholder color.
 * Whatever the photo means is said by the text next to it, so it is hidden from screen readers.
 * @returns The photo, cropped to fill its box.
 */
export const Photo = ({ className, recyclingKey, src }: IPhotoProps): ReactElement => {
  const reduced = useReducedMotion()

  return (
    <StyledImage
      accessibilityIgnoresInvertColors
      alt=""
      cachePolicy="memory-disk"
      className={className}
      contentFit="cover"
      recyclingKey={recyclingKey ?? null}
      source={{ uri: src }}
      transition={reduced ? 0 : FADE_MS}
    />
  )
}
