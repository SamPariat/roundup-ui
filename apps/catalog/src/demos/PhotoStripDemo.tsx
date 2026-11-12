import type { ReactElement } from 'react'

import type { IPhotoStripPhoto } from '@roundup/ui'

import { PhotoStrip } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/** The backgrounds of the sample pictures, so each page of the strip looks different. */
const FILLS = ['#8caaee', '#ef9f76', '#a6d189', '#ca9ee6', '#e5c890'] as const

/**
 * A small inline picture on a background, so the demo needs no network.
 * @param fill - The picture's background color.
 * @returns The picture as a data URL.
 */
const sample = (fill: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="${fill}"/><circle cx="240" cy="60" r="40" fill="#f4b8e4"/><rect x="24" y="110" width="150" height="40" rx="20" fill="#303446"/></svg>`,
  )}`

/** Five credited photos, as a venue's page shows them. */
const FIVE: IPhotoStripPhoto[] = FILLS.map((fill, i) => ({
  credit: { name: `Author ${i + 1}`, url: 'https://maps.google.com' },
  src: sample(fill),
}))

/**
 * PhotoStrip with five photos to swipe through, and with one, where it looks like a Photo.
 * @returns The specimens.
 */
export const PhotoStripDemo = (): ReactElement => (
  <>
    <Specimen
      note="Swipe a page at a time. The counter follows, and each photo keeps its credit."
      title="photos={5}"
    >
      <PhotoStrip className="h-46 w-full rounded-2xl" photos={FIVE} />
    </Specimen>
    <Specimen note="One photo has no counter: it looks like a Photo." title="photos={1}">
      <PhotoStrip className="h-46 w-full rounded-2xl" photos={FIVE.slice(0, 1)} />
    </Specimen>
  </>
)
