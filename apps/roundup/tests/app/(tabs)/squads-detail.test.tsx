import { fireEvent, screen, waitFor } from 'expo-router/testing-library'
import { Platform } from 'react-native'

import type { IBackend } from '../../helpers/fakes'

import { SquadsFixtures } from '../../helpers/squads'

/** The backend of the current test. */
let backend: IBackend

describe('squad page', () => {
  beforeEach(() => {
    // Android keeps the options button in the page; iOS puts it in the native header.
    jest.replaceProperty(Platform, 'OS', 'android')
    backend = SquadsFixtures.backend([SquadsFixtures.squad('s1', 'Friday crew')])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the members with their roles, and your own row says you', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')

    expect(await screen.findByRole('heading', { name: 'Members' })).toBeOnTheScreen()
    expect(screen.getByText('3 members · Started by you on 1st Jan 2026')).toBeOnTheScreen()
    expect(screen.getByText('Asha Rao (you)')).toBeOnTheScreen()
    expect(screen.getAllByText('Admin')).toHaveLength(2)
  })

  it('lets an admin add people, open member actions and open the options', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')

    expect(await screen.findByRole('button', { name: 'Add people' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Squad options' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Meera Iyer' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Kabir Rao' })).toBeOnTheScreen()
  })

  it('opens nothing for your own row', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')
    await screen.findByText('Asha Rao (you)')

    expect(screen.queryByRole('button', { name: /Asha Rao/ })).toBeNull()
  })

  it('gives a plain member no add people and no member actions', async () => {
    backend = SquadsFixtures.backend([SquadsFixtures.squad('s1', 'Friday crew', 'MEMBER')])
    await SquadsFixtures.open(backend, '/squads/s1')
    await screen.findByText('Meera Iyer')

    expect(screen.queryByRole('button', { name: 'Add people' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Meera Iyer' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Squad options' })).toBeOnTheScreen()
  })

  it('offers Make admin for a member and Remove admin for an admin', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Meera Iyer' }))

    expect(await screen.findByRole('button', { name: /^Make admin/ })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /^Remove admin/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Remove from squad' })).toBeOnTheScreen()
  })

  it('makes a member an admin and closes the actions', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Meera Iyer' }))
    await fireEvent.press(await screen.findByRole('button', { name: /^Make admin/ }))

    await waitFor(() => {
      expect(backend.paths).toContain('PATCH /api/v1/squads/s1/members/u2')
    })

    await waitFor(() => {
      expect(screen.getAllByText('Admin')).toHaveLength(3)
    })

    expect(screen.queryByRole('button', { name: /^Make admin/ })).toBeNull()
    expect(await screen.findByText('Meera Iyer is now an admin')).toBeOnTheScreen()
  })

  it('removes an admin back to member', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Kabir Rao' }))
    await fireEvent.press(await screen.findByRole('button', { name: /^Remove admin/ }))

    await waitFor(() => {
      expect(backend.paths).toContain('PATCH /api/v1/squads/s1/members/u3')
    })

    await waitFor(() => {
      expect(screen.getAllByText('Admin')).toHaveLength(1)
    })

    expect(await screen.findByText('Kabir Rao is no longer an admin')).toBeOnTheScreen()
  })

  it('removes a member from the squad', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Meera Iyer' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Remove from squad' }))

    await waitFor(() => {
      expect(backend.paths).toContain('DELETE /api/v1/squads/s1/members/u2')
    })

    await waitFor(() => {
      expect(screen.queryByText('Meera Iyer')).toBeNull()
    })

    expect(await screen.findByText('Removed Meera Iyer from the squad')).toBeOnTheScreen()
  })

  it('renames the squad', async () => {
    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Squad options' }))
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Rename squad' }))

    const field = await screen.findByLabelText('Squad name')

    expect(field).toHaveProp('value', 'Friday crew')

    await fireEvent.changeText(field, 'Saturday crew')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(backend.paths).toContain('PATCH /api/v1/squads/s1')
    })

    await waitFor(() => {
      expect(screen.queryByLabelText('Squad name')).toBeNull()
    })

    expect(backend.squads?.[0]?.name).toBe('Saturday crew')
  })

  it('offers no rename to a plain member', async () => {
    backend = SquadsFixtures.backend([SquadsFixtures.squad('s1', 'Friday crew', 'MEMBER')])
    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Squad options' }))

    expect(await screen.findByRole('menuitem', { name: 'Leave squad' })).toBeOnTheScreen()
    expect(screen.queryByRole('menuitem', { name: 'Rename squad' })).toBeNull()
  })

  it('confirms before leaving, then goes back to the list without a not-found flash', async () => {
    backend = SquadsFixtures.backend([
      { id: 's1', members: [SquadsFixtures.me()], name: 'Friday crew' },
    ])

    await SquadsFixtures.open(backend, '/squads/s1')
    await fireEvent.press(await screen.findByRole('button', { name: 'Squad options' }))
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Leave squad' }))

    expect(await screen.findByText('Leave Friday crew?')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Leave squad' }))

    expect(await screen.findByRole('heading', { name: 'No squads yet' })).toBeOnTheScreen()
    expect(screen).toHavePathname('/squads')
    expect(screen.queryByText('Squad not found')).toBeNull()
    expect(backend.paths).toContain('DELETE /api/v1/squads/s1/members/u1')
    expect(await screen.findByText('You left Friday crew')).toBeOnTheScreen()
  })

  it('shows not found for a squad that is not there', async () => {
    await SquadsFixtures.open(backend, '/squads/missing')

    expect(await screen.findByRole('heading', { name: 'Squad not found' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Go to your squads' })).toBeOnTheScreen()
  })
})
