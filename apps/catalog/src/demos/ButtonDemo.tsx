import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { Button, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The button colour treatments. */
const VARIANTS = ['primary', 'secondary', 'ghost', 'destructive'] as const

/** The button height steps. */
const SIZES = ['sm', 'md', 'lg'] as const

/**
 * Every Button variant, size and state, plus one that really sends: press it to see the loading state.
 * @returns The specimens.
 */
export const ButtonDemo = (): ReactElement => {
  const [sending, setSending] = useState(false)

  const send = useCallback((): void => {
    setSending(true)

    setTimeout(() => {
      setSending(false)
    }, 2000)
  }, [])

  return (
    <>
      {VARIANTS.map((variant) => (
        <Specimen key={variant} title={`variant=${variant}`}>
          <View className="flex-row flex-wrap items-center gap-3">
            {SIZES.map((size) => (
              <Button key={size} size={size} variant={variant}>
                {`Size ${size}`}
              </Button>
            ))}
          </View>
        </Specimen>
      ))}
      <Specimen title="icon=plus · with text">
        <Button icon="plus">Add member</Button>
      </Specimen>
      <Specimen note="An icon-only button names itself with label." title="icon=close · icon-only">
        <View className="flex-row gap-3">
          {SIZES.map((size) => (
            <Button icon="close" key={size} label="Close" size={size} variant="secondary" />
          ))}
        </View>
      </Specimen>
      <Specimen title="block=true">
        <Button block>Continue with phone</Button>
      </Specimen>
      <Specimen title="disabled=true">
        <View className="flex-row flex-wrap gap-3">
          {VARIANTS.map((variant) => (
            <Button disabled key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </View>
      </Specimen>
      <Specimen
        note="Shows a spinner and never gets narrower; a longer label widens it. Busy buttons ignore presses."
        title="loading=true · loadingLabel"
      >
        <View className="flex-row flex-wrap items-center gap-3">
          {SIZES.map((size) => (
            <Button key={size} loading loadingLabel="Sending code…" size={size}>
              Send code
            </Button>
          ))}
        </View>
      </Specimen>
      <Specimen
        note="No loadingLabel: the spinner alone, at the resting width."
        title="loading=true"
      >
        <View className="flex-row flex-wrap items-center gap-3">
          <Button icon="plus" loading>
            Add member
          </Button>
          <Button loading variant="secondary">
            Save
          </Button>
        </View>
      </Specimen>
      <Specimen title="loading=true · block">
        <Button block loading loadingLabel="Checking code…">
          Verify
        </Button>
      </Specimen>
      <Specimen note="Press it: it loads for two seconds." title="Interactive">
        <Button loading={sending} loadingLabel="Sending code…" onPress={send}>
          Send code
        </Button>
        <Text tone="muted" variant="caption">
          {sending ? 'Sending…' : 'Idle'}
        </Text>
      </Specimen>
    </>
  )
}
