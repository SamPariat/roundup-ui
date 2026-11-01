import type { ReactElement } from 'react'

import { useState } from 'react'

import { PhoneInput } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * PhoneInput in its resting, helper, error and disabled states, and one that keeps what is typed.
 * @returns The specimens.
 */
export const PhoneInputDemo = (): ReactElement => {
  const [phone, setPhone] = useState('')

  return (
    <>
      <Specimen title="default">
        <PhoneInput label="Phone number" />
      </Specimen>
      <Specimen title="value">
        <PhoneInput label="Phone number" value="9876543210" />
      </Specimen>
      <Specimen title="helper">
        <PhoneInput helper="We will text you a code." label="Phone number" />
      </Specimen>
      <Specimen title="error">
        <PhoneInput error="Enter a 10-digit number." label="Phone number" value="98765" />
      </Specimen>
      <Specimen title="disabled=true">
        <PhoneInput disabled label="Phone number" value="9876543210" />
      </Specimen>
      <Specimen note="Type digits; the field keeps them." title="Interactive">
        <PhoneInput label="Phone number" onChangeText={setPhone} value={phone} />
      </Specimen>
    </>
  )
}
