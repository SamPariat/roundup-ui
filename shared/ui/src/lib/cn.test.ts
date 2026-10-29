import { cn } from './cn.ts'

describe('cn', () => {
  it('drops falsy values', () => {
    expect(cn('p-4', false, undefined, 'gap-2')).toBe('p-4 gap-2')
  })

  it('lets the later class win on a conflict', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('keeps the colour and the type style apart', () => {
    expect(cn('text-fg', 'type-body')).toBe('text-fg type-body')
  })
})
