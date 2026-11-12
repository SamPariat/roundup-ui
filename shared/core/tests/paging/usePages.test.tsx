import { focusManager } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import type { IPage, IUsePagesOptions } from '../../src/paging/usePages'

import { usePages } from '../../src/paging/usePages'
import { TestCore } from '../helpers/wrapper'

/** A page of the fake list: its number, and the cursor of the next page. */
interface IFakePage extends IPage {
  /** The page's number, and where the next starts. */
  data: {
    /** The page's own number. */
    n: number
    /** Where the next page starts; null on the last. */
    nextCursor: null | string
  }
}

/**
 * Builds a list of three pages whose cursors are their numbers, and records each request.
 * @param asked - Receives the cursor of every request.
 * @returns The function that asks for a page.
 */
const threePages =
  (asked: (string | undefined)[]) =>
  (cursor: string | undefined): Promise<IFakePage> => {
    asked.push(cursor)

    const n = cursor === undefined ? 1 : Number(cursor)

    return Promise.resolve({ data: { n, nextCursor: n < 3 ? String(n + 1) : null } })
  }

/**
 * Renders the hook over a list of three pages.
 * @param asked - Receives the cursor of every request.
 * @param extra - More options, such as refetchOnFocus.
 * @returns The rendered hook.
 */
const renderPages = (
  asked: (string | undefined)[],
  extra: Partial<IUsePagesOptions<IFakePage>> = {},
): ReturnType<typeof renderHook<ReturnType<typeof usePages<IFakePage>>, undefined>> => {
  const { wrapper } = TestCore.create()

  return renderHook(
    () => usePages<IFakePage>({ fetchPage: threePages(asked), queryKey: ['pages'], ...extra }),
    { wrapper },
  )
}

describe('usePages', () => {
  afterEach(() => {
    focusManager.setFocused()
  })

  it('loads the first page, then each next page by its cursor, until the end', async () => {
    const asked: (string | undefined)[] = []
    const { result } = await renderPages(asked)

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.pages).toHaveLength(1)
    })

    expect(result.current.hasMore).toBe(true)

    await act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.pages).toHaveLength(2)
    })

    await act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.pages).toHaveLength(3)
    })

    expect(result.current.hasMore).toBe(false)
    expect(asked).toEqual([undefined, '2', '3'])

    await act(() => {
      result.current.loadMore()
    })

    expect(asked).toHaveLength(3)
  })

  it('starts again from the first page on refresh', async () => {
    const asked: (string | undefined)[] = []
    const { result } = await renderPages(asked)

    await waitFor(() => {
      expect(result.current.pages).toHaveLength(1)
    })

    await act(async () => {
      await result.current.refresh()
    })

    expect(asked).toEqual([undefined, undefined])
  })

  it('asks for nothing while there is no way to fetch a page', async () => {
    const { wrapper } = TestCore.create()

    const { result } = await renderHook(
      () => usePages<IFakePage>({ fetchPage: undefined, queryKey: ['held'] }),
      { wrapper },
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.pages).toBeUndefined()
  })

  it('reloads on return to the foreground, unless told not to', async () => {
    const asked: (string | undefined)[] = []
    const { result } = await renderPages(asked)

    await waitFor(() => {
      expect(result.current.pages).toHaveLength(1)
    })

    await act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })

    await waitFor(() => {
      expect(asked).toHaveLength(2)
    })

    const quiet: (string | undefined)[] = []

    const { result: quietResult } = await renderPages(quiet, {
      queryKey: ['quiet'],
      refetchOnFocus: false,
    })

    await waitFor(() => {
      expect(quietResult.current.pages).toHaveLength(1)
    })

    await act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })

    expect(quiet).toHaveLength(1)
  })
})
