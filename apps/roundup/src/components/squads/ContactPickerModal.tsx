import type { ReactElement } from 'react'

import { useCallback } from 'react'
import { Linking, View } from 'react-native'

import { useContactPickerViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Icon, List, ListRow, Modal, Skeleton, Text, TextField } from '@roundup/ui'

import { useErrorText } from '../../hooks/useErrorText'
import { InlineError } from '../InlineError'
import { PersonRow } from './PersonRow'

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
  const picker = useContactPickerViewModel(squadId)
  const errorText = useErrorText(picker.error, picker.requestId)

  const openSettings = useCallback((): void => {
    void Linking.openSettings()
  }, [])

  const add = useCallback((): void => {
    void picker.add().then((added) => {
      if (added) onClose()
    })
  }, [onClose, picker])

  if (picker.phase === 'denied') {
    return (
      <Modal
        actions={[
          <Button key="settings" onPress={openSettings}>
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

  const count = picker.pickedCount

  const actions = [
    <Button
      disabled={count === 0}
      key="add"
      loading={picker.busy && picker.phase === 'ready'}
      loadingLabel={t('addPeople.adding', { count })}
      onPress={add}
    >
      {count === 0 ? t('addPeople.addNone') : t('addPeople.add', { count })}
    </Button>,
    <Button key="cancel" onPress={onClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  const emptyText = picker.query.trim() === '' ? t('addPeople.none') : t('addPeople.noMatch')

  return (
    <Modal
      actions={actions}
      busy={picker.busy && picker.phase === 'ready'}
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
      <InlineError message={errorText} />
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
