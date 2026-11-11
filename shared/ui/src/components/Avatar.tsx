import type { VariantProps } from 'class-variance-authority'
import type { ReactElement } from 'react'

import { cva } from 'class-variance-authority'
import { Image, View } from 'react-native'

import type { TAvatarTint } from '../lib/avatar-tint'
import type { TTextProps } from './Text'

import { AvatarTint } from '../lib/avatar-tint'
import { cn } from '../lib/cn'
import { Text } from './Text'

const avatarVariants = cva('shrink-0 items-center justify-center overflow-hidden rounded-full', {
  variants: {
    size: {
      24: 'size-6',
      28: 'size-7',
      32: 'size-8',
      40: 'size-10',
      48: 'size-12',
      64: 'size-16',
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

/** The pixel sizes an avatar comes in; each maps to one class so Tailwind can see it. */
export type TAvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>

/** Props for Avatar. */
export interface IAvatarProps {
  /** Also the accessible name, so every avatar says whose it is. */
  name: string
  /** User or squad ID; picks the initials tint so it stays stable. */
  id?: string
  /** Photo URL. Without it (or while it is missing) the initials are drawn instead. */
  src?: string
  /** Force one of the six initials tints; normally derived from `id`. */
  tint?: TAvatarTint
  /** Fixed steps, because sizes come from classes. */
  size?: TAvatarSize
  /** Extra classes for placement, such as a negative margin when stacked. */
  className?: string
}

/** The type style of the initials at each avatar size, all from the type scale. */
const INITIALS_VARIANT: Record<TAvatarSize, TTextProps['variant']> = {
  24: 'caption',
  28: 'caption',
  32: 'caption',
  40: 'label',
  48: 'body-strong',
  64: 'title',
}

/**
 * A round photo of a person or squad, falling back to tinted initials.
 * @returns The avatar, an image named after its owner.
 */
export const Avatar = ({
  className,
  id,
  name,
  size = 40,
  src,
  tint,
}: IAvatarProps): ReactElement => (
  <View
    accessibilityLabel={name}
    accessible
    className={cn(avatarVariants({ size, tint: tint ?? AvatarTint.tintOf(id ?? name) }), className)}
    role="img"
  >
    {src === undefined ? (
      <Text aria-hidden maxFontSizeMultiplier={1.2} variant={INITIALS_VARIANT[size]}>
        {AvatarTint.initialsOf(name)}
      </Text>
    ) : (
      <Image accessibilityIgnoresInvertColors alt="" className="size-full" source={{ uri: src }} />
    )}
  </View>
)
