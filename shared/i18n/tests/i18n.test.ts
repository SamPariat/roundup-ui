import { i18n } from '../src/index.ts'

describe('i18n', () => {
  it('is ready synchronously, with English bundled', () => {
    expect(i18n.isInitialized).toBe(true)
    expect(i18n.language).toBe('en')
    expect(i18n.t('common.close')).toBe('Close')
  })

  it('interpolates values', () => {
    expect(i18n.t('price.level', { level: 2 })).toBe('Price level 2 of 4')
  })

  it('picks the plural form from the count', () => {
    expect(i18n.t('common.members', { count: 1 })).toBe('1 member')
    expect(i18n.t('common.members', { count: 3 })).toBe('3 members')
  })
})
