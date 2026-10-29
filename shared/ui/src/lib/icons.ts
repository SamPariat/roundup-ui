import type { FC } from 'react'
import type { SvgProps } from 'react-native-svg'

import Alert from '../../../../assets/svg/icons/alert.svg'
import Back from '../../../../assets/svg/icons/back.svg'
import Bookmark from '../../../../assets/svg/icons/bookmark.svg'
import BookmarkFilled from '../../../../assets/svg/icons/bookmarkFilled.svg'
import Check from '../../../../assets/svg/icons/check.svg'
import Chevron from '../../../../assets/svg/icons/chevron.svg'
import Clock from '../../../../assets/svg/icons/clock.svg'
import Close from '../../../../assets/svg/icons/close.svg'
import Contacts from '../../../../assets/svg/icons/contacts.svg'
import Device from '../../../../assets/svg/icons/device.svg'
import Edit from '../../../../assets/svg/icons/edit.svg'
import Explore from '../../../../assets/svg/icons/explore.svg'
import History from '../../../../assets/svg/icons/history.svg'
import Info from '../../../../assets/svg/icons/info.svg'
import Logout from '../../../../assets/svg/icons/logout.svg'
import Moon from '../../../../assets/svg/icons/moon.svg'
import More from '../../../../assets/svg/icons/more.svg'
import Phone from '../../../../assets/svg/icons/phone.svg'
import Pin from '../../../../assets/svg/icons/pin.svg'
import Plus from '../../../../assets/svg/icons/plus.svg'
import Profile from '../../../../assets/svg/icons/profile.svg'
import Search from '../../../../assets/svg/icons/search.svg'
import Shield from '../../../../assets/svg/icons/shield.svg'
import Squads from '../../../../assets/svg/icons/squads.svg'
import Star from '../../../../assets/svg/icons/star.svg'
import Sun from '../../../../assets/svg/icons/sun.svg'
import Trash from '../../../../assets/svg/icons/trash.svg'

// Each icon is an SVG file in assets/svg/icons (24-unit grid, 2px round strokes, currentColor),
// turned into a component by react-native-svg-transformer. Set `color` to tint it.
export const ICONS = {
  alert: Alert,
  back: Back,
  bookmark: Bookmark,
  bookmarkFilled: BookmarkFilled,
  check: Check,
  chevron: Chevron,
  clock: Clock,
  close: Close,
  contacts: Contacts,
  device: Device,
  edit: Edit,
  explore: Explore,
  history: History,
  info: Info,
  logout: Logout,
  moon: Moon,
  more: More,
  phone: Phone,
  pin: Pin,
  plus: Plus,
  profile: Profile,
  search: Search,
  shield: Shield,
  squads: Squads,
  star: Star,
  sun: Sun,
  trash: Trash,
} as const satisfies Record<string, FC<SvgProps>>

export type IconName = keyof typeof ICONS
