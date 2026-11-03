import type { ReactElement } from 'react'

import { useCallback } from 'react'

import { useNameViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, TextField } from '@roundup/ui'

import { AuthPage } from '../../components/AuthPage.tsx'
import { useErrorText } from '../../hooks/useErrorText.ts'

/**
 * Sign-in step three, shown to a new person (or one with no name yet): what their squad should
 * call them. Saving the name lets the route guard through to the app, so nothing navigates here.
 * @returns The name field and the Continue button inside the sign-in frame, without a back button.
 */
export default function NameScreen(): ReactElement {
  const { t } = useT()
  const { busy, error, name, requestId, setName, submit } = useNameViewModel()
  const errorText = useErrorText(error, requestId)

  const save = useCallback(() => {
    void submit()
  }, [submit])

  return (
    <AuthPage body={t('signIn.name.body')} title={t('signIn.name.title')}>
      <TextField
        helper={t('signIn.name.helper')}
        label={t('signIn.name.label')}
        onChangeText={setName}
        value={name}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
      <Button
        block
        loading={busy}
        loadingLabel={t('signIn.name.submitting')}
        onPress={save}
        size="lg"
      >
        {t('signIn.name.submit')}
      </Button>
    </AuthPage>
  )
}
