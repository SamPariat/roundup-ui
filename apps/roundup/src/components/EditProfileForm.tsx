import type { ReactElement } from 'react'

import { useCallback } from 'react'
import { Platform, View } from 'react-native'

import { useNameViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Button, TextField } from '@roundup/ui'

import { useBack } from '@/hooks/useBack'
import { useErrorText } from '@/hooks/useErrorText'

/** Props for EditProfileForm. */
export interface IEditProfileFormProps {
  /** Who the person is, which picks the avatar color. */
  id: string
  /** The current name, which the field starts with. */
  name: string
}

/**
 * The Edit profile form: the avatar, the name field and Save. Saving goes back to Profile. There
 * is no photo change yet, since the backend has no upload route. On web a Cancel button sits next to Save.
 * @returns The avatar, the name field and the buttons.
 */
export const EditProfileForm = ({ id, name }: IEditProfileFormProps): ReactElement => {
  const { t } = useT()
  const handleGoBack = useBack()
  const { busy, error, name: typed, requestId, setName, submit } = useNameViewModel(name)
  const errorText = useErrorText(error, requestId)

  const handleSave = useCallback(async (): Promise<void> => {
    if (await submit()) handleGoBack()
  }, [handleGoBack, submit])

  return (
    <View className="max-w-160 gap-6">
      <Avatar id={id} name={name} size={64} />
      <TextField
        helper={t('screens.editProfile.nameHelper')}
        label={t('screens.editProfile.nameLabel')}
        onChangeText={setName}
        value={typed}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
      <View className="gap-3 md:flex-row md:items-center">
        <Button
          block={Platform.OS !== 'web'}
          loading={busy}
          loadingLabel={t('screens.editProfile.saving')}
          onPress={handleSave}
          size="lg"
        >
          {t('screens.editProfile.save')}
        </Button>
        {Platform.OS === 'web' ? (
          <Button onPress={handleGoBack} variant="ghost">
            {t('screens.editProfile.cancel')}
          </Button>
        ) : null}
      </View>
    </View>
  )
}
