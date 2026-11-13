import type { ReactElement } from 'react'

import { useCallback } from 'react'
import { View } from 'react-native'

import type { RSVPStatus } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Chip } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'

/** Props for RsvpChips. */
export interface IRsvpChipsProps {
  /** The answer to show as chosen: the person's own, or the one being sent. */
  value: RSVPStatus | undefined
  /** Called with the answer the person picks. */
  onSelect: (status: RSVPStatus) => Promise<boolean>
}

/** Props for one answer's chip. */
interface IRsvpChipProps extends IRsvpChipsProps {
  /** The answer this chip stands for. */
  status: RSVPStatus
}

/**
 * One answer as a Chip, chosen when it is the person's answer.
 * @returns A button that picks this answer.
 */
const RsvpChip = ({ onSelect, status, value }: IRsvpChipProps): ReactElement => {
  const { t } = useT()

  const handleSelect = useCallback(async (): Promise<void> => {
    await onSelect(status)
  }, [onSelect, status])

  return (
    <Chip onPress={handleSelect} selected={value === status}>
      {EventText.answer(t, status)}
    </Chip>
  )
}

/**
 * The three answers to "Are you in?" as chips: Going, Maybe and Can't make it.
 * @returns The row of chips.
 */
export const RsvpChips = ({ onSelect, value }: IRsvpChipsProps): ReactElement => (
  <View className="flex-row flex-wrap gap-2">
    {EventText.answers.map((status) => (
      <RsvpChip key={status} onSelect={onSelect} status={status} value={value} />
    ))}
  </View>
)
