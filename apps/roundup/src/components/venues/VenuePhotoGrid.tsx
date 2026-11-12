import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IVenuePhoto } from '@roundup/core'

import { Photo } from '@roundup/ui'

/** Props for VenuePhotoGrid. */
export interface IVenuePhotoGridProps {
  /** The photos; the first is the large one, and up to four more follow. */
  photos: IVenuePhoto[]
}

/** How many small photos sit beside the large one. */
const SMALL = 4

/**
 * The photos of a venue on a wide screen: the first fills the left half, two rows of 160 points
 * high, and up to four more tile the right half in two by two. With one photo it fills the row.
 * Nothing is drawn without photos.
 * @returns The photo grid, or null when there are no photos.
 */
export const VenuePhotoGrid = ({ photos }: IVenuePhotoGridProps): null | ReactElement => {
  const [first, ...rest] = photos

  if (first === undefined) return null

  return (
    <View className="h-82 flex-row gap-2 overflow-hidden rounded-2xl">
      <Photo className="h-full flex-1 bg-bg-sunken" src={first.large} />
      {rest.length === 0 ? null : (
        <View className="h-full flex-1 flex-row flex-wrap content-between justify-between">
          {rest.slice(0, SMALL).map((photo) => (
            <Photo className="h-40 w-[49%] bg-bg-sunken" key={photo.small} src={photo.small} />
          ))}
        </View>
      )}
    </View>
  )
}
