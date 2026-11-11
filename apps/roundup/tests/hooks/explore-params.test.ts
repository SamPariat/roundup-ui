import { ExploreParams } from '@/hooks/explore-params'

describe('ExploreParams', () => {
  it('reads the words, the kind and the radius out of the parameters', () => {
    expect(ExploreParams.parse({ q: 'brew', radius: '10', type: 'cafe' })).toEqual({
      filter: 'cafe',
      query: 'brew',
      radiusKm: 10,
    })
  })

  it('falls back to the defaults when the parameters are missing', () => {
    expect(ExploreParams.parse({})).toEqual({ filter: undefined, query: '', radiusKm: 3 })
  })

  it.each([
    ['an unknown kind', { type: 'spa' }],
    ['a radius that is not a step', { radius: '4' }],
    ['a radius that is not a number', { radius: 'far' }],
    ['an empty radius', { radius: '' }],
  ])('falls back to the defaults for %s', (_name, params) => {
    expect(ExploreParams.parse(params)).toEqual({ filter: undefined, query: '', radiusKm: 3 })
  })

  it('takes the first of a repeated parameter', () => {
    expect(ExploreParams.parse({ q: ['a', 'b'], type: ['bar', 'cafe'] })).toMatchObject({
      filter: 'bar',
      query: 'a',
    })
  })

  it('writes the search, leaving out whatever is the default', () => {
    expect(ExploreParams.serialize({ filter: 'bar', query: ' brew ', radiusKm: 25 })).toEqual({
      q: 'brew',
      radius: '25',
      type: 'bar',
    })

    expect(ExploreParams.serialize({ query: '', radiusKm: 3 })).toEqual({
      q: undefined,
      radius: undefined,
      type: undefined,
    })

    expect(ExploreParams.serialize({})).toEqual({
      q: undefined,
      radius: undefined,
      type: undefined,
    })
  })

  it('reads back what it wrote', () => {
    const state = { filter: 'night_club' as const, query: 'roof', radiusKm: 50 }
    const written = ExploreParams.serialize(state)

    expect(ExploreParams.parse(written)).toEqual(state)
  })
})
