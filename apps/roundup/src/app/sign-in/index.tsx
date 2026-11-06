import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { usePhoneViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, PhoneInput, Text } from '@roundup/ui'

import { AuthPage } from '../../components/AuthPage'
import { useErrorText } from '../../hooks/useErrorText'
import { Paths } from '../../navigation/paths'

/**
 * Sign-in step one: the phone number. Sending the code opens the code screen.
 * @returns The phone field and the Send code button inside the sign-in frame.
 */
export default function PhoneScreen(): ReactElement {
  const { t } = useT()
  const router = useRouter()
  const { busy, error, phone, requestId, setPhone, submit } = usePhoneViewModel()
  const errorText = useErrorText(error, requestId)

  const send = useCallback((): void => {
    void submit().then((e164) => {
      if (e164 !== undefined) router.push(Paths.signInCode({ phone: e164 }))
    })
  }, [router, submit])

  return (
    <AuthPage body={t('signIn.phone.body')} title={t('signIn.phone.title')}>
      <PhoneInput
        helper={t('signIn.phone.helper')}
        label={t('signIn.phone.label')}
        onChangeText={setPhone}
        value={phone}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
      <Button
        block
        loading={busy}
        loadingLabel={t('signIn.phone.submitting')}
        onPress={send}
        size="lg"
      >
        {t('signIn.phone.submit')}
      </Button>
      <Text tone="muted" variant="caption">
        {t('signIn.phone.newHere')}
      </Text>
    </AuthPage>
  )
}
