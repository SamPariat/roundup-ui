import type { ReactElement } from 'react'

import { useCallback } from 'react'

import { Chip } from '@roundup/ui'

import type { IFrameOption, TFrameWidth } from '../hooks/useFrame'

/** Props for FrameChip. */
export interface IFrameChipProps {
  /** Called with the option's ID when the chip is pressed. */
  onSelect: (id: TFrameWidth) => void
  /** The width this chip stands for. */
  option: IFrameOption
  /** Whether this width is the chosen one. */
  selected: boolean
}

/**
 * A Chip bound to one width, so the list of chips needs no inline handler.
 * @returns The chip, selected when its width is the chosen one.
 */
export const FrameChip = ({ onSelect, option, selected }: IFrameChipProps): ReactElement => {
  const handleSelect = useCallback((): void => {
    onSelect(option.id)
  }, [onSelect, option.id])

  return (
    <Chip onPress={handleSelect} selected={selected}>
      {option.label}
    </Chip>
  )
}
