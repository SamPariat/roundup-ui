import type { ReactElement } from 'react'

import { Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The role colours a Text can take. */
const TONES = ['fg', 'muted', 'subtle', 'accent', 'danger'] as const

/**
 * Text in each tone, as a heading, and truncated. The type styles have a page of their own (Type).
 * @returns The specimens.
 */
export const TextDemo = (): ReactElement => (
  <>
    {TONES.map((tone) => (
      <Specimen key={tone} title={`tone=${tone}`}>
        <Text tone={tone}>Round up the squad, pick the place, split the bill.</Text>
      </Specimen>
    ))}
    <Specimen
      note="On-accent and on-highlight sit on their own fills."
      title="tone=on-accent · on-highlight"
    >
      <Text className="rounded-lg bg-accent p-3" tone="on-accent" variant="body-strong">
        On accent
      </Text>
      <Text className="rounded-lg bg-highlight p-3" tone="on-highlight" variant="body-strong">
        On highlight
      </Text>
    </Specimen>
    <Specimen
      note="heading marks the text for screen readers: 1 is the page title."
      title="heading=1 · 2 · 3"
    >
      <Text heading={1} variant="title">
        Heading level 1
      </Text>
      <Text heading={2} variant="heading">
        Heading level 2
      </Text>
      <Text heading={3} variant="label">
        Heading level 3
      </Text>
    </Specimen>
    <Specimen title="numberOfLines=1">
      <Text numberOfLines={1}>
        A very long squad name that cannot possibly fit on one line of a phone screen and so is cut
        short with an ellipsis
      </Text>
    </Specimen>
  </>
)
