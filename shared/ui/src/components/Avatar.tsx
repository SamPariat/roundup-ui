import type { VariantProps } from 'class-variance-authority'
import type { ReactElement } from 'react'

import { cva } from 'class-variance-authority'
import { Image, View } from 'react-native'

import type { AvatarTint } from '../lib/avatar-tint.ts'

import { initialsOf, tintOf } from '../lib/avatar-tint.ts'
import { cn } from '../lib/cn.ts'
import { Text } from './Text.tsx'

const avatarVariants = cva('shrink-0 items-center justify-center overflow-hidden rounded-full', {
  variants: {
    size: {
      24: 'size-[24px]',
      28: 'size-[28px]',
      32: 'size-[32px]',
      40: 'size-[40px]',
      48: 'size-[48px]',
      64: 'size-[64px]',
    },
    tint: {
      1: 'bg-avatar-1',
      2: 'bg-avatar-2',
      3: 'bg-avatar-3',
      4: 'bg-avatar-4',
      5: 'bg-avatar-5',
      6: 'bg-avatar-6',
    },
  },
  defaultVariants: { size: 40, tint: 1 },
})

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>

export interface AvatarProps {
  /** Also the accessible name, so every avatar says whose it is. */
  name: string
  /** User or squad ID; picks the initials tint so it stays stable. */
  id?: string
  src?: string
  /** Force one of the six initials tints; normally derived from `id`. */
  tint?: AvatarTint
  /** Fixed steps, because sizes come from classes. */
  size?: AvatarSize
  className?: string
}

const INITIALS_TEXT = {
  24: 'text-[9px]',
  28: 'text-[11px]',
  32: 'text-[12px]',
  40: 'text-[15px]',
  48: 'text-[18px]',
  64: 'text-[24px]',
} as const satisfies Record<AvatarSize, string>

export const Avatar = ({
  className,
  id,
  name,
  size = 40,
  src,
  tint,
}: AvatarProps): ReactElement => (
  <View
    accessibilityLabel={name}
    accessible
    className={cn(avatarVariants({ size, tint: tint ?? tintOf(id ?? name) }), className)}
    role="img"
  >
    {src === undefined ? (
      <Text aria-hidden className={INITIALS_TEXT[size]} maxFontSizeMultiplier={1.2} variant="label">
        {initialsOf(name)}
      </Text>
    ) : (
      <Image accessibilityIgnoresInvertColors alt="" className="size-full" source={{ uri: src }} />
    )}
  </View>
)
