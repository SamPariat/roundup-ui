import { fireEvent, screen } from '@testing-library/react-native'

import { renderWithTheme } from '../test/render.tsx'
import { ThemeSwitch } from './ThemeSwitch.tsx'

describe('ThemeSwitch', () => {
  it('is a radio group named Theme', async () => {
    await renderWithTheme(<ThemeSwitch />)

    expect(screen.getByLabelText('Theme')).toBeOnTheScreen()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('checks System by default', async () => {
    await renderWithTheme(<ThemeSwitch />)

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked()
  })

  it('checks the chosen value', async () => {
    await renderWithTheme(<ThemeSwitch value="light" />)

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
  })

  it('reports the new choice', async () => {
    const onChange = jest.fn()
    await renderWithTheme(<ThemeSwitch onChange={onChange} />)

    await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }))

    expect(onChange).toHaveBeenCalledWith('dark')
  })
})
