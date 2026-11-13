import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { ITabItem } from '@roundup/ui'

import { Tabs } from '@roundup/ui'

import type { TSquadEvents } from '@/components/events/SquadEvents'
import type { TFavorites } from '@/components/squads/SquadFavorites'
import type { TSquadTab } from '@/navigation/squad-tab'

import { EventsAside } from '@/components/events/SquadEvents'
import { FavoritesAside } from '@/components/squads/SquadFavorites'

/** Props for WideSquad. */
export interface IWideSquadProps {
  /** The squad's avatar, name and member count. */
  identity: ReactElement
  /** The tabs: the members and the events; the favorites sit in an aside. */
  tabs: ITabItem[]
  /** Which tab shows. */
  tab: TSquadTab
  /** Called with the ID of the tab the person picks. */
  onSelectTab: (id: string) => void
  /** The members block, beside the favorites. */
  members: ReactElement
  /** The events block, beside the card that needs an answer. */
  events: ReactElement
  /** The squad's events, for the aside of the Events tab. */
  eventsState: TSquadEvents
  /** The squad's favorites, for the aside of the Members tab. */
  favoritesState: TFavorites
}

/**
 * The squad's body from 1024 wide: its header, the tabs, and under them either the members with the
 * favorites in an aside, or the events with the card that needs an answer in an aside.
 * @returns The wide layout.
 */
export const WideSquad = ({
  events,
  eventsState,
  favoritesState,
  identity,
  members,
  onSelectTab,
  tab,
  tabs,
}: IWideSquadProps): ReactElement => {
  const showingEvents = tab === 'events'

  return (
    <View className="gap-6">
      {identity}
      <View className="max-w-160">
        <Tabs items={tabs} onChange={onSelectTab} value={showingEvents ? 'events' : 'members'} />
      </View>
      <View className="flex-row items-start gap-8">
        <View className={showingEvents ? 'min-w-0 flex-1' : 'max-w-160 min-w-0 flex-1'}>
          {showingEvents ? events : members}
        </View>
        <View className="w-90 shrink-0">
          {showingEvents ? (
            <EventsAside state={eventsState} />
          ) : (
            <FavoritesAside state={favoritesState} />
          )}
        </View>
      </View>
    </View>
  )
}
