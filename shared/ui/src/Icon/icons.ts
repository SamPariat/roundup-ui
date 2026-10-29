// 24-unit grid, 2px round strokes. Paths come from the design system's icon set.
export interface IconShape {
  tag: 'circle' | 'path' | 'rect'
  attributes: Record<string, number | string>
  filled?: boolean
}

const path = (d: string, filled = false): IconShape => ({ tag: 'path', attributes: { d }, filled })
const circle = (cx: number, cy: number, r: number, filled = false): IconShape => ({
  tag: 'circle',
  attributes: { cx, cy, r },
  filled,
})
const rect = (x: number, y: number, width: number, height: number, rx: number): IconShape => ({
  tag: 'rect',
  attributes: { x, y, width, height, rx },
})

export const ICONS = {
  back: [path('M15 18l-6-6 6-6')],
  chevron: [path('M9 18l6-6-6-6')],
  plus: [path('M12 5v14M5 12h14')],
  close: [path('M18 6L6 18M6 6l12 12')],
  check: [path('M20 6L9 17l-5-5')],
  search: [circle(11, 11, 7), path('M20 20l-3.5-3.5')],
  squads: [
    circle(9, 8, 3.5),
    path('M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5'),
    circle(17, 9, 2.5),
    path('M17.5 14.6c2 .4 3.5 2.2 3.5 4.6'),
  ],
  explore: [circle(12, 12, 9), path('M15.5 8.5l-2 5-5 2 2-5z')],
  profile: [circle(12, 8, 4), path('M4 21c0-4 3.6-7 8-7s8 3 8 7')],
  star: [path('M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', true)],
  bookmark: [path('M6 3h12v18l-6-4-6 4z')],
  bookmarkFilled: [path('M6 3h12v18l-6-4-6 4z', true)],
  pin: [path('M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z'), circle(12, 9.5, 2.5)],
  clock: [circle(12, 12, 9), path('M12 7v5l3 2')],
  history: [path('M3 12a9 9 0 1 0 3-6.7'), path('M3 4v5h5'), path('M12 8v4l3 2')],
  more: [circle(5, 12, 1.5, true), circle(12, 12, 1.5, true), circle(19, 12, 1.5, true)],
  logout: [path('M15 4h4v16h-4'), path('M10 8l-4 4 4 4'), path('M6 12h10')],
  trash: [path('M4 7h16'), path('M9 7V4h6v3'), path('M6 7l1 13h10l1-13')],
  info: [circle(12, 12, 9), path('M12 11v5M12 8h.01')],
  alert: [path('M12 3l10 18H2z'), path('M12 10v4M12 17h.01')],
  shield: [path('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z')],
  phone: [
    path(
      'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    ),
  ],
  edit: [path('M4 20h4L19 9l-4-4L4 16z')],
  sun: [
    circle(12, 12, 4),
    path(
      'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    ),
  ],
  moon: [path('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z')],
  device: [rect(7, 2, 10, 20, 2), path('M11 18h2')],
  contacts: [
    rect(4, 3, 16, 18, 2),
    circle(12, 10, 3),
    path('M7.5 17c.8-2 2.5-3 4.5-3s3.7 1 4.5 3'),
  ],
} as const satisfies Record<string, readonly IconShape[]>

export type IconName = keyof typeof ICONS
