import type { ReactElement } from 'react'

import { Photo } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/** A small inline picture, so the demo needs no network. */
const SAMPLE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#8caaee"/><circle cx="240" cy="60" r="40" fill="#f4b8e4"/><rect x="24" y="110" width="150" height="40" rx="20" fill="#a6d189"/></svg>',
)}`

/**
 * Photo as a loaded picture, with its author credited (linked and plain), and as the placeholder
 * color it sits on until one arrives.
 * @returns The specimens.
 */
export const PhotoDemo = (): ReactElement => (
  <>
    <Specimen
      note="Cropped to fill its box, cached in memory and on disk, and faded in."
      title="src=… (loaded)"
    >
      <Photo className="h-40 w-full rounded-2xl bg-bg-sunken" src={SAMPLE} />
    </Specimen>
    <Specimen
      note="Google requires crediting the author. With a url the name opens their profile."
      title="credit={ name, url }"
    >
      <Photo
        className="h-40 w-full rounded-2xl bg-bg-sunken"
        credit={{ name: 'Asha Rao', url: 'https://maps.google.com' }}
        src={SAMPLE}
      />
    </Specimen>
    <Specimen
      note="Without a url, or inside something already pressable, the credit is plain text."
      title="credit={ name }"
    >
      <Photo
        className="h-40 w-full rounded-2xl bg-bg-sunken"
        credit={{ name: 'Kabir' }}
        src={SAMPLE}
      />
    </Specimen>
    <Specimen note="Until the photo arrives the box shows the sunken color." title="Placeholder">
      <Photo className="h-40 w-full rounded-2xl bg-bg-sunken" src="https://invalid.invalid/x.jpg" />
    </Specimen>
  </>
)
