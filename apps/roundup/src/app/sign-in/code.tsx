import type { ReactElement } from 'react'

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback } from 'react'

import { useCodeViewModel, useDeps } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, OtpInput } from '@roundup/ui'

import { AuthPage } from '../../components/AuthPage'
import { useErrorText } from '../../hooks/useErrorText'
import { Paths } from '../../navigation/paths'

/** Props for CodeForm. */
interface ICodeFormProps {
  /** The E.164 number the code was sent to. */
  phone: string
}

/**
 * The code step for a number that is known to be valid.
 * @returns The code field, the Verify button and the way back.
 */
const CodeForm = ({ phone }: ICodeFormProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()
  const { helpers } = useDeps()

  const { busy, code, error, requestId, resend, resendIn, setCode, submit } =
    useCodeViewModel(phone)

  const errorText = useErrorText(error, requestId)

  const handleBack = useCallback((): void => {
    router.back()
  }, [router])

  const handleVerify = useCallback((): void => {
    void submit()
  }, [submit])

  const handleSendAgain = useCallback((): void => {
    void resend()
  }, [resend])

  return (
    <AuthPage
      body={t('signIn.code.body', { phone: helpers.phone.format(phone) })}
      onBack={handleBack}
      title={t('signIn.code.title')}
    >
      <OtpInput
        autoFocus
        label={t('signIn.code.label')}
        onChangeText={setCode}
        onResend={handleSendAgain}
        resendIn={resendIn}
        value={code}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
      <Button
        block
        loading={busy}
        loadingLabel={t('signIn.code.submitting')}
        onPress={handleVerify}
        size="lg"
      >
        {t('signIn.code.submit')}
      </Button>
      <Button block onPress={handleBack} variant="ghost">
        {t('signIn.code.changeNumber')}
      </Button>
    </AuthPage>
  )
}

/**
 * Sign-in step two: the six-digit code. The number arrives as the `phone` route parameter; one
 * that is not a valid +91 mobile number sends the person back to the phone screen.
 * @returns The code form, or a redirect to the phone screen.
 */
export default function CodeScreen(): ReactElement {
  const { helpers } = useDeps()
  const { phone } = useLocalSearchParams()

  if (typeof phone !== 'string' || !helpers.phone.isE164(phone))
    return <Redirect href={Paths.signInPhone()} />

  return <CodeForm phone={phone} />
}
