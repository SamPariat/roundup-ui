import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { TVenueType } from '@roundup/core'

import { Chip } from '@roundup/ui'

/** Props for FilterChip. */
export interface IFilterChipProps {
  /** The kind of place the chip filters by. */
  type: TVenueType
  /** The chip's text. */
  label: string
  /** Whether this kind is the one selected. */
  selected: boolean
  /** Called with the kind when the chip is pressed. */
  onToggle: (type: TVenueType) => void
}

/**
 * A chip of the Explore filters. Pressing it selects its kind of place, or clears the filter when
 * it is already selected.
 * @returns A pill that is filled while its kind is the one selected.
 */
export const FilterChip = ({ label, onToggle, selected, type }: IFilterChipProps): ReactElement => {
  const handlePress = useCallback((): void => {
    onToggle(type)
  }, [onToggle, type])

  return (
    <Chip onPress={handlePress} selected={selected}>
      {label}
    </Chip>
  )
}
