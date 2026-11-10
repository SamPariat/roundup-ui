import { Phone } from '../../src/helpers/phone'

/** The helper under test. */
const phone = new Phone()

describe('Phone', () => {
  it('keeps digits only, at most ten, and drops a pasted country code', () => {
    expect(phone.toNationalDigits('98a76-54 3210999')).toBe('9876543210')
    expect(phone.toNationalDigits('+91 98765 43210')).toBe('9876543210')
  })

  it.each([
    ['9876543210', true],
    ['5876543210', false],
    ['98765', false],
  ])('validates %s as %s', (digits, valid) => {
    expect(phone.isValidMobile(digits)).toBe(valid)
  })

  it('builds, checks and formats E.164 numbers', () => {
    expect(phone.toE164('9876543210')).toBe('+919876543210')
    expect(phone.isE164('+919876543210')).toBe(true)
    expect(phone.isE164('9876543210')).toBe(false)
    expect(phone.format('+919876543210')).toBe('+91 98765 43210')
  })
})
