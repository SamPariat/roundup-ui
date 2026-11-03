import type { ReactElement } from 'react'

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback } from 'react'

import { formatPhone, isE164, useCodeViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, OtpInput } from '@roundup/ui'

import { AuthPage } from '../../components/AuthPage.tsx'
import { useErrorText } from '../../hooks/useErrorText.ts'
import { paths } from '../../navigation/paths.ts'

/** Props for CodeForm. */
interface CodeFormProps {
  /** The E.164 number the code was sent to. */
  phone: string
}

/**
 * The code step for a number that is known to be valid.
 * @returns The code field, the Verify button and the way back.
 */
const CodeForm = ({ phone }: CodeFormProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const { busy, code, error, requestId, resend, resendIn, setCode, submit } =
    useCodeViewModel(phone)

  const errorText = useErrorText(error, requestId)

  const back = useCallback(() => {
    router.back()
  }, [router])

  const verify = useCallback(() => {
    void submit()
  }, [submit])

  const sendAgain = useCallback(() => {
    void resend()
  }, [resend])

  return (
    <AuthPage
      body={t('signIn.code.body', { phone: formatPhone(phone) })}
      onBack={back}
      title={t('signIn.code.title')}
    >
      <OtpInput
        label={t('signIn.code.label')}
        onChangeText={setCode}
        onResend={sendAgain}
        resendIn={resendIn}
        value={code}
        {...(errorText === undefined ? {} : { error: errorText })}
      />
      <Button
        block
        loading={busy}
        loadingLabel={t('signIn.code.submitting')}
        onPress={verify}
        size="lg"
      >
        {t('signIn.code.submit')}
      </Button>
      <Button block onPress={back} variant="ghost">
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
  const { phone } = useLocalSearchParams()

  if (typeof phone !== 'string' || !isE164(phone)) return <Redirect href={paths.signIn.phone()} />

  return <CodeForm phone={phone} />
}
