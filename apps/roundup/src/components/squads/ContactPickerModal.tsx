import type { ReactElement } from 'react'

import { useCallback, useMemo } from 'react'
import { Linking, View } from 'react-native'

import { useContactPickerViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Icon, List, ListRow, Modal, Skeleton, Text, TextField, Toast } from '@roundup/ui'

import { PersonRow } from './PersonRow'
import { useErrorText } from '@/hooks/useErrorText'
import { useNotify } from '@/hooks/useNotify'

/** Props for ContactPickerModal. */
export interface IContactPickerModalProps {
  /** The squad people are added to. */
  squadId: string
  /** Called when the person closes the modal, or once everyone ticked is added. */
  onClose: () => void
  /** Called when the person would rather type a number. */
  onTypeNumber: () => void
}

/**
 * The contacts picker. It asks for access when it opens. Without access it explains what the
 * numbers are for and offers Settings or typing a number; with access it lists the contacts who
 * are on Roundup, with a search field and a tick on each person picked. Below the list sits a
 * disabled row for inviting people who are not on Roundup, which does not exist yet.
 * @returns The modal for whichever step the picker is on.
 */
export const ContactPickerModal = ({
  onClose,
  onTypeNumber,
  squadId,
}: IContactPickerModalProps): ReactElement => {
  const { t } = useT()
  const notify = useNotify()

  const picker = useContactPickerViewModel(squadId)
  const { add, busy, phase, pickedCount } = picker
  // Adding is busy only once the contacts are in, not while they load.
  const adding = busy && phase === 'ready'
  const errorText = useErrorText(picker.error, picker.requestId)

  const handleOpenSettings = useCallback((): void => {
    void Linking.openSettings()
  }, [])

  // The sheet closes once they are in, so the notice over the app says how many joined.
  const handleAdd = useCallback(async (): Promise<void> => {
    if (!(await add())) return

    notify({
      id: `added-${squadId}-${String(pickedCount)}`,
      message: t('notices.added', { count: pickedCount }),
      tone: 'success',
    })

    onClose()
  }, [add, notify, onClose, pickedCount, squadId, t])

  const actions = useMemo(
    (): ReactElement[] => [
      <Button
        disabled={pickedCount === 0}
        key="add"
        loading={adding}
        loadingLabel={t('addPeople.adding', { count: pickedCount })}
        onPress={handleAdd}
      >
        {pickedCount === 0 ? t('addPeople.addNone') : t('addPeople.add', { count: pickedCount })}
      </Button>,
      <Button key="cancel" onPress={onClose} variant="ghost">
        {t('common.cancel')}
      </Button>,
    ],
    [adding, handleAdd, onClose, pickedCount, t],
  )

  if (picker.phase === 'denied') {
    return (
      <Modal
        actions={[
          <Button key="settings" onPress={handleOpenSettings}>
            {t('addPeople.denied.openSettings')}
          </Button>,
          <Button key="type" onPress={onTypeNumber} variant="ghost">
            {t('addPeople.denied.typeNumber')}
          </Button>,
        ]}
        body={t('addPeople.denied.body')}
        onClose={onClose}
        title={t('addPeople.denied.title')}
      />
    )
  }

  const emptyText = picker.query.trim() === '' ? t('addPeople.none') : t('addPeople.noMatch')

  return (
    <Modal
      actions={actions}
      busy={adding}
      onClose={onClose}
      subtitle={t('addPeople.subtitle')}
      title={t('addPeople.title')}
    >
      <TextField
        icon="search"
        label={t('addPeople.searchLabel')}
        onChangeText={picker.setQuery}
        placeholder={t('addPeople.searchLabel')}
        value={picker.query}
      />
      {picker.phase === 'loading' ? <Skeleton count={4} /> : null}
      {picker.phase === 'ready' && picker.people.length === 0 ? (
        <Text tone="muted" variant="body-sm">
          {emptyText}
        </Text>
      ) : null}
      {picker.people.length > 0 ? (
        <List>
          {picker.people.map((person) => (
            <PersonRow
              key={person.id}
              onToggle={picker.toggle}
              person={person}
              picked={picker.isPicked(person.id)}
            />
          ))}
        </List>
      ) : null}
      {errorText === undefined ? null : <Toast tone="error">{errorText}</Toast>}
      <View aria-disabled className="opacity-50" pointerEvents="none">
        <List>
          <ListRow
            leading={<Icon decorative name="contacts" />}
            subtitle={t('addPeople.inviteHint')}
            title={t('addPeople.inviteTitle')}
          />
        </List>
      </View>
    </Modal>
  )
}
