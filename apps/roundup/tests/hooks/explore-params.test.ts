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

  it('writes each part, leaving out whatever is the default', () => {
    expect(ExploreParams.queryOf(' brew ')).toBe('brew')
    expect(ExploreParams.queryOf('  ')).toBeUndefined()
    expect(ExploreParams.radiusOf(25)).toBe('25')
    expect(ExploreParams.radiusOf(3)).toBeUndefined()
    expect(ExploreParams.typeOf('bar')).toBe('bar')
  })

  it('reads back what it wrote', () => {
    const written = {
      q: ExploreParams.queryOf('roof'),
      radius: ExploreParams.radiusOf(50),
      type: ExploreParams.typeOf('night_club'),
    }

    expect(ExploreParams.parse(written)).toEqual({
      filter: 'night_club',
      query: 'roof',
      radiusKm: 50,
    })
  })
})
