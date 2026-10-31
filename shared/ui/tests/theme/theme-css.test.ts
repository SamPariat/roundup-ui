import { declared, forcedDark, forcedLight, latte, mocha } from '../helpers/theme-css.ts'

describe('theme.css', () => {
  it('gives Mocha and Latte the same roles', () => {
    expect(Object.keys(latte)).toEqual(Object.keys(mocha))
  })

  it('declares every role to Tailwind', () => {
    expect(Object.keys(declared)).toEqual(Object.keys(mocha))
  })

  it('uses Mocha as the default and as the manual dark choice', () => {
    expect(declared).toEqual(mocha)
    expect(forcedDark).toEqual(mocha)
  })

  it('uses the same Latte values for the device and for the manual light choice', () => {
    expect(forcedLight).toEqual(latte)
  })

  it('has the page background of each theme', () => {
    expect(mocha['bg']).toBe('#1e1e2e')
    expect(latte['bg']).toBe('#f2e9e1')
  })
})
