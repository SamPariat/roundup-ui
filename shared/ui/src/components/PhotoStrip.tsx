import type { ReactElement } from 'react'
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native'

import { useCallback, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { IPhotoCredit } from './Photo'

import { cn } from '../lib/cn'
import { Photo } from './Photo'
import { Text } from './Text'

/** One photo of a strip. */
export interface IPhotoStripPhoto {
  /** The photo's URL, already sized for the strip. */
  src: string
  /** Who took it, drawn over it and linked to their profile when it has one. */
  credit?: IPhotoCredit | undefined
}

/** Props for PhotoStrip. */
export interface IPhotoStripProps {
  /** The photos, in order; nothing is drawn without any. */
  photos: IPhotoStripPhoto[]
  /** Classes for the strip's height and shape, such as `h-46 rounded-2xl`. */
  className: string
}

/**
 * Photos side by side, one filling the strip at a time, swiped through a page at a time. With more
 * than one, a counter such as "2 / 5" sits in the top-right corner. One photo looks like a Photo.
 * @returns The strip, or null without photos.
 */
export const PhotoStrip = ({ className, photos }: IPhotoStripProps): null | ReactElement => {
  const { t } = useT()
  const [width, setWidth] = useState<number>(0)
  const [index, setIndex] = useState<number>(0)

  const handleLayout = useCallback((event: LayoutChangeEvent): void => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  // The page shown is the one most of the strip is on, so the counter follows the swipe.
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (width > 0) setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
    },
    [width],
  )

  const pageStyle = useMemo((): ViewStyle => ({ width }), [width])

  if (photos.length === 0) return null

  const count = photos.length

  return (
    <View className={cn('overflow-hidden bg-bg-sunken', className)}>
      <ScrollView
        accessibilityLabel={t('photo.strip')}
        horizontal
        onLayout={handleLayout}
        onScroll={handleScroll}
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {photos.map((photo) => (
          <View className="h-full" key={photo.src} style={pageStyle}>
            <Photo className="size-full bg-bg-sunken" credit={photo.credit} src={photo.src} />
          </View>
        ))}
      </ScrollView>
      {count > 1 ? (
        <View className="absolute top-2 right-2 rounded-full bg-photo-scrim px-2 py-0.5">
          <Text
            accessibilityLabel={t('photo.positionLabel', { count, index: index + 1 })}
            tone="on-photo"
            variant="caption"
          >
            {t('photo.position', { count, index: index + 1 })}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
