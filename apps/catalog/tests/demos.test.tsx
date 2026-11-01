import { createElement } from 'react'

import { REGISTRY } from '../src/registry.ts'
import { renderInCatalog } from './helpers/render.tsx'

describe('demos', () => {
  it.each(REGISTRY.map(({ Demo, title }) => [title, Demo] as const))(
    'renders the %s demo',
    async (_title, Demo) => {
      const { toJSON } = await renderInCatalog(createElement(Demo))

      expect(toJSON()).not.toBeNull()
    },
  )
})
