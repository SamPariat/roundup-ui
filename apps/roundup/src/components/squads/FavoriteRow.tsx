import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { Image, View } from 'react-native'

import type { IFavoriteRow } from '@roundup/core'
import type { IMenuItem } from '@roundup/ui'

import { useT } from '@roundup/i18n'
import { Button, Icon, ListRow, Menu } from '@roundup/ui'

import { SavedBy } from '@/components/squads/saved-by'
import { Paths } from '@/navigation/paths'

/** Props for FavoriteRow. */
export interface IFavoriteRowProps {
  /** The favorite to draw. */
  favorite: IFavoriteRow
  /** True while this favorite's save is being removed. */
  removing: boolean
  /** Called with the favorite when the person removes their save. */
  onRemove: (favorite: IFavoriteRow) => Promise<boolean>
}

/**
 * The thumbnail of a favorite: its photo, or a bookmark on a tint when it has none.
 * @returns The 48 point tile.
 */
const Thumbnail = ({
  photo,
}: {
  /** The photo's URL. */ photo: string | undefined
}): ReactElement =>
  photo === undefined ? (
    <View className="size-12 items-center justify-center rounded-lg bg-accent-soft">
      <Icon decorative name="bookmark-filled" tone="accent" />
    </View>
  ) : (
    <Image
      accessibilityIgnoresInvertColors
      alt=""
      className="size-12 rounded-lg bg-bg-sunken"
      source={{ uri: photo }}
    />
  )

/**
 * One favorite of a squad: its photo, name and who saved it and when, with the savers named in the subtitle.
 * Pressing the row opens the venue. When the person saved it themselves, a ⋯ beside the row offers
 * Remove from favorites, which takes out their save only, and shows Removing… while it runs.
 * @returns The row, with its options beside it.
 */
export const FavoriteRowItem = ({
  favorite,
  onRemove,
  removing,
}: IFavoriteRowProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const handleOpen = useCallback((): void => {
    router.push(Paths.venue(favorite.id, favorite.name))
  }, [favorite.id, favorite.name, router])

  const items = useMemo(
    (): IMenuItem[] => [
      {
        destructive: true,
        icon: 'trash',
        label: t('screens.squad.favorites.remove'),
        /** Removes the person's save. */
        onPress: (): void => {
          void onRemove(favorite)
        },
      },
    ],
    [favorite, onRemove, t],
  )

  let action: null | ReactElement = null

  if (removing) {
    action = (
      <Button
        loading
        loadingLabel={t('screens.squad.favorites.removing')}
        size="sm"
        variant="ghost"
      >
        {t('screens.squad.favorites.removing')}
      </Button>
    )
  } else if (favorite.savedByMe) {
    action = (
      <Menu items={items} label={t('screens.squad.favorites.options', { name: favorite.name })} />
    )
  }

  return (
    <View className="flex-row items-center pr-2">
      <View className="min-w-0 flex-1">
        <ListRow
          busy={removing}
          chevron
          leading={<Thumbnail photo={favorite.photo} />}
          onPress={handleOpen}
          subtitle={SavedBy.line(t, favorite)}
          title={favorite.name}
        />
      </View>
      {action}
    </View>
  )
}
