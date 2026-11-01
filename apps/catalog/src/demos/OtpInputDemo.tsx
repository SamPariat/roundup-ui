import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { OtpInput } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The code that the interactive specimen accepts. */
const RIGHT_CODE = '123456'

/**
 * OtpInput empty, part-filled, with a countdown, with Resend, in error and at four digits. The
 * last specimen is live: type 123456 to clear it, anything else to see the error.
 * @returns The specimens.
 */
export const OtpInputDemo = (): ReactElement => {
  const [code, setCode] = useState('')
  const [resends, setResends] = useState(0)
  const wrong = code.length === RIGHT_CODE.length && code !== RIGHT_CODE

  const resend = useCallback(() => {
    setResends((count) => count + 1)
    setCode('')
  }, [])

  return (
    <>
      <Specimen title="empty · resendIn=30">
        <OtpInput label="6-digit code" resendIn={30} />
      </Specimen>
      <Specimen title="value=123 · resendIn=0">
        <OtpInput label="6-digit code" resendIn={0} value="123" />
      </Specimen>
      <Specimen title="error">
        <OtpInput error="That code is not right." label="6-digit code" value="123456" />
      </Specimen>
      <Specimen title="length=4">
        <OtpInput label="4-digit code" length={4} resendIn={0} value="12" />
      </Specimen>
      <Specimen
        note={`Type ${RIGHT_CODE} to clear it. Resent ${String(resends)} times.`}
        title="Interactive"
      >
        {wrong ? (
          <OtpInput
            error="That code is not right."
            label="6-digit code"
            onChangeText={setCode}
            onResend={resend}
            resendIn={0}
            value={code}
          />
        ) : (
          <OtpInput
            label="6-digit code"
            onChangeText={setCode}
            onResend={resend}
            resendIn={0}
            value={code}
          />
        )}
      </Specimen>
    </>
  )
}
