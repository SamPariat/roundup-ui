import { onlineManager } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-native'

import { BACK_ONLINE_MS, useOfflineNotice } from '../../src/network/useOfflineNotice'
import { createTestCore } from '../helpers/wrapper'

describe('useOfflineNotice', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows nothing while online', async () => {
    const { wrapper } = createTestCore()
    const { result } = await renderHook(() => useOfflineNotice(), { wrapper })

    expect(result.current).toBeUndefined()
  })

  it('goes offline, then back online, then hides after two seconds', async () => {
    const { network, wrapper } = createTestCore()
    const { result } = await renderHook(() => useOfflineNotice(), { wrapper })

    await act(() => {
      network.set(false)
    })

    expect(result.current).toEqual({ id: 'offline', message: 'notice.offline', tone: 'error' })

    await act(() => {
      network.set(true)
    })

    expect(result.current).toEqual({
      id: 'back-online',
      message: 'notice.backOnline',
      tone: 'success',
    })

    await act(async () => {
      await jest.advanceTimersByTimeAsync(BACK_ONLINE_MS - 1)
    })

    expect(result.current?.id).toBe('back-online')

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1)
    })

    expect(result.current).toBeUndefined()
  })

  it('shows the offline notice at launch when there is no connection', async () => {
    const { network, wrapper } = createTestCore()

    network.set(false)

    const { result } = await renderHook(() => useOfflineNotice(), { wrapper })

    expect(result.current?.id).toBe('offline')
  })

  it('goes offline again if the connection drops during "back online"', async () => {
    const { network, wrapper } = createTestCore()
    const { result } = await renderHook(() => useOfflineNotice(), { wrapper })

    await act(() => {
      network.set(false)
      network.set(true)
      network.set(false)
    })

    await act(async () => {
      await jest.advanceTimersByTimeAsync(BACK_ONLINE_MS * 2)
    })

    expect(result.current?.id).toBe('offline')
  })

  it('stays quiet when a report says online while already online', async () => {
    const { network, wrapper } = createTestCore()
    const { result } = await renderHook(() => useOfflineNotice(), { wrapper })

    await act(() => {
      network.set(true)
    })

    expect(result.current).toBeUndefined()
  })

  it('points the query client at the same source', async () => {
    const { network, wrapper } = createTestCore()

    await renderHook(() => useOfflineNotice(), { wrapper })

    await act(() => {
      network.set(false)
    })

    expect(onlineManager.isOnline()).toBe(false)

    await act(() => {
      network.set(true)
    })

    expect(onlineManager.isOnline()).toBe(true)
  })
})
