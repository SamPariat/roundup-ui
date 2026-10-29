import type { ReactElement } from 'react'

import { Image, View } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

import { useT } from '@roundup/i18n'

import { useTheme } from '../theme/theme.tsx'
import { Badge } from './Badge.tsx'
import { Button } from './Button.tsx'
import { Icon } from './Icon.tsx'
import { Price } from './Price.tsx'
import { Rating } from './Rating.tsx'
import { Text } from './Text.tsx'

/** Props for VenueCard. */
export interface VenueCardProps {
  /** The venue's name. */
  name: string
  /** Street address shown under the name. */
  address?: string
  /** Average rating out of 5. */
  rating?: number
  /** How many reviews the rating is based on. */
  reviews?: number
  /** Google Places price level, 0 (unknown) to 4. */
  priceLevel?: 0 | 1 | 2 | 3 | 4
  /** Whether the venue is open now. Omit when unknown. */
  isOpen?: boolean
  /** Category tags drawn as plain badges. */
  types?: string[]
  /** Photo URL. A pattern is drawn without it. */
  photo?: string
  /** Show the save button; true draws it filled. */
  saved?: boolean
  /** Called when the save button is pressed. */
  onSave?: () => void
}

/**
 * Placeholder when a venue has no photo: tiles cut from the radius scale.
 * @returns A decorative SVG of tinted tiles.
 */
const VenuePattern = (): ReactElement => {
  const { roles } = useTheme()

  return (
    <Svg
      aria-hidden
      className="absolute inset-0"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 320 180"
      width="100%"
    >
      <Rect fill={roles['accent-soft']} height={96} rx={48} width={96} x={196} y={28} />
      <Rect fill={roles['highlight-soft']} height={64} rx={16} width={64} x={236} y={92} />
      <Rect fill={roles['bg-hover']} height={32} rx={16} width={120} x={28} y={120} />
    </Svg>
  )
}

/** Optional props that callers may pass as undefined, which exactOptionalPropertyTypes otherwise rejects. */
type Loose<T> = { [K in keyof T]?: T[K] | undefined }

const NO_TYPES: string[] = []

/**
 * The photo, or the pattern when there is none, with the save button floated on top.
 * @returns The media area with the optional save button.
 */
const VenueMedia = ({
  onSave,
  photo,
  saved,
}: Loose<Pick<VenueCardProps, 'onSave' | 'photo' | 'saved'>>): ReactElement => {
  const showSave = onSave !== undefined || saved !== undefined
  const isSaved = saved === true
  const { t } = useT()

  return (
    <View className="aspect-video items-center justify-center overflow-hidden bg-bg-sunken">
      {photo === undefined ? (
        <VenuePattern />
      ) : (
        <Image
          accessibilityIgnoresInvertColors
          alt=""
          className="size-full"
          source={{ uri: photo }}
        />
      )}
      {showSave ? (
        <View className="absolute top-2 right-2">
          <Button
            icon={isSaved ? 'bookmarkFilled' : 'bookmark'}
            label={isSaved ? t('venueCard.saved') : t('venueCard.save')}
            onPress={onSave}
            size="sm"
            variant={isSaved ? 'primary' : 'secondary'}
          />
        </View>
      ) : null}
    </View>
  )
}

/** Props for the open/closed badge. */
interface OpenBadgeProps {
  /** Whether the venue is open now. */
  isOpen: boolean
}

/**
 * A success or danger badge that says Open or Closed.
 * @returns A status pill worded Open or Closed.
 */
const OpenBadge = ({ isOpen }: OpenBadgeProps): ReactElement => {
  const { t } = useT()

  if (isOpen) return <Badge tone="success">{t('venueCard.open')}</Badge>

  return <Badge tone="danger">{t('venueCard.closed')}</Badge>
}

/**
 * Rating, price and opening status in one wrapping row; nothing renders when none is known.
 * @returns The facts row, or null when none of the facts is known.
 */
const VenueFacts = ({
  isOpen,
  priceLevel,
  rating,
  reviews,
}: Loose<
  Pick<VenueCardProps, 'isOpen' | 'priceLevel' | 'rating' | 'reviews'>
>): null | ReactElement => {
  if (rating === undefined && priceLevel === undefined && isOpen === undefined) return null

  const count = reviews === undefined ? {} : { count: reviews }

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {rating === undefined ? null : <Rating value={rating} {...count} />}
      {priceLevel === undefined || priceLevel === 0 ? null : <Price level={priceLevel} />}
      {isOpen === undefined ? null : <OpenBadge isOpen={isOpen} />}
    </View>
  )
}

/**
 * A card for a place: photo or pattern, name, address, rating, price level, opening status and category tags, with a save button when it can be saved.
 * @returns A bordered card container.
 */
export const VenueCard = ({
  address,
  isOpen,
  name,
  onSave,
  photo,
  priceLevel,
  rating,
  reviews,
  saved,
  types = NO_TYPES,
}: VenueCardProps): ReactElement => (
  <View className="overflow-hidden rounded-2xl border border-border bg-bg-raised">
    <VenueMedia onSave={onSave} photo={photo} saved={saved} />
    <View className="gap-1 px-4 pt-3 pb-4">
      <Text heading={3} variant="body-strong">
        {name}
      </Text>
      {address === undefined ? null : (
        <View className="flex-row items-center gap-2">
          <Icon decorative name="pin" size={16} tone="fg-muted" />
          <Text className="min-w-0 flex-1" tone="muted" variant="body-sm">
            {address}
          </Text>
        </View>
      )}
      <VenueFacts isOpen={isOpen} priceLevel={priceLevel} rating={rating} reviews={reviews} />
      {types.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap gap-2">
          {types.map((type) => (
            <Badge dot={false} key={type}>
              {type}
            </Badge>
          ))}
        </View>
      ) : null}
    </View>
  </View>
)
