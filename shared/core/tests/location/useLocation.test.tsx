import { focusManager } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { useLocation } from '../../src/location/useLocation'
import { FakeLocation } from '../helpers/fakes'
import { TestCore } from '../helpers/wrapper'

describe('useLocation', () => {
  it('is locating, then ready with the position', async () => {
    const location = new FakeLocation()
    const { wrapper } = TestCore.create({ location })
    const { result } = await renderHook(() => useLocation(), { wrapper })

    expect(result.current.phase).toBe('locating')

    await waitFor(() => {
      expect(result.current.phase).toBe('ready')
    })

    expect(result.current.coordinates).toEqual({ lat: 12.9716, lng: 77.5946 })
    expect(location.asked).toBe(1)
    expect(location.reads).toBe(1)
  })

  it('is denied, without reading the position, when access is refused', async () => {
    const location = new FakeLocation('denied')
    const { wrapper } = TestCore.create({ location })
    const { result } = await renderHook(() => useLocation(), { wrapper })

    await waitFor(() => {
      expect(result.current.phase).toBe('denied')
    })

    expect(result.current.coordinates).toBeUndefined()
    expect(location.reads).toBe(0)
  })

  it('is denied when no position is available', async () => {
    const location = new FakeLocation()

    location.unavailable = true

    const { wrapper } = TestCore.create({ location })
    const { result } = await renderHook(() => useLocation(), { wrapper })

    await waitFor(() => {
      expect(result.current.phase).toBe('denied')
    })
  })

  it('asks again on retry and becomes ready once access is given', async () => {
    const location = new FakeLocation('denied')
    const { wrapper } = TestCore.create({ location })
    const { result } = await renderHook(() => useLocation(), { wrapper })

    await waitFor(() => {
      expect(result.current.phase).toBe('denied')
    })

    location.permission = 'granted'

    await act(() => {
      result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.phase).toBe('ready')
    })

    expect(location.asked).toBe(2)
  })

  describe('when the app comes back to the foreground', () => {
    afterEach(() => {
      focusManager.setFocused()
    })

    it('asks again after a refusal', async () => {
      const location = new FakeLocation('denied')
      const { wrapper } = TestCore.create({ location })
      const { result } = await renderHook(() => useLocation(), { wrapper })

      await waitFor(() => {
        expect(result.current.phase).toBe('denied')
      })

      location.permission = 'granted'

      await act(() => {
        focusManager.setFocused(false)
        focusManager.setFocused(true)
      })

      await waitFor(() => {
        expect(result.current.phase).toBe('ready')
      })

      expect(location.asked).toBe(2)
    })

    it('keeps a known position without reading it again', async () => {
      const location = new FakeLocation()
      const { wrapper } = TestCore.create({ location })
      const { result } = await renderHook(() => useLocation(), { wrapper })

      await waitFor(() => {
        expect(result.current.phase).toBe('ready')
      })

      await act(() => {
        focusManager.setFocused(false)
        focusManager.setFocused(true)
      })

      expect(result.current.phase).toBe('ready')
      expect(location.asked).toBe(1)
      expect(location.reads).toBe(1)
    })
  })
})
