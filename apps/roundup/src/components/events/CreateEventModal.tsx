import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'

import { EventType, useCreateEventViewModel, useDeps } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Chip, DateTimeField, Modal, Text, TextField } from '@roundup/ui'

import { useErrorText } from '@/hooks/useErrorText'
import { Paths } from '@/navigation/paths'

/** Props for CreateEventModal. */
export interface ICreateEventModalProps {
  /** The squad the event is for. */
  squadId: string
  /** The squad's name, which the subtitle says is invited. */
  squadName: string
  /** Called when the person closes the modal, or once the event is made. */
  onClose: () => void
}

/** The kinds of night, in the order the chips show them. */
const TYPES: readonly EventType[] = [EventType.DRINKS, EventType.DINING, EventType.BOTH]

/** Props for one kind of night's chip. */
interface ITypeChipProps {
  /** The kind of night this chip stands for. */
  kind: EventType
  /** The chosen kind of night. */
  value: EventType
  /** Called with the kind the person picks. */
  onSelect: (kind: EventType) => void
}

/**
 * One kind of night as a Chip, chosen when it is the event's type.
 * @returns A button that picks this kind of night.
 */
const TypeChip = ({ kind, onSelect, value }: ITypeChipProps): ReactElement => {
  const { t } = useT()

  const handleSelect = useCallback((): void => {
    onSelect(kind)
  }, [kind, onSelect])

  const labels: Record<EventType, string> = {
    [EventType.BOTH]: t('screens.events.create.types.both'),
    [EventType.DINING]: t('screens.events.create.types.dinner'),
    [EventType.DRINKS]: t('screens.events.create.types.drinks'),
  }

  return (
    <Chip onPress={handleSelect} selected={value === kind}>
      {labels[kind]}
    </Chip>
  )
}

/**
 * The New event modal: a name, the kind of night, when it starts and when voting closes. Making
 * the event closes the modal and opens the new event, a draft the squad can suggest places for.
 * Mount it only while it is open, so each opening starts fresh.
 * @returns The modal with its fields and its two buttons.
 */
export const CreateEventModal = ({
  onClose,
  squadId,
  squadName,
}: ICreateEventModalProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()
  const model = useCreateEventViewModel(squadId)
  const dateField = useDeps().helpers.dates.field
  const { busy, earliest, error, invalid, name, requestId } = model
  const errorText = useErrorText(error, requestId)
  const nameText = useErrorText(invalid.name)
  const startText = useErrorText(invalid.startsAt)
  const votingText = useErrorText(invalid.votingCloses)

  const handleCreate = useCallback(async (): Promise<void> => {
    const id = await model.submit()

    if (id === undefined) return

    onClose()
    router.push(Paths.squadEvent(id, name.trim()))
  }, [model, name, onClose, router])

  // Each input shows the message of its own check; a failed request shows under the form.
  const nameError = nameText === undefined ? {} : { error: nameText }
  const startError = startText === undefined ? {} : { error: startText }
  const votingError = votingText === undefined ? {} : { error: votingText }

  const actions = [
    <Button
      key="create"
      loading={busy}
      loadingLabel={t('screens.events.create.submitting')}
      onPress={handleCreate}
    >
      {t('screens.events.create.submit')}
    </Button>,
    <Button key="cancel" onPress={onClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  return (
    <Modal
      actions={actions}
      busy={busy}
      onClose={onClose}
      subtitle={t('screens.events.create.subtitle', { name: squadName })}
      title={t('screens.events.create.title')}
    >
      <TextField
        label={t('screens.events.create.nameLabel')}
        onChangeText={model.setName}
        placeholder={t('screens.events.create.namePlaceholder')}
        value={name}
        {...nameError}
      />
      <View className="gap-2">
        <Text variant="label">{t('screens.events.create.typeLabel')}</Text>
        <View className="flex-row flex-wrap gap-2">
          {TYPES.map((kind) => (
            <TypeChip key={kind} kind={kind} onSelect={model.setType} value={model.type} />
          ))}
        </View>
      </View>
      <DateTimeField
        format={dateField}
        label={t('screens.events.create.whenLabel')}
        min={earliest}
        onChange={model.setStartsAt}
        value={model.startsAt}
        {...startError}
      />
      <DateTimeField
        format={dateField}
        helper={t('screens.events.create.votingHelper')}
        label={t('screens.events.create.votingLabel')}
        min={earliest}
        onChange={model.setVotingCloses}
        value={model.votingCloses}
        {...votingError}
      />
      {errorText === undefined ? null : (
        <Text aria-live="polite" role="alert" tone="danger" variant="body-sm">
          {errorText}
        </Text>
      )}
    </Modal>
  )
}
