import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IEventInfo, IEventMember } from '@roundup/core'

import { RSVPStatus } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Badge, Icon, List, ListRow, Text } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'

/** Props for EventMembers. */
export interface IEventMembersProps {
  /** The event whose members are listed. */
  event: IEventInfo
}

/** Props for one member's row. */
interface IMemberRowProps {
  /** The member the row shows. */
  member: IEventMember
}

/**
 * One member of the "Who's coming" list: their avatar and name, what they answered, and a tick
 * for Going or a Maybe badge.
 * @returns The list row.
 */
const MemberRow = ({ member }: IMemberRowProps): ReactElement => {
  const { t } = useT()
  const answer = EventText.memberLine(t, member.rsvp)

  const trailing =
    member.rsvp === RSVPStatus.GOING ? <Icon label={answer} name="check" tone="accent" /> : null

  return (
    <ListRow
      leading={
        <Avatar
          id={member.id}
          name={member.name}
          size={40}
          {...(member.src === undefined ? {} : { src: member.src })}
        />
      }
      subtitle={answer}
      title={member.name}
      trailing={
        member.rsvp === RSVPStatus.MAYBE ? <Badge tone="warning">{answer}</Badge> : trailing
      }
    />
  )
}

/**
 * The "Who's coming" list of the wide layout's aside: every member with their answer, under a
 * count of how many answered each way.
 * @returns The heading, the counts and the list.
 */
export const EventMembers = ({ event }: IEventMembersProps): ReactElement => {
  const { t } = useT()

  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between gap-2">
        <Text heading={2} variant="heading">
          {t('screens.event.whosComing')}
        </Text>
        <Text tone="muted" variant="caption">
          {EventText.rsvpSummary(t, event.rsvpCounts)}
        </Text>
      </View>
      <List>
        {event.members.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </List>
    </View>
  )
}
