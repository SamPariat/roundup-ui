import type { ReactElement } from 'react'

import { Rating } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * Rating with and without a review count, at the top and the bottom of the scale.
 * @returns The specimens.
 */
export const RatingDemo = (): ReactElement => (
  <>
    <Specimen title="value=4.6 · count=1280">
      <Rating count={1280} value={4.6} />
    </Specimen>
    <Specimen title="value=3.8 (no count)">
      <Rating value={3.8} />
    </Specimen>
    <Specimen title="value=5 · count=12">
      <Rating count={12} value={5} />
    </Specimen>
    <Specimen title="value=1.2 · count=3">
      <Rating count={3} value={1.2} />
    </Specimen>
  </>
)
