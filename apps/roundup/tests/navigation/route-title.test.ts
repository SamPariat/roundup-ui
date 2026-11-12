import { RouteTitle } from '@/navigation/route-title'

describe('RouteTitle.of', () => {
  it('reads the title query parameter', () => {
    expect(RouteTitle.of({ squadId: 's1', title: 'Friday crew' })).toBe('Friday crew')
  })

  it.each([undefined, {}, { title: '' }, { title: 3 }])('has none for %j', (params) => {
    expect(RouteTitle.of(params)).toBeUndefined()
  })
})
