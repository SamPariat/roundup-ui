import { fireEvent, screen } from '@testing-library/react-native'

import { ThemeSwitch } from '../../src/components/ThemeSwitch'
import { RenderHelper } from '../helpers/render'

describe('ThemeSwitch', () => {
  it('is a radio group named Theme', async () => {
    await RenderHelper.withTheme(<ThemeSwitch />)

    expect(screen.getByLabelText('Theme')).toBeOnTheScreen()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('checks System by default', async () => {
    await RenderHelper.withTheme(<ThemeSwitch />)

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked()
  })

  it('checks the chosen value', async () => {
    await RenderHelper.withTheme(<ThemeSwitch value="light" />)

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
  })

  it('reports the new choice', async () => {
    const onChange = jest.fn()

    await RenderHelper.withTheme(<ThemeSwitch onChange={onChange} />)

    await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }))

    expect(onChange).toHaveBeenCalledWith('dark')
  })
})
