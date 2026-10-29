import type { ReactElement } from 'react'

import { Image, View } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

import { Badge } from '../Badge/Badge.tsx'
import { Button } from '../Button/Button.tsx'
import { Icon } from '../Icon/Icon.tsx'
import { Price } from '../Price/Price.tsx'
import { Rating } from '../Rating/Rating.tsx'
import { Text } from '../Text/Text.tsx'
import { useTheme } from '../theme/theme.tsx'

export interface VenueCardProps {
  name: string
  address?: string
  rating?: number
  reviews?: number
  priceLevel?: 0 | 1 | 2 | 3 | 4
  isOpen?: boolean
  types?: string[]
  photo?: string
  /** Show the save button; true draws it filled. */
  saved?: boolean
  onSave?: () => void
}

// Placeholder when a venue has no photo: tiles cut from the radius scale.
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

const NO_TYPES: string[] = []

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
}: VenueCardProps): ReactElement => {
  const showSave = onSave !== undefined || saved !== undefined

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-bg-raised">
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
              icon={saved === true ? 'bookmarkFilled' : 'bookmark'}
              label={saved === true ? 'Saved to squad' : 'Save to squad'}
              onPress={onSave}
              size="sm"
              variant={saved === true ? 'primary' : 'secondary'}
            />
          </View>
        ) : null}
      </View>
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
        {rating !== undefined || priceLevel !== undefined || isOpen !== undefined ? (
          <View className="flex-row flex-wrap items-center gap-2">
            {rating === undefined ? null : (
              <Rating value={rating} {...(reviews === undefined ? {} : { count: reviews })} />
            )}
            {priceLevel === undefined || priceLevel === 0 ? null : <Price level={priceLevel} />}
            {isOpen === undefined ? null : (
              <Badge tone={isOpen ? 'success' : 'danger'}>{isOpen ? 'Open' : 'Closed'}</Badge>
            )}
          </View>
        ) : null}
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
}
