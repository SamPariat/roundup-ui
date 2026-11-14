import type { ReactElement } from 'react'

import { useCallback, useMemo, useState } from 'react'
import { Linking, Platform, View } from 'react-native'

import type { ITabItem, TIconName } from '@roundup/ui'

import { useNominateViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, List, Modal, Skeleton, Tabs, Text, TextField, Toast } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'
import { PlaceRow } from '@/components/events/PlaceRow'
import { useDebounced } from '@/hooks/useDebounced'
import { useErrorText } from '@/hooks/useErrorText'

/** Props for NominateSheet. */
export interface INominateSheetProps {
  /** The event the place is suggested for. */
  eventId: string
  /** The squad the event belongs to. */
  squadId: string
  /** The event's name, for the subtitle. */
  eventName: string
  /** Called when the person is done. */
  onClose: () => void
}

/** The tabs of the sheet. */
type TNominateTab = 'favorites' | 'history'

/** The tab the sheet opens on. */
const FIRST_TAB: TNominateTab = 'favorites'

/** A place of the sheet's list, whichever list it comes from. */
interface IPlaceItem {
  /** The place's Google ID. */
  id: string
  /** The icon in front of its name. */
  icon: TIconName
  /** The place's name. */
  name: string
  /** The line under the name; left out when nothing is known of it. */
  subtitle: string | undefined
}

/** How many placeholder rows show while a list loads. */
const PLACEHOLDERS = 4

/**
 * The Suggest a place sheet: a search field, the squad's favorites and the places it has been to
 * as tabs, and the places the typed words find. Each row has its own Suggest button, so Done only
 * closes the sheet. Search needs the person's location, which is only asked for once they type;
 * when it is refused the tabs keep working and a note says so. Mount it only while it is open.
 * @returns The modal with the list and Done.
 */
export const NominateSheet = ({
  eventId,
  eventName,
  onClose,
  squadId,
}: INominateSheetProps): ReactElement => {
  const { t } = useT()

  const [tab, setTab] = useState<TNominateTab>(FIRST_TAB)
  const [text, setText] = useState<string>('')

  const query = useDebounced(text)

  const {
    error,
    favorites,
    favoritesLoading,
    history,
    historyLoading,
    nominate,
    phase,
    requestId,
    results,
    retryLocation,
    searching,
    suggestedIds,
    suggestingId,
  } = useNominateViewModel(eventId, squadId, query)

  const errorText = useErrorText(error, requestId)
  const words = query.trim()
  const busy = suggestingId !== undefined
  const searchDenied = words !== '' && phase === 'denied'
  const showResults = words !== '' && !searchDenied
  // The words still being typed are not searched yet, so the list waits for them.
  const typing = text.trim() !== words

  const tabLoading: Record<TNominateTab, boolean> = {
    favorites: favoritesLoading,
    history: historyLoading,
  }

  const loading = showResults ? searching || typing || phase === 'locating' : tabLoading[tab]

  const emptyText = {
    favorites: t('screens.event.suggest.emptyFavorites'),
    history: t('screens.event.suggest.emptyHistory'),
    results: t('screens.event.suggest.emptyResults'),
  }[showResults ? 'results' : tab]

  const items = useMemo(
    (): ITabItem[] => [
      {
        id: 'favorites',
        label: t('screens.event.suggest.favorites'),
        ...(favoritesLoading ? {} : { count: favorites.length }),
      },
      {
        id: 'history',
        label: t('screens.event.suggest.history'),
        ...(historyLoading ? {} : { count: history.length }),
      },
    ],
    [favorites.length, favoritesLoading, history.length, historyLoading, t],
  )

  const places = useMemo((): IPlaceItem[] => {
    if (showResults) {
      return results.map((venue) => ({
        icon: 'pin',
        id: venue.id,
        name: venue.name,
        subtitle: EventText.venueLine(t, venue),
      }))
    }

    if (tab === 'history') {
      return history.map((visit) => ({
        icon: 'history',
        id: visit.id,
        name: visit.name,
        subtitle: EventText.visitLine(t, visit),
      }))
    }

    return favorites.map((favorite) => ({
      icon: 'bookmark-filled',
      id: favorite.id,
      name: favorite.name,
      subtitle: EventText.favoriteLine(t, favorite),
    }))
  }, [favorites, history, results, showResults, t, tab])

  const actions = useMemo(
    (): ReactElement[] => [
      <Button key="done" onPress={onClose}>
        {t('screens.event.suggest.close')}
      </Button>,
    ],
    [onClose, t],
  )

  const handleOpenSettings = useCallback((): void => {
    void Linking.openSettings()
  }, [])

  const handleTab = useCallback((id: string): void => {
    setTab(id === 'history' ? 'history' : 'favorites')
  }, [])

  const deniedLabel = Platform.select({
    default: t('screens.explore.denied.openSettings'),
    web: t('screens.explore.denied.tryAgain'),
  })

  const deniedPress = Platform.select({ default: handleOpenSettings, web: retryLocation })

  return (
    <Modal
      actions={actions}
      busy={busy}
      onClose={onClose}
      subtitle={t('screens.event.suggest.subtitle', { name: eventName })}
      title={t('screens.event.suggest.title')}
    >
      <TextField
        icon="search"
        label={t('screens.event.suggest.searchLabel')}
        onChangeText={setText}
        placeholder={t('screens.event.suggest.searchPlaceholder')}
        value={text}
      />
      {searchDenied ? (
        <View className="items-start gap-2" role="alert">
          <Text variant="label">{t('screens.explore.denied.title')}</Text>
          <Text tone="muted" variant="body-sm">
            {t('screens.explore.denied.body')}
          </Text>
          <Button onPress={deniedPress} size="sm" variant="secondary">
            {deniedLabel}
          </Button>
        </View>
      ) : null}
      {showResults ? null : <Tabs items={items} onChange={handleTab} value={tab} />}
      {loading ? <Skeleton count={PLACEHOLDERS} variant="item" /> : null}
      {!loading && places.length === 0 ? (
        <Text tone="muted" variant="body-sm">
          {emptyText}
        </Text>
      ) : null}
      {!loading && places.length > 0 ? (
        <List>
          {places.map((place) => (
            <PlaceRow
              busy={busy}
              icon={place.icon}
              id={place.id}
              key={place.id}
              name={place.name}
              onSuggest={nominate}
              subtitle={place.subtitle}
              suggested={suggestedIds.has(place.id)}
              suggesting={suggestingId === place.id}
            />
          ))}
        </List>
      ) : null}
      {errorText === undefined ? null : <Toast tone="error">{errorText}</Toast>}
    </Modal>
  )
}
