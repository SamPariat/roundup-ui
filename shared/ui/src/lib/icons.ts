import type { FC } from 'react'
import type { SvgProps } from 'react-native-svg'

import type { Styled } from './svg.ts'

import Alert from '../../../../assets/svg/icons/alert.svg'
import Back from '../../../../assets/svg/icons/back.svg'
import BookmarkFilled from '../../../../assets/svg/icons/bookmark-filled.svg'
import Bookmark from '../../../../assets/svg/icons/bookmark.svg'
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
import { styleSvg } from './svg.ts'

/**
 * Each icon is an SVG file in assets/svg/icons (24-unit grid, 2px round strokes, currentColor),
 * turned into a component by react-native-svg-transformer. A `text-*` class tints it.
 */
export const ICONS = {
  alert: styleSvg(Alert),
  back: styleSvg(Back),
  bookmark: styleSvg(Bookmark),
  'bookmark-filled': styleSvg(BookmarkFilled),
  check: styleSvg(Check),
  chevron: styleSvg(Chevron),
  clock: styleSvg(Clock),
  close: styleSvg(Close),
  contacts: styleSvg(Contacts),
  device: styleSvg(Device),
  edit: styleSvg(Edit),
  explore: styleSvg(Explore),
  history: styleSvg(History),
  info: styleSvg(Info),
  logout: styleSvg(Logout),
  moon: styleSvg(Moon),
  more: styleSvg(More),
  phone: styleSvg(Phone),
  pin: styleSvg(Pin),
  plus: styleSvg(Plus),
  profile: styleSvg(Profile),
  search: styleSvg(Search),
  shield: styleSvg(Shield),
  squads: styleSvg(Squads),
  star: styleSvg(Star),
  sun: styleSvg(Sun),
  trash: styleSvg(Trash),
} as const satisfies Record<string, FC<Styled<SvgProps>>>

/** The name of every icon in assets/svg/icons. */
export type IconName = keyof typeof ICONS
