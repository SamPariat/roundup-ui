import type { ReactElement } from 'react'

import { Image } from 'expo-image'
import { styled } from 'nativewind'
import { useCallback } from 'react'
import { Linking, Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn'
import { useReducedMotion } from '../lib/useReducedMotion'
import { Text } from './Text'

/** Who took a photo, which Google requires showing with it. */
export interface IPhotoCredit {
  /** The author's display name. */
  name: string
  /** The author's profile page; left out when Google gives none. */
  url?: string
}

/** Props for Photo. */
export interface IPhotoProps {
  /** The photo's URL, already sized for where it is drawn. */
  src: string
  /** Classes for the size, shape and the placeholder color (`bg-bg-sunken`) shown until it loads. */
  className: string
  /** Identifies the photo in a recycled list item, so a row never flashes its previous photo. */
  recyclingKey?: string
  /**
   * Who took it, drawn in a pill at the bottom-left over the photo; leave it out for photos too
   * small to label, or our own. With a url the name links to the author's profile, so leave the url
   * out where the photo sits inside something already pressable, such as a card.
   */
  credit?: IPhotoCredit | undefined
}

/** The fade from the placeholder to the photo, in milliseconds. */
const FADE_MS = 150

// expo-image is not a React Native component, so className is mapped onto its style here.
const StyledImage = styled(Image, { className: 'style' })

/**
 * A decorative photo, cached in memory and on disk, that fades in over its placeholder color.
 * Whatever the photo means is said by the text next to it, so it is hidden from screen readers.
 * With a credit, the author's name is drawn over it, and opens their profile when it has one.
 * @returns The photo, cropped to fill its box.
 */
export const Photo = ({ className, credit, recyclingKey, src }: IPhotoProps): ReactElement => {
  const reduced = useReducedMotion()
  const { t } = useT()

  const creditUrl = credit?.url

  const handleOpenCredit = useCallback((): void => {
    if (creditUrl !== undefined) void Linking.openURL(creditUrl)
  }, [creditUrl])

  const image = (
    <StyledImage
      accessibilityIgnoresInvertColors
      alt=""
      cachePolicy="memory-disk"
      className={credit === undefined ? className : 'size-full'}
      contentFit="cover"
      recyclingKey={recyclingKey ?? null}
      source={{ uri: src }}
      transition={reduced ? 0 : FADE_MS}
    />
  )

  if (credit === undefined) return image

  // The box keeps the caller's size, shape and placeholder; the photo fills it and the credit sits on top.
  return (
    <View className={cn('overflow-hidden', className)}>
      {image}
      <View className="absolute bottom-2 left-2 max-w-4/5 rounded-full bg-photo-scrim px-2 py-0.5">
        {creditUrl === undefined ? (
          <Text numberOfLines={1} tone="on-photo" variant="caption">
            {t('photo.credit', { name: credit.name })}
          </Text>
        ) : (
          <Pressable accessibilityRole="link" onPress={handleOpenCredit}>
            <Text className="underline" numberOfLines={1} tone="on-photo" variant="caption">
              {t('photo.credit', { name: credit.name })}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
