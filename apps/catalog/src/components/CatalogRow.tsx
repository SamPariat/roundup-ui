import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { ListRow } from '@roundup/ui'

import type { ICatalogEntry } from '@/registry'

/** Props for CatalogRow. */
export interface ICatalogRowProps {
  /** The page this row opens. */
  entry: ICatalogEntry
}

/**
 * A row of the component index: the title and summary, opening the component's page.
 * @returns The pressable row.
 */
export const CatalogRow = ({ entry }: ICatalogRowProps): ReactElement => {
  const router = useRouter()

  const handleOpen = useCallback((): void => {
    router.push({ pathname: '/[component]', params: { component: entry.slug } })
  }, [entry.slug, router])

  return <ListRow chevron onPress={handleOpen} subtitle={entry.summary} title={entry.title} />
}
