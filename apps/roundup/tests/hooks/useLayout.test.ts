import { Layout } from '@/hooks/useLayout'

// 360 phone, 466 Duo folded, 626 Duo open portrait, 768 tablet, 890 Duo open landscape, 1024 and 1440 desktop.
describe('Layout.forWidth', () => {
  it.each([
    [360, 'bottom', 16],
    [466, 'bottom', 16],
    [626, 'bottom', 16],
    [768, 'bottom', 32],
    [890, 'bottom', 32],
    [1024, 'side', 32],
    [1440, 'side', 32],
  ] as const)('at %i wide uses the %s nav with a %i gutter', (width, nav, gutter) => {
    expect(Layout.forWidth(width)).toMatchObject({ nav, gutter })
  })
})

describe('Layout.columnsFor', () => {
  it.each([
    [0, 16, 1],
    [390, 16, 1],
    [776, 32, 2],
    [1024, 32, 3],
    [1280, 32, 3],
    [2000, 32, 3],
  ])(
    'gives a %i point list with a %i gutter %i columns of at least 280',
    (width, gutter, columns) => {
      expect(Layout.columnsFor(width, gutter)).toBe(columns)
    },
  )
})
