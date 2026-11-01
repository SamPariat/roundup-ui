import type { ReactElement } from 'react'

import type { TextProps } from '@roundup/ui'

import { Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** One type style. */
interface Style {
  /** The sample line. */
  sample: string
  /** The Text variant. */
  variant: NonNullable<TextProps['variant']>
}

/** Every Text variant, from the largest to the smallest. */
const STYLES: readonly Style[] = [
  { variant: 'display', sample: 'Round up the squad' },
  { variant: 'title', sample: 'Friday Footy' },
  { variant: 'heading', sample: 'Upcoming plans' },
  { variant: 'body', sample: 'Pick the place, split the bill, and let everyone know.' },
  { variant: 'body-strong', sample: 'Pick the place, split the bill.' },
  { variant: 'body-sm', sample: 'Last plan was on Friday at 8 pm.' },
  { variant: 'label', sample: 'Add member' },
  { variant: 'caption', sample: '12 members' },
  { variant: 'otp', sample: '123456' },
  { variant: 'numeric', sample: '₹1,250.00' },
]

/**
 * Every Text variant with a sample line, named by the variant prop and its type utility.
 * @returns The specimens.
 */
export const TypeDemo = (): ReactElement => (
  <>
    {STYLES.map(({ sample, variant }) => (
      <Specimen key={variant} note={`class type-${variant}`} title={`variant=${variant}`}>
        <Text variant={variant}>{sample}</Text>
      </Specimen>
    ))}
  </>
)
