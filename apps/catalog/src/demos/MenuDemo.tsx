import type { ReactElement } from 'react'

import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import type { IMenuItem } from '@roundup/ui'

import { Button, Menu, Text } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * Menu over a stand-in screen, opened from its ⋯ button, with a destructive row last.
 * @returns The specimen.
 */
export const MenuDemo = (): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const [picked, setPicked] = useState<string>('Nothing yet')

  const handleOpen = useCallback((): void => {
    setOpen(true)
  }, [])

  const handleClose = useCallback((): void => {
    setOpen(false)
  }, [])

  const items = useMemo(
    (): IMenuItem[] => [
      {
        icon: 'edit',
        label: 'Rename squad',
        /** Shows that Rename squad was picked. */
        onPress: () => {
          setPicked('Rename squad')
        },
      },
      {
        destructive: true,
        icon: 'logout',
        label: 'Leave squad',
        /** Shows that Leave squad was picked. */
        onPress: () => {
          setPicked('Leave squad')
        },
      },
    ],
    [],
  )

  return (
    <Specimen note="Press ⋯, then a row or anywhere outside." title="destructive last">
      <View className="h-64 rounded-xl bg-bg-sunken p-4">
        <View className="flex-row items-center justify-between">
          <Text tone="muted">Picked: {picked}</Text>
          <Button icon="more" label="Squad options" onPress={handleOpen} variant="ghost" />
        </View>
        <Menu items={items} label="Squad options" onClose={handleClose} top={56} visible={open} />
      </View>
    </Specimen>
  )
}
