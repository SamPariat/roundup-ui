import type { ReactElement } from 'react'

import { Price } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The price levels: 0 is unknown, 1 to 4 light that many marks. */
const LEVELS = [1, 2, 3, 4] as const

/**
 * Price from one to four marks, and the unknown level, which draws nothing.
 * @returns The specimens.
 */
export const PriceDemo = (): ReactElement => (
  <>
    {LEVELS.map((level) => (
      <Specimen key={level} title={`level=${String(level)}`}>
        <Price level={level} />
      </Specimen>
    ))}
    <Specimen note="Unknown draws nothing, so the box below is empty." title="level=0">
      <Price level={0} />
    </Specimen>
  </>
)
