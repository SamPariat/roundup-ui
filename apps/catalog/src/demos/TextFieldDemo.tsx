import type { ReactElement } from 'react'

import { useState } from 'react'

import { TextField } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * TextField in its resting, helper, error, disabled and icon states and its four keyboard presets.
 * The last two specimens keep their text, so typing and the error state work.
 * @returns The specimens.
 */
export const TextFieldDemo = (): ReactElement => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('aarav@example')
  const emailValid = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(email)

  return (
    <>
      <Specimen title="default">
        <TextField label="Squad name" placeholder="Friday Footy" />
      </Specimen>
      <Specimen title="value">
        <TextField label="Squad name" value="Friday Footy" />
      </Specimen>
      <Specimen title="helper">
        <TextField helper="Members see this when you invite them." label="Squad name" />
      </Specimen>
      <Specimen note="The error replaces the helper and turns the field red." title="error">
        <TextField
          error="A squad needs a name."
          helper="Members see this when you invite them."
          label="Squad name"
        />
      </Specimen>
      <Specimen title="disabled=true">
        <TextField disabled label="Squad name" value="Friday Footy" />
      </Specimen>
      <Specimen title="icon=search">
        <TextField icon="search" label="Find a venue" placeholder="Cafe, bar, bakery" />
      </Specimen>
      <Specimen title="type=email">
        <TextField label="Email" placeholder="name@example.com" type="email" />
      </Specimen>
      <Specimen title="type=password">
        <TextField label="Password" type="password" value="hunter2hunter2" />
      </Specimen>
      <Specimen title="type=number">
        <TextField label="Budget per person" placeholder="500" type="number" />
      </Specimen>
      <Specimen note="Type in the field." title="Interactive">
        <TextField
          helper={`${String(name.length)} characters`}
          label="Squad name"
          onChangeText={setName}
          value={name}
        />
      </Specimen>
      <Specimen note="Fix the address to clear the error." title="Interactive · error from input">
        {emailValid ? (
          <TextField label="Email" onChangeText={setEmail} type="email" value={email} />
        ) : (
          <TextField
            error="Enter a full address, like name@example.com"
            label="Email"
            onChangeText={setEmail}
            type="email"
            value={email}
          />
        )}
      </Specimen>
    </>
  )
}
