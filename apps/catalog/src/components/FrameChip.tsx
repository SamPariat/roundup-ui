import type { ReactElement } from 'react'

import { useCallback } from 'react'

import { Chip } from '@roundup/ui'

import type { FrameOption, FrameWidth } from '../hooks/useFrame.ts'

/** Props for FrameChip. */
export interface FrameChipProps {
  /** Called with the option's ID when the chip is pressed. */
  onSelect: (id: FrameWidth) => void
  /** The width this chip stands for. */
  option: FrameOption
  /** Whether this width is the chosen one. */
  selected: boolean
}

/**
 * A Chip bound to one width, so the list of chips needs no inline handler.
 * @returns The chip, selected when its width is the chosen one.
 */
export const FrameChip = ({ onSelect, option, selected }: FrameChipProps): ReactElement => {
  const select = useCallback(() => {
    onSelect(option.id)
  }, [onSelect, option.id])

  return (
    <Chip onPress={select} selected={selected}>
      {option.label}
    </Chip>
  )
}
