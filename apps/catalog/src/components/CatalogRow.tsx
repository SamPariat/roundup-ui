import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { ListRow } from '@roundup/ui'

import type { CatalogEntry } from '../registry.ts'

/** Props for CatalogRow. */
export interface CatalogRowProps {
  /** The page this row opens. */
  entry: CatalogEntry
}

/**
 * A row of the component index: the title and summary, opening the component's page.
 * @returns The pressable row.
 */
export const CatalogRow = ({ entry }: CatalogRowProps): ReactElement => {
  const router = useRouter()

  const open = useCallback((): void => {
    router.push({ pathname: '/[component]', params: { component: entry.slug } })
  }, [entry.slug, router])

  return <ListRow chevron onPress={open} subtitle={entry.summary} title={entry.title} />
}
