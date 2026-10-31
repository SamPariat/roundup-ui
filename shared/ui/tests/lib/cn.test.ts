import { cn } from '../../src/lib/cn.ts'

describe('cn', () => {
  it('drops falsy values', () => {
    expect(cn('p-4', false, undefined, 'gap-2')).toBe('p-4 gap-2')
  })

  it('keeps the colour and the type style apart', () => {
    expect(cn('text-fg', 'type-body')).toBe('text-fg type-body')
  })
})
