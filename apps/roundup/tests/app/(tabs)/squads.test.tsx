import { fireEvent, screen, waitFor } from 'expo-router/testing-library'

import type { IBackend } from '../../helpers/fakes'

import { SquadsFixtures } from '../../helpers/squads'

/** The backend of the current test. */
let backend: IBackend

describe('squads list', () => {
  it('shows the empty state with a New squad action', async () => {
    backend = SquadsFixtures.backend([])
    await SquadsFixtures.open(backend, '/squads')

    expect(await screen.findByRole('heading', { name: 'No squads yet' })).toBeOnTheScreen()

    // The floating button is the one create action: the empty state has none of its own.
    expect(screen.getAllByRole('button', { name: 'New squad' })).toHaveLength(1)
  })

  it('shows each squad as a card named by its name, members and role', async () => {
    backend = SquadsFixtures.backend([
      SquadsFixtures.squad('s1', 'Friday crew'),
      SquadsFixtures.squad('s2', 'Goa trip', 'MEMBER'),
    ])

    await SquadsFixtures.open(backend, '/squads')

    expect(
      await screen.findByRole('button', { name: 'Friday crew, 3 members, Admin' }),
    ).toBeOnTheScreen()

    expect(screen.getByRole('button', { name: 'Goa trip, 3 members' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'New squad' })).toBeOnTheScreen()
    expect(screen.queryByRole('heading', { name: 'No squads yet' })).toBeNull()
  })

  it('opens a squad from its card', async () => {
    backend = SquadsFixtures.backend([SquadsFixtures.squad('s1', 'Friday crew')])
    await SquadsFixtures.open(backend, '/squads')

    await fireEvent.press(await screen.findByRole('button', { name: /^Friday crew/ }))

    expect(await screen.findByRole('heading', { name: 'Members' })).toBeOnTheScreen()
    expect(screen).toHavePathname('/squads/s1')
  })

  it('loads the next page when the end of the list comes into view', async () => {
    const squads = Array.from({ length: 26 }, (_, index) =>
      SquadsFixtures.squad(`s${index}`, `Squad ${String(index).padStart(2, '0')}`),
    )

    backend = SquadsFixtures.backend(squads)
    await SquadsFixtures.open(backend, '/squads')
    await screen.findByRole('button', { name: /^Squad 00/ })

    expect(backend.paths.filter((path) => path.startsWith('GET /api/v1/squads?'))).toEqual([
      'GET /api/v1/squads?limit=25',
    ])

    await fireEvent(await screen.findByRole('button', { name: /^Squad 00/ }), 'endReached')

    await waitFor(() => {
      expect(backend.paths).toContain('GET /api/v1/squads?limit=25&cursor=25')
    })
  })

  it('creates a squad and opens it', async () => {
    backend = SquadsFixtures.backend([])
    await SquadsFixtures.open(backend, '/squads')
    await SquadsFixtures.pressNewSquad()
    await fireEvent.changeText(await screen.findByLabelText('Squad name'), 'Sunday football')
    await fireEvent.press(screen.getByRole('button', { name: 'Create squad' }))

    expect(await screen.findByRole('heading', { name: 'Members' })).toBeOnTheScreen()
    expect(backend.paths).toContain('POST /api/v1/squads')
    expect(screen).toHavePathname('/squads/new-1')
  })

  it('refuses an empty name without a request', async () => {
    backend = SquadsFixtures.backend([])
    await SquadsFixtures.open(backend, '/squads')
    await SquadsFixtures.pressNewSquad()
    await fireEvent.press(await screen.findByRole('button', { name: 'Create squad' }))

    expect(
      await screen.findByText('Enter a squad name between 1 and 50 characters.'),
    ).toBeOnTheScreen()

    expect(backend.paths).not.toContain('POST /api/v1/squads')
  })
})
