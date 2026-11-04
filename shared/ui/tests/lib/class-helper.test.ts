import { ClassHelper } from '../../src/lib/class-helper'

describe('ClassHelper.cn', () => {
  it('drops falsy values', () => {
    expect(ClassHelper.cn('p-4', false, undefined, 'gap-2')).toBe('p-4 gap-2')
  })

  it('keeps the color and the type style apart', () => {
    expect(ClassHelper.cn('text-fg', 'type-body')).toBe('text-fg type-body')
  })
})
