import { act, renderHook } from '@testing-library/react-native'

import { usePullRefresh } from '@/hooks/usePullRefresh'

describe('usePullRefresh', () => {
  it('is refreshing while the reload runs and stops when it settles', async () => {
    jest.useFakeTimers()

    const refresh = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 1000)
        }),
    )

    const { result } = await renderHook(() => usePullRefresh(refresh))

    await act(() => {
      void result.current.handleReload()
    })

    expect(result.current.refreshing).toBe(true)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.refreshing).toBe(false)

    jest.useRealTimers()
  })

  it('stops refreshing when the reload fails', async () => {
    const refresh = jest.fn(() => Promise.reject(new Error('offline')))
    const { result } = await renderHook(() => usePullRefresh(refresh))

    await act(async () => {
      await expect(result.current.handleReload()).rejects.toThrow('offline')
    })

    expect(result.current.refreshing).toBe(false)
  })
})
