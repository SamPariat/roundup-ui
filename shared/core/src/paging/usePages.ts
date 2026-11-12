import type { InfiniteData, QueryKey } from '@tanstack/react-query'

import { keepPreviousData, skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

/** The cursor of the page to load; undefined for the first. */
type TCursor = string | undefined

/** What every page of a cursor-paged list carries: where the next page starts. */
export interface IPage {
  /** The cursor and nothing else of the page that paging reads. */
  data: {
    /** Where the next page starts; null or missing at the end of the list. */
    nextCursor?: null | string | undefined
  }
}

/** What usePages is told about the list. */
export interface IUsePagesOptions<TPage extends IPage> {
  /** The cache key of the list. */
  queryKey: QueryKey
  /** Asks for the page that starts at a cursor; undefined holds the list back, as while signed out. */
  fetchPage: ((cursor: TCursor) => Promise<TPage>) | undefined
  /** True to keep the last results on screen while a new key loads, so typing does not flash. */
  keepPrevious?: boolean
  /** False to leave the list as it is when the app returns to the foreground; true by default. */
  refetchOnFocus?: boolean
}

/** What usePages gives back. */
export interface IPages<TPage extends IPage> {
  /** The pages loaded so far, in order; undefined until the first arrives. */
  pages: TPage[] | undefined
  /** True while the first page loads. */
  loading: boolean
  /** True while a later page loads. */
  loadingMore: boolean
  /** True when there are more pages to load. */
  hasMore: boolean
  /** Loads the next page; does nothing when there is none or one is loading. */
  loadMore: () => void
  /** Loads the list again from the start. */
  refresh: () => Promise<void>
  /** What the load failed with, or null. */
  error: Error | null
}

/**
 * Reads where the next page starts.
 * @param last - The most recent page.
 * @returns The cursor, or undefined at the end of the list.
 */
const nextCursor = (last: IPage): TCursor => last.data.nextCursor ?? undefined

/**
 * Loads a cursor-paged list a page at a time: the query, the next page's cursor, a load-more that
 * never cancels a page already loading, and a refresh that starts again from the first page. The
 * three lists of the app (squads, a squad's favorites and the venue search) share it.
 * @param options - The list's key, how to ask for a page, and how it behaves.
 * @param options.fetchPage - Asks for the page at a cursor; undefined holds the list back.
 * @param options.keepPrevious - True to keep the last results while a new key loads.
 * @param options.queryKey - The cache key of the list.
 * @param options.refetchOnFocus - False to leave the list alone on return to the foreground.
 * @returns The pages and the paging state and actions.
 */
export const usePages = <TPage extends IPage>({
  fetchPage,
  keepPrevious = false,
  queryKey,
  refetchOnFocus = true,
}: IUsePagesOptions<TPage>): IPages<TPage> => {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, refetch } =
    useInfiniteQuery<TPage, Error, InfiniteData<TPage, TCursor>, QueryKey, TCursor>({
      getNextPageParam: nextCursor,
      initialPageParam: undefined,
      queryFn: fetchPage === undefined ? skipToken : (context) => fetchPage(context.pageParam),
      queryKey,
      refetchOnWindowFocus: refetchOnFocus,
      ...(keepPrevious ? { placeholderData: keepPreviousData } : {}),
    })

  const loadMore = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage({ cancelRefetch: false })
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const refresh = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  return {
    error,
    hasMore: hasNextPage,
    loading: isPending,
    loadingMore: isFetchingNextPage,
    loadMore,
    pages: data?.pages,
    refresh,
  }
}
