import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { Chip } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The filters of the interactive group. */
const FILTERS = ['Cafes', 'Bars', 'Open now', 'Under ₹500'] as const

/** Props for FilterChip. */
interface FilterChipProps {
  /** The filter's text, which is also its ID. */
  label: string
  /** Called with the label when the chip is pressed. */
  onToggle: (label: string) => void
  /** Whether the filter is on. */
  selected: boolean
}

/**
 * A Chip that reports which filter was pressed, so the group needs no inline handler.
 * @returns The chip, filled when its filter is on.
 */
const FilterChip = ({ label, onToggle, selected }: FilterChipProps): ReactElement => {
  const toggle = useCallback(() => {
    onToggle(label)
  }, [label, onToggle])

  return (
    <Chip onPress={toggle} selected={selected}>
      {label}
    </Chip>
  )
}

/**
 * Chip unselected, selected and with an icon, plus a filter group where several can be on at once.
 * @returns The specimens.
 */
export const ChipDemo = (): ReactElement => {
  const [chosen, setChosen] = useState<readonly string[]>(['Cafes'])

  const toggle = useCallback((label: string) => {
    setChosen((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    )
  }, [])

  return (
    <>
      <Specimen title="selected=false (default)">
        <Chip>Cafes</Chip>
      </Specimen>
      <Specimen
        note="A selected chip is filled and swaps its icon for a check."
        title="selected=true"
      >
        <Chip selected>Cafes</Chip>
      </Specimen>
      <Specimen title="icon=pin · selected=false / true">
        <View className="flex-row flex-wrap gap-3">
          <Chip icon="pin">Nearby</Chip>
          <Chip icon="pin" selected>
            Nearby
          </Chip>
        </View>
      </Specimen>
      <Specimen note="Press the chips: each toggles on its own." title="Interactive filter group">
        <View className="flex-row flex-wrap gap-3">
          {FILTERS.map((label) => (
            <FilterChip
              key={label}
              label={label}
              onToggle={toggle}
              selected={chosen.includes(label)}
            />
          ))}
        </View>
      </Specimen>
    </>
  )
}
