import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

import { styleSvg } from '../lib/svg.ts'
import { Text } from './Text.tsx'

/** Props for EmptyState. */
export interface EmptyStateProps {
  /** Headline saying what is missing. */
  title: string
  /** One sentence on what will appear here or what to do. */
  body?: string
  /** Which illustration to draw. Defaults to squads. */
  art?: 'favorites' | 'search' | 'squads'
  /** A button or link below the copy. */
  action?: ReactNode
}

/** Props for the illustration frame. */
interface EmptyArtProps {
  /** Which illustration to draw. */
  kind: NonNullable<EmptyStateProps['art']>
}

// react-native-svg shapes that take Tailwind classes: fill-* and stroke-* pick a role colour.
const StyledSvg = styleSvg(Svg)
const StyledCircle = styleSvg(Circle)
const StyledPath = styleSvg(Path)
const StyledRect = styleSvg(Rect)

/**
 * Magnifying-glass illustration. All three illustrations are shapes only: discs and pills from the
 * radius scale, in role colours.
 * @returns The SVG shapes.
 */
const SearchArt = (): ReactElement => (
  <>
    <StyledCircle
      className="fill-bg-raised stroke-border-strong"
      cx={44}
      cy={44}
      r={20}
      strokeWidth={2}
    />
    <StyledRect
      className="fill-accent"
      height={10}
      rx={5}
      transform="rotate(45 71 67)"
      width={26}
      x={58}
      y={62}
    />
  </>
)

/**
 * Bookmark illustration.
 * @returns The SVG shapes.
 */
const FavoritesArt = (): ReactElement => (
  <>
    <StyledPath className="fill-accent" d="M32 22h32v54l-16-11-16 11z" />
    <StyledCircle className="fill-highlight" cx={70} cy={26} r={8} />
  </>
)

/**
 * People-and-pill illustration.
 * @returns The SVG shapes.
 */
const SquadsArt = (): ReactElement => (
  <>
    <StyledCircle className="fill-accent" cx={36} cy={42} r={14} />
    <StyledCircle className="fill-highlight" cx={62} cy={46} r={11} />
    <StyledRect
      className="fill-bg-raised stroke-border-strong"
      height={16}
      rx={8}
      strokeWidth={2}
      width={60}
      x={18}
      y={62}
    />
  </>
)

/** The illustration for each kind. */
const ART = { favorites: FavoritesArt, search: SearchArt, squads: SquadsArt } as const

/**
 * Draws the chosen illustration on its round wash. Decorative, so hidden from assistive technology.
 * @returns The SVG.
 */
const EmptyArt = ({ kind }: EmptyArtProps): ReactElement => {
  const Art = ART[kind]

  return (
    <StyledSvg aria-hidden height={96} viewBox="0 0 96 96" width={96}>
      <StyledCircle className="fill-accent-soft" cx={48} cy={48} r={48} />
      <Art />
    </StyledSvg>
  )
}

/**
 * A centred placeholder for a screen or list with nothing in it yet: an illustration, a headline, an explanation and an optional action.
 * @returns The placeholder.
 */
export const EmptyState = ({
  action,
  art = 'squads',
  body,
  title,
}: EmptyStateProps): ReactElement => (
  <View className="items-center gap-2 px-6 pt-12 pb-8">
    <View className="mb-4">
      <EmptyArt kind={art} />
    </View>
    <Text className="text-center" heading={2} variant="heading">
      {title}
    </Text>
    {body === undefined ? null : (
      <Text className="mb-4 max-w-70 text-center" tone="muted" variant="body-sm">
        {body}
      </Text>
    )}
    {action}
  </View>
)
